# Impact Templates - Freitext-Template Referenz

## Übersicht

**Wichtig:** Templates speichern nur den variablen Freitext-Teil. `{impact}` und `{unit}` werden automatisch eingefügt.

---

## Template-Struktur

### Platzhalter

| Platzhalter | Beschreibung | Beispiel | Wo verwendet |
|------------|--------------|----------|--------------|
| `{impact}` | Formatierter Impact-Wert | "1", "10", "0.5" | Automatisch eingefügt |
| `{unit}` | Unit (automatisch Singular/Plural) | "person" / "people", "Person" / "Personen" | Automatisch eingefügt |
| `{project}` | Projektname | "Openversum" | Nur in CTA (automatisch) |
| `{amount}` | Betrag in USD | "100" | Nur in CTA (automatisch) |
| `{points}` | Impact Points | "1000" | Nur in CTA (automatisch) |

### Template-Typen

1. **CTA (Call-to-Action)**: Für Teaser/Checkout-Seiten
2. **Past (Vergangenheit)**: Für Dashboard/Share-Cards

---

## Past Template (Dashboard/Share)

### Struktur
```
{impact} {unit} {freitext_past}
```

### Gespeichert in DB
- `past_template_en`: nur Freitext-Teil (z.B. `"provided with safe drinking water"`)
- `past_template_de`: nur Freitext-Teil (z.B. `"Zugang zu sauberem Trinkwasser gegeben"`)

### Beispiele

**Wasser & Sanitär:**
- `past_template_en`: `"provided with safe drinking water"`
- `past_template_de`: `"Zugang zu sauberem Trinkwasser gegeben"`
- **Generiert:** `"10 people provided with safe drinking water"` / `"10 Personen Zugang zu sauberem Trinkwasser gegeben"`

**Plastik entfernen:**
- `past_template_en`: `"of plastic removed"`
- `past_template_de`: `"Plastik entfernt"`
- **Generiert:** `"5 kg of plastic removed"` / `"5 kg Plastik entfernt"`

**Bäume pflanzen:**
- `past_template_en`: `"planted"`
- `past_template_de`: `"gepflanzt"`
- **Generiert:** `"50 trees planted"` / `"50 Bäume gepflanzt"`

**Bildung:**
- `past_template_en`: `"educated"`
- `past_template_de`: `"ausgebildet"`
- **Generiert:** `"10 children educated"` / `"10 Kinder ausgebildet"`

**Mahlzeiten:**
- `past_template_en`: `"provided to families"`
- `past_template_de`: `"an Familien verteilt"`
- **Generiert:** `"30 meals provided to families"` / `"30 Mahlzeiten an Familien verteilt"`

---

## CTA Template (Teaser/Checkout)

### Struktur
```
Support {project} with ${amount} and help {impact} {unit} {freitext_cta} — earn {points} Impact Points
```

### Gespeichert in DB
- `cta_template_en`: nur Freitext-Teil (z.B. `"access safe drinking water"`)
- `cta_template_de`: nur Freitext-Teil (z.B. `"Zugang zu sauberem Trinkwasser zu verschaffen"`)

### Beispiele

**Wasser & Sanitär:**
- `cta_template_en`: `"access safe drinking water"`
- `cta_template_de`: `"Zugang zu sauberem Trinkwasser zu verschaffen"`
- **Generiert:** `"Support Openversum with $100 and help 10 people access safe drinking water — earn 1000 Impact Points"` / `"Unterstütze Openversum mit $100 und hilf 10 Personen Zugang zu sauberem Trinkwasser zu verschaffen — verdiene 1000 Impact Points"`

**Plastik entfernen:**
- `cta_template_en`: `"remove plastic"`
- `cta_template_de`: `"Plastik zu entfernen"`
- **Generiert:** `"Support Ocean Cleanup with $25 and help 5 kg remove plastic — earn 250 Impact Points"` / `"Unterstütze Ocean Cleanup mit $25 und hilf 5 kg Plastik zu entfernen — verdiene 250 Impact Points"`

**Bäume pflanzen:**
- `cta_template_en`: `"plant trees"`
- `cta_template_de`: `"Bäume zu pflanzen"`
- **Generiert:** `"Support Reforest Earth with $50 and help 50 trees plant trees — earn 500 Impact Points"` / `"Unterstütze Reforest Earth mit $50 und hilf 50 Bäume Bäume zu pflanzen — verdiene 500 Impact Points"`

**Bildung:**
- `cta_template_en`: `"receive education"`
- `cta_template_de`: `"Bildung zu erhalten"`
- **Generiert:** `"Support Vision Friend with $250 and help 10 children receive education — earn 2500 Impact Points"` / `"Unterstütze Vision Friend mit $250 und hilf 10 Kinder Bildung zu erhalten — verdiene 2500 Impact Points"`

---

## Impact-Tiers (Nicht-lineare Projekte)

Für Projekte mit nicht-linearen Impact-Berechnungen (z.B. "pro Tag" bei kleinen Beträgen, "für ein Jahr" bei großen Beträgen):

**JSONB-Array in `projects.impact_tiers`:**
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

**Wichtig:** Auch hier nur Freitext-Teile! Die Struktur bleibt gleich:
- Past: `"{impact} {unit} {freitext_past}"`
- CTA: `"Support {project} with ${amount} and help {impact} {unit} {freitext_cta} — earn {points} Impact Points"`

---

## Template-Generierungs-Logik

### Schritt 1: Impact-Wert formatieren
```typescript
function formatImpact(calculatedImpact: number, unitType: string): string {
  if (unitType === 'person' || unitType === 'people') {
    // Personen: Ganzzahl wenn ≥1, sonst Dezimal
    if (calculatedImpact >= 1) {
      return Math.floor(calculatedImpact).toString();
    } else {
      return calculatedImpact.toFixed(2); // Für Tooltip
    }
  } else if (unitType === 'kg' || unitType === 'liter' || unitType === 'L') {
    // kg/Liter: 1 Dezimalstelle
    return calculatedImpact.toFixed(1);
  } else {
    // Andere: Ganzzahl wenn möglich
    return calculatedImpact % 1 === 0 
      ? calculatedImpact.toString() 
      : calculatedImpact.toFixed(1);
  }
}
```

### Schritt 2: Unit (Singular/Plural) wählen
```typescript
function getUnit(calculatedImpact: number, singular: string, plural: string): string {
  return calculatedImpact === 1 ? singular : plural;
}
```

### Schritt 3: Past Template rendern
```typescript
function renderPastTemplate(
  template: string,  // Nur Freitext-Teil
  impact: number,
  unit: string
): string {
  const formattedImpact = formatImpact(impact, unit);
  return `${formattedImpact} ${unit} ${template}`;
}
```

### Schritt 4: CTA Template rendern
```typescript
function renderCtaTemplate(
  template: string,  // Nur Freitext-Teil
  project: string,
  amount: number,
  impact: number,
  unit: string,
  points: number
): string {
  const formattedImpact = formatImpact(impact, unit);
  return `Support ${project} with $${amount} and help ${formattedImpact} ${unit} ${template} — earn ${points} Impact Points`;
}
```

---

## Beispiel: Vollständiger Workflow

### Projekt-Daten (Standard - linear):
```typescript
{
  title: "Openversum",
  impact_factor: 0.1, // 1$ = 0.1 Personen
  impact_unit_singular_en: "person",
  impact_unit_plural_en: "people",
  impact_unit_singular_de: "Person",
  impact_unit_plural_de: "Personen",
  past_template_en: "provided with safe drinking water",
  past_template_de: "Zugang zu sauberem Trinkwasser gegeben",
  cta_template_en: "access safe drinking water",
  cta_template_de: "Zugang zu sauberem Trinkwasser zu verschaffen",
  impact_tiers: null // Nicht gesetzt = lineares Projekt
}
```

### Donation: $100
```typescript
calculated_impact = 100 * 0.1 = 10
impact_points = 100 * 10 = 1000
unit = "people" (weil 10 !== 1)
```

### Generierte Texte:

**Past (EN):**
- Template: `"{impact} {unit} {freitext_past}"`
- Freitext: `"provided with safe drinking water"`
- Ergebnis: `"10 people provided with safe drinking water"`

**Past (DE):**
- Template: `"{impact} {unit} {freitext_past}"`
- Freitext: `"Zugang zu sauberem Trinkwasser gegeben"`
- Ergebnis: `"10 Personen Zugang zu sauberem Trinkwasser gegeben"`

**CTA (EN):**
- Template: `"Support {project} with ${amount} and help {impact} {unit} {freitext_cta} — earn {points} Impact Points"`
- Freitext: `"access safe drinking water"`
- Ergebnis: `"Support Openversum with $100 and help 10 people access safe drinking water — earn 1000 Impact Points"`

**CTA (DE):**
- Template: `"Unterstütze {project} mit ${amount} und hilf {impact} {unit} {freitext_cta} — verdiene {points} Impact Points"`
- Freitext: `"Zugang zu sauberem Trinkwasser zu verschaffen"`
- Ergebnis: `"Unterstütze Openversum mit $100 und hilf 10 Personen Zugang zu sauberem Trinkwasser zu verschaffen — verdiene 1000 Impact Points"`

---

## Unregelmäßige Pluralformen

### Englisch
- `person` / `people`
- `child` / `children`
- `woman` / `women`
- `man` / `men`

### Deutsch
- `Person` / `Personen`
- `Kind` / `Kinder`
- `Frau` / `Frauen`
- `Mann` / `Männer`
- `Baum` / `Bäume`
- `Mahlzeit` / `Mahlzeiten`

**Lösung:** Explizite Speicherung in `impact_unit_singular_*` / `impact_unit_plural_*` Feldern.

---

## Zusammenfassung

✅ **Templates speichern nur Freitext-Teile**
- Past: `"{impact} {unit} {freitext_past}"` → nur `{freitext_past}` wird gespeichert
- CTA: `"Support {project} with ${amount} and help {impact} {unit} {freitext_cta} — earn {points} Impact Points"` → nur `{freitext_cta}` wird gespeichert

✅ **Platzhalter werden automatisch eingefügt:**
- `{impact}` → formatierter Impact-Wert
- `{unit}` → Singular/Plural basierend auf Impact-Wert
- `{project}`, `{amount}`, `{points}` → nur in CTA (automatisch)

✅ **Flexibilität durch Freitext:**
- Jede Wortstellung möglich (durch Freitext-Position)
- Natürlich klingende Sätze
- Lokalisierbar (DE/EN Templates unabhängig)

---

*Letzte Aktualisierung: [Datum]*
*Status: Referenz-Dokument*
