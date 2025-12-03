import { createClient } from '@supabase/supabase-js';

// Lazy initialization - only create client when needed (after .env is loaded)
// Use SERVICE_ROLE_KEY for server-side token verification (has permission to verify tokens)
// Read directly from process.env to ensure .env is loaded first
let supabase: ReturnType<typeof createClient> | null = null;

function getSupabaseClient() {
  if (!supabase) {
    console.log('[supabase-auth-middleware] ========== INITIALIZATION ==========');
    
    // Read directly from process.env (supports both VITE_ prefix and non-prefixed)
    const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
    const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '';
    
    console.log('[supabase-auth-middleware] SUPABASE_URL:', SUPABASE_URL || '❌ MISSING');
    console.log('[supabase-auth-middleware] SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? `✅ Set (length: ${SUPABASE_ANON_KEY.length})` : '❌ MISSING');
    console.log('[supabase-auth-middleware] SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE_KEY ? `✅ Set (length: ${SUPABASE_SERVICE_ROLE_KEY.length})` : '❌ MISSING');
    
    if (!SUPABASE_URL) {
      throw new Error(`Missing SUPABASE_URL`);
    }
    
    // Use SERVICE_ROLE_KEY if available, otherwise fall back to ANON_KEY
    const supabaseKey = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;
    
    if (!supabaseKey) {
      throw new Error(`Missing Supabase key: SUPABASE_SERVICE_ROLE_KEY=${!!SUPABASE_SERVICE_ROLE_KEY}, SUPABASE_ANON_KEY=${!!SUPABASE_ANON_KEY}`);
    }
    
    supabase = createClient(SUPABASE_URL, supabaseKey);
    console.log('[supabase-auth-middleware] Using key type:', SUPABASE_SERVICE_ROLE_KEY ? 'SERVICE_ROLE_KEY ✅' : 'ANON_KEY ⚠️');
    console.log('[supabase-auth-middleware] ✅ Supabase client initialized');
    console.log('[supabase-auth-middleware] ===================================\n');
  }
  
  return supabase;
}

/**
 * Get Supabase user from Authorization header token
 * Returns null if token is invalid or missing
 */
export async function getSupabaseUser(req: any) {
  const authHeader = req.headers.authorization;
  
  console.log('[getSupabaseUser] ========== AUTH CHECK ==========');
  console.log('[getSupabaseUser] Authorization header present:', !!authHeader);
  console.log('[getSupabaseUser] Header starts with Bearer:', authHeader?.startsWith('Bearer '));
  
  if (!authHeader?.startsWith('Bearer ')) {
    console.log('[getSupabaseUser] ❌ No Bearer token found');
    return null;
  }
  
  const token = authHeader.substring(7);
  console.log('[getSupabaseUser] Token length:', token.length);
  console.log('[getSupabaseUser] Token preview:', token.substring(0, 20) + '...');
  
  try {
    // Lazy initialization ensures .env is loaded
    const client = getSupabaseClient();
    const { data: { user }, error } = await client.auth.getUser(token);
    
    if (error) {
      console.error('[getSupabaseUser] ❌ Token verification error:', {
        message: error.message,
        status: error.status,
        name: error.name
      });
      return null;
    }
    
    if (!user) {
      console.error('[getSupabaseUser] ❌ No user returned from token');
      return null;
    }
    
    console.log('[getSupabaseUser] ✅ User authenticated:', user.email);
    console.log('[getSupabaseUser] ================================');
    return user;
  } catch (error) {
    console.error('[getSupabaseUser] ❌ Exception verifying Supabase token:', error);
    return null;
  }
}

/**
 * Middleware to require Supabase authentication
 * Sets req.user to the user from public.users table
 */
export async function requireSupabaseAuth(req: any, res: any, next: any) {
  // Import storage dynamically to avoid circular dependencies
  const { storage } = await import('./storage');
  
  const supabaseUser = await getSupabaseUser(req);
  
  if (!supabaseUser) {
    return res.status(401).json({ message: "You must be logged in" });
  }
  
  // Get user from public.users by email
  const dbUser = await storage.getUserByEmail(supabaseUser.email || '');
  
  if (!dbUser) {
    return res.status(404).json({ message: "User not found in database" });
  }
  
  // Attach user to request (compatible with existing code that uses req.user)
  req.user = dbUser;
  next();
}







