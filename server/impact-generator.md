# Impact Generator - Dokumentation

## Übersicht

Der Impact Generator (`server/impact-generator.ts`) ist Teil von Phase 3.1 der Impact Tracking Migration. Er generiert unveränderliche Impact-Snapshots für Donations mit berechneten Impact-Werten und lokalisierten, Template-basierten Texten.

## Funktionen

### `hasImpact(project: Project): boolean`

Prüft, ob ein Projekt alle erforderlichen Impact-Daten hat.

**Erforderliche Felder:**
- `impactFactor` (nicht null)
- `impactUnitSingularEn`
- `impactUnitPluralEn`
- `pastTemplateEn`
- `ctaTemplateEn`

**Rückgabe:**
- `true` wenn alle Felder vorhanden sind
- `false` sonst

---

### `generateImpactSnapshot(project: Project, amount: number, language: 'en' | 'de'): ImpactSnapshot`

Generiert einen Impact-Snapshot für eine Donation.

**Parameter:**
- `project`: Project-Objekt mit Impact-Daten
- `amount`: Donation-Betrag in USD
- `language`: Sprache ('en' | 'de')

**Rückgabe:**
```typescript
{
  calculated_impact: number,
  impact_factor: number,
  impact_unit_singular: string,
  impact_unit_plural: string,
  unit: string, // Singular oder Plural basierend auf calculated_impact
  generated_text_cta: string,
  generated_text_past: string,
  timestamp: string
}
```

**Fehler:**
- Wirft `Error` wenn Projekt keine Impact-Daten hat
- Wirft `Error` wenn Templates fehlen

---

## Berechnungs-Logik

### 1. Impact-Tiers (nicht-lineare Projekte)

Wenn `project.impactTiers` vorhanden ist:
1. Finde passendes Tier basierend auf Betrag (`min_amount <= amount < max_amount`)
2. Fallback: Nutze letztes Tier für Beträge >= `max_amount`
3. Berechne: `calculated_impact = amount * tier.impact_factor`
4. Nutze Templates aus dem Tier

### 2. Impact-Factor (lineare Projekte)

Wenn `project.impactFactor` vorhanden ist:
1. Berechne: `calculated_impact = amount * impact_factor`
2. Nutze Standard-Templates aus `project.cta_template_*` / `project.past_template_*`

### 3. Formatierung

**Regeln:**
- **Personen:** Ganzzahl wenn ≥1, sonst Dezimal (z.B. "10", "0.50")
- **kg/Liter:** 1 Dezimalstelle (z.B. "5.0", "10.5")
- **Andere:** Ganzzahl wenn möglich, sonst 1 Dezimalstelle

### 4. Pluralisierung

- `calculated_impact === 1` → Singular (`impact_unit_singular_*`)
- `calculated_impact !== 1` → Plural (`impact_unit_plural_*`)

### 5. Text-Generierung

**Past Template:**
- Struktur: `"{impact} {unit} {freitext_past}"`
- Beispiel: `"10 people provided with safe drinking water"`

**CTA Template:**
- Struktur: `"Support {project} with ${amount} and help {impact} {unit} {freitext_cta} — earn {points} Impact Points"`
- Beispiel: `"Support Openversum with $100 and help 10 people access safe drinking water — earn 1000 Impact Points"`

---

## Beispiele

### Lineares Projekt

**Projekt-Daten:**
```typescript
{
  impactFactor: 0.1,
  impactUnitSingularEn: 'person',
  impactUnitPluralEn: 'people',
  ctaTemplateEn: 'access safe drinking water',
  pastTemplateEn: 'provided with safe drinking water'
}
```

**Donation: $100**
```typescript
const snapshot = generateImpactSnapshot(project, 100, 'en');
// {
//   calculated_impact: 10,
//   impact_factor: 0.1,
//   unit: 'people',
//   generated_text_past: '10 people provided with safe drinking water',
//   generated_text_cta: 'Support Openversum with $100 and help 10 people access safe drinking water — earn 1000 Impact Points'
// }
```

### Nicht-lineares Projekt (Impact-Tiers)

**Projekt-Daten:**
```typescript
{
  impactTiers: [
    {
      min_amount: 0,
      max_amount: 100,
      impact_factor: 10.0,
      cta_template_en: 'fresh air per day',
      past_template_en: 'fresh air per day provided'
    },
    {
      min_amount: 100,
      max_amount: 1000,
      impact_factor: 1.0,
      cta_template_en: 'fresh air for a year',
      past_template_en: 'fresh air for a year provided'
    }
  ]
}
```

**Donation: $50 (Tier 1)**
```typescript
const snapshot = generateImpactSnapshot(project, 50, 'en');
// {
//   calculated_impact: 500,
//   impact_factor: 10.0,
//   generated_text_past: '500 children fresh air per day provided'
// }
```

**Donation: $500 (Tier 2)**
```typescript
const snapshot = generateImpactSnapshot(project, 500, 'en');
// {
//   calculated_impact: 500,
//   impact_factor: 1.0,
//   generated_text_past: '500 children fresh air for a year provided'
// }
```

---

## Fehlerbehandlung

### Fehlende Impact-Daten

```typescript
try {
  const snapshot = generateImpactSnapshot(project, 100, 'en');
} catch (error) {
  // Error: Project 1 (Test Project) does not have impact tracking data.
  // Required fields: impactFactor, impactUnitSingularEn, impactUnitPluralEn, pastTemplateEn, ctaTemplateEn
}
```

### Fehlende Templates

```typescript
try {
  const snapshot = generateImpactSnapshot(project, 100, 'en');
} catch (error) {
  // Error: Project 1 (Test Project) is missing templates for language en
}
```

---

## Testing

Tests befinden sich in `server/__tests__/impact-generator.test.ts`.

**Test-Cases:**
- ✅ Lineare Projekte (impact_factor)
- ✅ Nicht-lineare Projekte (impact_tiers)
- ✅ Singular/Plural Auswahl
- ✅ Formatierung (Personen, kg, etc.)
- ✅ Text-Generierung (Past & CTA)
- ✅ Deutsche/Englische Texte
- ✅ Edge Cases (<1 Person, große Beträge)
- ✅ Fehlerbehandlung

**Ausführen:**
```bash
npm test -- impact-generator.test.ts
```

---

## Integration

Der Impact Generator wird in Phase 3.2 in die Donation-API (`api/projects-donate.ts`) integriert:

```typescript
import { generateImpactSnapshot } from '../server/impact-generator';

// Nach Donation-Erstellung
const impactSnapshotEn = generateImpactSnapshot(project, amount, 'en');
const impactSnapshotDe = generateImpactSnapshot(project, amount, 'de');

// Update Donation
await supabase
  .from('donations')
  .update({
    calculated_impact: impactSnapshotEn.calculated_impact,
    impact_snapshot: {
      en: impactSnapshotEn,
      de: impactSnapshotDe,
      timestamp: new Date().toISOString()
    },
    generated_text_past_en: impactSnapshotEn.generated_text_past,
    generated_text_past_de: impactSnapshotDe.generated_text_past
  })
  .eq('id', donationId);
```

---

## Fallback-Logik

**Wichtig:** Der Impact Generator wirft Fehler, wenn Impact-Daten fehlen. Die Fallback-Logik wird im Frontend (Phase 4) implementiert, nicht hier.

**Grund:** Der Generator wird nur für neue Donations verwendet, die bereits Impact-Daten haben sollten. Wenn keine vorhanden sind, sollte die Donation nicht erstellt werden oder die alte Logik verwendet werden.

---

*Letzte Aktualisierung: [Datum]*
*Status: Phase 3.1 implementiert*






