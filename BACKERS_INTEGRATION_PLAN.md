# Backers Database Integration Plan

## Ziel
Die "Trusted by Leading Institutions" Section auf der Homepage dynamisch mit Supabase verbinden:
- Institutions aus `backers` Tabelle laden (nur `featured = true`)
- Supported Projects dynamisch aus `project_backers` Verknüpfung laden
- Logo-Pfade aus `logo_path` verwenden (statt lokaler Imports)
- Layout beibehalten

## Schritt-für-Schritt Plan

### Schritt 1: Schema-Definitionen erstellen
**Datei:** `shared/schema.ts`
- TypeScript Interfaces für `backers` Tabelle hinzufügen
- TypeScript Interfaces für `project_backers` Tabelle hinzufügen
- **Backup:** `shared/schema.ts.BACKUP-001`

### Schritt 2: Custom Hooks erstellen
**Datei:** `client/src/hooks/use-backers.tsx` (NEU)
- `useFeaturedBackers()` Hook erstellen:
  - Lädt alle Backers mit `featured = true` aus Supabase
  - Sortiert nach Name oder Reihenfolge
- `useBackerProjects(backerId)` Hook erstellen:
  - Lädt alle Projects für einen spezifischen Backer aus `project_backers`
  - Verknüpft mit `projects` Tabelle für vollständige Project-Daten
- **Backup:** N/A (neue Datei)

### Schritt 3: Logo-Handling implementieren
**Datei:** `client/src/lib/image-utils.ts` (oder neue `client/src/lib/logo-utils.ts`)
- Funktion `getLogoUrl(logoPath)` erstellen:
  - Handhabt Supabase Storage URLs (falls `logo_path` ein Storage-Pfad ist)
  - Handhabt externe URLs
  - Fallback auf lokale Assets falls nötig
- **Backup:** Falls bestehende Datei: `client/src/lib/image-utils.ts.BACKUP-001`

### Schritt 4: Component refactoring
**Datei:** `client/src/components/home/institutional-proof-simple.tsx`
- Lokale `institutions` Array entfernen
- `useFeaturedBackers()` Hook verwenden
- Lokale Logo-Imports entfernen
- `logo_path` aus Backer-Daten verwenden
- `supportedProjects` dynamisch laden:
  - Bei `selectedInstitution`: `useBackerProjects(backerId)` verwenden
  - Alle verknüpften Projects laden und anzeigen
- Fallback-Logik für fehlende Daten einbauen
- **Backup:** `client/src/components/home/institutional-proof-simple.tsx.BACKUP-001`

### Schritt 5: Error Handling & Loading States
**Datei:** `client/src/components/home/institutional-proof-simple.tsx`
- Loading States für Backers hinzufügen
- Loading States für Supported Projects hinzufügen
- Error Handling für fehlgeschlagene API-Calls
- Fallback-Anzeige wenn keine Backers gefunden werden
- **Backup:** N/A (wird in Schritt 4 erstellt)

### Schritt 6: Testing & Validierung
- Testen mit verschiedenen Backers (featured/non-featured)
- Testen mit verschiedenen Project-Backer-Verknüpfungen
- Testen mit fehlenden Logos
- Testen mit fehlenden Projekten
- Validierung dass Layout unverändert bleibt

## Wichtige Annahmen

1. **Spaltennamen in Supabase:**
   - `backers.name` → Name der Institution
   - `backers.Shortdescription` → Beschreibung (möglicherweise `short_description` in DB)
   - `backers.website:url` → Wahrscheinlich `website_url` in DB
   - `backers.logo_path` → Logo-Pfad
   - `backers.Featured` → Wahrscheinlich `featured` (boolean) in DB

2. **project_backers Tabelle:**
   - Spalten: `backer_id` (FK zu backers), `project_id` (FK zu projects)
   - Möglicherweise zusätzliche Spalten wie `created_at`

3. **Logo-Pfade:**
   - Können Supabase Storage URLs sein (`https://[project].supabase.co/storage/v1/object/public/[bucket]/[path]`)
   - Können externe URLs sein
   - Fallback auf lokale Assets wenn nötig

## Risiken & Lösungen

1. **Risiko:** Spaltennamen stimmen nicht mit Annahmen überein
   - **Lösung:** Debug-Logs einbauen, um tatsächliche Spaltennamen zu sehen

2. **Risiko:** Logo-Pfade funktionieren nicht
   - **Lösung:** Fallback auf lokale Assets oder Placeholder

3. **Risiko:** Performance bei vielen Backers/Projects
   - **Lösung:** Caching mit React Query, Lazy Loading

4. **Risiko:** Layout bricht
   - **Lösung:** Schrittweise Migration, Layout-Checks nach jedem Schritt

