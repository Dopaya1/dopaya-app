-- Migration to add impact_noun and impact_verb columns to projects table
-- Run this in your Supabase SQL editor

ALTER TABLE "projects" 
ADD COLUMN IF NOT EXISTS "impact_noun" TEXT,
ADD COLUMN IF NOT EXISTS "impact_verb" TEXT;

-- Update existing projects with sample data for testing
-- You can modify these values based on your actual project data

-- Example for Ignis Careers (assuming it has slug 'ignis-careers')
UPDATE "projects" 
SET 
  "impact_noun" = 'children',
  "impact_verb" = 'educate'
WHERE "slug" = 'ignis-careers';

-- Example for other projects (you can customize these)
UPDATE "projects" 
SET 
  "impact_noun" = 'trees',
  "impact_verb" = 'plant'
WHERE "slug" = 'panjurli-labs';

UPDATE "projects" 
SET 
  "impact_noun" = 'people',
  "impact_verb" = 'empower'
WHERE "slug" = 'allika-eco-products';

UPDATE "projects" 
SET 
  "impact_noun" = 'women',
  "impact_verb" = 'support'
WHERE "slug" = 'sanitrust-pads';
