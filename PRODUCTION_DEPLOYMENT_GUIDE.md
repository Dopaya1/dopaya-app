# 🚀 Production Deployment Guide

## ✅ Pre-Deployment Checklist

### 1. **Stripe Production Keys**

In Vercel Dashboard → Settings → Environment Variables:

```bash
# Production Stripe Keys (von Stripe Dashboard)
VITE_STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...

# Webhook Secret (von Stripe Production Webhook, nicht CLI!)
STRIPE_WEBHOOK_SECRET=whsec_...
```

**⚠️ WICHTIG:**
- Test Keys (`pk_test_...`, `sk_test_...`) funktionieren **NUR** in Test Mode
- Production Keys erhältst du von: **Stripe Dashboard** → **Developers** → **API keys**
- Toggle auf **"Live mode"** (oben rechts)

---

### 2. **Stripe Production Webhook**

#### Schritt 1: Webhook Endpoint erstellen

1. Gehe zu **Stripe Dashboard** → **Developers** → **Webhooks** (Live mode!)
2. Klick **"Add endpoint"**
3. URL: `https://your-vercel-domain.vercel.app/api/stripe/webhook`
4. Description: "Dopaya Production Webhook"
5. Events auswählen:
   - `payment_intent.succeeded`
   - `charge.succeeded`
   - `charge.updated`
6. **Add endpoint**

#### Schritt 2: Webhook Secret kopieren

7. Nach Erstellung: Klick auf den Webhook
8. **Signing secret** anzeigen und kopieren (`whsec_...`)
9. In Vercel Environment Variables als `STRIPE_WEBHOOK_SECRET` hinzufügen

---

### 3. **Supabase Environment Variables**

Stelle sicher, dass diese in Vercel gesetzt sind:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
DATABASE_URL=postgresql://...
```

---

### 4. **SQL Migrations (Supabase)**

Stelle sicher, dass diese Spalte existiert:

```sql
-- In Supabase SQL Editor ausführen:
ALTER TABLE donations 
ADD COLUMN IF NOT EXISTS "tipAmount" INTEGER DEFAULT 0;
```

---

## 🔧 **Deployment Schritte**

### Option 1: Via Vercel CLI

```bash
# Install Vercel CLI (falls nicht installiert)
npm i -g vercel

# Login
vercel login

# Deploy to production
cd /Users/patrick/Cursor/Dopaya/Tech
vercel --prod
```

### Option 2: Via Git Push (empfohlen)

```bash
cd /Users/patrick/Cursor/Dopaya/Tech

# Stage wichtige Dateien
git add server/stripe-routes.ts
git add server/project-mapper.ts
git add server/supabase-storage-new.ts
git add client/src/pages/support-page.tsx
git add client/src/components/payment/
git add shared/schema.ts
git add server/routes.ts
git add server/index.ts

# Commit
git commit -m "feat: Implement Stripe embedded payments with impact tracking

- Add embedded Stripe Payment Element
- Implement Payment Intent flow
- Add webhook handler for payment_intent.succeeded
- Add tipAmount tracking to donations
- Add impact snapshot generation
- Add project field mapper for snake_case/camelCase conversion
- Update donation creation to include impact fields"

# Push to main
git push origin main
```

Vercel wird **automatisch deployen** nach dem Push!

---

## 🧪 **Nach Deployment: Testing**

### 1. **Webhook Testing**

Gehe zu **Stripe Dashboard** → **Developers** → **Webhooks**:
- Check ob Status "Active" ist
- Send test webhook
- Check Logs für erfolgreiche Requests (200 Status)

### 2. **Payment Testing**

1. Gehe zu Production URL
2. Wähle ein Projekt
3. Teste mit **echter Kreditkarte** (kleine Beträge!)
4. Check:
   - ✅ Payment erfolgreich
   - ✅ Donation in Supabase erstellt
   - ✅ Impact Points vergeben
   - ✅ Email Receipt erhalten
   - ✅ Impact Snapshot gefüllt

### 3. **Email Receipt Check**

- Nach erfolgreicher Zahlung sollte Email binnen 1-2 Minuten ankommen
- Check Spam-Ordner falls nicht in Inbox
- Email kommt von Stripe (`receipts@stripe.com`)

---

## 🔍 **Monitoring & Debugging**

### Vercel Logs

```bash
# Real-time logs
vercel logs --follow

# Specific function logs
vercel logs /api/stripe/webhook
```

### Stripe Dashboard

**Developers** → **Events**:
- Alle Webhook Events
- Status (succeeded/failed)
- Response Logs
- Retry attempts

### Supabase

**Database** → **donations** Tabelle:
- Check neue Donations
- Verify alle Felder gefüllt sind
- Check `calculated_impact`, `impact_snapshot`, `generated_text_past_*`

---

## ⚠️ **Troubleshooting**

### Webhook Fehler

**400 Bad Request:**
- Check `STRIPE_WEBHOOK_SECRET` in Vercel
- Stelle sicher es ist der Production Secret (nicht CLI Secret!)

**500 Internal Server Error:**
- Check Vercel Function Logs
- Verify Supabase Connection
- Check Database Spalten existieren

### Keine Email

- Check Stripe Dashboard → Settings → Emails
- "Successful payments" muss aktiviert sein
- Nur Production Mode sendet Emails!
- Check Test Mode vs Live Mode

### Impact Snapshot leer

- Check Projekt hat `impactFactor` und Templates
- Check Logs: "Generating impact snapshot..."
- Verify `project-mapper.ts` wird korrekt importiert

---

## 📊 **Environment Variables Übersicht**

| Variable | Required | Source | Example |
|----------|----------|--------|---------|
| `VITE_STRIPE_PUBLIC_KEY` | ✅ | Stripe Dashboard (Live) | `pk_live_...` |
| `STRIPE_SECRET_KEY` | ✅ | Stripe Dashboard (Live) | `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | ✅ | Stripe Webhook Settings | `whsec_...` |
| `VITE_SUPABASE_URL` | ✅ | Supabase Project Settings | `https://xxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | ✅ | Supabase API Settings | `eyJhbG...` |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase API Settings | `eyJhbG...` |
| `DATABASE_URL` | ✅ | Supabase Database Settings | `postgresql://...` |

---

## 🎯 **Success Criteria**

Nach erfolgreichem Deployment:

- ✅ Payment Flow funktioniert
- ✅ Webhooks erreichen Server (200 Status)
- ✅ Donations werden in Supabase gespeichert
- ✅ Impact Points werden vergeben
- ✅ Impact Snapshot wird generiert
- ✅ Tip Tracking funktioniert
- ✅ Email Receipts werden versandt
- ✅ Keine Fehler in Vercel Logs
- ✅ Keine Fehler in Stripe Webhook Logs

---

## 📞 **Support**

Bei Problemen:
1. Check Vercel Function Logs
2. Check Stripe Webhook Logs
3. Check Supabase Database
4. Verify Environment Variables

---

**Deployment Date:** {{ Heute }}
**Version:** 1.0.0 - Stripe Embedded Payments

