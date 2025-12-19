-- =====================================================
-- ALL PROJECTS UNIVERSAL FUND - DATABASE MIGRATION
-- =====================================================
-- Date: December 18, 2025
-- Purpose: Add universal funding feature
-- Safe to run: YES (additive changes only)
-- =====================================================

-- STEP 1: Add isUniversalFund column to projects table
-- This is safe - adds a new column with default false for all existing projects
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS is_universal_fund BOOLEAN DEFAULT false;

-- STEP 2: Create index for faster queries (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_projects_is_universal_fund 
ON projects(is_universal_fund) 
WHERE is_universal_fund = true;

-- STEP 3: Insert the special "All Projects" entry
-- Check if it already exists first to make this idempotent
INSERT INTO projects (
  slug,
  title,
  title_de,
  category,
  description,
  description_de,
  mission_statement,
  mission_statement_de,
  key_impact,
  key_impact_de,
  about_us,
  about_us_de,
  image_url,
  country,
  country_de,
  featured,
  status,
  is_universal_fund,
  impact_points_multiplier,
  created_at
) 
SELECT
  'all-projects',
  'Support All Projects',
  'Alle Projekte unterstützen',
  'Universal Impact',
  'Can''t choose which project to support? No problem! Your donation will be split equally across all active social enterprises on Dopaya. Make maximum impact with one simple contribution.',
  'Sie können sich nicht entscheiden, welches Projekt Sie unterstützen möchten? Kein Problem! Ihre Spende wird gleichmäßig auf alle aktiven Sozialunternehmen bei Dopaya aufgeteilt. Erzielen Sie maximale Wirkung mit einem einfachen Beitrag.',
  'Making impact easier. Your donation helps every social enterprise on our platform grow and scale their positive change.',
  'Wirkung leicht gemacht. Ihre Spende hilft jedem Sozialunternehmen auf unserer Plattform zu wachsen und ihre positive Veränderung zu skalieren.',
  'Your contribution is automatically distributed across all active projects, maximizing your social impact footprint.',
  'Ihr Beitrag wird automatisch auf alle aktiven Projekte verteilt und maximiert so Ihren sozialen Impact.',
  'The Universal Impact Fund is perfect for supporters who believe in Dopaya''s mission and want to support the entire ecosystem of vetted social enterprises. Each project receives an equal share of your donation, helping them grow sustainably.',
  'Der Universal Impact Fund ist perfekt für Unterstützer, die an Dopayas Mission glauben und das gesamte Ökosystem geprüfter Sozialunternehmen unterstützen möchten. Jedes Projekt erhält einen gleichen Anteil Ihrer Spende und hilft ihnen nachhaltig zu wachsen.',
  '/assets/all-projects-hero.jpg',
  'Global',
  'Global',
  true,
  'active',
  true,
  10,
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM projects WHERE slug = 'all-projects'
);

-- STEP 4: Verify the insertion
-- Run this to check if it worked:
-- SELECT id, slug, title, is_universal_fund, featured FROM projects WHERE slug = 'all-projects';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (if needed)
-- =====================================================
-- Run these commands in order to completely remove the feature:

-- 1. Delete the special project
-- DELETE FROM projects WHERE slug = 'all-projects';

-- 2. Remove any donations associated with it (optional - keeps data intact)
-- DELETE FROM donations WHERE "projectId" IN (SELECT id FROM projects WHERE slug = 'all-projects');

-- 3. Drop the index
-- DROP INDEX IF EXISTS idx_projects_is_universal_fund;

-- 4. Remove the column (optional - safe to keep)
-- ALTER TABLE projects DROP COLUMN IF EXISTS is_universal_fund;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check if column was added successfully
-- SELECT column_name, data_type, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'projects' AND column_name = 'is_universal_fund';

-- Check if the special project exists
-- SELECT id, slug, title, is_universal_fund, featured, status 
-- FROM projects 
-- WHERE slug = 'all-projects';

-- Count active projects (to calculate split)
-- SELECT COUNT(*) as active_project_count 
-- FROM projects 
-- WHERE status = 'active' AND is_universal_fund = false;

-- =====================================================
-- END OF MIGRATION
-- =====================================================


