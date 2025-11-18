// Standalone Vercel serverless function for /api/user/supported-projects
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
 */
async function getSupabaseUser(req: any) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.substring(7);
  
  // Security: Validate token format
  if (!token || token.length < 10) {
    return null;
  }
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    return error || !user ? null : user;
  } catch (error) {
    console.error('[getSupabaseUser] Error:', error);
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
  
  // Security: Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return null;
  }
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', email.toLowerCase().trim())
      .limit(1)
      .single();
    
    return error ? null : data;
  } catch (error) {
    console.error('[getUserByEmail] Error:', error);
    return null;
  }
}

/**
 * Get projects supported by user
 */
async function getUserSupportedProjects(userId: number) {
  // Security: Validate userId
  if (!Number.isInteger(userId) || userId <= 0) {
    return [];
  }
  
  try {
    // Get distinct project IDs from user donations
    const { data: donations, error: donationsError } = await supabase
      .from('donations')
      .select('projectId')
      .eq('userId', userId);
    
    if (donationsError || !donations || donations.length === 0) {
      return [];
    }
    
    // Get unique project IDs (security: validate they're integers)
    const projectIds = [...new Set(
      donations
        .map(d => d.projectId)
        .filter(id => Number.isInteger(id) && id > 0)
    )];
    
    if (projectIds.length === 0) {
      return [];
    }
    
    // Get project details
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .in('id', projectIds);
    
    if (projectsError) {
      console.error('[getUserSupportedProjects] Error:', projectsError);
      return [];
    }
    
    return projects || [];
    
  } catch (error) {
    console.error('[getUserSupportedProjects] Error:', error);
    return [];
  }
}

// Vercel serverless function handler
export default async function handler(req: any, res: any) {
  // Security: Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  console.log('[GET /api/user/supported-projects] Request received');
  
  try {
    const supabaseUser = await getSupabaseUser(req);
    
    if (!supabaseUser || !supabaseUser.email) {
      return res.status(401).json({ message: 'You must be logged in to view supported projects' });
    }
    
    const dbUser = await getUserByEmail(supabaseUser.email);
    
    if (!dbUser || !dbUser.id) {
      return res.status(404).json({ message: 'User not found in database' });
    }
    
    const projects = await getUserSupportedProjects(dbUser.id);
    
    return res.json(projects);
    
  } catch (error) {
    console.error('[GET /api/user/supported-projects] Error:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
