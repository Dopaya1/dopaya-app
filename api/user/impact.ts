// Standalone Vercel serverless function for /api/user/impact
// SECURITY: No hardcoded credentials, uses environment variables only
// No dependencies on server/ directory to avoid module resolution issues

/// <reference types="node" />

import { createClient } from '@supabase/supabase-js';

// Security: Validate environment variables at module load
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    'Missing required environment variables: SUPABASE_URL and SUPABASE_ANON_KEY must be set'
  );
}

// Initialize Supabase client (secure - no hardcoded values)
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Get Supabase user from Authorization header token
 * Returns null if token is invalid or missing
 */
async function getSupabaseUser(req: any) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.substring(7);
  
  // Security: Validate token format (basic check)
  if (!token || token.length < 10) {
    return null;
  }
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('[getSupabaseUser] Error verifying token:', error);
    return null;
  }
}

/**
 * Get user from public.users table by email
 */
async function getUserByEmail(email: string) {
  if (!email || typeof email !== 'string') {
    return null;
  }
  
  // Security: Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.error('[getUserByEmail] Invalid email format:', email);
    return null;
  }
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .limit(1)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned - user doesn't exist
        return null;
      }
      console.error('[getUserByEmail] Error:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('[getUserByEmail] Unexpected error:', error);
    return null;
  }
}

/**
 * Get user impact data
 */
async function getUserImpact(userId: number) {
  // Security: Validate userId is a positive integer
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new Error('Invalid user ID');
  }
  
  try {
    // Get user from users table
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, "impactPoints", "totalDonations"')
      .eq('id', userId)
      .single();
    
    if (userError || !user) {
      console.error('[getUserImpact] User not found:', userId);
      return {
        impactPoints: 0,
        impactPointsChange: 0,
        amountDonated: 0,
        amountDonatedChange: 0,
        projectsSupported: 0,
        projectsSupportedChange: 0,
        userLevel: 'aspirer',
      };
    }
    
    const impactPoints = (user as any).impactPoints ?? 0;
    const totalDonations = (user as any).totalDonations ?? 0;
    
    // Get donations to calculate amountDonated and projectsSupported
    const { data: donations, error: donationsError } = await supabase
      .from('donations')
      .select('amount, projectId')
      .eq('userId', userId);
    
    if (donationsError) {
      console.error('[getUserImpact] Error fetching donations:', donationsError);
      // Return user's Impact Points even if donations fail
      return {
        impactPoints,
        impactPointsChange: 0,
        amountDonated: totalDonations,
        amountDonatedChange: 0,
        projectsSupported: 0,
        projectsSupportedChange: 0,
        userLevel: totalDonations > 0 ? 'changemaker' : 'aspirer',
      };
    }
    
    // Calculate totals
    const amountDonated = donations?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0;
    const distinctProjectIds = new Set<number>();
    donations?.forEach(d => {
      if (d.projectId && Number.isInteger(d.projectId)) {
        distinctProjectIds.add(d.projectId);
      }
    });
    const projectsSupported = distinctProjectIds.size;
    
    // Determine user status based on impactPoints >= 100 (not amountDonated)
    const userLevel: string = impactPoints >= 100 ? 'changemaker' : 'aspirer';
    const userStatus: string = impactPoints >= 100 ? 'changemaker' : 'aspirer';
    
    return {
      impactPoints,
      impactPointsChange: 0,
      amountDonated,
      amountDonatedChange: 0,
      projectsSupported,
      projectsSupportedChange: 0,
      userLevel,
      userStatus,
    };
  } catch (error) {
    console.error('[getUserImpact] Error:', error);
    throw error;
  }
}

// Vercel serverless function handler
export default async function handler(req: any, res: any) {
  // Security: Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  console.log('[GET /api/user/impact] Request received');
  
  try {
    // Get authenticated user
    const supabaseUser = await getSupabaseUser(req);
    
    if (!supabaseUser || !supabaseUser.email) {
      console.log('[GET /api/user/impact] No authenticated user');
      return res.status(401).json({ message: 'You must be logged in to view impact data' });
    }
    
    console.log('[GET /api/user/impact] Authenticated user:', supabaseUser.email);
    
    // Get user from database
    const dbUser = await getUserByEmail(supabaseUser.email);
    
    if (!dbUser || !dbUser.id) {
      console.log('[GET /api/user/impact] User not found in database, returning default values:', supabaseUser.email);
      // Return default values instead of 404 - user might be created by trigger soon
      // This prevents dashboard errors while trigger creates the user
      // 50 IP = aspirer (need 100+ for supporter)
      return res.json({
        impactPoints: 50, // Default welcome bonus
        impactPointsChange: 0,
        amountDonated: 0,
        amountDonatedChange: 0,
        projectsSupported: 0,
        projectsSupportedChange: 0,
        userLevel: 'aspirer',
        userStatus: 'aspirer', // 50 < 100, so aspirer
      });
    }
    
    console.log('[GET /api/user/impact] Database user found:', dbUser.id);
    
    // Get impact data
    const userImpact = await getUserImpact(dbUser.id);
    
    console.log('[GET /api/user/impact] Returning impact data');
    return res.json(userImpact);
    
  } catch (error) {
    console.error('[GET /api/user/impact] Error:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
