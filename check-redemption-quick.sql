-- Quick check: What columns exist and what data is there?
-- Run this in Supabase SQL Editor

-- Check columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'redemptions'
ORDER BY ordinal_position;

-- Check ALL data (bypass RLS with service role)
SELECT * FROM redemptions ORDER BY id DESC LIMIT 20;

-- Count
SELECT COUNT(*) as total FROM redemptions;
