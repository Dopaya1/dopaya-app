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
        const impactHistory = await storage.getUserImpactHistory(dbUser.id);
        return res.json(impactHistory);
      } catch (error) {
        console.error('[GET /api/user/impact-history] Error:', error);
        return res.status(500).json({ message: "Failed to fetch impact history" });
      }
    }
    
    return res.status(401).json({ message: "You must be logged in to view impact history" });
  } catch (error) {
    console.error('[GET /api/user/impact-history] Unexpected error:', error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

