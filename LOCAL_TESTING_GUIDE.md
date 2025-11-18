# Local Testing Guide

## Problem: Redirects to Production After Login

When testing locally, Supabase auth redirects might send you to production instead of localhost. This guide shows how to fix this.

## Solution 1: Configure Supabase Redirect URLs (Recommended)

### Step 1: Add Localhost URLs to Supabase

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Navigate to **Authentication** → **URL Configuration**
3. Under **Redirect URLs**, add these URLs:
   ```
   http://localhost:3001/auth/callback
   http://localhost:3001/**
   http://127.0.0.1:3001/auth/callback
   ```
4. Under **Site URL**, you can temporarily set it to:
   ```
   http://localhost:3001
   ```
   (Or keep production URL and just add localhost to redirect URLs)

5. **Save** the changes

### Step 2: Start Local Dev Server

```bash
cd Tech
npm run dev
```

The server will start on `http://localhost:3001`

### Step 3: Test Authentication

1. Open `http://localhost:3001` in your browser
2. Try logging in with Google or Email
3. You should be redirected back to `http://localhost:3001/auth/callback` instead of production

## Solution 2: Use Environment Variable Override

If you can't modify Supabase settings, you can override the redirect URL locally.

### Create `.env.local` file

Create `/Tech/.env.local`:

```bash
# Local development override
VITE_LOCAL_DEV=true
VITE_LOCAL_PORT=3001
```

### Update Auth Modal (if needed)

The auth modal already uses `window.location.origin`, which should automatically use localhost when running locally. If it doesn't, we can add an override.

## Solution 3: Test Serverless Functions Without Full Auth

You can test the serverless functions directly without going through the full auth flow:

### Option A: Use the Test Script

```bash
cd Tech
npm run test:serverless
```

This tests the functions with mock requests (no real auth needed).

### Option B: Test with curl (requires auth token)

1. Get a Supabase auth token:
   - Log in via production
   - Open browser DevTools → Application → Local Storage
   - Find `sb-<project-id>-auth-token`
   - Copy the `access_token` value

2. Test the endpoint:
```bash
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
     http://localhost:3001/api/user/impact
```

## Troubleshooting

### Still Redirecting to Production?

1. **Check Supabase Settings:**
   - Make sure localhost URLs are added to Redirect URLs
   - Check that Site URL allows localhost (or is set to localhost for testing)

2. **Clear Browser Cache:**
   - Clear cookies and local storage
   - Try incognito/private mode

3. **Check Browser Console:**
   - Look for errors in the console
   - Check Network tab for redirect requests

4. **Verify Port:**
   - Make sure dev server is running on port 3001
   - Check `http://localhost:3001` loads correctly

### API Endpoints Not Working Locally?

The serverless functions (`/api/user/*`) are designed for Vercel deployment. For local testing:

1. **Use the Express server** (already running on port 3001)
2. The routes in `server/routes.ts` handle `/api/*` requests locally
3. Make sure `server/routes.ts` has the same endpoints

### Environment Variables Not Loading?

1. Check `.env.local` exists in `/Tech/` directory
2. Restart the dev server after adding env vars
3. Verify variables are loaded:
   ```bash
   # In server/index.ts or any server file
   console.log('SUPABASE_URL:', process.env.VITE_SUPABASE_URL);
   ```

## Quick Test Checklist

- [ ] Supabase redirect URLs include `http://localhost:3001/auth/callback`
- [ ] Dev server running on port 3001
- [ ] Browser opens `http://localhost:3001` (not production)
- [ ] Can see localhost in browser address bar after login
- [ ] API endpoints respond at `http://localhost:3001/api/*`

## Production vs Local Testing

| Feature | Production | Local |
|---------|-----------|-------|
| URL | `https://dopaya.com` | `http://localhost:3001` |
| Auth Redirect | `https://dopaya.com/auth/callback` | `http://localhost:3001/auth/callback` |
| API Endpoints | Vercel serverless functions | Express server routes |
| Environment | Vercel env vars | `.env.local` file |

## Need Help?

If you're still having issues:
1. Check the browser console for errors
2. Check the server logs (terminal where `npm run dev` is running)
3. Verify Supabase project settings
4. Try clearing all browser data for localhost


