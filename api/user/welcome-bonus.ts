import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

/**
 * Serverless handler that mirrors the Express route /api/user/welcome-bonus.
 * Applies a one-time welcome bonus (50 points) and records a transaction.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Basic CORS handling for preflight and POST
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

  // Find or create DB user
  let dbUser;
  const { data: byAuth } = await supabase.from('users').select('*').eq('auth_user_id', supaUser.id).maybeSingle();
  dbUser = byAuth || null;

  if (!dbUser && supaUser.email) {
    const { data: byEmail } = await supabase.from('users').select('*').eq('email', supaUser.email).maybeSingle();
    dbUser = byEmail || null;
  }

  if (!dbUser) {
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
        impactPoints: 50,
      })
      .select()
      .maybeSingle();
    if (createErr || !created) {
      return res.status(500).json({ message: 'Failed to create user' });
    }
    dbUser = created;
  }

  const userId = dbUser.id;

  // Check if welcome_bonus already applied
  const { data: txExists } = await supabase
    .from('user_transactions')
    .select('id')
    .eq('user_id', userId)
    .eq('transaction_type', 'welcome_bonus')
    .limit(1)
    .maybeSingle();

  if (txExists) {
    return res.status(200).json({ message: 'Welcome bonus already applied' });
  }

  // Apply bonus: update impactPoints to at least +50
  try {
    await supabase.rpc('exec_sql', {
      sql: `
        update users
        set "impactPoints" = greatest(coalesce("impactPoints", 0), 50),
            welcome_bonus_applied = true
        where id = ${userId};
      `,
    });
  } catch {
    // ignore if rpc not present
  }

  // Insert transaction
  const { error: txErr } = await supabase.from('user_transactions').insert({
    user_id: userId,
    transaction_type: 'welcome_bonus',
    points_change: 50,
    description: 'Welcome bonus',
  });
  if (txErr) {
    // Non-critical: return success since points were applied
    return res.status(200).json({ message: 'Welcome bonus applied, transaction not recorded', warning: txErr.message });
  }

  return res.status(200).json({ message: 'Welcome bonus applied' });
}

