import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './secrets';

// Initialize Supabase client with validation
let supabase: ReturnType<typeof createClient>;
try {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(`Missing Supabase credentials: SUPABASE_URL=${!!SUPABASE_URL}, SUPABASE_ANON_KEY=${!!SUPABASE_ANON_KEY}`);
  }
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  console.log('[supabase-auth-middleware] Supabase client initialized');
} catch (error) {
  console.error('[supabase-auth-middleware] Failed to initialize Supabase client:', error);
  // Create a minimal client that will fail gracefully
  supabase = createClient(SUPABASE_URL || 'https://placeholder.supabase.co', SUPABASE_ANON_KEY || 'placeholder-key');
}

/**
 * Get Supabase user from Authorization header token
 * Returns null if token is invalid or missing
 */
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







