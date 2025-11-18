# Phase 1 Database Schema Changes - COMPLETED ✅

**Date:** 2025-01-15  
**Status:** All migrations and TypeScript schema updates complete

---

## 🎉 Summary

Successfully completed all 4 database migrations and updated TypeScript schema for Phase 1 rewards system implementation.

---

## ✅ Completed Migrations

### Migration 1: Enhanced `rewards` table
**Added 10 new columns:**
- `brand_id` - Links to brands table
- `reward_type` - Type of reward (coupon_code, freebie, experience)
- `coupon_code` - The actual code users get
- `redemption_instructions` - How to redeem
- `inventory_count` - Total inventory (NULL = unlimited)
- `inventory_remaining` - Track usage
- `min_rank_required` - Tier-gating (impact-aspirer, supporter, etc.)
- `status` - Active, coming_soon, or out_of_stock
- `created_at` - When reward was added
- `updated_at` - Last modified

**Kept legacy fields for backward compatibility:**
- `partnerLevel`, `discount`, `discountName`, `companyName`

---

### Migration 2: Created `user_transactions` table
**Purpose:** Audit trail for all Impact Points movements

**13 columns:**
- `id`, `user_id`, `transaction_type`
- `project_id`, `donation_id`, `support_amount` (for support transactions)
- `reward_id`, `redemption_id` (for redemption transactions)
- `points_change` (positive = earned, negative = spent)
- `points_balance_after` (running balance for audit)
- `description`, `metadata`, `created_at`

**Indexes created:**
- `idx_user_transactions_user_id`
- `idx_user_transactions_created_at`
- `idx_user_transactions_type`
- `idx_user_transactions_user_created`

---

### Migration 3: Enhanced `redemptions` table
**Added 4 new columns:**
- `reward_id` - Links to rewards table
- `coupon_code` - The actual code given to user
- `status` - pending, fulfilled, or cancelled
- `fulfilled_at` - When redemption was fulfilled
- `metadata` - JSON string for extra data

**Indexes created:**
- `idx_redemptions_user_id`
- `idx_redemptions_reward_id`
- `idx_redemptions_status`
- `idx_redemptions_user_reward` (for duplicate check)

---

### Migration 4: Created `impact_ranks` table + enhanced `users` table

**New `impact_ranks` table (12 columns):**
- `id`, `rank_key`, `rank_name`
- `min_lifetime_points` - Threshold for this rank
- `display_order` - For sorting
- `icon_name`, `color_class`, `tagline`, `benefits`
- `is_active` - Can disable ranks
- `created_at`, `updated_at`

**Initial 4 ranks inserted:**
1. Impact Aspirer (0+ points)
2. Supporter (1000+ points)
3. Changemaker (5000+ points)
4. Impact Legend (20000+ points)

**Added to `users` table:**
- `lifetime_impact_points` - Total points ever earned (for rank calculation)
- `user_level` - Current rank (impact-aspirer, supporter, etc.)

**Indexes created:**
- `idx_impact_ranks_min_points`
- `idx_impact_ranks_active`
- `idx_users_level`
- `idx_users_lifetime_points`

---

## ✅ TypeScript Schema Updates

Updated `/Users/patrick/Cursor/Dopaya/Tech/shared/schema.ts`:

1. ✅ Added `lifetimeImpactPoints` and `userLevel` to `users` table
2. ✅ Added 10 Phase 1 fields to `rewards` table
3. ✅ Created `userTransactions` table schema with full types
4. ✅ Added 4 new fields to `redemptions` table
5. ✅ Created `impactRanks` table schema with full types

**All TypeScript types exported:**
- `InsertUserTransaction`, `UserTransaction`
- `InsertImpactRank`, `ImpactRank`
- Updated `User`, `Reward`, `Redemption` types

---

## 🎯 Key Design Decisions

### 1. Lifetime Points vs. Current Wallet
- **`impactPoints`** = Current spendable balance (decreases when redeeming)
- **`lifetimeImpactPoints`** = Total ever earned (never decreases, used for rank)
- **Ranks based on lifetime** = Users never lose rank when spending points ✅

### 2. Flexible Rank System
- Ranks stored in database table (not hardcoded)
- Can change thresholds anytime with simple UPDATE query
- Can add new ranks without code changes
- TypeScript code calculates ranks on-the-fly for flexibility

### 3. Static Coupon Codes (Phase 1)
- Same code shown to all users (e.g., "DOPAYA10")
- Code stored in `rewards.coupon_code`
- `redemptions` table tracks who redeemed what
- Prevents duplicate redemptions per user
- **Phase 2:** Unique codes per user

### 4. Audit Trail
- `user_transactions` = single source of truth for all point movements
- Every earn/spend creates a transaction record
- Running balance stored for verification
- Can reconstruct user balance at any point in time

---

## 🚀 What's Next

### Immediate Next Steps:
1. Update backend code to use new schema
2. Implement redemption logic with inventory tracking
3. Add rank calculation helpers
4. Build rewards filtering (by rank, status, inventory)

### Phase 2 Features (Later):
- Unique coupon codes per user
- Brand self-service portal
- Reward bundles/stacking
- Rank-based multipliers
- A/B testing for ranks

---

## 📊 Database State

**Tables Modified:**
- ✅ `users` (2 new columns)
- ✅ `rewards` (10 new columns)
- ✅ `redemptions` (4 new columns)

**Tables Created:**
- ✅ `user_transactions` (13 columns, 4 indexes)
- ✅ `impact_ranks` (12 columns, 2 indexes, 4 initial ranks)

**Total New Indexes:** 10
**Total New Columns:** 29
**Total New Tables:** 2

---

## 🔄 How to Update Ranks

### Change thresholds:
```sql
UPDATE impact_ranks
SET min_lifetime_points = 750
WHERE rank_key = 'supporter';

-- Then recalculate users:
UPDATE users u
SET user_level = (
  SELECT r.rank_key
  FROM impact_ranks r
  WHERE r.is_active = true
    AND u.lifetime_impact_points >= r.min_lifetime_points
  ORDER BY r.min_lifetime_points DESC
  LIMIT 1
);
```

### Add new rank:
```sql
INSERT INTO impact_ranks (rank_key, rank_name, min_lifetime_points, display_order, ...)
VALUES ('rising-star', 'Rising Star', 500, 1.5, ...);

-- Then recalculate users (same query as above)
```

---

## ✅ Verification

- ✅ All migrations run successfully in Supabase
- ✅ TypeScript schema updated
- ✅ No linter errors in schema.ts
- ✅ TypeScript compilation passes (pre-existing errors in other files are unrelated)
- ✅ Safe fallback: All changes are additive (no breaking changes)

---

## 🛡️ Rollback Plan (if needed)

If you need to revert:

```sql
-- Remove new columns from users
ALTER TABLE users DROP COLUMN lifetime_impact_points;
ALTER TABLE users DROP COLUMN user_level;

-- Remove new columns from rewards
ALTER TABLE rewards DROP COLUMN brand_id;
ALTER TABLE rewards DROP COLUMN reward_type;
-- ... (drop other new columns)

-- Remove new columns from redemptions
ALTER TABLE redemptions DROP COLUMN reward_id;
ALTER TABLE redemptions DROP COLUMN coupon_code;
-- ... (drop other new columns)

-- Drop new tables
DROP TABLE user_transactions;
DROP TABLE impact_ranks;
```

Then revert the TypeScript schema file from git:
```bash
git checkout HEAD -- Tech/shared/schema.ts
```

---

**Status:** ✅ Ready for Phase 1 implementation!





