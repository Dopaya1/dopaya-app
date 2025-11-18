import { storage } from '../../server/storage';
import { getSupabaseUser } from '../../server/supabase-auth-middleware';

// Vercel serverless function - uses standard Node.js request/response
export default async function handler(req: any, res: any) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Try Supabase auth first
    const supabaseUser = await getSupabaseUser(req);
    
    if (supabaseUser) {
      const dbUser = await storage.getUserByEmail(supabaseUser.email || '');
      if (!dbUser) {
        return res.status(404).json({ message: "User not found in database" });
      }
      
      try {
        const projects = await storage.getUserSupportedProjects(dbUser.id);
        return res.json(projects);
      } catch (error) {
        console.error('[GET /api/user/supported-projects] Error:', error);
        return res.status(500).json({ message: "Failed to fetch supported projects" });
      }
    }
    
    return res.status(401).json({ message: "You must be logged in to view supported projects" });
  } catch (error) {
    console.error('[GET /api/user/supported-projects] Unexpected error:', error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

