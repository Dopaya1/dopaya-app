# Simple Auth Fix - Make Backend Recognize Supabase Sessions

## The Core Issue

**Backend checks:** `req.isAuthenticated()` (Passport sessions)
**Frontend uses:** Supabase Auth (JWT tokens)

These don't talk to each other!

## The Simple Solution

Add ONE middleware that bridges them:

### Step 1: Create Supabase Auth Middleware

```typescript
// server/supabase-auth-middleware.ts
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './secrets';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function getSupabaseUser(req: any) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.substring(7);
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('Error verifying Supabase token:', error);
    return null;
  }
}
```

### Step 2: Update ONE Protected Route (Test)

Let's fix `/api/user/impact` as a test:

```typescript
// In server/routes.ts
import { getSupabaseUser } from './supabase-auth-middleware';

app.get("/api/user/impact", async (req, res) => {
  // Try Supabase auth first
  const supabaseUser = await getSupabaseUser(req);
  
  if (supabaseUser) {
    // Get user from public.users by email
    const dbUser = await storage.getUserByEmail(supabaseUser.email);
    
    if (!dbUser) {
      return res.status(404).json({ message: "User not found in database" });
    }
    
    const impact = await storage.getUserImpact(dbUser.id);
    return res.json(impact);
  }
  
  // Fallback to old Passport auth (for backwards compatibility)
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "You must be logged in to view impact" });
  }
  
  const impact = await storage.getUserImpact(req.user!.id);
  res.json(impact);
});
```

### Step 3: Update Frontend to Send Token

```typescript
// In client/src/lib/queryClient.ts
import { supabase } from './supabase';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        const url = queryKey[0] as string;
        
        // Get Supabase session token
        const { data: { session } } = await supabase.auth.getSession();
        
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        
        // Add Authorization header if we have a session
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
        }
        
        const response = await fetch(url, { headers });
        
        // ... rest of the code
      }
    }
  }
});
```

### Step 4: Fix Logout

```typescript
// In client/src/hooks/use-auth.tsx
const logoutMutation = useMutation({
  mutationFn: async () => {
    console.log('Logout mutation executing with Supabase...');
    
    // Sign out from Supabase
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Supabase logout error:', error);
      // Even if error, still clear local state
    }
  },
  onSuccess: () => {
    setUser(null);
    queryClient.clear(); // Clear all cached data
    toast({
      title: "Logged out successfully",
      description: "You have been logged out.",
    });
    // Redirect to homepage
    window.location.href = '/';
  },
  onError: (error: Error) => {
    console.error('Logout error:', error);
    // Still redirect even on error
    setUser(null);
    queryClient.clear();
    window.location.href = '/';
  },
});
```

## Implementation Steps

1. Create `supabase-auth-middleware.ts` ✓
2. Update `queryClient.ts` to send auth token ✓
3. Update `use-auth.tsx` logout to be more forgiving ✓
4. Update protected routes one by one ✓

## Testing

After implementing:

1. **Login works** - Already working ✅
2. **Dashboard loads** - Will work after Step 2 ✓
3. **Logout works** - Will work after Step 4 ✓
4. **New signups get 50 IP** - Already working ✅

---

**This is the MINIMAL fix. No overengineering. Just bridge the gap.**





