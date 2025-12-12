# Impact Tracking & Shareable Texts - Migration Plan

## Übersicht

Migration von einem Preset-basierten Impact-System zu einem einheitlichen, linear skalierbaren System mit persistierten Impact-Snapshots und lokalisierten, generierten Texten.

**Ziel:** Jede Spende (Preset oder Custom) berechnet automatisch den korrekten Impact, speichert einen unveränderlichen Snapshot und generiert konsistente, lokalisiert korrekte Texte für CTA (Future) und Past (Historical/Dashboard/Share).

---

## Phase 0: Analyse & Backup (1 Tag) ✅ ABGESCHLOSSEN

### 0.1 Datenbank-Backup ✅
```sql
-- Backup aller relevanten Tabellen
CREATE TABLE projects_backup_YYYYMMDD AS SELECT * FROM projects;
CREATE TABLE donations_backup_YYYYMMDD AS SELECT * FROM donations;
```
**Status:** Backup wurde vom User erstellt.

### 0.2 Analyse: Preset-Konsistenz prüfen
**Ziel:** Prüfen, ob Presets linear sind und ein einheitlicher `impact_factor` berechnet werden kann.

**SQL-Script erstellt:** `Tech/scripts/analyze-impact-presets.sql` und `Tech/scripts/analyze-impact-presets.ts`
- Für jedes Projekt: Prüfe ob `impact1/donation1 ≈ impact2/donation2 ≈ ... ≈ impact7/donation7`
- Berechne Median/Mean der Ratios pro Projekt
- Markiere Projekte mit hoher Varianz (>10%) für manuelle Review
- Exportiere Liste der inkonsistenten Projekte

**Erwartetes Ergebnis:**
- Liste aller Projekte mit berechnetem `impact_factor`
- Liste der Projekte, die manuelle Anpassung benötigen
- Validierung, dass lineare Berechnung für die meisten Projekte funktioniert

**Hinweis:** User wird `impact_factor` manuell eintragen, daher ist die automatische Analyse weniger kritisch.

---

## Phase 1: Schema-Erweiterung (2-3 Tage) ✅ IN ARBEIT

**Status:** SQL-Migration ausgeführt, Daten werden manuell eingetragen, Drizzle Schema aktualisiert.

### 1.1 Projects-Tabelle erweitern

**Neue Spalten hinzufügen:**
```sql
-- Impact-Berechnung
ALTER TABLE projects ADD COLUMN IF NOT EXISTS impact_factor NUMERIC;

-- Units (für {unit} Platzhalter - automatisch Singular/Plural)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS impact_unit_singular_en TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS impact_unit_plural_en TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS impact_unit_singular_de TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS impact_unit_plural_de TEXT;

-- Templates (nur Freitext-Teil - {impact} und {unit} werden automatisch eingefügt)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS cta_template_en TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS cta_template_de TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS past_template_en TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS past_template_de TEXT;

-- Impact-Tiers für nicht-lineare Projekte (optional - für Ausnahmen)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS impact_tiers JSONB;

-- Optional: Backup der alten Presets
ALTER TABLE projects ADD COLUMN IF NOT EXISTS impact_presets JSONB;
```

**Template-Format (Freitext-Teil):**

**Wichtig:** Templates speichern nur den variablen Freitext-Teil. `{impact}` und `{unit}` werden automatisch eingefügt.

**Past Template (Dashboard/Share):**
- Struktur: `"{impact} {unit} {freitext_past}"`
- `past_template_en`: nur Freitext-Teil (z.B. `"provided with safe drinking water"`)
- `past_template_de`: nur Freitext-Teil (z.B. `"Zugang zu sauberem Trinkwasser gegeben"`)

**CTA Template (Teaser/Checkout):**
- Struktur: `"Support {project} with ${amount} and help {impact} {unit} {freitext_cta} — earn {points} Impact Points"`
- `cta_template_en`: nur Freitext-Teil (z.B. `"access safe drinking water"`)
- `cta_template_de`: nur Freitext-Teil (z.B. `"Zugang zu sauberem Trinkwasser zu verschaffen"`)

**Beispiele (vollständig generiert):**
- EN CTA: `"Support Openversum with $100 and help 10 people access safe drinking water — earn 1000 Impact Points"`
- DE CTA: `"Unterstütze Openversum mit $100 und hilf 10 Personen Zugang zu sauberem Trinkwasser zu verschaffen — verdiene 1000 Impact Points"`
- EN Past: `"10 people provided with safe drinking water"`
- DE Past: `"10 Personen Zugang zu sauberem Trinkwasser gegeben"`

**Hinweis:** `has_impact` wird im Code geprüft (basierend auf vorhandenen Feldern), nicht als Spalte gespeichert.

**Impact-Tiers (Optional - für nicht-lineare Projekte):**
- Wenn `impact_tiers` gesetzt ist, wird diese statt `impact_factor` verwendet
- Struktur: JSONB-Array mit Tiers, die verschiedene Templates pro Betrags-Bereich haben
- **Wichtig:** Auch hier nur Freitext-Teile in den Templates!
- Beispiel für nicht-lineares Projekt:
```json
[
  {
    "min_amount": 0,
    "max_amount": 100,
    "impact_factor": 10.0,
    "cta_template_en": "fresh air per day",
    "cta_template_de": "frische Luft pro Tag zu geben",
    "past_template_en": "fresh air per day provided",
    "past_template_de": "frische Luft pro Tag gegeben"
  },
  {
    "min_amount": 100,
    "max_amount": 1000,
    "impact_factor": 1.0,
    "cta_template_en": "fresh air for a year",
    "cta_template_de": "frische Luft für ein Jahr zu geben",
    "past_template_en": "fresh air for a year provided",
    "past_template_de": "frische Luft für ein Jahr gegeben"
  }
]
```

**Legacy-Spalten markieren (nicht löschen):**
- `donation1-7`, `impact1-7` bleiben erhalten
- `impactUnit`, `impact_noun`, `impact_verb` bleiben erhalten
- `impactUnitDe`, `impactNounDe`, `impactVerbDe` bleiben erhalten

### 1.2 Donations-Tabelle erweitern

**Neue Spalten hinzufügen:**
```sql
ALTER TABLE donations ADD COLUMN IF NOT EXISTS calculated_impact NUMERIC;
ALTER TABLE donations ADD COLUMN IF NOT EXISTS impact_snapshot JSONB;
ALTER TABLE donations ADD COLUMN IF NOT EXISTS generated_text_past_en TEXT;
ALTER TABLE donations ADD COLUMN IF NOT EXISTS generated_text_past_de TEXT;
```

**Hinweis:** Nur Past-Texte werden gespeichert. CTA-Texte werden nur vor der Spende benötigt (aus Projekt-Template generiert), nicht danach.

**Schema-Update in `shared/schema.ts`:**
- Erweitere `projects` Type mit neuen Feldern
- Erweitere `donations` Type mit neuen Feldern
- Alle neuen Felder als `nullable` definieren (für Backward-Compatibility)

### 1.3 Drizzle Schema aktualisieren ✅ ABGESCHLOSSEN

**Datei:** `Tech/shared/schema.ts`

**Änderungen:**
1. ✅ Imports erweitert: `numeric` und `jsonb` hinzugefügt
2. ✅ `projects` Tabelle erweitert mit neuen Impact-Feldern
3. ✅ `donations` Tabelle erweitert mit neuen Impact-Snapshot-Feldern
4. ✅ Alle neuen Felder als `nullable` definiert (für Backward-Compatibility)

**Implementiert:**
```typescript
// In projects table:
impactFactor: numeric("impact_factor"),
impactUnitSingularEn: text("impact_unit_singular_en"),
impactUnitPluralEn: text("impact_unit_plural_en"),
impactUnitSingularDe: text("impact_unit_singular_de"),
impactUnitPluralDe: text("impact_unit_plural_de"),
ctaTemplateEn: text("cta_template_en"),  // Nur Freitext-Teil
ctaTemplateDe: text("cta_template_de"),  // Nur Freitext-Teil
pastTemplateEn: text("past_template_en"), // Nur Freitext-Teil
pastTemplateDe: text("past_template_de"), // Nur Freitext-Teil
impactTiers: jsonb("impact_tiers"),      // Optional
impactPresets: jsonb("impact_presets"),   // Optional (Backup)

// In donations table:
calculatedImpact: numeric("calculated_impact"),
impactSnapshot: jsonb("impact_snapshot"),
generatedTextPastEn: text("generated_text_past_en"),
generatedTextPastDe: text("generated_text_past_de"),
// Note: CTA texts are not stored - only needed before donation (from project template)
```

**Hinweis:** `has_impact` wird im Code geprüft, nicht als Spalte gespeichert:
```typescript
function hasImpact(project: Project): boolean {
  return !!(
    project.impactFactor != null &&
    project.impactUnitSingularEn &&
    project.impactUnitPluralEn &&
    project.pastTemplateEn &&
    project.ctaTemplateEn
  );
}
```

**Fallback-Logik:** Siehe Phase 4 für Details zur Fallback-Implementierung.

---

## Phase 2: Backfill & Normalisierung (2-3 Tage)

**⚠️ WICHTIG: Kein Backfill für historische Donations!**
- Nur neue Donations (ab Migration) erhalten Impact-Snapshots
- Historische Donations werden weiterhin mit aktueller Logik berechnet (Fallback)
- Keine Migration/Backfill-Scripts für `donations`-Tabelle nötig

### 2.1 Impact-Factor berechnen

**Script erstellen:** `Tech/scripts/calculate-impact-factors.ts`

**Logik:**
1. Für jedes Projekt mit Presets:
   - Extrahiere alle gültigen `(donation, impact)` Paare
   - Berechne Ratio: `impact / donation` für jedes Paar
   - Berechne Median der Ratios → `impact_factor`
   - Speichere in `projects.impact_factor`

2. Validierung:
   - Prüfe Varianz der Ratios (wenn >10%, markiere für Review)
   - Logge Projekte mit inkonsistenten Presets

3. Fallback:
   - Wenn kein Preset vorhanden: `impact_factor = NULL`
   - Setze `has_impact = false` für Projekte ohne Impact-Daten

**SQL-Beispiel:**
```sql
-- Berechne impact_factor für Projekte mit mindestens 2 Presets
UPDATE projects
SET impact_factor = (
  SELECT PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY ratio)
  FROM (
    SELECT impact_1::numeric / NULLIF(donation_1, 0) AS ratio FROM projects WHERE id = projects.id AND donation_1 IS NOT NULL AND impact_1 IS NOT NULL
    UNION ALL
    SELECT impact_2::numeric / NULLIF(donation_2, 0) FROM projects WHERE id = projects.id AND donation_2 IS NOT NULL AND impact_2 IS NOT NULL
    -- ... für alle 7 Presets
  ) ratios
)
WHERE has_impact = true;
```

### 2.2 Impact-Unit & Name extrahieren

**Script erstellen:** `Tech/scripts/extract-impact-units.ts`

**Logik:**
1. Extrahiere aus bestehenden Feldern:
   - `impactUnit` → `impact_unit_singular_en` / `impact_unit_plural_en`
   - `impactUnitDe` → `impact_unit_singular_de` / `impact_unit_plural_de`
   - `impact_noun` + `impact_verb` → `impact_name_en`
   - `impactNounDe` + `impactVerbDe` → `impact_name_de`

2. Mapping-Regeln:
   - "person" / "people" → Singular: "person", Plural: "people"
   - "kg" → Singular: "kg", Plural: "kg" (keine Plural-Änderung)
   - "liter" / "L" → Singular: "liter", Plural: "liters"
   - Custom Units: Manuelle Mapping-Tabelle

3. Name-Generierung:
   - Kombiniere `verb` + `noun` zu natürlichem Text
   - Beispiele:
     - `verb: "train"`, `noun: "women"` → `"train women"` (EN) / `"Frauen ausbilden"` (DE)
     - `verb: "provide"`, `noun: "access"` → `"provide access"` (EN) / `"Zugang bereitstellen"` (DE)

### 2.3 Locale-Templates generieren

**Script erstellen:** `Tech/scripts/generate-locale-templates.ts`

**Logik:**
1. Generiere Templates aus bestehenden Feldern (`impact_verb`, `impact_noun`, `impactUnit`)
2. **Wichtig:** Nur Freitext-Teile werden gespeichert!

**Past Templates:**
- Struktur: `"{impact} {unit} {freitext_past}"`
- Extrahiere nur den Freitext-Teil aus bestehenden Feldern
- Beispiel: Aus `impact_verb: "provide"`, `impact_noun: "safe drinking water"` → `"provided with safe drinking water"`

**CTA Templates:**
- Struktur: `"Support {project} with ${amount} and help {impact} {unit} {freitext_cta} — earn {points} Impact Points"`
- Extrahiere nur den Freitext-Teil aus bestehenden Feldern
- Beispiel: Aus `impact_verb: "access"`, `impact_noun: "safe drinking water"` → `"access safe drinking water"`

3. **Platzhalter (automatisch eingefügt):**
   - `{impact}` → formatierter Impact-Wert
   - `{unit}` → automatisch Singular/Plural basierend auf `calculated_impact`
   - `{project}`, `{amount}`, `{points}` → nur in CTA (automatisch)

4. **Unregelmäßige Pluralformen:**
   - Speichere Singular/Plural explizit in `impact_unit_singular_*` / `impact_unit_plural_*`
   - `{unit}` wird automatisch per `calculated_impact` gewählt

5. **Beispiele für Template-Generierung:**
   - Aus `impact_verb: "access"`, `impact_noun: "safe drinking water"`:
     - EN Past: `"provided with safe drinking water"` (nur Freitext)
     - DE Past: `"Zugang zu sauberem Trinkwasser gegeben"` (nur Freitext)
     - EN CTA: `"access safe drinking water"` (nur Freitext)
     - DE CTA: `"Zugang zu sauberem Trinkwasser zu verschaffen"` (nur Freitext)

**Speichere in:**
- `projects.cta_template_en`, `projects.cta_template_de` (nur Freitext-Teil)
- `projects.past_template_en`, `projects.past_template_de` (nur Freitext-Teil)
- `projects.impact_tiers` (Optional - für nicht-lineare Projekte, auch nur Freitext-Teile)

### 2.4 Impact-Presets JSON generieren

**Optional:** Konvertiere `donation1-7` / `impact1-7` in JSONB-Array für spätere Verwendung:

```json
[
  { "donation": 250, "impact": 10 },
  { "donation": 500, "impact": 20 },
  ...
]
```

**Script:** `Tech/scripts/generate-impact-presets.ts`

---

## Phase 3: Server-seitige Generierung (3-4 Tage) ✅ IN ARBEIT

### 3.1 Impact-Snapshot-Generator ✅ ABGESCHLOSSEN

**Datei erstellt:** `Tech/server/impact-generator.ts`

**Funktion:** `generateImpactSnapshot(project, amount, language)`

**Input:**
- `project`: Project-Objekt mit `impact_factor`, `impact_unit_*`, `cta_template_*`, `past_template_*`
- `amount`: Donation-Betrag (number)
- `language`: 'en' | 'de'

**Output:**
```typescript
{
  calculated_impact: number,
  impact_factor: number,
  impact_unit_singular: string,
  impact_unit_plural: string,
  unit: string, // Singular oder Plural basierend auf calculated_impact
  generated_text_cta: string,  // "Support Openversum with $100 and help 10 people access safe drinking water — earn 1000 Impact Points"
  generated_text_past: string, // "10 people provided with safe drinking water"
  timestamp: string
}
```

**Berechnungs-Logik:**

**1. Prüfe Impact-Tiers (für nicht-lineare Projekte):**
```typescript
if (project.impact_tiers && project.impact_tiers.length > 0) {
  // Finde passendes Tier basierend auf Betrag
  const tier = project.impact_tiers.find(t => 
    amount >= t.min_amount && amount < t.max_amount
  ) || project.impact_tiers[project.impact_tiers.length - 1]; // Fallback: letztes Tier
  
  calculated_impact = amount * tier.impact_factor;
  // Nutze Templates aus dem Tier
  cta_template = tier.cta_template_en (oder _de);
  past_template = tier.past_template_en (oder _de);
}
```

**2. Fallback: Lineare Berechnung (Standard):**
```typescript
else if (project.impact_factor) {
  calculated_impact = amount * project.impact_factor;
  // Nutze Standard-Templates aus project.cta_template_* / project.past_template_*
}
```

**3. Formatierung nach Regeln:**
- Personen: Ganzzahl wenn ≥1, sonst Dezimal mit Tooltip
- kg/Liter: 1 Dezimalstelle
- <1 Person: Zeige Dezimalwert in Tooltip

**4. Pluralisierung:**
- `calculated_impact === 1` → Singular (`impact_unit_singular_*`)
- `calculated_impact !== 1` → Plural (`impact_unit_plural_*`)

**5. Text-Generierung mit Templates:**
- **Past Template:** `"{impact} {unit} {freitext_past}"`
  - `{impact}` → formatierter Impact-Wert (nach Regeln)
  - `{unit}` → Singular oder Plural basierend auf `calculated_impact`
  - `{freitext_past}` → aus `project.past_template_*` (nur Freitext-Teil)
  
- **CTA Template:** `"Support {project} with ${amount} and help {impact} {unit} {freitext_cta} — earn {points} Impact Points"`
  - `{project}` → Projektname
  - `{amount}` → Betrag (z.B. "100")
  - `{impact}` → formatierter Impact-Wert (nach Regeln)
  - `{unit}` → Singular oder Plural basierend auf `calculated_impact`
  - `{freitext_cta}` → aus `project.cta_template_*` (nur Freitext-Teil)
  - `{points}` → Impact Points (z.B. amount * 10)

**Beispiele (Standard - lineare Projekte):**
- **Projekt-Daten:**
  - `past_template_en`: `"provided with safe drinking water"`
  - `cta_template_en`: `"access safe drinking water"`
- **Donation: $100 → 10 people**
- EN Past: `"10 people provided with safe drinking water"`
- EN CTA: `"Support Openversum with $100 and help 10 people access safe drinking water — earn 1000 Impact Points"`

**Beispiele (Nicht-linear - mit impact_tiers):**
- **Tier 1 (0-100):**
  - `past_template_en`: `"fresh air per day provided"`
  - `cta_template_en`: `"fresh air per day"`
- **$50 Spende → 500 children**
- EN Past: `"500 children fresh air per day provided"`
- EN CTA: `"Support Project with $50 and help 500 children fresh air per day — earn 500 Impact Points"`

**Unregelmäßige Pluralformen:**
- Templates handhaben automatisch Singular/Plural über `{unit}` Platzhalter
- Beispiele: "person" / "people", "child" / "children" → explizit in `impact_unit_singular_*` / `impact_unit_plural_*` gespeichert

### 3.2 Integration in Donation-API

**Datei:** `Tech/api/projects-donate.ts`

**Änderungen:**
1. Nach erfolgreicher Donation:
   - Rufe `generateImpactSnapshot()` für DE und EN auf
   - Speichere `calculated_impact` und beide Snapshots
   - Speichere generierte Texte in separaten Spalten

2. Response:
   - Return `impact_snapshot` im Response für sofortige UI-Verwendung

**Code-Struktur:**
```typescript
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

### 3.3 Tests ✅ ABGESCHLOSSEN

**Test-Script:** `Tech/scripts/test-impact-generator.ts`
**Ausführen:** `npm run test:impact-generator`

**Test-Cases (alle erfolgreich):**
- ✅ Linear project ($100) → korrekter Impact (10 people)
- ✅ Singular unit ($10) → korrekte Unit (person)
- ✅ German texts → korrekte Lokalisierung
- ✅ Non-linear project (impact_tiers) → korrekte Tier-Auswahl
- ✅ Error handling → korrekte Fehlermeldungen
- ✅ <1 Person ($10, factor 0.05) → Dezimalwert (0.50)
- ✅ Formatierung → korrekte Regeln (Personen ganzzahlig, kg Dezimal)

**Dokumentation:** `Tech/server/impact-generator.md`

---

## Phase 4: Frontend-Anpassung (3-4 Tage)

### 4.1 Impact-Calculator refactoren ⏳ NÄCHSTER SCHRITT

**Datei:** `Tech/client/src/lib/impact-calculator.ts`

**Neue Funktion:** `calculateImpactUnified(project, amount)`

**Logik (mit Fallback für Backward-Compatibility):**
1. Prüfe ob `project.impact_factor` vorhanden → verwende neue Logik
2. **Fallback:** Nutze alte Interpolation-Logik (für Projekte ohne `impact_factor`)
3. Return: `{ impact, unit, exactMatch }` (kompatibel mit bestehendem Code)

**Code (mit Fallback):**
```typescript
export function calculateImpactUnified(project: Project, donationAmount: number) {
  // 1. Prüfe impact_tiers (für nicht-lineare Projekte)
  if (project.impactTiers && project.impactTiers.length > 0) {
    const tier = project.impactTiers.find(t => 
      donationAmount >= t.min_amount && donationAmount < t.max_amount
    ) || project.impactTiers[project.impactTiers.length - 1];
    
    const calculatedImpact = donationAmount * tier.impact_factor;
    return {
      impact: calculatedImpact,
      unit: project.impactUnitSingularEn || project.impactUnit || "impact units",
      exactMatch: false,
      tier: tier // Für Template-Auswahl
    };
  }
  
  // 2. Neue Logik: Linear mit impact_factor (Standard)
  if (project.impactFactor != null && hasImpact(project)) {
    const calculatedImpact = donationAmount * Number(project.impactFactor);
    return {
      impact: calculatedImpact,
      unit: project.impactUnitSingularEn || project.impactUnit || "impact units",
      exactMatch: false
    };
  }
  
  // 3. FALLBACK: Alte Interpolation-Logik (für Projekte ohne neue Felder)
  return calculateImpact(project, donationAmount);
}

// Helper: Prüft ob Projekt neue Impact-Daten hat
function hasImpact(project: Project): boolean {
  return !!(
    project.impactFactor != null &&
    project.impactUnitSingularEn &&
    project.impactUnitPluralEn &&
    project.pastTemplateEn &&
    project.ctaTemplateEn
  );
}
```

**Wichtig:** Fallback-Logik stellt sicher, dass alte Projekte weiterhin funktionieren!

### 4.2 Support-Page: Live-Preview

**Datei:** `Tech/client/src/pages/support-page.tsx`

**Änderungen:**
1. Nutze `calculateImpactUnified()` für Live-Preview
2. Zeige Impact-Display mit korrekter Formatierung
3. <1 Person: Tooltip mit exaktem Dezimalwert
4. Zeige klaren Text: "Impact wird linear berechnet"

**UI-Komponente:** Impact-Preview-Box
- Zeigt `amountDisplay → impactDisplay` live
- Formatierung nach Regeln (Personen ganzzahlig, kg/Liter 1 Dezimalstelle)
- Tooltip für <1 Person

### 4.3 Dashboard: Share-Cards ⏳ NÄCHSTER SCHRITT

**Datei:** `Tech/client/src/components/dashboard/impact-share-card.tsx`

**Änderungen (mit Fallback):**
1. Nutze `donation.generated_text_past_de` / `generated_text_past_en` aus Snapshot (für neue Donations)
2. **Fallback:** Berechne Impact mit neuer Logik und nutze `project.past_template_*` (für alte Donations ohne Snapshot)
3. **Fallback:** Falls neue Logik nicht verfügbar, nutze alte Berechnung
4. Aggregiere `calculated_impact` pro User/Project

**Code (mit Fallback):**
```typescript
// Für jede Donation
function getShareText(donation: Donation, project: Project, language: 'en' | 'de'): string {
  // 1. Nutze generierten Text aus Snapshot (neue Donations)
  if (language === 'de' && donation.generatedTextPastDe) {
    return donation.generatedTextPastDe;
  }
  if (language === 'en' && donation.generatedTextPastEn) {
    return donation.generatedTextPastEn;
  }
  
  // 2. Fallback: Generiere aus Template (alte Donations oder neue ohne Snapshot)
  if (project.pastTemplateEn && project.impactFactor != null) {
    const impact = calculateImpactUnified(project, donation.amount);
    return generatePastTextFromTemplate(impact, project, language);
  }
  
  // 3. Fallback: Alte Logik (für Projekte ohne neue Felder)
  const oldImpact = calculateImpact(project, donation.amount);
  return formatOldImpactText(oldImpact, project, language);
}

// Aggregation (mit Fallback)
const totalImpact = donations.reduce((sum, d) => {
  if (d.calculatedImpact != null) {
    return sum + Number(d.calculatedImpact);
  }
  // Fallback: Berechne Impact für alte Donations
  const impact = calculateImpactUnified(project, d.amount);
  return sum + impact.impact;
}, 0);
```

**Wichtig:** Drei-stufige Fallback-Logik stellt sicher, dass alle Donations (alt und neu) korrekt angezeigt werden!

### 4.4 Impact-Summary-Modal

**Datei:** `Tech/client/src/components/dashboard/impact-summary-modal.tsx`

**Änderungen:**
1. Nutze `calculated_impact` aus Donations (wenn vorhanden)
2. Fallback: Berechne mit neuer Logik
3. Aggregiere nach `impact_unit` und nutze `generated_text_past_*` für Share-Strings

---

## Phase 5: Testing & Rollout (2-3 Tage)

### 5.1 Feature-Flag

**Datei:** `Tech/client/src/lib/feature-flags.ts`

**Hinzufügen:**
```typescript
export const USE_NEW_IMPACT_SYSTEM = 
  import.meta.env.VITE_USE_NEW_IMPACT_SYSTEM === 'true' || 
  new URLSearchParams(window.location.search).has('newImpactSystem');
```

### 5.2 Staging-Tests

**Test-Projekte:** 10 Projekte mit verschiedenen Impact-Typen
- Personen (ganzzahlig)
- kg/Liter (Dezimal)
- Verschiedene Sprachen
- Verschiedene Beträge

**Test-Szenarien:**
1. Preset-Spende ($250) → Snapshot korrekt
2. Custom-Spende ($75) → Snapshot korrekt
3. <1 Person ($5) → Tooltip mit Dezimalwert
4. Große Spende ($5000) → Snapshot korrekt
5. Dashboard → Share-Texts korrekt
6. Impact-Summary → Aggregation korrekt

### 5.3 Monitoring & Logging

**Fehler-Logging:**
- Wenn `impact_factor` fehlt → Log Warning
- Wenn Snapshot-Generierung fehlschlägt → Log Error, Fallback auf alte Logik
- Wenn `generated_text_*` fehlt → Fallback auf Berechnung

### 5.4 Production-Rollout

**Schritte:**
1. Deploy mit Feature-Flag `VITE_USE_NEW_IMPACT_SYSTEM=false` (Standard)
2. Test mit `?newImpactSystem=1` in URL
3. Nach erfolgreichen Tests: Feature-Flag auf `true` setzen
4. Monitoring für 1 Woche
5. Nach erfolgreicher Validierung: Feature-Flag entfernen (immer aktiv)

---

## Phase 6: Cleanup (Optional, später)

### 6.1 Legacy-Spalten entfernen

**Nur nach erfolgreicher Migration und Validierung:**
- `donation1-7`, `impact1-7` können entfernt werden (nach 3-6 Monaten)
- `impactUnit`, `impact_noun`, `impact_verb` können entfernt werden
- Alte Interpolations-Logik kann entfernt werden

**SQL:**
```sql
-- NUR nach vollständiger Validierung!
ALTER TABLE projects DROP COLUMN donation_1;
ALTER TABLE projects DROP COLUMN impact_1;
-- ... für alle 7 Presets
```

---

## Akzeptanzkriterien

### Must-Have (Phase 1-5):
- ✅ Neue Donations haben `impact_snapshot` mit `calculated_impact` und generierten Texten
- ✅ Dashboard zeigt konsistente Share-Strings aus Snapshots (neue Donations) oder Templates (alte Donations)
- ✅ Preset- und Custom-Spenden erzeugen identische Berechnungen
- ✅ Keine Breaking Changes für bestehende Daten
- ✅ Fallback auf alte Logik, wenn neue Felder fehlen
- ✅ **Kein Backfill für historische Donations** - nur neue Donations erhalten Snapshots

### Nice-to-Have (Phase 6):
- Legacy-Spalten entfernt
- Admin-UI für Impact-Management (optional)

---

## Risiken & Mitigation

### Risiko 1: Inkonsistente Presets
**Mitigation:** Phase 0 Analyse identifiziert problematische Projekte, manuelle Review

### Risiko 2: Fehlende Snapshots bei neuen Donations
**Mitigation:** Fehler-Logging, Fallback auf alte Logik, Monitoring

### Risiko 3: Performance bei vielen Donations
**Mitigation:** Snapshots werden nur bei Donation-Erstellung generiert, nicht bei jedem Dashboard-Load

### Risiko 4: Breaking Changes
**Mitigation:** Alle neuen Felder nullable, Feature-Flag, Fallback-Logik

---

## Timeline

- **Phase 0:** 1 Tag (Analyse & Backup)
- **Phase 1:** 2-3 Tage (Schema)
- **Phase 2:** 2-3 Tage (Backfill)
- **Phase 3:** 3-4 Tage (Server-Generierung)
- **Phase 4:** 3-4 Tage (Frontend)
- **Phase 5:** 2-3 Tage (Testing & Rollout)
- **Phase 6:** Optional (Cleanup)

**Gesamt:** ~13-20 Tage (2.5-4 Wochen)

---

## Nächste Schritte

1. ✅ Phase 0 starten: Analyse-Script erstellen
2. ✅ Backup-Script erstellen
3. ✅ Schema-Migration vorbereiten
4. ✅ Impact-Generator implementieren

---

## Notizen

- **Lineare Presets:** Einheitlicher `impact_factor` für alle Projekte
- **⚠️ Kein Backfill für Donations:** Nur neue Donations (ab Migration) erhalten Impact-Snapshots. Historische Donations werden weiterhin mit aktueller Logik berechnet (Fallback).
- **Locale-Templates:** Templates (`cta_template_*`, `past_template_*`) statt einfacher String-Konkatenation für natürlich klingende Sätze. Handhabt unregelmäßige Pluralformen automatisch über `{unit}` Platzhalter.
- **Keine Admin-UI:** Manuelle DB-Updates für Inkonsistenzen
- **Feature-Flag:** Schrittweiser Rollout mit Fallback

---

*Letzte Aktualisierung: [Datum]*
*Status: In Planung*

