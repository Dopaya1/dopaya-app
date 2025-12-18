-- Test query to check if redemption 41 exists in Supabase
-- Run this in Supabase SQL Editor

SELECT 
  id,
  "userId",
  "rewardId",
  "pointsSpent",
  status,
  "createdAt"
FROM redemptions
WHERE id = 41;

-- Also check all redemptions for user 42
SELECT 
  id,
  "userId",
  "rewardId",
  "pointsSpent",
  status,
  "createdAt"
FROM redemptions
WHERE "userId" = 42
ORDER BY "createdAt" DESC;








