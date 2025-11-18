-- ============================================
-- CLEANUP: Remove duplicate snake_case columns
-- Keep only camelCase columns (impactPoints, totalDonations)
-- ============================================

-- Step 1: Migrate any data from snake_case to camelCase (if snake_case has values)
-- Update impactPoints if it's 0 but impact_points has a value
UPDATE public.users
SET "impactPoints" = impact_points
WHERE "impactPoints" = 0 
  AND impact_points > 0
  AND impact_points IS NOT NULL;

-- Update totalDonations if it's 0 but total_donations has a value
UPDATE public.users
SET "totalDonations" = total_donations
WHERE "totalDonations" = 0 
  AND total_donations > 0
  AND total_donations IS NOT NULL;

-- Step 2: Drop the duplicate snake_case columns
ALTER TABLE public.users 
DROP COLUMN IF EXISTS impact_points;

ALTER TABLE public.users 
DROP COLUMN IF EXISTS total_donations;

-- Step 3: Verify cleanup (run this separately to check)
-- SELECT column_name, data_type 
-- FROM information_schema.columns
-- WHERE table_schema = 'public' 
--   AND table_name = 'users' 
--   AND column_name IN ('impactPoints', 'totalDonations', 'impact_points', 'total_donations')
-- ORDER BY column_name;
