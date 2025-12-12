import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

/**
 * Reward redemption endpoint (flat route) to avoid nested dynamic routing issues.
 * Mirrors Express /api/rewards/:id/redeem logic.
 * Expects rewardId in req.body (number).
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS handling
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ message: 'Supabase credentials not configured' });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    // Auth - get Supabase user from Bearer token
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Missing bearer token' });
    }
    const token = authHeader.substring(7);
    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authData?.user) {
      return res.status(401).json({ message: 'Invalid or missing user' });
    }
    const supaUser = authData.user;

    // Resolve DB user (same logic as donate endpoint)
    let dbUser;
    const { data: byAuth } = await supabase.from('users').select('*').eq('auth_user_id', supaUser.id).maybeSingle();
    dbUser = byAuth || null;
    if (!dbUser && supaUser.email) {
      const { data: byEmail } = await supabase.from('users').select('*').eq('email', supaUser.email).maybeSingle();
      dbUser = byEmail || null;
    }
    if (!dbUser) {
      // Create user on-the-fly (same as Express route Step 3)
      const username = (supaUser.email || `user_${Date.now()}`).split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
      const firstName = (supaUser.user_metadata?.full_name || '').split(' ')[0] || '';
      const lastName = (supaUser.user_metadata?.full_name || '').split(' ').slice(1).join(' ') || '';
      const { data: created, error: createErr } = await supabase
        .from('users')
        .insert({
          username,
          email: supaUser.email,
          firstName,
          lastName,
          auth_user_id: supaUser.id,
          impactPoints: 0,
        })
        .select()
        .maybeSingle();
      if (createErr || !created) {
        return res.status(500).json({ message: 'Failed to resolve user' });
      }
      dbUser = created;
    }
    const userId = dbUser.id;

    // Get rewardId from body
    const rewardId = typeof req.body?.rewardId === 'number' ? req.body.rewardId : Number(req.body?.rewardId);
    if (!rewardId || isNaN(rewardId)) {
      return res.status(400).json({ message: 'Invalid reward ID' });
    }

    // Get reward from database
    const { data: reward, error: rewardError } = await supabase
      .from('rewards')
      .select('*')
      .eq('id', rewardId)
      .maybeSingle();

    if (rewardError || !reward) {
      return res.status(404).json({ message: 'Reward not found' });
    }

    // Check if user has enough points
    const currentBalance = (dbUser.impactPoints ?? 0) || 0;
    const pointsCost = reward.pointsCost || reward.points_cost || 0;
    
    if (currentBalance < pointsCost) {
      return res.status(400).json({ message: 'Insufficient impact points' });
    }

    // Create redemption record (try camelCase first, fallback to snake_case)
    let redemption;
    let redemptionData: any = {
      userId,
      rewardId,
      pointsSpent: pointsCost,
      status: 'pending',
    };

    const { data: redemptionCamel, error: redemptionErrorCamel } = await supabase
      .from('redemptions')
      .insert([redemptionData])
      .select()
      .maybeSingle();

    if (redemptionErrorCamel && (redemptionErrorCamel.message.includes('column') || redemptionErrorCamel.code === '42703')) {
      // Fallback to snake_case
      redemptionData = {
        user_id: userId,
        reward_id: rewardId,
        points_spent: pointsCost,
        status: 'pending',
      };
      const { data: redemptionSnake, error: redemptionErrorSnake } = await supabase
        .from('redemptions')
        .insert([redemptionData])
        .select()
        .maybeSingle();

      if (redemptionErrorSnake || !redemptionSnake) {
        return res.status(500).json({ 
          message: 'Failed to create redemption',
          error: redemptionErrorSnake?.message || 'Unknown error'
        });
      }
      redemption = redemptionSnake;
    } else if (redemptionErrorCamel || !redemptionCamel) {
      return res.status(500).json({ 
        message: 'Failed to create redemption',
        error: redemptionErrorCamel?.message || 'Unknown error'
      });
    } else {
      redemption = redemptionCamel;
    }

    // Apply points change (deduct points and create transaction)
    // Same logic as storage.applyPointsChange() fallback method
    try {
      const newBalance = currentBalance - pointsCost;

      // Update balance FIRST
      const { error: updateError } = await supabase
        .from('users')
        .update({ impactPoints: newBalance })
        .eq('id', userId);

      if (updateError) {
        // Rollback redemption if balance update fails
        await supabase.from('redemptions').delete().eq('id', redemption.id);
        throw new Error(`Failed to update balance: ${updateError.message}`);
      }

      // Create transaction AFTER balance update succeeds (snake_case columns)
      const redemptionId = redemption.id;
      const { error: transactionError } = await supabase
        .from('user_transactions')
        .insert([{
          user_id: userId,
          transaction_type: 'redemption',
          reward_id: rewardId,
          redemption_id: redemptionId,
          points_change: -pointsCost, // negative (points deducted)
          points_balance_after: newBalance,
          description: `Redeemed reward ${rewardId}`,
        }]);

      if (transactionError) {
        // Rollback balance and redemption if transaction fails
        await supabase.from('users').update({ impactPoints: currentBalance }).eq('id', userId);
        await supabase.from('redemptions').delete().eq('id', redemption.id);
        throw new Error(`Failed to create transaction: ${transactionError.message}`);
      }
    } catch (pointsError) {
      // If points change fails, rollback redemption
      try {
        await supabase.from('redemptions').delete().eq('id', redemption.id);
      } catch (rollbackError) {
        console.error('[rewards-redeem] Failed to rollback redemption:', rollbackError);
      }
      return res.status(500).json({
        message: 'Failed to process redemption',
        error: pointsError instanceof Error ? pointsError.message : 'Unknown error'
      });
    }

    return res.status(201).json(redemption);
  } catch (error) {
    console.error('[rewards-redeem] Error:', error);
    return res.status(500).json({
      message: 'Failed to process redemption',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

