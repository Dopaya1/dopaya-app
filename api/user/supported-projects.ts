import { storage } from '../../server/storage';
import { getSupabaseUser } from '../../server/supabase-auth-middleware';

// Vercel serverless function - uses standard Node.js request/response
export default async function handler(req: any, res: any) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  console.log('[GET /api/user/supported-projects] Request received');
  console.log('[GET /api/user/supported-projects] Auth header:', req.headers.authorization ? 'Present' : 'Missing');

  try {
    // Try Supabase auth first
    const supabaseUser = await getSupabaseUser(req);
    
    if (supabaseUser) {
      console.log('[GET /api/user/supported-projects] Supabase user found:', supabaseUser.email);
      const dbUser = await storage.getUserByEmail(supabaseUser.email || '');
      if (!dbUser) {
        console.log('[GET /api/user/supported-projects] User not found in database for:', supabaseUser.email);
        return res.status(404).json({ message: "User not found in database" });
      }
      
      try {
        const projects = await storage.getUserSupportedProjects(dbUser.id);
        console.log('[GET /api/user/supported-projects] Returning', projects.length, 'supported projects');
        return res.json(projects);
      } catch (error) {
        console.error('[GET /api/user/supported-projects] Error fetching projects:', error);
        return res.status(500).json({ 
          message: "Failed to fetch supported projects",
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
    
    console.log('[GET /api/user/supported-projects] No Supabase user found');
    return res.status(401).json({ message: "You must be logged in to view supported projects" });
  } catch (error) {
    console.error('[GET /api/user/supported-projects] Unexpected error:', error);
    return res.status(500).json({ 
      message: "Internal server error",
      error: error instanceof Error ? error.message : String(error),
      stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
    });
  }
}

