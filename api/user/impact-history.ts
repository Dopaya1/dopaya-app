// Standalone Vercel serverless function for /api/user/impact-history
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
 * Get user impact history (monthly grouped donations)
 */
async function getUserImpactHistory(userId: number) {
  // Security: Validate userId
  if (!Number.isInteger(userId) || userId <= 0) {
    return [];
  }
  
  try {
    const { data: donations, error } = await supabase
      .from('donations')
      .select('amount, impactPoints, createdAt')
      .eq('userId', userId)
      .order('createdAt', { ascending: true });
    
    if (error || !donations) {
      console.error('[getUserImpactHistory] Error:', error);
      return [];
    }
    
    // Group by month
    const monthlyData: Record<string, { date: Date; amount: number; impactPoints: number }> = {};
    
    donations.forEach(donation => {
      if (!donation.createdAt) return;
      
      const date = new Date(donation.createdAt);
      if (isNaN(date.getTime())) return; // Invalid date
      
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          date: new Date(date.getFullYear(), date.getMonth(), 1),
          amount: 0,
          impactPoints: 0,
        };
      }
      
      monthlyData[monthKey].amount += donation.amount || 0;
      monthlyData[monthKey].impactPoints += donation.impactPoints || 0;
    });
    
    // Convert to array and sort by date
    // Schema expects date as string (ISO format)
    return Object.values(monthlyData)
      .map(({ date, amount, impactPoints }) => ({
        date: date.toISOString().split('T')[0], // Format as YYYY-MM-DD string
        points: impactPoints, // Schema expects 'points' not 'impactPoints'
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
      
  } catch (error) {
    console.error('[getUserImpactHistory] Error:', error);
    return [];
  }
}

// Vercel serverless function handler
export default async function handler(req: any, res: any) {
  // Security: Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  console.log('[GET /api/user/impact-history] Request received');
  
  try {
    const supabaseUser = await getSupabaseUser(req);
    
    if (!supabaseUser || !supabaseUser.email) {
      return res.status(401).json({ message: 'You must be logged in to view impact history' });
    }
    
    const dbUser = await getUserByEmail(supabaseUser.email);
    
    if (!dbUser || !dbUser.id) {
      return res.status(404).json({ message: 'User not found in database' });
    }
    
    const impactHistory = await getUserImpactHistory(dbUser.id);
    
    return res.json(impactHistory);
    
  } catch (error) {
    console.error('[GET /api/user/impact-history] Error:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
