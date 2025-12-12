# Donations Tabelle - Spalten-Erklärung

## Übersicht

Die `donations` Tabelle speichert für jede Spende einen **unveränderlichen Snapshot** des Impacts zum Zeitpunkt der Spende. Dies ermöglicht:
- ✅ Konsistente Anzeige auch wenn sich Projekt-Daten später ändern
- ✅ Schnellen Zugriff ohne Template-Rendering
- ✅ Historische Genauigkeit

---

## Spalten-Details

**Wichtig:** Nur Past-Texte werden gespeichert. CTA-Texte werden nur vor der Spende benötigt (aus Projekt-Template generiert), nicht danach.

### 1. `calculated_impact` (NUMERIC)

**Zweck:** Der berechnete Impact-Wert zum Zeitpunkt der Spende

**Berechnung:**
```typescript
calculated_impact = donation_amount * impact_factor
```

**Beispiele:**
- Spende: $100, `impact_factor = 0.1` → `calculated_impact = 10.0`
- Spende: $50, `impact_factor = 10.0` → `calculated_impact = 500.0`
- Spende: $25, `impact_factor = 0.2` → `calculated_impact = 5.0`

**Verwendung:**
- Aggregation: Summe aller `calculated_impact` pro User/Project
- Dashboard: "Du hast insgesamt 150 Personen geholfen"
- Impact-Summary: Gesamt-Impact über alle Spenden

**Wichtig:** Dieser Wert bleibt unverändert, auch wenn sich `impact_factor` später ändert!

---

### 2. `impact_snapshot` (JSONB)

**Zweck:** Vollständiger Snapshot aller Impact-Daten zum Zeitpunkt der Spende

**Struktur:**
```json
{
  "en": {
    "calculated_impact": 10.0,
    "impact_factor": 0.1,
    "unit": "people",
    "unit_singular": "person",
    "unit_plural": "people",
    "generated_text_cta": "Support Openversum with $100 and help 10 people access safe drinking water — earn 1000 Impact Points",
    "generated_text_past": "10 people provided with safe drinking water",
    "timestamp": "2024-01-15T10:30:00Z"
  },
  "de": {
    "calculated_impact": 10.0,
    "impact_factor": 0.1,
    "unit": "Personen",
    "unit_singular": "Person",
    "unit_plural": "Personen",
    "generated_text_cta": "Unterstütze Openversum mit $100 und hilf 10 Personen Zugang zu sauberem Trinkwasser zu verschaffen — verdiene 1000 Impact Points",
    "generated_text_past": "10 Personen Zugang zu sauberem Trinkwasser gegeben",
    "timestamp": "2024-01-15T10:30:00Z"
  },
  "project_snapshot": {
    "title": "Openversum",
    "impact_factor": 0.1,
    "impact_unit_singular_en": "person",
    "impact_unit_plural_en": "people",
    "cta_template_en": "access safe drinking water",
    "past_template_en": "provided with safe drinking water"
  }
}
```

**Verwendung:**
- Vollständige Historie: Alle Daten zum Zeitpunkt der Spende
- Debugging: Nachvollziehen, warum ein bestimmter Text generiert wurde
- Migration: Fallback, falls einzelne Text-Spalten fehlen
- Audit: Nachweis, welche Projekt-Daten verwendet wurden

**Vorteil:** Enthält ALLE relevanten Daten in einem JSON-Objekt, auch wenn sich Projekt-Daten später ändern.

---

### 3. `generated_text_past_en` (TEXT)

**Zweck:** Vollständig generierter Past-Text (Englisch) - für Dashboard/Share

**Beispiel:**
```
"10 people provided with safe drinking water"
```

**Generierung:**
```typescript
// Template: "{impact} {unit} {freitext_past}"
// Freitext: "provided with safe drinking water"
// Ergebnis: "10 people provided with safe drinking water"
```

**Verwendung:**
- Dashboard: Share-Cards anzeigen
- Impact-Summary: Aggregierte Impact-Texte
- Social Sharing: Direkt teilbarer Text

**Wichtig:** Wird einmalig bei Spende generiert. Änderungen am Projekt-Template haben keine Auswirkung.

---

### 4. `generated_text_past_de` (TEXT)

**Zweck:** Vollständig generierter Past-Text (Deutsch) - für Dashboard/Share

**Beispiel:**
```
"10 Personen Zugang zu sauberem Trinkwasser gegeben"
```

**Generierung:**
```typescript
// Template: "{impact} {unit} {freitext_past}"
// Freitext: "Zugang zu sauberem Trinkwasser gegeben"
// Ergebnis: "10 Personen Zugang zu sauberem Trinkwasser gegeben"
```

**Verwendung:** Gleiche wie `generated_text_past_en`, nur für deutsche Seite.

---

## Warum beide: `impact_snapshot` (JSONB) UND einzelne Text-Spalten?

### `impact_snapshot` (JSONB)
- ✅ Vollständige Historie aller Daten
- ✅ Debugging & Audit
- ✅ Fallback, falls Text-Spalten fehlen
- ❌ Nicht direkt für SQL-Queries verwendbar (JSONB-Parsing nötig)

### `generated_text_past_*` (TEXT)
- ✅ Schneller Zugriff ohne JSONB-Parsing
- ✅ Direkt in SQL-Queries verwendbar
- ✅ Einfache Aggregation möglich
- ❌ Redundanz (auch in `impact_snapshot` enthalten)

**Lösung:** Beide haben ihren Zweck:
- **Text-Spalten** für Performance & einfache Queries
- **JSONB-Snapshot** für Vollständigkeit & Debugging

**Hinweis:** CTA-Texte werden nicht gespeichert, da sie nur vor der Spende benötigt werden (aus Projekt-Template generiert).

---

## Beispiel: Vollständiger Datensatz

**Donation:**
- `id`: 123
- `user_id`: 456
- `project_id`: 789
- `amount`: 100.00
- `created_at`: "2024-01-15T10:30:00Z"

**Impact-Spalten:**
```sql
calculated_impact = 10.0

impact_snapshot = {
  "en": {
    "calculated_impact": 10.0,
    "impact_factor": 0.1,
    "unit": "people",
    "generated_text_cta": "Support Openversum with $100 and help 10 people access safe drinking water — earn 1000 Impact Points",
    "generated_text_past": "10 people provided with safe drinking water"
  },
  "de": {
    "calculated_impact": 10.0,
    "impact_factor": 0.1,
    "unit": "Personen",
    "generated_text_cta": "Unterstütze Openversum mit $100 und hilf 10 Personen Zugang zu sauberem Trinkwasser zu verschaffen — verdiene 1000 Impact Points",
    "generated_text_past": "10 Personen Zugang zu sauberem Trinkwasser gegeben"
  }
}

generated_text_past_en = "10 people provided with safe drinking water"
generated_text_past_de = "10 Personen Zugang zu sauberem Trinkwasser gegeben"
```

---

## Wann werden diese Spalten gefüllt?

**Bei Spende-Erstellung** (in `api/projects-donate.ts`):

1. Impact berechnen: `calculated_impact = amount * impact_factor`
2. Unit wählen: Singular/Plural basierend auf `calculated_impact`
3. Past-Texte generieren: Templates rendern mit Platzhaltern
4. Snapshot erstellen: Alle Daten in JSONB speichern
5. In Datenbank speichern: Alle 4 Spalten auf einmal

**Code-Beispiel:**
```typescript
const impactSnapshotEn = generateImpactSnapshot(project, amount, 'en');
const impactSnapshotDe = generateImpactSnapshot(project, amount, 'de');

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

## Zusammenfassung

| Spalte | Typ | Zweck | Beispiel |
|--------|-----|-------|----------|
| `calculated_impact` | NUMERIC | Berechneter Impact-Wert | `10.0` |
| `impact_snapshot` | JSONB | Vollständiger Snapshot | `{ "en": {...}, "de": {...} }` |
| `generated_text_past_en` | TEXT | Past-Text (EN) | `"10 people provided with..."` |
| `generated_text_past_de` | TEXT | Past-Text (DE) | `"10 Personen Zugang zu..."` |

**Alle Spalten sind `nullable`** für Backward-Compatibility (alte Spenden haben keine Impact-Daten).

---

*Letzte Aktualisierung: [Datum]*

