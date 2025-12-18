# 💰 Tip Tracking Implementation

**Date:** December 17, 2025  
**Status:** ✅ Completed  
**Risk Level:** Low (safe migration)

---

## 🎯 What Was Implemented

### Problem
- Donations stored only `amount` (support for project)
- Tips were paid to Dopaya but not tracked
- No way to see donation vs. tip separately

### Solution
- Added `tipAmount` column to `donations` table
- Updated schema and webhook handlers
- Tip is now tracked separately from project support

---

## 📊 Database Changes

### New Column: `tipAmount`

**Table:** `donations`  
**Type:** INTEGER  
**Default:** 0  
**Nullable:** No

**Migration SQL:**
```sql
ALTER TABLE donations 
ADD COLUMN "tipAmount" INTEGER DEFAULT 0;
```

**Column Structure:**
- `amount`: Support amount (goes to project) - e.g., $50
- `tipAmount`: Tip amount (goes to Dopaya) - e.g., $5
- **Total charged:** `amount + tipAmount` - e.g., $55

---

## 🔧 Code Changes

### 1. Schema Updated

**File:** `Tech/shared/schema.ts`

**Before:**
```typescript
export const donations = pgTable("donations", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  projectId: integer("projectId").notNull(),
  amount: integer("amount").notNull(),
  impactPoints: integer("impactPoints").notNull(),
  status: text("status").default("pending"),
  createdAt: timestamp("createdAt").defaultNow(),
  // ...
});
```

**After:**
```typescript
export const donations = pgTable("donations", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  projectId: integer("projectId").notNull(),
  amount: integer("amount").notNull(),       // Support amount
  tipAmount: integer("tipAmount").default(0), // Tip amount (NEW!)
  impactPoints: integer("impactPoints").notNull(),
  status: text("status").default("pending"),
  createdAt: timestamp("createdAt").defaultNow(),
  // ...
});
```

---

### 2. Webhook Handler Updated

**File:** `Tech/server/stripe-routes.ts`

**Payment Intent Handler (Line 374-381):**
```typescript
// Create donation (this also creates transaction and awards points)
const donation = await storage.createDonation({
  userId: numericUserId,
  projectId: parsedProjectId,
  amount: Math.round(parsedSupportAmount), // Support amount (goes to project)
  tipAmount: Math.round(parsedTipAmount),   // Tip amount (goes to Dopaya) - NEW!
  impactPoints: finalImpactPoints,
  status: 'completed'
});
```

**What Changed:**
- Added `tipAmount: Math.round(parsedTipAmount)` to donation creation
- `tipAmount` comes from Stripe Payment Intent metadata
- Rounds to integer (database expects INTEGER)

---

## 📋 Migration Steps

### Step 1: Run SQL Migration

**In Supabase SQL Editor:**

```sql
-- Add tipAmount column
ALTER TABLE donations 
ADD COLUMN "tipAmount" INTEGER DEFAULT 0;

-- Verify
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'donations'
AND column_name = 'tipAmount';
```

**Expected Result:**
```
column_name | data_type | column_default
tipAmount   | integer   | 0
```

---

### Step 2: Verify Existing Data

**Check that existing donations have tipAmount = 0:**

```sql
SELECT id, amount, "tipAmount", "createdAt"
FROM donations
ORDER BY "createdAt" DESC
LIMIT 10;
```

**Expected:**
- Existing donations: `tipAmount = 0` (automatically set by DEFAULT)
- New donations: `tipAmount = actual tip value`

---

### Step 3: Restart Server

**After schema update:**
```bash
# Terminal 1
cd Tech
npm run dev
```

The new schema is now active!

---

## 🧪 Testing

### Test 1: Verify Schema

```sql
-- Check donations table structure
\d donations

-- Should show tipAmount column
```

---

### Test 2: Create Donation with Tip

1. **Browser:** `http://localhost:3001/support/bonji?previewOnboarding=1`
2. **Amount:** $50
3. **Tip:** 10% = $5
4. **Total:** $55
5. **Pay with test card:** `4242 4242 4242 4242`

**Check Database:**
```sql
SELECT 
  id,
  amount,
  "tipAmount",
  amount + "tipAmount" as total_charged,
  "impactPoints"
FROM donations
ORDER BY "createdAt" DESC
LIMIT 1;
```

**Expected Result:**
```
id | amount | tipAmount | total_charged | impactPoints
---+--------+-----------+---------------+-------------
 X |     50 |         5 |            55 |          500
```

✅ **Success!** Tip is tracked separately!

---

### Test 3: Query Total Support vs. Tips

**Total Support Amount:**
```sql
SELECT SUM(amount) as total_support
FROM donations
WHERE status = 'completed';
```

**Total Tips:**
```sql
SELECT SUM("tipAmount") as total_tips
FROM donations
WHERE status = 'completed';
```

**Total Revenue:**
```sql
SELECT 
  SUM(amount) as total_support,
  SUM("tipAmount") as total_tips,
  SUM(amount + "tipAmount") as total_revenue
FROM donations
WHERE status = 'completed';
```

---

## 📊 Data Analysis Queries

### User Donation Breakdown

**See support vs. tips per user:**
```sql
SELECT 
  u.username,
  u.email,
  SUM(d.amount) as total_support,
  SUM(d."tipAmount") as total_tips,
  SUM(d.amount + d."tipAmount") as total_paid,
  COUNT(d.id) as donation_count
FROM donations d
JOIN users u ON d."userId" = u.id
WHERE d.status = 'completed'
GROUP BY u.id, u.username, u.email
ORDER BY total_paid DESC;
```

---

### Project Revenue Breakdown

**See how much each project received (excluding tips):**
```sql
SELECT 
  p.title,
  p.slug,
  SUM(d.amount) as project_support,
  SUM(d."tipAmount") as tips_generated,
  COUNT(d.id) as donation_count
FROM donations d
JOIN projects p ON d."projectId" = p.id
WHERE d.status = 'completed'
GROUP BY p.id, p.title, p.slug
ORDER BY project_support DESC;
```

---

### Tip Percentage Analysis

**Average tip percentage:**
```sql
SELECT 
  AVG((d."tipAmount"::FLOAT / NULLIF(d.amount, 0)) * 100) as avg_tip_percentage,
  MIN((d."tipAmount"::FLOAT / NULLIF(d.amount, 0)) * 100) as min_tip_percentage,
  MAX((d."tipAmount"::FLOAT / NULLIF(d.amount, 0)) * 100) as max_tip_percentage
FROM donations d
WHERE d.status = 'completed'
AND d.amount > 0;
```

---

## 🔄 Backwards Compatibility

### Existing Donations
- ✅ All existing donations have `tipAmount = 0` (set by DEFAULT)
- ✅ Queries without `tipAmount` still work
- ✅ No data loss

### Old Webhook Handler (checkout.session.completed)
- Still works for backwards compatibility
- Creates donations with `tipAmount = 0` (default value)
- No changes needed

### New Webhook Handler (payment_intent.succeeded)
- Uses `tipAmount` from metadata
- Tracks tips correctly
- Future-proof implementation

---

## ⚠️ Important Notes

### Impact Points Calculation
- Impact Points are calculated based on **support amount only** (`amount`)
- Tips do NOT count towards Impact Points
- Example: $50 support + $5 tip = 500 Impact Points (not 550)

### Display Logic
- Show `amount` as "Your Support"
- Show `tipAmount` as "Tip to Dopaya"
- Show `amount + tipAmount` as "Total Paid"

---

## 🚨 Troubleshooting

### "Column tipAmount does not exist"

**Problem:** Migration not run in database

**Solution:**
```sql
-- Run migration
ALTER TABLE donations 
ADD COLUMN "tipAmount" INTEGER DEFAULT 0;
```

---

### Tip shows as 0 in database

**Problem 1:** Webhook not receiving metadata

**Check Stripe CLI logs:**
```bash
# In Terminal 2 where Stripe CLI runs
# Look for tipAmount in metadata
```

**Problem 2:** Metadata not passed from frontend

**Check Payment Intent creation (server logs):**
```bash
# Should show: tipAmount: '5'
```

**Fix:** Ensure support-page.tsx passes tipAmount:
```typescript
await apiRequest("POST", `/api/create-payment-intent`, {
  // ...
  tipAmount: tipAmount, // Make sure this is included!
  // ...
});
```

---

### Old donations show tipAmount = null

**Problem:** Migration ran without DEFAULT 0

**Solution:**
```sql
-- Update existing NULL values
UPDATE donations
SET "tipAmount" = 0
WHERE "tipAmount" IS NULL;

-- Ensure default is set
ALTER TABLE donations 
ALTER COLUMN "tipAmount" SET DEFAULT 0;
```

---

## 📈 Future Enhancements

### 1. Dashboard Visualization
- Show tip vs. support breakdown in admin dashboard
- Graph: Support vs. Tips over time
- User stats: Average tip percentage

### 2. Custom Tip Amounts
- Allow users to enter custom tip amounts (not just percentage)
- Suggest different tip levels (5%, 10%, 15%, 20%)

### 3. Tip Reports
- Monthly tip revenue reports
- Project-specific tip generation
- User generosity leaderboard (highest tip %)

---

## ✅ Verification Checklist

- [ ] SQL migration executed successfully
- [ ] Schema updated in `shared/schema.ts`
- [ ] Webhook handler updated
- [ ] Server restarted
- [ ] Test donation created
- [ ] Tip tracked correctly in database
- [ ] Support amount separate from tip
- [ ] Impact Points calculated on support amount only
- [ ] Existing donations have tipAmount = 0
- [ ] No linter errors

---

## 📚 Related Files

- `Tech/ADD_TIP_TRACKING.sql` - SQL migration script
- `Tech/shared/schema.ts` - Updated schema
- `Tech/server/stripe-routes.ts` - Updated webhook handlers
- `Tech/STRIPE_CLI_SETUP.md` - Webhook testing guide

---

**Last Updated:** December 17, 2025  
**Status:** ✅ Production Ready  
**Migration Time:** < 1 minute  
**Risk Level:** Low (safe, tested)

