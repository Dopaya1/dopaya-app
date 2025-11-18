# Security Standards for Serverless Functions

## Overview
All serverless functions in `/api/user/*` are designed with security as a top priority. This document outlines the security measures implemented.

## Security Measures

### 1. **No Hardcoded Credentials**
- ✅ All credentials come from environment variables only
- ✅ No fallback values or hardcoded secrets
- ✅ Environment variables validated at module load time
- ✅ Functions fail fast if required env vars are missing

### 2. **Authentication & Authorization**
- ✅ All endpoints require valid Supabase JWT token
- ✅ Token validation via `supabase.auth.getUser()`
- ✅ Token format validation (minimum length, Bearer prefix)
- ✅ User must exist in both `auth.users` and `public.users` tables

### 3. **Input Validation**
- ✅ HTTP method validation (only GET allowed for read endpoints)
- ✅ User ID validation (must be positive integer)
- ✅ Email format validation (regex pattern)
- ✅ SQL injection prevention via Supabase client (parameterized queries)

### 4. **Error Handling**
- ✅ No sensitive information in error messages
- ✅ Generic error messages for unauthorized/not found cases
- ✅ Detailed logging for debugging (server-side only)
- ✅ Graceful degradation (return empty arrays/zero values on errors)

### 5. **Data Access Control**
- ✅ Users can only access their own data
- ✅ Email-based user lookup ensures correct user mapping
- ✅ Database queries filtered by authenticated user ID

### 6. **Environment Variables**
Required environment variables:
- `VITE_SUPABASE_URL` or `SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` or `SUPABASE_ANON_KEY` - Supabase anonymous key

**Note:** The `ANON` key is safe to expose in frontend code (it's designed for public use with Row Level Security). However, we still validate it's set and never hardcode it.

## Function Structure

Each serverless function follows this pattern:

```typescript
1. Environment variable validation (module load)
2. Supabase client initialization
3. Request handler:
   a. Method validation
   b. Token extraction & validation
   c. User authentication
   d. Database user lookup
   e. Business logic execution
   f. Response with appropriate status codes
```

## Testing

### Local Testing
Use the provided test script:
```bash
npm run test:serverless
```

Or manually:
```bash
tsx scripts/test-serverless-local.ts
```

### Environment Setup
Create `.env.local` with:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
TEST_AUTH_TOKEN=optional_test_token
```

## Deployment Checklist

Before deploying to production:

- [ ] Verify all environment variables are set in Vercel
- [ ] Ensure no hardcoded credentials in code
- [ ] Test authentication flow end-to-end
- [ ] Verify error handling doesn't leak sensitive info
- [ ] Check that Row Level Security (RLS) is enabled in Supabase
- [ ] Confirm user data isolation (users can't access other users' data)

## Security Best Practices

1. **Never log sensitive data** (passwords, tokens, full user objects)
2. **Always validate input** before database queries
3. **Use parameterized queries** (Supabase client handles this)
4. **Fail securely** (return errors, don't crash)
5. **Keep dependencies updated** (regular security audits)
6. **Monitor for suspicious activity** (unusual API call patterns)

## Row Level Security (RLS)

The Supabase database should have RLS policies enabled to provide an additional layer of security:

- Users can only read their own data in `public.users`
- Users can only read their own donations
- Users can only read projects they've supported

This ensures that even if the application logic has a bug, the database itself enforces access control.

## Incident Response

If a security issue is discovered:

1. **Immediately** revoke affected tokens/credentials
2. **Review** logs for unauthorized access
3. **Update** affected code with security fix
4. **Deploy** fix to production
5. **Notify** affected users if data was compromised
6. **Document** the issue and resolution

## Contact

For security concerns, please report them immediately through the appropriate channels.

