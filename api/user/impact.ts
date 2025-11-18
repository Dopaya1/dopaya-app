// Vercel serverless function for /api/user/impact
import { storage } from '../../server/storage';
import { getSupabaseUser } from '../../server/supabase-auth-middleware';

export default async function handler(req: any, res: any) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  console.log('[GET /api/user/impact] Request received');
  console.log('[GET /api/user/impact] Auth header:', req.headers.authorization ? 'Present' : 'Missing');
  
  try {
    // Try Supabase auth first
    const supabaseUser = await getSupabaseUser(req);
    
    if (supabaseUser) {
      console.log('[GET /api/user/impact] Supabase user found:', supabaseUser.email);
      // Get user from public.users by email
      const dbUser = await storage.getUserByEmail(supabaseUser.email || '');
      
      if (!dbUser) {
        console.log('[GET /api/user/impact] User not found in database for:', supabaseUser.email);
        return res.status(404).json({ message: "User not found in database" });
      }
      
      console.log('[GET /api/user/impact] Database user found:', dbUser.id, 'impactPoints:', (dbUser as any).impactPoints);
      
      try {
        const userImpact = await storage.getUserImpact(dbUser.id);
        console.log('[GET /api/user/impact] Returning impact:', userImpact);
        return res.json(userImpact);
      } catch (error) {
        console.error('[GET /api/user/impact] Error fetching impact:', error);
        return res.status(500).json({ 
          message: "Failed to fetch impact data",
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
    
    console.log('[GET /api/user/impact] No Supabase user found');
    return res.status(401).json({ message: "You must be logged in to view impact data" });
  } catch (error) {
    console.error('[GET /api/user/impact] Unexpected error:', error);
    return res.status(500).json({ 
      message: "Internal server error",
      error: error instanceof Error ? error.message : String(error),
      stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
    });
  }
}
