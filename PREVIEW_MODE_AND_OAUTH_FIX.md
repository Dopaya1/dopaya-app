# Preview Mode & Google OAuth Fix

## 🎯 How to Preview the New Features

To see the mini gamification flows and new onboarding features, add `?previewOnboarding=1` to any URL:

**Examples:**
- `https://dopaya.com?previewOnboarding=1` (Homepage)
- `https://dopaya.com/dashboard?previewOnboarding=1` (Dashboard)
- `https://dopaya.com/projects?previewOnboarding=1` (Projects)

**Important:** The preview flag is stored in `sessionStorage`, so once you add it once, it will persist across navigation until you close the browser tab.

**To disable preview mode:**
- Close the browser tab/window, OR
- Clear sessionStorage: Open browser console and run `sessionStorage.removeItem('onboardingPreview')`

---

## ✅ What Was Fixed

### 1. **Google OAuth User Sync**
- **Problem:** Users authenticated via Google were created in `auth.users` but NOT in `public.users` table (no 50 Impact Points)
- **Fix:** 
  - Added auth token to `/api/auth/ensure-profile` API call
  - Improved error logging to catch failures
  - Function now returns `true` if user was just created (new user)

### 2. **New User Redirect Flow**
- **Problem:** New users were redirected to homepage `/#` instead of mini gamification flow
- **Fix:**
  - Auth callback now detects if user was just created (`isNewUser`)
  - Checks if preview mode is enabled
  - Redirects new users in preview mode to `/dashboard?newUser=1&previewOnboarding=1`
  - This triggers the welcome modal and mini gamification flow

### 3. **Better Error Handling**
- Added detailed console logging for debugging
- API errors are now properly logged with status codes
- User creation failures won't block auth flow (graceful degradation)

---

## 🔧 What to Check in Supabase

If Google OAuth is still redirecting to `/#` instead of `/auth/callback`, check your Supabase settings:

1. **Go to Supabase Dashboard → Authentication → URL Configuration**
2. **Check "Redirect URLs":**
   - Should include: `https://dopaya.com/auth/callback`
   - Should include: `https://www.dopaya.com/auth/callback` (if using www)
   - Should include: `http://localhost:3001/auth/callback` (for local dev)

3. **Check "Site URL":**
   - Should be: `https://dopaya.com` (or your production domain)

4. **For Google OAuth Provider:**
   - Make sure "Authorized redirect URIs" in Google Cloud Console includes:
     - `https://[your-supabase-project].supabase.co/auth/v1/callback`

---

## 🧪 Testing Steps

1. **Enable Preview Mode:**
   - Visit: `https://dopaya.com?previewOnboarding=1`

2. **Test Google Login:**
   - Delete your user from `public.users` table in Supabase (keep in `auth.users` for testing)
   - Click "Log in with Google"
   - After authentication, you should:
     - ✅ Be redirected to `/dashboard?newUser=1&previewOnboarding=1`
     - ✅ See welcome modal with "You've earned 50 Impact Points"
     - ✅ See user in `public.users` table with `impactPoints = 50`

3. **Check Console Logs:**
   - Open browser DevTools → Console
   - Look for:
     - `"Checking if user profile exists for: [email]"`
     - `"User profile ensured successfully: {created: true}"`
     - `"User authenticated successfully"`

4. **Verify Database:**
   - Check `public.users` table in Supabase
   - New user should have:
     - `impactPoints = 50`
     - `totalDonations = 0`
     - `email` matching the Google account

---

## 🐛 Troubleshooting

### User still not created in `public.users`
- Check browser console for API errors
- Check server logs for `/api/auth/ensure-profile` errors
- Verify the endpoint is accessible (should return JSON, not HTML)

### Still redirecting to homepage `/#`
- Check Supabase redirect URL configuration (see above)
- Verify preview mode is enabled (`?previewOnboarding=1` in URL)
- Check browser console for redirect errors

### Welcome modal not showing
- Verify URL has `?newUser=1&previewOnboarding=1`
- Check if `welcomeModalShown` is already in sessionStorage (clear it: `sessionStorage.removeItem('welcomeModalShown')`)
- Check browser console for dashboard errors

---

## 📝 Files Changed

- `Tech/client/src/pages/auth-callback.tsx` - Fixed user sync and redirect logic
- `Tech/server/routes.ts` - Already had correct endpoint (no changes needed)

---

*Last updated: 2025-01-15*



