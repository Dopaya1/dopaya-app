// Standalone Vercel serverless function for /api/user/supported-projects-with-donations
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
 * Get supported projects with donations for user
 * Mirrors storage.getUserSupportedProjectsWithDonations() logic
 */
async function getUserSupportedProjectsWithDonations(userId: number) {
  try {
    // Get all donations for the user with project details
    // Try camelCase first
    let { data: donations, error: donationsError } = await supabase
      .from('donations')
      .select('*')
      .eq('userId', userId)
      .order('createdAt', { ascending: false });
    
    // If camelCase fails, try snake_case
    if (donationsError && (donationsError.message.includes('column') || donationsError.code === '42703' || donationsError.code === 'PGRST116')) {
      const result = await supabase
        .from('donations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      donations = result.data;
      donationsError = result.error;
    }
    
    if (donationsError || !donations || donations.length === 0) {
      console.log(`[getUserSupportedProjectsWithDonations] No donations found for user ${userId}`);
      return [];
    }
    
    // Group donations by projectId
    const donationsByProject = new Map<number, any[]>();
    donations.forEach((donation: any) => {
      const projectId = donation.projectId || donation.project_id;
      if (projectId) {
        if (!donationsByProject.has(projectId)) {
          donationsByProject.set(projectId, []);
        }
        donationsByProject.get(projectId)!.push(donation);
      }
    });
    
    // Get unique project IDs
    const projectIds = Array.from(donationsByProject.keys());
    
    if (projectIds.length === 0) {
      return [];
    }
    
    // Get project details
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .in('id', projectIds);
    
    if (projectsError) {
      console.error(`[getUserSupportedProjectsWithDonations] Error fetching projects:`, projectsError);
      return [];
    }
    
    // Aggregate data per project
    // Universal Fund is treated like a normal project - no special aggregation needed
    const result = (projects || []).map((project: any) => {
      const projectDonations = donationsByProject.get(project.id) || [];
      
      // Calculate aggregates
      const totalAmount = projectDonations.reduce((sum, d: any) => sum + (d.amount || 0), 0);
      const totalImpactPoints = projectDonations.reduce((sum, d: any) => sum + (d.impactPoints || d.impact_points || 0), 0);
      const donationCount = projectDonations.length;
      
      // Get last donation date (most recent)
      const lastDonation = projectDonations[0]; // Already sorted by createdAt DESC
      const lastDonationDate = lastDonation?.createdAt || lastDonation?.created_at
        ? new Date(lastDonation.createdAt || lastDonation.created_at)
        : null;
      
      return {
        project: project,
        totalAmount,
        totalImpactPoints,
        donationCount,
        lastDonationDate,
        donations: projectDonations
      };
    });
    
    // Sort by last donation date (most recent first)
    result.sort((a, b) => {
      if (!a.lastDonationDate && !b.lastDonationDate) return 0;
      if (!a.lastDonationDate) return 1;
      if (!b.lastDonationDate) return -1;
      return b.lastDonationDate.getTime() - a.lastDonationDate.getTime();
    });
    
    return result;
  } catch (error) {
    console.error(`[getUserSupportedProjectsWithDonations] Error:`, error);
    return [];
  }
}

// Vercel serverless function handler
export default async function handler(req: any, res: any) {
  // Security: Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  console.log('[GET /api/user/supported-projects-with-donations] Request received');
  
  try {
    const supabaseUser = await getSupabaseUser(req);
    
    if (!supabaseUser || !supabaseUser.email) {
      return res.status(401).json({ message: 'You must be logged in to view supported projects' });
    }
    
    const dbUser = await getUserByEmail(supabaseUser.email);
    
    if (!dbUser || !dbUser.id) {
      // Return empty array instead of 404 - user might be created by trigger soon
      return res.json([]);
    }
    
    const projectsWithDonations = await getUserSupportedProjectsWithDonations(dbUser.id);
    
    return res.json(projectsWithDonations);
    
  } catch (error) {
    console.error('[GET /api/user/supported-projects-with-donations] Error:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}






