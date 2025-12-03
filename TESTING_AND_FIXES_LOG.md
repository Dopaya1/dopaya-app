# Testing & Fixes Log

**Erstellt:** 2025-01-27
**Zweck:** Dokumentation aller offenen Tests, Fixes und Verifikationen

---

## 📋 Inhaltsverzeichnis

1. [Impact Points Acceptance Test](#impact-points-acceptance-test) ⏳ PENDING
2. [Weitere Tests & Fixes](#weitere-tests--fixes)

---

## Impact Points Acceptance Test

**Datum:** [Datum]
**Status:** ⏳ PENDING
**Zweck:** End-to-End Test des kompletten Donation-Flows

### Test-Schritte

#### Schritt 1: Auth-Token holen

**Im Browser:**
1. Öffne `http://localhost:3001`
2. Logge dich ein
3. Öffne Browser-Console (F12)
4. Führe aus:
```javascript
const { data: { session } } = await supabase.auth.getSession();
console.log('Token:', session?.access_token);
```
5. Kopiere den Token

#### Schritt 2: Test-Donation durchführen

**Im Terminal:**
```bash
TOKEN="dein-token-von-schritt-1"
PROJECT_ID=124  # Oder eine andere gültige Project ID
AMOUNT=10

curl -X POST http://localhost:3001/api/projects/$PROJECT_ID/donate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"amount\":$AMOUNT}"
```

**Erwartete Antwort:**
- Status: `201 Created`
- JSON mit donation data

#### Schritt 3: Server-Logs prüfen

**Erwartete Logs:**
- `[POST /api/projects/:id/donate] ✅ USER RESOLVED`
- `[createDonation] ✅ Donation created successfully`
- `[applyPointsChange] ✅ Used RPC function. User X: +Y points. Balance: A → B`
- `[createDonation] ✅ Transaction created for donation X`

#### Schritt 4: Datenbank prüfen (Supabase SQL Editor)

**Wo:** Supabase Dashboard → SQL Editor → New query

**Query 1: Finde User ID**
```sql
SELECT id, email, "impactPoints", "auth_user_id" 
FROM users 
WHERE email = 'deine-email@example.com';
```

**Query 2: Prüfe letzte Donation**
```sql
-- Ersetze USER_ID mit ID aus Query 1
SELECT id, "userId", "projectId", amount, "impactPoints", "createdAt"
FROM donations 
WHERE "userId" = USER_ID 
ORDER BY "createdAt" DESC 
LIMIT 1;
```

**Query 3: Prüfe letzte Transaction**
```sql
-- Ersetze USER_ID mit ID aus Query 1
SELECT id, user_id, transaction_type, points_change, points_balance_after, "createdAt"
FROM user_transactions 
WHERE user_id = USER_ID 
ORDER BY "createdAt" DESC 
LIMIT 1;
```

**Query 4: Verifiziere Balance-Match**
```sql
-- Ersetze USER_ID mit ID aus Query 1
SELECT 
  u.id, 
  u."impactPoints" as cached_balance,
  COALESCE(SUM(ut.points_change), 0) as calculated_balance,
  (u."impactPoints" = COALESCE(SUM(ut.points_change), 0)) as balance_matches
FROM users u
LEFT JOIN user_transactions ut ON ut.user_id = u.id
WHERE u.id = USER_ID 
GROUP BY u.id, u."impactPoints";
```

### Testing Checklist

- [ ] Test user existiert oder wurde erstellt
- [ ] Donation POST erfolgreich (201 status)
- [ ] Donation row in Datenbank erstellt
- [ ] Transaction row in Datenbank erstellt
- [ ] User `impactPoints` korrekt aktualisiert
- [ ] Balance = Summe aller Transactions (`balance_matches = true`)
- [ ] Server logs zeigen erfolgreichen Flow

### Test-Ergebnisse

**Datum:** [Datum]
**Tester:** [Name]

**Ergebnisse:**
- [ ] ✅ Alle Checks bestanden
- [ ] ❌ Fehler gefunden (Details unten)

**Details:**
```
[Füge hier Test-Ergebnisse, Logs, SQL-Query-Ergebnisse ein]
```

---

## Weitere Tests & Fixes

### Dashboard: Load More & Donation Aggregation

**Datum:** 2025-01-27
**Status:** ⏳ IN PROGRESS
**Problem:** 
- Viele unterstützte Projekte führen zu langen Listen ohne Pagination
- Mehrere Donations pro Projekt werden nicht aggregiert (nur Placeholder-Daten)
- Keine Möglichkeit, alle Donations zu sehen

**Lösung:**
1. **Load More Button:**
   - Initial: 4 Cards anzeigen
   - "Load More" Button zeigt weitere 4 Cards
   - Button verschwindet, wenn alle Cards geladen sind

2. **Donation Aggregation:**
   - Backend: Neue API `/api/user/supported-projects-with-donations` erstellen
   - Aggregiert pro Projekt:
     - `totalAmount`: Summe aller Donations
     - `totalImpact`: Summe aller Impact-Werte
     - `donationCount`: Anzahl der Donations
     - `lastDonationDate`: Datum der letzten Donation
     - `donations[]`: Array aller Donations (für Details)
   - Frontend: Aggregierte Daten anzeigen statt Placeholder
   - Optional: Expandable Details für einzelne Donations

**Dateien:**
- `Tech/server/routes.ts` - Neue API Route
- `Tech/server/supabase-storage-new.ts` - Neue Methode `getUserSupportedProjectsWithDonations`
- `Tech/client/src/pages/dashboard-v2.tsx` - Load More + Aggregierte Daten

**Implementierungs-Schritte:**
1. ✅ Dokumentation im Log
2. ✅ Backend API erweitern (`getUserSupportedProjectsWithDonations`)
3. ✅ Backend Route hinzugefügt (`/api/user/supported-projects-with-donations`)
4. ✅ Frontend Load More implementieren (initial 4, dann +4)
5. ✅ Frontend Aggregation anzeigen (totalAmount, totalImpactPoints, donationCount, lastDonationDate)
6. ⏳ Testing

**Ergebnis:** ⏳ PENDING TESTING

**Implementierungs-Details:**
- Backend: Neue Methode `getUserSupportedProjectsWithDonations` in `supabase-storage-new.ts`
- Backend: Neue Route `/api/user/supported-projects-with-donations` in `routes.ts`
- Frontend: Query geändert zu neuer API
- Frontend: Load More Button nach 4 Cards (zeigt weitere 4 pro Klick)
- Frontend: Aggregierte Daten werden angezeigt:
  - Gesamtbetrag (`totalAmount`)
  - Anzahl Donations (`donationCount`) - wird nur angezeigt wenn > 1
  - Letztes Donation-Datum (`lastDonationDate`)
  - Impact-Beschreibung aus Projekt (`impact_noun`, `impact_verb`, `impactUnit`)

**Details:**
```
- Load More: Initial 4, dann +4 pro Klick
- Aggregation: Ein Card pro Projekt mit Gesamtdaten
- Optional: Expandable Details für einzelne Donations
```

---

## Notizen

[Platz für allgemeine Notizen, Erkenntnisse, etc.]

