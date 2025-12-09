-- Find missing redemptions: Transactions with redemption_id but no matching redemption
-- This will show which redemption_ids exist in transactions but not in redemptions table

-- Step 1: Find all unique redemption_ids from transactions
WITH transaction_redemptions AS (
  SELECT DISTINCT redemption_id
  FROM user_transactions
  WHERE redemption_id IS NOT NULL
),
redemption_ids AS (
  SELECT id as redemption_id
  FROM redemptions
)
SELECT 
  tr.redemption_id,
  CASE 
    WHEN r.redemption_id IS NULL THEN 'MISSING ❌'
    ELSE 'EXISTS ✅'
  END as status,
  (SELECT COUNT(*) FROM user_transactions WHERE redemption_id = tr.redemption_id) as transaction_count
FROM transaction_redemptions tr
LEFT JOIN redemption_ids r ON tr.redemption_id = r.redemption_id
ORDER BY tr.redemption_id;

-- Step 2: Show details of missing redemptions
SELECT 
  ut.id as transaction_id,
  ut.redemption_id,
  ut.reward_id,
  ut.points_change,
  ut.created_at as transaction_date,
  'REDEMPTION MISSING' as issue
FROM user_transactions ut
LEFT JOIN redemptions r ON ut.redemption_id = r.id
WHERE ut.redemption_id IS NOT NULL
  AND r.id IS NULL
ORDER BY ut.redemption_id, ut.created_at;

-- Step 3: Count summary
SELECT 
  COUNT(DISTINCT ut.redemption_id) as total_unique_redemption_ids_in_transactions,
  COUNT(DISTINCT r.id) as total_redemptions_in_table,
  COUNT(DISTINCT ut.redemption_id) - COUNT(DISTINCT r.id) as missing_redemptions_count
FROM user_transactions ut
LEFT JOIN redemptions r ON ut.redemption_id = r.id
WHERE ut.redemption_id IS NOT NULL;


