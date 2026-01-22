# 🚀 Complete Setup Instructions

**Erstellt:** 17. Dezember 2025  
**Status:** ✅ Ready to Execute

---

## 📋 Was wurde implementiert

### ✅ **Phase 1: Payment Integration (COMPLETED)**
- Embedded Stripe Payment Form
- Payment Intent Endpoint
- Webhook Handler
- Impact Points Tracking

### ✅ **Phase 2: Tip Tracking (COMPLETED)**
- `tipAmount` Spalte zur Datenbank
- Schema Update
- Webhook Update für Tip-Tracking

### ⏳ **Phase 3: Localhost Webhook Testing (TO DO)**
- Stripe CLI Setup
- Webhook Forwarding

---

## 🎯 Was DU jetzt machen musst

### **SCHRITT 1: SQL Migration ausführen** (2 Minuten)

**Öffne Supabase SQL Editor:**
1. Gehe zu: https://supabase.com/dashboard
2. Wähle dein Projekt: **Impaktera**
3. Klicke links auf: **SQL Editor**
4. Klicke: **New Query**

**Kopiere und führe aus:**

```sql
-- Add tipAmount column to donations table
ALTER TABLE donations 
ADD COLUMN "tipAmount" INTEGER DEFAULT 0;

-- Add comment for documentation
COMMENT ON COLUMN donations."tipAmount" IS 'Tip amount given to Dopaya (separate from project support amount)';

-- Verify column was added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'donations'
AND column_name = 'tipAmount';
```

**Klicke: RUN** (oder Cmd+Enter)

**Erwartetes Ergebnis:**
```
column_name | data_type | column_default
tipAmount   | integer   | 0
```

✅ **Wenn du das siehst: Erfolgreich!**

---

### **SCHRITT 2: Server neu starten** (1 Minute)

**Terminal 1:**
```bash
# Stoppe Server (Ctrl+C falls läuft)
cd Tech
npm run dev
```

✅ **Server läuft jetzt mit neuem Schema!**

---

### **SCHRITT 3: Stripe CLI Setup** (5 Minuten)

**Terminal 2 (neu öffnen):**

#### 3.1 Installieren
```bash
brew install stripe/stripe-cli/stripe
```

#### 3.2 Login
```bash
stripe login
```
→ Browser öffnet sich, login bestätigen

#### 3.3 Webhook Forwarding starten
```bash
stripe listen --forward-to localhost:3001/api/stripe/webhook
```

**Output:**
```
> Ready! Your webhook signing secret is whsec_abc123xyz...
```

✅ **Kopiere den Webhook Secret!** (die komplette Zeile nach "secret is")

---

### **SCHRITT 4: Webhook Secret zur .env hinzufügen** (1 Minute)

**Öffne:** `Tech/.env`

**Füge diese Zeile hinzu:**
```bash
STRIPE_WEBHOOK_SECRET=whsec_abc123xyz... # Dein Secret von oben
```

**Speichern!**

---

### **SCHRITT 5: Server NOCHMAL neu starten** (1 Minute)

**Terminal 1:**
```bash
# Stoppe Server (Ctrl+C)
npm run dev
```

**Terminal 2:**
```bash
# Stripe CLI läuft weiter - NICHT stoppen!
```

---

## 🧪 **SCHRITT 6: TESTEN!**

### Test 1: Webhook Test Event

**Terminal 3 (neu öffnen):**
```bash
stripe trigger payment_intent.succeeded
```

**Watch Terminal 2 (Stripe CLI):**
```
✅ --> payment_intent.succeeded [evt_test_abc]
✅ <-- [200] POST localhost:3001/api/stripe/webhook
```

**Watch Terminal 1 (Server):**
```
[Stripe Webhook - Payment Intent] Processing donation...
[Stripe Webhook - Payment Intent] ✅ Donation created: ID X, +100 Impact Points
```

✅ **Wenn du das siehst: Webhooks funktionieren!**

---

### Test 2: Echte Payment

1. **Browser:** http://localhost:3001/support/bonji?previewOnboarding=1
2. **Login** (falls nötig)
3. **Wähle Betrag:** $50
4. **Tip:** 10% (Slider)
5. **Klicke:** "Continue"
6. **Payment Modal erscheint!**
7. **Gib Test-Karte ein:**
   ```
   Card: 4242 4242 4242 4242
   Expiry: 12/34
   CVC: 123
   ZIP: 12345
   ```
8. **Klicke:** "Pay $55.00"

**Was du sehen solltest:**
1. ✅ Button zeigt "Processing..."
2. ✅ Modal schließt sich
3. ✅ Processing Animation erscheint
4. ✅ "Congratulations! +500 Impact Points"
5. ✅ Mini-Journey Modal

**Watch Terminal 2 (Stripe CLI):**
```
--> payment_intent.succeeded [evt_1abc...]
<-- [200] POST localhost:3001/api/stripe/webhook
```

**Watch Terminal 1 (Server):**
```
[Payment Intent] ✅ Created: pi_abc123
[Stripe Webhook - Payment Intent] Processing donation: User 1, Amount $50, Project 1
[Stripe Webhook - Payment Intent] ✅ Donation created: ID 456, +500 Impact Points
```

---

### Test 3: Datenbank prüfen

**Supabase SQL Editor:**
```sql
SELECT 
  id,
  amount,
  "tipAmount",
  amount + "tipAmount" as total,
  "impactPoints",
  "createdAt"
FROM donations
ORDER BY "createdAt" DESC
LIMIT 1;
```

**Erwartetes Ergebnis:**
```
id | amount | tipAmount | total | impactPoints | createdAt
---+--------+-----------+-------+--------------+------------------------
 X |     50 |         5 |    55 |          500 | 2025-12-17 15:30:00
```

✅ **Perfekt! Tip wird separat getrackt!**

---

## 🎉 Was jetzt funktioniert

### ✅ Real Payments
- Stripe verarbeitet echte Zahlungen
- Kreditkarte, Apple Pay, Google Pay

### ✅ Webhooks
- Lokale Entwicklung mit Stripe CLI
- Donations werden automatisch erstellt
- Impact Points werden vergeben

### ✅ Tip Tracking
- Support-Betrag separat von Tip
- In Datenbank: `amount` (Support) + `tipAmount` (Tip)
- Queries können Support vs. Tip analysieren

### ✅ Receipt Emails
- Stripe sendet automatisch Email-Receipt
- User bekommt Bestätigung nach Zahlung

---

## 📊 Terminal Übersicht während Development

**Du brauchst 3 Terminals:**

```
┌─────────────────────────────────────┐
│ Terminal 1: Server                  │
│ $ cd Tech && npm run dev            │
│ → Port 3001                         │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Terminal 2: Stripe CLI              │
│ $ stripe listen --forward-to...     │
│ → Webhook Forwarding                │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Terminal 3: Commands                │
│ $ git, stripe trigger, etc.         │
│ → Für Tests & Commands              │
└─────────────────────────────────────┘
```

---

## 📚 Dokumentation

### Guides erstellt:
- ✅ `PAYMENT_MIGRATION_GUIDE.md` - Kompletter Guide (1283 Zeilen)
- ✅ `PAYMENT_QUICK_START.md` - Quick Start (266 Zeilen)
- ✅ `PAYMENT_IMPLEMENTATION_LOG.md` - Was implementiert wurde
- ✅ `STRIPE_CLI_SETUP.md` - Stripe CLI Anleitung
- ✅ `TIP_TRACKING_IMPLEMENTATION.md` - Tip Tracking Details
- ✅ `ADD_TIP_TRACKING.sql` - SQL Migration Script
- ✅ **Dieses File** - Setup Instructions

---

## 🐛 Troubleshooting

### Problem: "Column tipAmount does not exist"
**Lösung:** SQL Migration in Schritt 1 ausführen

### Problem: Webhook kommt nicht an
**Lösung:** Stripe CLI in Terminal 2 muss laufen

### Problem: "Webhook signature verification failed"
**Lösung:** 
1. Stripe CLI neu starten
2. Neuen Secret kopieren
3. In .env einfügen
4. Server neu starten

### Problem: Tip ist 0 in Datenbank
**Lösung:** Prüfe dass Stripe CLI läuft (Terminal 2)

---

## ✅ Checklist

### Setup:
- [ ] SQL Migration ausgeführt
- [ ] Stripe CLI installiert
- [ ] `stripe login` erfolgreich
- [ ] Webhook forwarding läuft (Terminal 2)
- [ ] Webhook Secret in `.env`
- [ ] Server neu gestartet

### Testing:
- [ ] Test Webhook erfolgreich (`stripe trigger`)
- [ ] Echte Payment durchgeführt
- [ ] Donation in Supabase sichtbar
- [ ] `tipAmount` korrekt gespeichert
- [ ] Impact Points vergeben

### Verifizierung:
- [ ] Terminal 1 zeigt "Donation created"
- [ ] Terminal 2 zeigt "[200] POST webhook"
- [ ] Supabase zeigt neue Donation
- [ ] Browser zeigt Success Animation

---

## 🚀 Production Deployment (später)

Wenn du auf Production deployen willst:

1. **Stripe Live Keys** in Production .env
2. **Webhook in Stripe Dashboard erstellen:**
   - URL: `https://dopaya.com/api/stripe/webhook`
   - Events: `payment_intent.succeeded`
3. **Production Webhook Secret** zur .env
4. **Testen mit echter Karte**

**Kein Stripe CLI** in Production nötig!

---

## 🎯 Next Steps

1. ✅ **SQL Migration ausführen** (Schritt 1)
2. ✅ **Stripe CLI Setup** (Schritte 3-5)
3. ✅ **Testen** (Schritt 6)
4. 📊 **Analytics bauen** (später)
5. 🚀 **Production Deployment** (wenn bereit)

---

**Viel Erfolg!** 🎉

**Fragen?** Check die Guides oder frag mich!

**Status:** ✅ Alles bereit zum Ausführen


