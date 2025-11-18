# Quick Local Testing Fix

## The Problem
After login, you're redirected to production (`https://dopaya.com`) instead of localhost (`http://localhost:3001`).

## The Solution (2 Steps)

### Step 1: Configure Supabase Redirect URLs

1. **Go to Supabase Dashboard:**
   - Visit: https://supabase.com/dashboard
   - Select your Dopaya project

2. **Navigate to Authentication Settings:**
   - Click **Authentication** in the left sidebar
   - Click **URL Configuration** tab

3. **Add Localhost URLs:**
   Under **Redirect URLs**, add these (one per line):
   ```
   http://localhost:3001/auth/callback
   http://localhost:3001/**
   http://127.0.0.1:3001/auth/callback
   ```

4. **Optional - Set Site URL for Testing:**
   You can temporarily change **Site URL** to:
   ```
   http://localhost:3001
   ```
   (Remember to change it back to `https://dopaya.com` before deploying!)

5. **Click "Save"**

### Step 2: Test Locally

1. **Start the dev server:**
   ```bash
   cd Tech
   npm run dev
   ```

2. **Open in browser:**
   ```
   http://localhost:3001
   ```

3. **Try logging in:**
   - Use Google OAuth or Email
   - You should be redirected to: `http://localhost:3001/auth/callback`
   - **NOT** to: `https://dopaya.com`

## Verify It's Working

After login, check the browser address bar:
- ✅ **Correct:** `http://localhost:3001/auth/callback`
- ❌ **Wrong:** `https://dopaya.com/auth/callback`

## Quick Test Script

Run this to check your setup:
```bash
cd Tech
npm run test:local
```

## Troubleshooting

### Still redirecting to production?

1. **Clear browser data:**
   - Clear cookies for `localhost:3001`
   - Clear local storage
   - Try incognito/private mode

2. **Double-check Supabase settings:**
   - Make sure URLs are saved (refresh the page)
   - Verify no typos in the URLs
   - Check that `http://` (not `https://`) is used for localhost

3. **Check browser console:**
   - Open DevTools (F12)
   - Look for errors or redirect logs
   - Check Network tab for redirect requests

4. **Verify dev server:**
   - Make sure it's running on port 3001
   - Check terminal for any errors
   - Verify `http://localhost:3001` loads the app

## Why This Happens

Supabase only allows redirects to URLs that are explicitly whitelisted in the dashboard. This is a security feature to prevent redirect attacks. By default, only your production URL is whitelisted, so you need to add localhost URLs for local development.

## Before Deploying

Remember to:
- ✅ Keep localhost URLs in the redirect list (they won't affect production)
- ✅ Or remove them if you prefer (just add them back when testing locally)
- ✅ Make sure **Site URL** is set back to `https://dopaya.com` for production

