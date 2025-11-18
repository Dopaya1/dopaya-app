// Vercel serverless function - uses standard Node.js request/response
export default async function handler(req: any, res: any) {
  // Dynamic imports to avoid module initialization issues
  let storage: any;
  let getSupabaseUser: any;
  
  try {
    const storageModule = await import('../../server/storage');
    storage = storageModule.storage;
    
    const authModule = await import('../../server/supabase-auth-middleware');
    getSupabaseUser = authModule.getSupabaseUser;
  } catch (importError) {
    console.error('[GET /api/user/impact-history] Failed to import modules:', importError);
    return res.status(500).json({ 
      message: "Server configuration error",
      error: importError instanceof Error ? importError.message : String(importError)
    });
  }
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  console.log('[GET /api/user/impact-history] Request received');
  console.log('[GET /api/user/impact-history] Auth header:', req.headers.authorization ? 'Present' : 'Missing');

  try {
    // Try Supabase auth first
    const supabaseUser = await getSupabaseUser(req);
    
    if (supabaseUser) {
      console.log('[GET /api/user/impact-history] Supabase user found:', supabaseUser.email);
      const dbUser = await storage.getUserByEmail(supabaseUser.email || '');
      if (!dbUser) {
        console.log('[GET /api/user/impact-history] User not found in database for:', supabaseUser.email);
        return res.status(404).json({ message: "User not found in database" });
      }
      try {
        const impactHistory = await storage.getUserImpactHistory(dbUser.id);
        console.log('[GET /api/user/impact-history] Returning history with', impactHistory.length, 'entries');
        return res.json(impactHistory);
      } catch (error) {
        console.error('[GET /api/user/impact-history] Error fetching history:', error);
        return res.status(500).json({ 
          message: "Failed to fetch impact history",
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
    
    console.log('[GET /api/user/impact-history] No Supabase user found');
    return res.status(401).json({ message: "You must be logged in to view impact history" });
  } catch (error) {
    console.error('[GET /api/user/impact-history] Unexpected error:', error);
    return res.status(500).json({ 
      message: "Internal server error",
      error: error instanceof Error ? error.message : String(error),
      stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
    });
  }
}

