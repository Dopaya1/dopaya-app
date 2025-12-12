# Impact Migration - Änderungs-Zusammenfassung

## Was wurde geändert?

### 1. Template-Struktur: Freitext-Teile statt vollständige Templates

**Vorher (falsch):**
- Templates speicherten vollständige Sätze mit allen Platzhaltern
- Beispiel: `"Support {project} with ${amount} and help {verb} {impact} {unit} — earn {points} Impact Points"`

**Jetzt (korrekt):**
- Templates speichern nur den variablen Freitext-Teil
- `{impact}` und `{unit}` werden automatisch eingefügt
- **Past Template:** `"{impact} {unit} {freitext_past}"` → nur `{freitext_past}` wird gespeichert
- **CTA Template:** `"Support {project} with ${amount} and help {impact} {unit} {freitext_cta} — earn {points} Impact Points"` → nur `{freitext_cta}` wird gespeichert

**Beispiele:**
- `past_template_en`: `"provided with safe drinking water"` (nur Freitext)
- `cta_template_en`: `"access safe drinking water"` (nur Freitext)
- Generiert: `"10 people provided with safe drinking water"` / `"Support Openversum with $100 and help 10 people access safe drinking water — earn 1000 Impact Points"`

---

### 2. `has_impact` Spalte entfernt

**Vorher:**
- `has_impact BOOLEAN DEFAULT true` als Spalte in `projects` Tabelle

**Jetzt:**
- `has_impact` wird im Code geprüft (basierend auf vorhandenen Feldern)
- Keine redundante Spalte mehr

**Code-Check:**
```typescript
function hasImpact(project: Project): boolean {
  return !!(
    project.impact_factor != null &&
    project.impact_unit_singular_en &&
    project.impact_unit_plural_en &&
    project.past_template_en &&
    project.cta_template_en
  );
}
```

---

### 3. `impact_name_*` Spalten entfernt

**Vorher:**
- `impact_name_en` und `impact_name_de` als separate Spalten

**Jetzt:**
- Impact-Name ist im Freitext-Template enthalten
- Keine separaten Spalten mehr nötig

---

### 4. Impact-Tiers: Auch nur Freitext-Teile

**Vorher:**
- Impact-Tiers speicherten vollständige Templates

**Jetzt:**
- Impact-Tiers speichern auch nur Freitext-Teile
- Gleiche Struktur wie Standard-Templates

**Beispiel:**
```json
{
  "min_amount": 0,
  "max_amount": 100,
  "impact_factor": 10.0,
  "cta_template_en": "fresh air per day",  // Nur Freitext
  "past_template_en": "fresh air per day provided"  // Nur Freitext
}
```

---

## Finale Spalten-Struktur

### `projects` Tabelle (9 Spalten + 2 optional)

**Erforderlich:**
1. `impact_factor` (NUMERIC) - Faktor für lineare Berechnung
2. `impact_unit_singular_en` (TEXT) - Unit Singular (EN)
3. `impact_unit_plural_en` (TEXT) - Unit Plural (EN)
4. `impact_unit_singular_de` (TEXT) - Unit Singular (DE)
5. `impact_unit_plural_de` (TEXT) - Unit Plural (DE)
6. `cta_template_en` (TEXT) - CTA Freitext (EN)
7. `cta_template_de` (TEXT) - CTA Freitext (DE)
8. `past_template_en` (TEXT) - Past Freitext (EN)
9. `past_template_de` (TEXT) - Past Freitext (DE)

**Optional:**
10. `impact_tiers` (JSONB) - Für nicht-lineare Projekte
11. `impact_presets` (JSONB) - Backup der alten Presets

### `donations` Tabelle (4 Spalten)

1. `calculated_impact` (NUMERIC) - Berechneter Impact-Wert
2. `impact_snapshot` (JSONB) - Vollständiger Snapshot
3. `generated_text_past_en` (TEXT) - Generierter Past-Text (EN)
4. `generated_text_past_de` (TEXT) - Generierter Past-Text (DE)

**Hinweis:** CTA-Texte werden nicht gespeichert, da sie nur vor der Spende benötigt werden (aus Projekt-Template generiert).

---

## SQL-Migration

Siehe: `Tech/scripts/add-impact-columns.sql`

**Ausführen:**
```sql
-- In Supabase SQL Editor oder via psql
\i Tech/scripts/add-impact-columns.sql
```

Oder direkt in Supabase SQL Editor kopieren und ausführen.

---

## Dokumentation aktualisiert

1. ✅ `IMPACT_TRACKING_MIGRATION.md` - Migrationsplan aktualisiert
2. ✅ `IMPACT_TEMPLATES_REFERENCE.md` - Template-Referenz komplett neu geschrieben
3. ✅ `scripts/add-impact-columns.sql` - SQL-Migration erstellt

---

## Nächste Schritte

1. ✅ SQL-Migration ausführen (Phase 1)
2. ⏳ Drizzle Schema aktualisieren (`shared/schema.ts`)
3. ⏳ Impact-Generator implementieren (Phase 3)
4. ⏳ Frontend-Anpassung (Phase 4)

---

*Letzte Aktualisierung: [Datum]*

