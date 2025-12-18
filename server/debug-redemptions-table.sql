-- Debug query to check what's actually in the redemptions table
-- Run this in Supabase SQL Editor

-- 1. Check table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'redemptions'
ORDER BY ordinal_position;

-- 2. Check ALL redemptions (ignore RLS if possible)
SELECT * FROM redemptions ORDER BY id DESC LIMIT 10;

-- 3. Check redemptions for user 42 specifically
SELECT * FROM redemptions WHERE "userId" = 42 ORDER BY id DESC;

-- 4. Also try with snake_case
SELECT * FROM redemptions WHERE user_id = 42 ORDER BY id DESC;

-- 5. Check RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'redemptions';

-- 6. Count total redemptions
SELECT COUNT(*) as total_redemptions FROM redemptions;








