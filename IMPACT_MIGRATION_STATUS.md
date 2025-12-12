# Impact Migration - Status & Änderungen

## ✅ Abgeschlossen

### Phase 0: Analyse & Backup
- ✅ Datenbank-Backup erstellt
- ✅ Analyse-Scripts erstellt (`analyze-impact-presets.sql`, `analyze-impact-presets.ts`)

### Phase 1: Schema-Erweiterung
- ✅ SQL-Migration ausgeführt (`add-impact-columns.sql`)
  - `projects` Tabelle: 9 neue Spalten + 2 optional
  - `donations` Tabelle: 4 neue Spalten
- ✅ Drizzle Schema aktualisiert (`shared/schema.ts`)
  - Neue Felder hinzugefügt
  - Alle als `nullable` für Backward-Compatibility
- ⏳ Daten in `projects` Tabelle werden manuell eingetragen

---

## ⏳ In Arbeit / Nächste Schritte

### Phase 1 (Fortsetzung)
- ⏳ Daten in `projects` Tabelle ausfüllen (manuell durch User)

### Phase 3: Server-seitige Generierung
- ✅ Impact-Generator implementiert (`server/impact-generator.ts`)
  - ✅ Lineare Projekte (impact_factor)
  - ✅ Nicht-lineare Projekte (impact_tiers)
  - ✅ Formatierung nach Regeln
  - ✅ Pluralisierung (Singular/Plural)
  - ✅ Text-Generierung (Past & CTA)
  - ✅ Multi-Language (DE/EN)
  - ✅ Fehlerbehandlung
  - ✅ Tests erfolgreich
- ✅ Integration in Donation-API (`api/projects-donate.ts` & Express-Flat-Route)
  - Speichert bei vorhandenen Impact-Daten: `calculated_impact`, `impact_snapshot`, `generated_text_past_en/de`
  - Fallback: Wenn `hasImpact` false oder Fehler → Donation läuft ohne Snapshot weiter
  - Keine Änderung am User-Flow, nur zusätzliche Felder

### Phase 4: Frontend-Anpassung
- ✅ Impact-Calculator refactoren (`calculateImpactUnified()` mit Fallback)
  - Neue Funktion `calculateImpactUnified()` erstellt
  - Unterstützt: impact_factor (linear), impact_tiers (non-linear), Fallback zu alter Logik
  - Snake_case → camelCase Mapping für Supabase-Kompatibilität
  - Multi-Language Support (EN/DE)
  - Rückgabewert enthält `source` für Debugging
- ✅ Case Study Popup (Homepage)
  - Nutzt `calculateImpactUnified()` für Impact-Berechnung
  - Nutzt `generateCtaText()` für Template-basierte Text-Generierung
  - Unterstützt DE/EN mit korrekten Texten
  - Farben: Betrag/Impact/Unit in Orange, Freitext in Schwarz
- ✅ Projektdetailseiten Boxen
  - Nutzt `calculateImpactUnified()` für Impact-Berechnung
  - Nutzt `generateCtaText()` für Template-basierte Text-Generierung
  - Fallback zu alter Logik für Projekte ohne Impact-Daten
- ✅ Dashboard: Impact Summary Modal & Share Cards
  - Nutzt `calculated_impact` aus Donation-Snapshots für Aggregation
  - Nutzt `generated_text_past_*` aus Snapshots für Labels (wenn verfügbar)
  - Fallback zu `calculateImpactUnified()` wenn kein Snapshot vorhanden
  - Fallback zu alter Logik für alte Projekte
  - Share-Cards nutzen Impact-Labels aus Modal für Share-Text
- ⏳ Support-Page: Live-Preview (NÄCHSTER SCHRITT)

---

## Wichtige Änderungen während der Diskussion

### 1. Template-Struktur: Freitext-Teile statt vollständige Templates ✅
- **Vorher:** Vollständige Templates mit allen Platzhaltern
- **Jetzt:** Nur Freitext-Teil wird gespeichert
  - Past: `"{impact} {unit} {freitext_past}"` → nur `{freitext_past}` gespeichert
  - CTA: `"Support {project} with ${amount} and help {impact} {unit} {freitext_cta} — earn {points} Impact Points"` → nur `{freitext_cta}` gespeichert

### 2. `has_impact` Spalte entfernt ✅
- Wird im Code geprüft (basierend auf vorhandenen Feldern)
- Keine redundante Spalte mehr

### 3. CTA-Texte in `donations` Tabelle entfernt ✅
- Nur Past-Texte werden gespeichert
- CTA-Texte werden nur vor der Spende benötigt (aus Projekt-Template generiert)

### 4. Impact-Tiers für nicht-lineare Projekte ✅
- JSONB-Spalte `impact_tiers` für Ausnahmen
- Auch hier nur Freitext-Teile in Templates

---

## Finale Spalten-Struktur

### `projects` Tabelle (9 Spalten + 2 optional)
1. `impact_factor` (NUMERIC) - Faktor für lineare Berechnung
2. `impact_unit_singular_en` (TEXT)
3. `impact_unit_plural_en` (TEXT)
4. `impact_unit_singular_de` (TEXT)
5. `impact_unit_plural_de` (TEXT)
6. `cta_template_en` (TEXT) - nur Freitext
7. `cta_template_de` (TEXT) - nur Freitext
8. `past_template_en` (TEXT) - nur Freitext
9. `past_template_de` (TEXT) - nur Freitext
10. `impact_tiers` (JSONB) - optional
11. `impact_presets` (JSONB) - optional

### `donations` Tabelle (4 Spalten)
1. `calculated_impact` (NUMERIC)
2. `impact_snapshot` (JSONB)
3. `generated_text_past_en` (TEXT)
4. `generated_text_past_de` (TEXT)

---

## Fallback-Logik (Modularer Ansatz)

### Prinzip: Drei-stufige Fallback-Logik

**1. Neue Logik (wenn verfügbar):**
- Nutze `impact_factor` oder `impact_tiers`
- Nutze neue Templates
- Nutze generierte Texte aus Snapshot

**2. Fallback zu neuen Templates (wenn Impact-Daten vorhanden):**
- Berechne Impact mit neuer Logik
- Generiere Texte aus Templates zur Laufzeit

**3. Fallback zu alter Logik (für alte Projekte/Donations):**
- Nutze alte Interpolation-Logik
- Nutze alte Formatierung

### Vorteile:
- ✅ Keine Breaking Changes
- ✅ Alte Projekte funktionieren weiterhin
- ✅ Schrittweise Migration möglich
- ✅ Geringstes Risiko

---

## Phase 4.1: Impact-Calculator Refactoring ✅

### Implementiert: `calculateImpactUnified()`

**Datei:** `Tech/client/src/lib/impact-calculator.ts`

**Funktionalität:**
- ✅ Neue Funktion `calculateImpactUnified(project, donationAmount, language)`
- ✅ Unterstützt drei Berechnungsmethoden:
  1. **New Linear**: `impact_factor` für lineare Projekte
  2. **New Tiers**: `impact_tiers` für nicht-lineare Projekte
  3. **Old Tiers**: Fallback zu alter `calculateImpact()` Logik
- ✅ Snake_case → camelCase Mapping für Supabase-Kompatibilität
- ✅ Multi-Language Support (EN/DE) für Unit-Auswahl
- ✅ Rückgabewert enthält `source` für Debugging (`'new_linear' | 'new_tiers' | 'old_tiers'`)
- ✅ Alte `calculateImpact()` Funktion bleibt erhalten (als `@deprecated` markiert)

**Fallback-Logik:**
1. Prüft ob Projekt neue Impact-Daten hat (`hasImpactData()`)
2. Wenn ja: Nutzt neue Logik (impact_factor oder impact_tiers)
3. Wenn nein: Fallback zu alter `calculateImpact()` Logik
4. Keine Breaking Changes - alte Projekte funktionieren weiterhin

**Nächster Schritt:** Integration in Case Study Popup (Homepage)

---

## Risiko-Mitigation

### 1. Alle neuen Spalten sind `nullable`
- Bestehende Daten bleiben unverändert
- Alte Queries funktionieren weiterhin

### 2. Fallback-Logik auf allen Ebenen
- Impact-Berechnung: Fallback zu alter Logik
- Text-Generierung: Fallback zu alter Formatierung
- Dashboard: Fallback für alte Donations

### 3. Modularer Ansatz
- Jede Phase kann unabhängig getestet werden
- Rollback möglich ohne Datenverlust
- Feature-Flag für schrittweisen Rollout

### 4. Keine Daten-Migration
- Kein Backfill für historische Donations
- Nur neue Donations erhalten Snapshots
- Alte Donations nutzen Fallback-Logik

---

## Nächste Schritte

1. ✅ **DONE:** SQL-Migration ausgeführt
2. ✅ **DONE:** Drizzle Schema aktualisiert
3. ⏳ **IN PROGRESS:** Daten in `projects` Tabelle ausfüllen (User)
4. ✅ **DONE:** Impact-Generator implementiert (Phase 3.1)
   - ✅ Alle Tests erfolgreich
   - ✅ Dokumentation erstellt
5. ⏳ **NEXT:** Integration in Donation-API (Phase 3.2)
6. ⏳ **NEXT:** Frontend-Anpassung mit Fallback (Phase 4)

---

*Letzte Aktualisierung: [Datum]*
*Status: Phase 1 abgeschlossen, Phase 3/4 nächste Schritte*

