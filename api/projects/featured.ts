// Standalone Vercel serverless function for /api/projects/featured
// SECURITY: No hardcoded credentials, uses environment variables only

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
 * Get featured projects
 * Mirrors storage.getFeaturedProjects() logic
 */
async function getFeaturedProjects() {
  try {
    console.log('[getFeaturedProjects] Fetching featured projects from Supabase...');
    
    // Try camelCase first
    let { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('status', 'active')
      .eq('featured', true)
      .order('createdAt', { ascending: false });
    
    // If camelCase fails, try snake_case
    if (error && (error.message.includes('column') || error.code === '42703' || error.code === 'PGRST116')) {
      console.log('[getFeaturedProjects] camelCase query failed, trying snake_case...', error.message);
      const result = await supabase
        .from('projects')
        .select('*')
        .eq('status', 'active')
        .eq('featured', true)
        .order('created_at', { ascending: false });
      
      data = result.data;
      error = result.error;
    }
    
    if (error) {
      console.error('[getFeaturedProjects] Error fetching featured projects:', error);
      return [];
    }
    
    // Filter out draft projects (should already be filtered by status='active', but double-check)
    const activeProjects = (data || []).filter((project: any) => project.status !== 'draft');
    
    console.log(`[getFeaturedProjects] Found ${activeProjects.length} featured projects`);
    return activeProjects;
  } catch (error) {
    console.error('[getFeaturedProjects] Error:', error);
    return [];
  }
}

// Vercel serverless function handler
export default async function handler(req: any, res: any) {
  // Security: Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  console.log('[GET /api/projects/featured] Request received');
  
  try {
    const featuredProjects = await getFeaturedProjects();
    return res.json(featuredProjects);
  } catch (error) {
    console.error('[GET /api/projects/featured] Error:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}






