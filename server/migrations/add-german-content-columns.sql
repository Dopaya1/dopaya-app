-- Migration: Add German content columns to projects table
-- Date: 2025-01-XX
-- Description: Adds nullable German translation columns for project content
-- This migration is non-destructive - all columns are nullable

-- Add German content columns to projects table
ALTER TABLE "projects" 
ADD COLUMN IF NOT EXISTS "title_de" TEXT,
ADD COLUMN IF NOT EXISTS "description_de" TEXT,
ADD COLUMN IF NOT EXISTS "slug_de" TEXT,
ADD COLUMN IF NOT EXISTS "summary_de" TEXT,
ADD COLUMN IF NOT EXISTS "mission_statement_de" TEXT,
ADD COLUMN IF NOT EXISTS "key_impact_de" TEXT,
ADD COLUMN IF NOT EXISTS "about_us_de" TEXT,
ADD COLUMN IF NOT EXISTS "impact_achievements_de" TEXT,
ADD COLUMN IF NOT EXISTS "fund_usage_de" TEXT,
ADD COLUMN IF NOT EXISTS "selection_reasoning_de" TEXT;

-- Add unique constraint on slug_de only if not null
-- Note: PostgreSQL doesn't support conditional unique constraints directly
-- We'll use a partial unique index instead
CREATE UNIQUE INDEX IF NOT EXISTS "projects_slug_de_unique" 
ON "projects" ("slug_de") 
WHERE "slug_de" IS NOT NULL;

-- Add comment to document the migration
COMMENT ON COLUMN "projects"."title_de" IS 'German translation of project title';
COMMENT ON COLUMN "projects"."description_de" IS 'German translation of project description';
COMMENT ON COLUMN "projects"."slug_de" IS 'German URL slug for project (unique if not null)';
COMMENT ON COLUMN "projects"."summary_de" IS 'German translation of project summary';
COMMENT ON COLUMN "projects"."mission_statement_de" IS 'German translation of mission statement';
COMMENT ON COLUMN "projects"."key_impact_de" IS 'German translation of key impact';
COMMENT ON COLUMN "projects"."about_us_de" IS 'German translation of about us section';
COMMENT ON COLUMN "projects"."impact_achievements_de" IS 'German translation of impact achievements';
COMMENT ON COLUMN "projects"."fund_usage_de" IS 'German translation of fund usage';
COMMENT ON COLUMN "projects"."selection_reasoning_de" IS 'German translation of selection reasoning';

