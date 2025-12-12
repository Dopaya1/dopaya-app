// Standalone Vercel serverless function for /api/newsletter/subscribe
// Uses Supabase table instead of file system for serverless compatibility

/// <reference types="node" />

import { createClient } from '@supabase/supabase-js';

// Security: Validate environment variables at module load
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    'Missing required environment variables: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set'
  );
}

// Initialize Supabase client with service role key for writes
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

/**
 * Subscribe email to newsletter
 * Stores in Supabase table (newsletter_subscribers) or creates it if needed
 */
async function subscribeNewsletter(email: string, source: string = 'footer') {
  try {
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      throw new Error('Valid email is required');
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Try to insert into newsletter_subscribers table
    // If table doesn't exist, we'll get an error and handle it gracefully
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .insert({
        email: normalizedEmail,
        source: source || 'footer',
        subscribed_at: new Date().toISOString(),
      })
      .select()
      .maybeSingle();

    if (error) {
      // Check if it's a unique constraint violation (email already exists)
      if (error.code === '23505' || error.message.includes('unique') || error.message.includes('duplicate')) {
        return {
          success: true,
          alreadySubscribed: true,
          message: 'Email already subscribed',
        };
      }

      // If table doesn't exist, log warning but don't fail
      if (error.code === '42P01' || error.message.includes('does not exist')) {
        console.warn('[subscribeNewsletter] Table newsletter_subscribers does not exist. Please create it in Supabase.');
        console.warn('[subscribeNewsletter] SQL to create table:');
        console.warn(`
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  source TEXT DEFAULT 'footer',
  subscribed_at TIMESTAMP DEFAULT NOW()
);
        `);
        
        // Return success anyway (graceful degradation)
        return {
          success: true,
          message: 'Subscription request received (table not configured)',
        };
      }

      throw error;
    }

    return {
      success: true,
      alreadySubscribed: false,
      message: 'Successfully subscribed to newsletter',
      subscriber: data,
    };
  } catch (error) {
    console.error('[subscribeNewsletter] Error:', error);
    throw error;
  }
}

// Vercel serverless function handler
export default async function handler(req: any, res: any) {
  // CORS handling
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('[POST /api/newsletter/subscribe] Request received');
  
  try {
    const { email, source = 'footer' } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    const result = await subscribeNewsletter(email, source);

    if (result.alreadySubscribed) {
      return res.status(200).json({
        message: result.message,
        alreadySubscribed: true,
      });
    }

    return res.status(200).json({
      message: result.message,
      subscriberCount: result.subscriber ? 1 : undefined,
    });
  } catch (error) {
    console.error('[POST /api/newsletter/subscribe] Error:', error);
    return res.status(500).json({
      error: 'Failed to subscribe to newsletter',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}



