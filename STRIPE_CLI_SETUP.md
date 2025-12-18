# 🔧 Stripe CLI Setup für Localhost Webhook Testing

**Status:** Required for local development  
**Warum:** Webhooks benötigen öffentliche URL, Stripe CLI forwarded zu localhost

---

## 📋 Was ist das Problem?

### Ohne Stripe CLI:
```
1. Payment auf localhost:3001 ✅
2. Stripe verarbeitet Payment ✅
3. Stripe versucht Webhook zu senden → https://dopaya.com/api/stripe/webhook ❌
4. Kann localhost nicht erreichen ❌
5. Keine Donation erstellt ❌
6. Keine Impact Points vergeben ❌
```

### Mit Stripe CLI:
```
1. Payment auf localhost:3001 ✅
2. Stripe verarbeitet Payment ✅
3. Stripe sendet Webhook ✅
4. Stripe CLI fängt Webhook ab ✅
5. Forwarded zu localhost:3001/api/stripe/webhook ✅
6. Donation erstellt ✅
7. Impact Points vergeben ✅
```

---

## 🚀 Installation & Setup

### Schritt 1: Stripe CLI installieren

**macOS:**
```bash
brew install stripe/stripe-cli/stripe
```

**Linux:**
```bash
# Debian/Ubuntu
wget https://github.com/stripe/stripe-cli/releases/latest/download/stripe_linux_x86_64.tar.gz
tar -xvf stripe_linux_x86_64.tar.gz
sudo mv stripe /usr/local/bin/
```

**Windows:**
```bash
# Mit Scoop
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe
```

**Verifizieren:**
```bash
stripe --version
# Output: stripe version X.XX.X
```

---

### Schritt 2: Bei Stripe einloggen

```bash
stripe login
```

**Was passiert:**
1. Browser öffnet sich automatisch
2. Login in deinen Stripe Account
3. "Allow access" bestätigen
4. Terminal zeigt: `Done! The Stripe CLI is configured`

**Verifizieren:**
```bash
stripe config --list
# Zeigt deine Account-Info
```

---

### Schritt 3: Webhook Forwarding starten

**Terminal 1 (Server):**
```bash
cd Tech
npm run dev
```
→ Server läuft auf localhost:3001

**Terminal 2 (Stripe CLI):**
```bash
stripe listen --forward-to localhost:3001/api/stripe/webhook
```

**Output:**
```
> Ready! You are using Stripe API Version [2025-07-30]. Your webhook signing secret is whsec_abc123xyz456... (^C to quit)
```

**⚠️ WICHTIG:** Kopiere den Webhook Secret!

---

### Schritt 4: Webhook Secret zur .env hinzufügen

**Öffne:** `Tech/.env`

**Füge hinzu:**
```bash
# Stripe Webhook Secret (from Stripe CLI)
STRIPE_WEBHOOK_SECRET=whsec_abc123xyz456...
```

**Speichern!**

---

### Schritt 5: Server neu starten

**Terminal 1:**
```bash
# Stoppe Server (Ctrl+C)
npm run dev
```

**Terminal 2:**
```bash
# Stripe CLI läuft weiter!
```

---

## 🧪 Testing

### Test 1: Webhook Forwarding testen

**Terminal 3:**
```bash
stripe trigger payment_intent.succeeded
```

**Expected Output in Terminal 2 (Stripe CLI):**
```
2025-12-17 15:30:00   --> payment_intent.succeeded [evt_test_abc123]
2025-12-17 15:30:00   <-- [200] POST localhost:3001/api/stripe/webhook [evt_test_abc123]
```

**Expected Output in Terminal 1 (Server):**
```
[Stripe Webhook - Payment Intent] Processing donation: User X, Amount $10, Project Y
[Stripe Webhook - Payment Intent] ✅ Donation created: ID 123, +100 Impact Points
```

---

### Test 2: Echte Payment mit Webhook

1. **Browser:** `http://localhost:3001/support/bonji?previewOnboarding=1`
2. **Wähle Betrag:** $50 + 10% Tip
3. **Click "Continue"**
4. **Payment Modal:** Kreditkarte eingeben
   ```
   Card: 4242 4242 4242 4242
   Expiry: 12/34
   CVC: 123
   ```
5. **Click "Pay $55.00"**

**Watch Terminal 2 (Stripe CLI):**
```
> payment_intent.succeeded [evt_1abc123]
< [200] POST localhost:3001/api/stripe/webhook
```

**Watch Terminal 1 (Server):**
```
[Payment Intent] ✅ Created: pi_abc123
[Stripe Webhook - Payment Intent] Processing donation: User 1, Amount $50, Project 1
[Stripe Webhook - Payment Intent] ✅ Donation created: ID 456, +500 Impact Points
```

**Check Supabase:**
- `donations` table → New row with amount=50
- `user_transactions` table → New transaction with points_change=500
- `users` table → impactPoints increased by 500

---

## 📊 Workflow während Development

### Terminal Setup:

**Terminal 1 - Server:**
```bash
cd Tech
npm run dev
```
→ Läuft dauerhaft während Development

**Terminal 2 - Stripe CLI:**
```bash
stripe listen --forward-to localhost:3001/api/stripe/webhook
```
→ Läuft parallel zu Server

**Terminal 3 - Commands:**
```bash
# Für Tests, Git, etc.
```

---

## 🔧 Troubleshooting

### "stripe: command not found"

**Problem:** Stripe CLI nicht installiert oder nicht in PATH

**Lösung:**
```bash
# Neu installieren
brew install stripe/stripe-cli/stripe

# Oder PATH prüfen
which stripe
```

---

### "Ready! Your webhook signing secret is whsec_..."

**Problem:** Webhook Secret falsch oder nicht in .env

**Lösung:**
1. Kopiere den EXAKTEN Secret aus Terminal 2
2. Füge zu `.env` hinzu: `STRIPE_WEBHOOK_SECRET=whsec_...`
3. Server neu starten

---

### Webhook liefert 404

**Problem:** Endpoint nicht gefunden

**Lösung:**
```bash
# Prüfe ob Server läuft
curl http://localhost:3001/api/stripe/webhook

# Sollte antworten (nicht 404)
```

---

### "Webhook signature verification failed"

**Problem:** Falscher Webhook Secret

**Lösung:**
1. **Stop** Stripe CLI (Ctrl+C in Terminal 2)
2. **Neu starten:**
   ```bash
   stripe listen --forward-to localhost:3001/api/stripe/webhook
   ```
3. **Neuer Secret** wird generiert
4. **Update** `.env` mit neuem Secret
5. **Restart** Server

---

## 🚀 Production Deployment

**Im Production brauchst du KEIN Stripe CLI!**

### Production Setup:

1. **Stripe Dashboard:** https://dashboard.stripe.com/webhooks/create
2. **URL:** `https://dopaya.com/api/stripe/webhook`
3. **Events auswählen:**
   - `payment_intent.succeeded`
   - `checkout.session.completed`
4. **Webhook Secret kopieren:** `whsec_...`
5. **In Production .env einfügen:**
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_production_secret_here
   ```

**Done!** Webhooks funktionieren automatisch.

---

## 📋 Quick Reference

### Start Development:
```bash
# Terminal 1
cd Tech && npm run dev

# Terminal 2
stripe listen --forward-to localhost:3001/api/stripe/webhook
```

### Test Webhook:
```bash
stripe trigger payment_intent.succeeded
```

### View Webhook Logs:
```bash
# In Stripe CLI Terminal (Terminal 2)
# Zeigt alle Webhooks live
```

### Stop Everything:
```bash
# Terminal 1: Ctrl+C (Server)
# Terminal 2: Ctrl+C (Stripe CLI)
```

---

## ✅ Checklist

- [ ] Stripe CLI installiert
- [ ] `stripe login` erfolgreich
- [ ] Webhook forwarding läuft
- [ ] Webhook Secret in `.env`
- [ ] Server neu gestartet
- [ ] Test-Webhook erfolgreich
- [ ] Echte Payment getestet
- [ ] Donation in Supabase sichtbar
- [ ] Impact Points vergeben

---

**Last Updated:** December 17, 2025  
**Status:** ✅ Complete Guide for Local Development

