-- ============================================
-- Add Tip Tracking to Donations Table
-- ============================================
-- This migration adds tipAmount column to track
-- donations and tips separately
--
-- SAFE: Uses DEFAULT 0, existing data unaffected
-- ============================================

-- Add tipAmount column
ALTER TABLE donations 
ADD COLUMN "tipAmount" INTEGER DEFAULT 0;

-- Add comment for documentation
COMMENT ON COLUMN donations."tipAmount" IS 'Tip amount given to Dopaya (separate from project support amount)';

-- Verify column was added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'donations'
AND column_name = 'tipAmount';

-- ============================================
-- Expected Result:
-- column_name | data_type | column_default
-- tipAmount   | integer   | 0
-- ============================================

