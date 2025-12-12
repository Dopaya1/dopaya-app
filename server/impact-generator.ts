/**
 * Impact Snapshot Generator
 * 
 * Generates immutable impact snapshots for donations with calculated impact values
 * and localized, template-based text generation.
 * 
 * Phase 3.1 of Impact Tracking Migration
 * 
 * @module server/impact-generator
 */

import { Project } from "@shared/schema";

/**
 * Impact Tier structure (for non-linear projects)
 */
export interface ImpactTier {
  min_amount: number;
  max_amount: number;
  impact_factor: number;
  cta_template_en: string;
  cta_template_de: string;
  past_template_en: string;
  past_template_de: string;
}

/**
 * Impact Snapshot structure
 */
export interface ImpactSnapshot {
  calculated_impact: number;
  impact_factor: number;
  impact_unit_singular: string;
  impact_unit_plural: string;
  unit: string; // Singular or Plural based on calculated_impact
  generated_text_cta: string;
  generated_text_past: string;
  timestamp: string;
}

/**
 * Checks if project has new impact tracking data
 * Supports both linear (impact_factor) and non-linear (impact_tiers) projects
 */
export function hasImpact(project: Project): boolean {
  // Check if project has impact_tiers (non-linear)
  if (project.impactTiers && Array.isArray(project.impactTiers) && project.impactTiers.length > 0) {
    // For impact_tiers, we need units and templates from project
    return !!(
      project.impactUnitSingularEn &&
      project.impactUnitPluralEn &&
      project.pastTemplateEn &&
      project.ctaTemplateEn
    );
  }
  
  // Check if project has impact_factor (linear)
  return !!(
    project.impactFactor != null &&
    project.impactUnitSingularEn &&
    project.impactUnitPluralEn &&
    project.pastTemplateEn &&
    project.ctaTemplateEn
  );
}

/**
 * Formats impact value according to rules:
 * - People: Whole number if ≥1, else decimal with tooltip
 * - kg/Liter: 1 decimal place
 * - <1 Person: Show decimal value in tooltip
 */
function formatImpact(calculatedImpact: number, unitType: string): string {
  // Check if unit is person/people type
  const isPersonType = unitType.toLowerCase().includes('person') || 
                       unitType.toLowerCase().includes('people') ||
                       unitType.toLowerCase().includes('child') ||
                       unitType.toLowerCase().includes('children');
  
  if (isPersonType) {
    // People: Whole number if ≥1, else decimal
    if (calculatedImpact >= 1) {
      return Math.floor(calculatedImpact).toString();
    } else {
      return calculatedImpact.toFixed(2); // For tooltip
    }
  } else if (unitType.toLowerCase() === 'kg' || 
             unitType.toLowerCase() === 'liter' || 
             unitType.toLowerCase() === 'l') {
    // kg/Liter: 1 decimal place
    return calculatedImpact.toFixed(1);
  } else {
    // Other: Whole number if possible, else 1 decimal
    return calculatedImpact % 1 === 0 
      ? calculatedImpact.toString() 
      : calculatedImpact.toFixed(1);
  }
}

/**
 * Gets unit (Singular or Plural) based on calculated impact
 */
function getUnit(
  calculatedImpact: number,
  singular: string,
  plural: string
): string {
  return calculatedImpact === 1 ? singular : plural;
}

/**
 * Renders Past template: "{impact} {unit} {freitext_past}"
 */
function renderPastTemplate(
  template: string, // Only free-text part
  formattedImpact: string,
  unit: string
): string {
  return `${formattedImpact} ${unit} ${template}`;
}

/**
 * Renders CTA template: "Support {project} with ${amount} and help {impact} {unit} {freitext_cta} — earn {points} Impact Points"
 */
function renderCtaTemplate(
  template: string, // Only free-text part
  projectTitle: string,
  amount: number,
  formattedImpact: string,
  unit: string,
  points: number
): string {
  return `Support ${projectTitle} with $${amount} and help ${formattedImpact} ${unit} ${template} — earn ${points} Impact Points`;
}

/**
 * Generates impact snapshot for a donation
 * 
 * @param project - Project object with impact tracking data
 * @param amount - Donation amount in USD
 * @param language - Language ('en' | 'de')
 * @returns Impact snapshot with calculated impact and generated texts
 * @throws Error if project doesn't have impact tracking data
 */
export function generateImpactSnapshot(
  project: Project,
  amount: number,
  language: 'en' | 'de'
): ImpactSnapshot {
  // Validate that project has impact tracking data
  if (!hasImpact(project)) {
    const hasTiers = project.impactTiers && Array.isArray(project.impactTiers) && project.impactTiers.length > 0;
    const hasFactor = project.impactFactor != null;
    throw new Error(
      `Project ${project.id} (${project.title}) does not have impact tracking data. ` +
      `Required: (impactFactor OR impactTiers) AND impactUnitSingularEn, impactUnitPluralEn, pastTemplateEn, ctaTemplateEn. ` +
      `Found: impactFactor=${hasFactor}, impactTiers=${hasTiers}`
    );
  }

  let calculatedImpact: number;
  let impactFactor: number;
  let ctaTemplate: string;
  let pastTemplate: string;
  let unitSingular: string;
  let unitPlural: string;

  // 1. Check Impact-Tiers (for non-linear projects)
  if (project.impactTiers && Array.isArray(project.impactTiers) && project.impactTiers.length > 0) {
    const tiers = project.impactTiers as ImpactTier[];
    
    // Find matching tier based on amount
    const tier = tiers.find(t => 
      amount >= t.min_amount && amount < t.max_amount
    ) || tiers[tiers.length - 1]; // Fallback: last tier (for amounts >= max)
    
    calculatedImpact = amount * tier.impact_factor;
    impactFactor = tier.impact_factor;
    
    // Use templates from tier
    ctaTemplate = language === 'de' ? tier.cta_template_de : tier.cta_template_en;
    pastTemplate = language === 'de' ? tier.past_template_de : tier.past_template_en;
    
    // Use units from project (tiers don't have separate units)
    unitSingular = language === 'de' 
      ? (project.impactUnitSingularDe || project.impactUnitSingularEn || 'Einheit')
      : (project.impactUnitSingularEn || 'unit');
    unitPlural = language === 'de'
      ? (project.impactUnitPluralDe || project.impactUnitPluralEn || 'Einheiten')
      : (project.impactUnitPluralEn || 'units');
  } 
  // 2. Fallback: Linear calculation (Standard)
  else if (project.impactFactor != null) {
    impactFactor = Number(project.impactFactor);
    calculatedImpact = amount * impactFactor;
    
    // Use standard templates from project
    ctaTemplate = language === 'de' 
      ? (project.ctaTemplateDe || project.ctaTemplateEn || '')
      : (project.ctaTemplateEn || '');
    pastTemplate = language === 'de'
      ? (project.pastTemplateDe || project.pastTemplateEn || '')
      : (project.pastTemplateEn || '');
    
    unitSingular = language === 'de'
      ? (project.impactUnitSingularDe || project.impactUnitSingularEn || 'Einheit')
      : (project.impactUnitSingularEn || 'unit');
    unitPlural = language === 'de'
      ? (project.impactUnitPluralDe || project.impactUnitPluralEn || 'Einheiten')
      : (project.impactUnitPluralEn || 'units');
  } 
  // 3. This should not happen if hasImpact() check passed, but safety fallback
  else {
    throw new Error(
      `Project ${project.id} (${project.title}) has no impact_factor or impact_tiers`
    );
  }

  // Validate templates exist
  if (!ctaTemplate || !pastTemplate) {
    throw new Error(
      `Project ${project.id} (${project.title}) is missing templates for language ${language}`
    );
  }

  // Format impact value
  const formattedImpact = formatImpact(calculatedImpact, unitSingular);

  // Choose unit (Singular or Plural)
  const unit = getUnit(calculatedImpact, unitSingular, unitPlural);

  // Calculate impact points (default multiplier: 10)
  const points = amount * (project.impactPointsMultiplier || 10);

  // Generate texts
  const generatedTextPast = renderPastTemplate(pastTemplate, formattedImpact, unit);
  const generatedTextCta = renderCtaTemplate(
    ctaTemplate,
    project.title,
    amount,
    formattedImpact,
    unit,
    points
  );

  return {
    calculated_impact: calculatedImpact,
    impact_factor: impactFactor,
    impact_unit_singular: unitSingular,
    impact_unit_plural: unitPlural,
    unit,
    generated_text_cta: generatedTextCta,
    generated_text_past: generatedTextPast,
    timestamp: new Date().toISOString()
  };
}

