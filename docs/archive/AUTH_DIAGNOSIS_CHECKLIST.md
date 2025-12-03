# Authentication Diagnosis Checklist

## ✅ Step 1: Frontend Sending Authorization Header
**Status:** ✅ CONFIRMED
- Browser console shows: `[apiRequest] Token retrieved: Yes (length: 1347)`
- Browser console shows: `[apiRequest] Authorization header added`
- Frontend is correctly sending `Authorization: Bearer <token>` header

## ✅ Step 2: Backend Receiving Header
**Status:** ✅ LOGGING ADDED
- Added logging at start of `/api/projects/:id/donate` route
- Logs will show:
  - `[POST /api/projects/:id/donate] Authorization header: Present/Missing`
  - `[POST /api/projects/:id/donate] Authorization header value: Bearer ...`
  - Full headers object

**Action Required:** Check server terminal when making donation request

## ✅ Step 3: Backend Verifying Token with Correct Key
**Status:** ✅ FIXED
- Updated `supabase-auth-middleware.ts` to use `SERVICE_ROLE_KEY` for token verification
- Previously was using `ANON_KEY` which may not have permission to verify tokens
- Now uses `SERVICE_ROLE_KEY` if available, falls back to `ANON_KEY`
- Client is initialized lazily (after .env is loaded)

## ✅ Step 4: getSupabaseUser Logging
**Status:** ✅ LOGGING ADDED
- Logs show:
  - Authorization header presence
  - Bearer token check
  - Token length and preview
  - Supabase client initialization
  - Token verification result (success or error details)
  - User email if authenticated

**Action Required:** Check server terminal for `[getSupabaseUser]` logs

---

## Testing Instructions

1. **Restart server** to pick up changes:
   ```bash
   cd /Users/patrick/Cursor/Dopaya/Tech
   lsof -ti:3001 | xargs kill -9 2>/dev/null
   npm run dev
   ```

2. **Make a donation** and watch server terminal for:
   ```
   [POST /api/projects/:id/donate] ========== REQUEST ==========
   [POST /api/projects/:id/donate] Authorization header: Present
   [POST /api/projects/:id/donate] Authorization header value: Bearer ...
   [getSupabaseUser] ========== AUTH CHECK ==========
   [getSupabaseUser] Authorization header present: true
   [getSupabaseUser] Header starts with Bearer: true
   [getSupabaseUser] Token length: 1347
   [supabase-auth-middleware] ========== INITIALIZATION ==========
   [supabase-auth-middleware] Using key type: SERVICE_ROLE_KEY ✅
   [getSupabaseUser] ✅ User authenticated: your-email@example.com
   ```

3. **If you see errors**, check:
   - `[getSupabaseUser] ❌ Token verification error:` - Shows Supabase error
   - `[supabase-auth-middleware] ❌ MISSING` - Environment variable not loaded

---

## Key Changes Made

1. ✅ Added comprehensive logging to donation route
2. ✅ Updated auth middleware to use SERVICE_ROLE_KEY (was using ANON_KEY)
3. ✅ Added lazy initialization to ensure .env is loaded first
4. ✅ Added detailed error logging for token verification

---

## Expected Behavior

**If everything works:**
- Server logs show token received and verified
- User authenticated successfully
- Donation created
- Transaction record created
- User balance updated

**If still failing:**
- Check server logs for exact error message
- Verify SERVICE_ROLE_KEY is set in .env
- Verify token is being sent (check browser console)
- Check Supabase dashboard for token validity

