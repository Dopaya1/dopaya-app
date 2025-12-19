-- =====================================================
-- ALL PROJECTS UNIVERSAL FUND - DATABASE MIGRATION
-- =====================================================
-- Run this in Supabase SQL Editor
-- Safe to run multiple times (uses IF NOT EXISTS)
-- =====================================================

-- STEP 1: Add the column to projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS is_universal_fund BOOLEAN DEFAULT false;

-- STEP 2: Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_projects_is_universal_fund 
ON projects(is_universal_fund) 
WHERE is_universal_fund = true;

-- STEP 3: Insert the special "All Projects" entry
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
  image_url,
  country,
  country_de,
  featured,
  status,
  is_universal_fund,
  impact_points_multiplier,
  created_at
) VALUES (
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
  '/placeholder-project.png',
  'Global',
  'Global',
  true,
  'active',
  true,
  10,
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- 1. Check if column was added
SELECT 
  column_name, 
  data_type, 
  column_default 
FROM information_schema.columns 
WHERE table_name = 'projects' AND column_name = 'is_universal_fund';

-- 2. Check if the special project was created
SELECT 
  id, 
  slug, 
  title, 
  is_universal_fund, 
  featured, 
  status 
FROM projects 
WHERE slug = 'all-projects';

-- 3. Count active projects (for split calculation verification)
SELECT COUNT(*) as active_project_count 
FROM projects 
WHERE status = 'active' AND (is_universal_fund = false OR is_universal_fund IS NULL);

-- =====================================================
-- SUCCESS!
-- =====================================================
-- If all three queries above return results, you're ready to test!


