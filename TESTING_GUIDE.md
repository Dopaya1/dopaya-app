# Impact Generator - Testing Guide

## Schnelltest: Automatischer Test-Script

**Ausführen:**
```bash
cd Tech
npm run test:impact-generator
```

**Was wird getestet:**
- ✅ Lineare Projekte (impact_factor)
- ✅ Singular/Plural Auswahl
- ✅ Deutsche/Englische Texte
- ✅ Nicht-lineare Projekte (impact_tiers)
- ✅ Fehlerbehandlung
- ✅ Formatierung (<1 Person)

---

## Manueller Test mit echten Projekten

### Option 1: Test-Script mit echtem Projekt aus DB

**Erstelle:** `Tech/scripts/test-impact-generator-real.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import { generateImpactSnapshot } from '../server/impact-generator';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function testWithRealProject() {
  // Hole ein Projekt mit Impact-Daten aus der DB
  const { data: project, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', 1) // Ersetze mit ID eines Projekts das Impact-Daten hat
    .single();

  if (error || !project) {
    console.error('❌ Projekt nicht gefunden:', error);
    return;
  }

  console.log('📊 Testing with project:', project.title);
  console.log('Impact Factor:', project.impact_factor);
  console.log('Units:', project.impact_unit_singular_en, '/', project.impact_unit_plural_en);
  console.log('Templates:', project.past_template_en?.substring(0, 50), '...\n');

  // Test verschiedene Beträge
  const amounts = [10, 50, 100, 250, 500];

  for (const amount of amounts) {
    try {
      const snapshotEn = generateImpactSnapshot(project, amount, 'en');
      const snapshotDe = generateImpactSnapshot(project, amount, 'de');

      console.log(`💰 Donation: $${amount}`);
      console.log(`   Impact: ${snapshotEn.calculated_impact} ${snapshotEn.unit}`);
      console.log(`   EN Past: "${snapshotEn.generated_text_past}"`);
      console.log(`   DE Past: "${snapshotDe.generated_text_past}"`);
      console.log(`   EN CTA: "${snapshotEn.generated_text_cta.substring(0, 80)}..."`);
      console.log('');
    } catch (error) {
      console.error(`❌ Error for $${amount}:`, error);
    }
  }
}

testWithRealProject();
```

**Ausführen:**
```bash
cd Tech
tsx scripts/test-impact-generator-real.ts
```

---

### Option 2: Test direkt in der Donation-API (nach Integration)

**Schritte:**
1. Stelle sicher, dass ein Projekt Impact-Daten hat (in Supabase prüfen)
2. Erstelle eine Test-Donation über die Support-Page
3. Prüfe in Supabase `donations` Tabelle:
   - `calculated_impact` sollte gesetzt sein
   - `impact_snapshot` sollte JSONB mit EN/DE Daten enthalten
   - `generated_text_past_en` und `generated_text_past_de` sollten gesetzt sein

**SQL Query zum Prüfen:**
```sql
SELECT 
  id,
  amount,
  calculated_impact,
  generated_text_past_en,
  generated_text_past_de,
  impact_snapshot
FROM donations
WHERE calculated_impact IS NOT NULL
ORDER BY created_at DESC
LIMIT 5;
```

---

## Was solltest du prüfen?

### ✅ Funktionale Tests

1. **Impact-Berechnung:**
   - [ ] Lineare Projekte: `calculated_impact = amount * impact_factor`
   - [ ] Nicht-lineare Projekte: Korrekte Tier-Auswahl
   - [ ] Singular/Plural: Korrekt bei impact = 1

2. **Text-Generierung:**
   - [ ] Past-Texte sind grammatikalisch korrekt
   - [ ] CTA-Texte enthalten alle Platzhalter korrekt
   - [ ] Deutsche Texte sind korrekt lokalisiert
   - [ ] Keine doppelten Wörter (z.B. "trees trees")

3. **Formatierung:**
   - [ ] Personen: Ganzzahl wenn ≥1 (z.B. "10 people")
   - [ ] Personen: Dezimal wenn <1 (z.B. "0.50 people")
   - [ ] kg/Liter: 1 Dezimalstelle (z.B. "5.0 kg")

### ✅ Edge Cases

1. **<1 Person:**
   - [ ] Format: "0.50 people" (nicht "0.5")
   - [ ] Unit: Plural (auch bei <1)

2. **Große Beträge:**
   - [ ] Impact wird korrekt berechnet
   - [ ] Texte sind nicht zu lang

3. **Impact-Tiers:**
   - [ ] Korrekte Tier-Auswahl bei Betrag in Range
   - [ ] Fallback zu letztem Tier bei Betrag >= max

### ✅ Fehlerbehandlung

1. **Projekt ohne Impact-Daten:**
   - [ ] Wirft klaren Fehler
   - [ ] Fehlermeldung ist hilfreich

2. **Fehlende Templates:**
   - [ ] Wirft Fehler mit Details

---

## Test-Szenarien

### Szenario 1: Wasser-Projekt (linear)
```
Projekt: Openversum
impact_factor: 0.1
Unit: person / people
Templates: "access safe drinking water" / "provided with safe drinking water"

Test-Beträge:
- $10 → 1 person ✅
- $100 → 10 people ✅
- $5 → 0.50 people ✅
```

### Szenario 2: Nicht-lineares Projekt (Tiers)
```
Projekt: Fresh Air Initiative
impact_tiers: [
  { 0-100: factor 10.0, "per day" },
  { 100-1000: factor 1.0, "for a year" }
]

Test-Beträge:
- $50 → Tier 1, "per day" ✅
- $500 → Tier 2, "for a year" ✅
```

---

## Debugging

### Wenn Tests fehlschlagen:

1. **Prüfe Projekt-Daten in Supabase:**
```sql
SELECT 
  id,
  title,
  impact_factor,
  impact_unit_singular_en,
  impact_unit_plural_en,
  cta_template_en,
  past_template_en,
  impact_tiers
FROM projects
WHERE id = YOUR_PROJECT_ID;
```

2. **Prüfe Impact-Generator Logs:**
   - Fehlermeldungen zeigen fehlende Felder
   - Prüfe ob alle Templates vorhanden sind

3. **Teste manuell:**
```typescript
import { generateImpactSnapshot } from './server/impact-generator';

const project = { /* Projekt-Daten */ };
try {
  const snapshot = generateImpactSnapshot(project, 100, 'en');
  console.log(snapshot);
} catch (error) {
  console.error(error);
}
```

---

## Nächste Schritte nach Tests

Wenn alle Tests erfolgreich sind:
1. ✅ Impact-Generator ist bereit
2. ⏳ Weiter mit Phase 3.2: Integration in Donation-API
3. ⏳ Dann: Frontend-Tests mit echten Donations

---

*Letzte Aktualisierung: [Datum]*






