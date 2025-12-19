import { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';

// LAZY INITIALIZATION: Client is created on first access, not at module load time
// This ensures environment variables are loaded before client initialization
let supabase: ReturnType<typeof createClient> | null = null;

function getSupabaseClient(): ReturnType<typeof createClient> {
  if (supabase) {
    return supabase;
  }
  
  // Read from process.env directly (after .env is loaded)
  const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
  
  console.log('[Newsletter] ========== INITIALIZATION ==========');
  console.log('[Newsletter] SUPABASE_URL:', SUPABASE_URL ? `✅ Set (${SUPABASE_URL.substring(0, 20)}...)` : '❌ MISSING');
  console.log('[Newsletter] SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE_KEY ? `✅ Set (${SUPABASE_SERVICE_ROLE_KEY.substring(0, 10)}... length: ${SUPABASE_SERVICE_ROLE_KEY.length})` : '❌ MISSING');
  
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('[Newsletter] ❌ Missing Supabase credentials');
    throw new Error('Missing Supabase credentials for newsletter subscription');
  }
  
  supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  console.log('[Newsletter] ✅ Supabase client initialized');
  console.log('[Newsletter] ===================================');
  
  return supabase;
}

export const subscribeNewsletter = async (req: Request, res: Response) => {
  try {
    const { email, source = 'footer' } = req.body;

    console.log('[Newsletter] 📧 Subscription request received:', { email, source });

    if (!email || !email.includes('@')) {
      console.warn('[Newsletter] ⚠️ Invalid email:', email);
      return res.status(400).json({ error: 'Valid email is required' });
    }

    let client;
    try {
      client = getSupabaseClient();
    } catch (initError: any) {
      console.error('[Newsletter] ❌ Failed to initialize Supabase client:', initError.message);
      return res.status(503).json({ 
        error: 'Newsletter service unavailable',
        message: initError.message 
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    console.log('[Newsletter] 📝 Attempting to insert:', { email: normalizedEmail, source });

    // Try to insert into newsletter_subscribers table (same as Vercel function)
    const { data, error } = await client
      .from('newsletter_subscribers')
      .insert({
        email: normalizedEmail,
        source: source || 'footer',
        subscribed_at: new Date().toISOString(),
      })
      .select()
      .maybeSingle();

    if (error) {
      console.error('[Newsletter] ❌ Supabase error:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });

      // Check if it's a unique constraint violation (email already exists)
      if (error.code === '23505' || error.message.includes('unique') || error.message.includes('duplicate')) {
        console.log(`[Newsletter] ℹ️ Email already subscribed: ${normalizedEmail}`);
        return res.status(200).json({
          message: 'Email already subscribed',
          alreadySubscribed: true,
        });
      }

      // If table doesn't exist, log error
      if (error.code === '42P01' || error.message.includes('does not exist')) {
        console.error('[Newsletter] ❌ Table newsletter_subscribers does not exist in Supabase');
        return res.status(500).json({ 
          error: 'Newsletter table not configured',
          message: 'Please create newsletter_subscribers table in Supabase. See CREATE_NEWSLETTER_TABLE.sql'
        });
      }

      // RLS Policy error
      if (error.code === '42501' || error.message.includes('permission denied') || error.message.includes('policy')) {
        console.error('[Newsletter] ❌ RLS Policy blocked insert. Check RLS policies in Supabase.');
        return res.status(500).json({ 
          error: 'Permission denied',
          message: 'RLS policy blocked insert. Please check Supabase RLS policies for newsletter_subscribers table.'
        });
      }

      throw error;
    }

    console.log(`[Newsletter] ✅ New subscriber saved: ${normalizedEmail} from ${source}`, data);

    return res.status(200).json({
      message: 'Successfully subscribed to newsletter',
      subscriber: data,
    });

  } catch (error: any) {
    console.error('[Newsletter] ❌ Subscription error:', error);
    return res.status(500).json({
      error: 'Failed to subscribe to newsletter',
      message: error?.message || 'Unknown error'
    });
  }
};

export const getNewsletterStats = async (req: Request, res: Response) => {
  try {
    let client;
    try {
      client = getSupabaseClient();
    } catch (initError: any) {
      return res.status(503).json({ 
        error: 'Newsletter service unavailable',
        message: initError.message 
      });
    }

    // Fetch all subscribers from Supabase
    const { data: subscribers, error } = await client
      .from('newsletter_subscribers')
      .select('email, source, subscribed_at')
      .order('subscribed_at', { ascending: false });

    if (error) {
      if (error.code === '42P01' || error.message.includes('does not exist')) {
        return res.status(200).json({
          totalSubscribers: 0,
          recentSubscribers: [],
          sources: {},
          message: 'Table not found - no subscribers yet'
        });
      }
      throw error;
    }

    const subscribersList = subscribers || [];

    // Calculate stats
    const sources = subscribersList.reduce((acc, sub) => {
      const source = sub.source || 'unknown';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    res.status(200).json({
      totalSubscribers: subscribersList.length,
      recentSubscribers: subscribersList.slice(0, 10), // First 10 (already ordered desc)
      sources
    });
  } catch (error: any) {
    console.error('[Newsletter] ❌ Stats error:', error);
    res.status(500).json({ 
      error: 'Failed to get newsletter stats',
      message: error?.message || 'Unknown error'
    });
  }
};
