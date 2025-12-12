-- ============================================
-- Impact Tracking Migration - Schema Extension
-- ============================================
-- Phase 1: Add new columns to projects and donations tables
-- 
-- IMPORTANT: 
-- - Templates store only the free-text part (not full template)
-- - {impact} and {unit} are automatically inserted
-- - has_impact is checked in code, not stored as column
-- ============================================

-- ============================================
-- PROJECTS TABLE
-- ============================================

-- Impact calculation
ALTER TABLE projects ADD COLUMN IF NOT EXISTS impact_factor NUMERIC;

-- Units (for {unit} placeholder - automatic Singular/Plural)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS impact_unit_singular_en TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS impact_unit_plural_en TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS impact_unit_singular_de TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS impact_unit_plural_de TEXT;

-- Templates (only free-text part - {impact} and {unit} are automatically inserted)
-- Past: "{impact} {unit} {freitext_past}"
-- CTA: "Support {project} with ${amount} and help {impact} {unit} {freitext_cta} — earn {points} Impact Points"
ALTER TABLE projects ADD COLUMN IF NOT EXISTS cta_template_en TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS cta_template_de TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS past_template_en TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS past_template_de TEXT;

-- Impact-Tiers for non-linear projects (optional - for exceptions)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS impact_tiers JSONB;

-- Optional: Backup of old presets
ALTER TABLE projects ADD COLUMN IF NOT EXISTS impact_presets JSONB;

-- ============================================
-- DONATIONS TABLE
-- ============================================

-- Calculated impact value
ALTER TABLE donations ADD COLUMN IF NOT EXISTS calculated_impact NUMERIC;

-- Full impact snapshot (JSONB with all data)
ALTER TABLE donations ADD COLUMN IF NOT EXISTS impact_snapshot JSONB;

-- Generated texts (for quick access without template rendering)
-- Note: Only Past texts are stored - CTA texts are only needed before donation (from project template)
ALTER TABLE donations ADD COLUMN IF NOT EXISTS generated_text_past_en TEXT;
ALTER TABLE donations ADD COLUMN IF NOT EXISTS generated_text_past_de TEXT;

-- ============================================
-- NOTES
-- ============================================
-- 1. All new columns are nullable for backward compatibility
-- 2. has_impact is NOT a column - it's checked in code:
--    hasImpact = impact_factor != null && 
--                impact_unit_singular_en && 
--                impact_unit_plural_en && 
--                past_template_en && 
--                cta_template_en
-- 3. Templates store only the free-text part:
--    - past_template_en: "provided with safe drinking water"
--    - cta_template_en: "access safe drinking water"
-- 4. Donations table only stores Past texts (CTA texts are only needed before donation)
-- 4. Impact-Tiers structure (JSONB):
--    [
--      {
--        "min_amount": 0,
--        "max_amount": 100,
--        "impact_factor": 10.0,
--        "cta_template_en": "fresh air per day",
--        "cta_template_de": "frische Luft pro Tag zu geben",
--        "past_template_en": "fresh air per day provided",
--        "past_template_de": "frische Luft pro Tag gegeben"
--      }
--    ]

