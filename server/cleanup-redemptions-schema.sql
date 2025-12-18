-- SAFE CLEANUP: Remove reward_id column and its foreign key
-- ⚠️ ONLY RUN THIS IF:
-- 1. You've confirmed reward_id column exists
-- 2. All values in reward_id are NULL
-- 3. You're using rewardId (camelCase) everywhere

-- Step 1: Drop the foreign key constraint (if it exists)
-- This must be done BEFORE dropping the column
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'redemptions_reward_id_fkey'
        AND table_name = 'redemptions'
    ) THEN
        ALTER TABLE redemptions DROP CONSTRAINT redemptions_reward_id_fkey;
        RAISE NOTICE 'Dropped foreign key: redemptions_reward_id_fkey';
    ELSE
        RAISE NOTICE 'Foreign key redemptions_reward_id_fkey does not exist';
    END IF;
END $$;

-- Step 2: Drop the reward_id column (if it exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'redemptions' 
        AND column_name = 'reward_id'
    ) THEN
        ALTER TABLE redemptions DROP COLUMN reward_id;
        RAISE NOTICE 'Dropped column: reward_id';
    ELSE
        RAISE NOTICE 'Column reward_id does not exist';
    END IF;
END $$;

-- Step 3: Verify the cleanup
SELECT 
    column_name, 
    data_type
FROM information_schema.columns 
WHERE table_name = 'redemptions'
ORDER BY ordinal_position;

-- Expected result: Should only show rewardId (camelCase), not reward_id








