import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './secrets';
import { storage } from './storage';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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





