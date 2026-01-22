-- Create newsletter_subscribers table if it doesn't exist
-- This table stores newsletter subscription emails from Footer and Checkout

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  source TEXT DEFAULT 'footer',
  subscribed_at TIMESTAMP DEFAULT NOW()
);

-- Add index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON newsletter_subscribers(email);

-- Add index on source for analytics
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_source ON newsletter_subscribers(source);

-- Add RLS policy to allow service role to insert/select
-- Note: This assumes you're using Supabase Service Role Key for writes
-- If using ANON_KEY, you may need to adjust RLS policies

-- Allow public inserts (for newsletter signup)
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Policy: Allow service role full access
CREATE POLICY IF NOT EXISTS "Service role can manage newsletter subscribers"
  ON newsletter_subscribers
  FOR ALL
  USING (auth.role() = 'service_role');

-- Policy: Allow anonymous inserts (for public signup forms)
CREATE POLICY IF NOT EXISTS "Allow public newsletter signups"
  ON newsletter_subscribers
  FOR INSERT
  WITH CHECK (true);

-- Policy: Allow authenticated users to read their own subscription
CREATE POLICY IF NOT EXISTS "Users can read their own subscription"
  ON newsletter_subscribers
  FOR SELECT
  USING (auth.uid()::text = (SELECT email FROM auth.users WHERE email = newsletter_subscribers.email LIMIT 1)::text);


