// Test endpoint to check environment variables in Vercel
export default async function handler(req: any, res: any) {
  const envCheck = {
    hasViteSupabaseUrl: !!process.env.VITE_SUPABASE_URL,
    hasSupabaseUrl: !!process.env.SUPABASE_URL,
    hasViteSupabaseAnonKey: !!process.env.VITE_SUPABASE_ANON_KEY,
    hasSupabaseAnonKey: !!process.env.SUPABASE_ANON_KEY,
    viteSupabaseUrlLength: process.env.VITE_SUPABASE_URL?.length || 0,
    supabaseUrlLength: process.env.SUPABASE_URL?.length || 0,
    viteSupabaseAnonKeyLength: process.env.VITE_SUPABASE_ANON_KEY?.length || 0,
    supabaseAnonKeyLength: process.env.SUPABASE_ANON_KEY?.length || 0,
    nodeEnv: process.env.NODE_ENV,
    // Don't expose actual values, just check if they exist
  };

  // Try to import storage to see if it works
  let storageStatus = 'not tested';
  try {
    const storageModule = await import('../../server/storage');
    storageStatus = storageModule.storage ? 'loaded successfully' : 'failed to load';
  } catch (error) {
    storageStatus = `error: ${error instanceof Error ? error.message : String(error)}`;
  }

  // Try to import auth middleware
  let authStatus = 'not tested';
  try {
    const authModule = await import('../../server/supabase-auth-middleware');
    authStatus = authModule.getSupabaseUser ? 'loaded successfully' : 'failed to load';
  } catch (error) {
    authStatus = `error: ${error instanceof Error ? error.message : String(error)}`;
  }

  res.json({
    environment: envCheck,
    moduleStatus: {
      storage: storageStatus,
      auth: authStatus,
    },
    message: 'Environment check complete',
  });
}


