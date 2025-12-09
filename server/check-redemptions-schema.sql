-- Check if reward_id column exists and if it's used
-- Run this in Supabase SQL Editor to check the schema

-- 1. Check all columns in redemptions table
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'redemptions'
ORDER BY ordinal_position;

-- 2. Check all foreign keys on redemptions table
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'redemptions';

-- 3. Check if reward_id column has any non-null values
SELECT 
    COUNT(*) as total_rows,
    COUNT(reward_id) as non_null_reward_id_count,
    COUNT(rewardId) as non_null_rewardId_count
FROM redemptions;

-- 4. Check sample data to see both columns
SELECT 
    id,
    "userId",
    "rewardId",
    "reward_id",
    "pointsSpent",
    status,
    "createdAt"
FROM redemptions
ORDER BY id DESC
LIMIT 10;


