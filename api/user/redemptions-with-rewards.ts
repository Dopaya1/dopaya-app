// Standalone Vercel serverless function for /api/user/redemptions-with-rewards
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
 * Get redemptions with rewards for user
 * Mirrors storage.getUserRedemptionsWithRewards() logic
 */
async function getUserRedemptionsWithRewards(userId: number) {
  try {
    console.log(`[getUserRedemptionsWithRewards] Fetching redemptions for user ${userId}...`);
    
    // Step 1: Fetch redemptions (without join)
    // Try camelCase first
    let { data: redemptions, error: redemptionsError } = await supabase
      .from('redemptions')
      .select('*')
      .eq('userId', userId)
      .order('createdAt', { ascending: false });
    
    // If camelCase fails, try snake_case
    if (redemptionsError && (redemptionsError.message.includes('column') || redemptionsError.code === '42703' || redemptionsError.code === 'PGRST116')) {
      console.log(`[getUserRedemptionsWithRewards] camelCase query failed, trying snake_case...`, redemptionsError.message);
      const result = await supabase
        .from('redemptions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      redemptions = result.data;
      redemptionsError = result.error;
    }
    
    if (redemptionsError) {
      console.error(`[getUserRedemptionsWithRewards] Error fetching redemptions:`, redemptionsError);
      return [];
    }
    
    if (!redemptions || redemptions.length === 0) {
      console.log(`[getUserRedemptionsWithRewards] No redemptions found for user ${userId}`);
      return [];
    }
    
    // Step 2: Get unique reward IDs from redemptions
    const rewardIds = [...new Set(redemptions.map((r: any) => r.rewardId || r.reward_id).filter(Boolean))];
    console.log(`[getUserRedemptionsWithRewards] Found ${rewardIds.length} unique reward IDs:`, rewardIds);
    
    if (rewardIds.length === 0) {
      return [];
    }
    
    // Step 3: Fetch all rewards in one query
    const { data: rewardsData, error: rewardsError } = await supabase
      .from('rewards')
      .select(`
        *,
        brands (*)
      `)
      .in('id', rewardIds);
    
    if (rewardsError) {
      console.error(`[getUserRedemptionsWithRewards] Error fetching rewards:`, rewardsError);
      return [];
    }
    
    // Step 4: Create a map of rewardId -> reward for fast lookup
    const rewardsMap = new Map();
    if (rewardsData) {
      rewardsData.forEach((reward: any) => {
        rewardsMap.set(reward.id, reward);
      });
    }
    
    console.log(`[getUserRedemptionsWithRewards] Loaded ${rewardsMap.size} rewards into map`);
    
    // Step 5: Map redemptions to return structure with manually joined rewards
    const result = redemptions.map((redemption: any) => {
      const redemptionDate = redemption.createdAt || redemption.created_at;
      
      // CRITICAL: Get rewardId from redemption (camelCase or snake_case)
      const finalRewardId = redemption.rewardId || redemption.reward_id;
      
      // MANUAL JOIN: Look up reward from map using rewardId
      const reward = finalRewardId ? rewardsMap.get(finalRewardId) : null;
      
      if (!finalRewardId) {
        console.error(`[getUserRedemptionsWithRewards] ⚠️ WARNING: No rewardId found for redemption ${redemption.id}!`);
      }
      
      if (!reward) {
        console.error(`[getUserRedemptionsWithRewards] ⚠️ WARNING: Reward ${finalRewardId} not found in map for redemption ${redemption.id}!`);
      }
      
      return {
        redemption: {
          id: redemption.id,
          userId: redemption.userId || redemption.user_id,
          rewardId: finalRewardId,
          pointsSpent: redemption.pointsSpent || redemption.points_spent,
          status: redemption.status || 'pending',
          createdAt: redemptionDate ? new Date(redemptionDate) : null
        },
        reward: reward || {}, // Manually joined reward from map
        pointsSpent: redemption.pointsSpent || redemption.points_spent || 0,
        redemptionDate: redemptionDate ? new Date(redemptionDate) : null,
        status: redemption.status || 'pending'
      };
    });
    
    return result;
  } catch (error) {
    console.error(`[getUserRedemptionsWithRewards] Error:`, error);
    return [];
  }
}

// Vercel serverless function handler
export default async function handler(req: any, res: any) {
  // Security: Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  console.log('[GET /api/user/redemptions-with-rewards] Request received');
  
  try {
    const supabaseUser = await getSupabaseUser(req);
    
    if (!supabaseUser || !supabaseUser.email) {
      return res.status(401).json({ message: 'You must be logged in to view redemptions' });
    }
    
    const dbUser = await getUserByEmail(supabaseUser.email);
    
    if (!dbUser || !dbUser.id) {
      // Return empty array instead of 404 - user might be created by trigger soon
      return res.json([]);
    }
    
    const redemptionsWithRewards = await getUserRedemptionsWithRewards(dbUser.id);
    
    return res.json(redemptionsWithRewards);
    
  } catch (error) {
    console.error('[GET /api/user/redemptions-with-rewards] Error:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}



