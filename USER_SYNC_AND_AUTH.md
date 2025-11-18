# User Sync & Auth System - Complete Guide

## Overview

This document consolidates all information about:
1. User sync between `auth.users` and `public.users`
2. Impact Points system
3. Auth system fixes

## User Sync System

### How It Works

When a user signs up (email or Google OAuth):
1. Supabase creates user in `auth.users`
2. Our code calls `/api/auth/ensure-profile`
3. Backend creates user in `public.users` with 50 Impact Points
4. User redirected to dashboard

### Files Involved

- `client/src/components/auth/auth-modal.tsx` - Email signup sync
- `client/src/pages/auth-callback.tsx` - OAuth signup sync
- `server/routes.ts` - `/api/auth/ensure-profile` endpoint
- `server/supabase-storage-new.ts` - `getUserByEmail()` and `createUser()`

### Database Schema

**Required columns in `users` table:**
- `impactPoints` (INTEGER, default 50) - Current point balance
- `totalDonations` (INTEGER, default 0) - Total amount donated

**To add if missing:**
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS "impactPoints" INTEGER DEFAULT 50;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "totalDonations" INTEGER DEFAULT 0;
UPDATE users SET "impactPoints" = 50 WHERE "impactPoints" IS NULL;
```

### Manual Sync (If Needed)

For existing users in `auth.users` but not in `public.users`:

```bash
curl -X POST http://localhost:3001/api/auth/ensure-profile \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","username":"username","firstName":"First","lastName":"Last"}'
```

## Auth System Fix

### The Problem

- Frontend uses Supabase Auth (JWT tokens)
- Backend checks Passport sessions
- They don't communicate → 401 errors

### The Solution

See `SIMPLE_AUTH_FIX.md` for the complete implementation guide.

**Quick summary:**
1. Create middleware to verify Supabase tokens
2. Update queryClient to send tokens
3. Update protected routes to check Supabase auth
4. Fix logout to be more forgiving

## Troubleshooting

### User not in public.users after signup
- Check browser console for errors
- Check server logs for `/api/auth/ensure-profile` calls
- Manually sync using curl command above

### 401 Unauthorized errors
- Auth system mismatch (see SIMPLE_AUTH_FIX.md)
- Backend doesn't recognize Supabase sessions

### Logout not working
- Supabase session issue
- See SIMPLE_AUTH_FIX.md for fix

### Impact Points showing 0
- Check if `impactPoints` column exists
- Run SQL: `UPDATE users SET "impactPoints" = 50 WHERE "impactPoints" IS NULL;`

## Status

✅ User sync working
✅ Impact Points column added
✅ New signups get 50 Impact Points
⚠️ Auth system needs fix (see SIMPLE_AUTH_FIX.md)





