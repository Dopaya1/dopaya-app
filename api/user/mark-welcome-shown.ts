import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

/**
 * Marks welcome_shown flag for the authenticated user.
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
  let dbUser;
  const { data: byAuth } = await supabase.from('users').select('*').eq('auth_user_id', supaUser.id).maybeSingle();
  dbUser = byAuth || null;
  if (!dbUser && supaUser.email) {
    const { data: byEmail } = await supabase.from('users').select('*').eq('email', supaUser.email).maybeSingle();
    dbUser = byEmail || null;
  }

  if (!dbUser) {
    return res.status(404).json({ message: 'User not found in database' });
  }

  const userId = dbUser.id;
  const { error: updateErr } = await supabase
    .from('users')
    .update({ welcome_shown: true })
    .eq('id', userId);

  if (updateErr) {
    // Column may not exist; treat as non-blocking
    return res.status(200).json({ message: 'Marked locally; column missing in DB', warning: updateErr.message });
  }

  return res.status(200).json({ message: 'Welcome marked as shown' });
}

