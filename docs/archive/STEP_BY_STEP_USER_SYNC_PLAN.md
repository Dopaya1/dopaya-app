# Step-by-Step User Sync Implementation Plan

## Goal
Fix "User not found in database" error by creating users on-the-fly when they authenticate via Supabase but don't exist in `public.users` table.

---

## Step 1: Inspect Current Schema ✅
**Status:** In Progress
**Action:** Check actual database schema for `users` table

**Check:**
- Current columns and their types
- Whether `auth_user_id` column exists
- Whether `password` is nullable
- Existing indexes

---

## Step 2: Add Missing Column & Make Password Nullable
**Status:** Pending
**Action:** 
- Add `auth_user_id TEXT` column if missing
- Make `password` nullable if it's currently NOT NULL

**SQL:**
```sql
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS auth_user_id TEXT;

ALTER TABLE public.users
ALTER COLUMN password DROP NOT NULL;
```

---

## Step 3: Add Unique Index
**Status:** Pending
**Action:** Add unique constraint on `auth_user_id`

**SQL:**
```sql
ALTER TABLE public.users
ADD CONSTRAINT users_auth_user_id_unique UNIQUE (auth_user_id);
```

---

## Step 4: Implement On-the-Fly Create Fallback
**Status:** Pending
**Action:** 
- Add `getUserByAuthId()` method to `SupabaseStorage`
- Add `createUserMinimal()` method to `SupabaseStorage`
- Update donation route to use these methods

---

## Step 5: Acceptance Tests
**Status:** Pending
**Action:**
- Test fresh user (no DB row) → donation should create user
- Test existing user → donation should work normally
- Verify user created with correct `auth_user_id`

---

## Step 6: Create Migration Script
**Status:** Pending
**Action:** Create SQL migration file for tracking

---

## Verification Checklist
After each step, verify:
- [ ] No errors in server logs
- [ ] Schema changes applied correctly
- [ ] Code compiles without errors
- [ ] Existing functionality still works

