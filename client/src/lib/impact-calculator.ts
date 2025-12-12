import { Project } from "@shared/schema";

/**
 * Normalizes project data from Supabase (snake_case) to camelCase for frontend use
 * This ensures compatibility with both API responses and local project objects
 */
function normalizeProject(project: Project): Project {
  // If already normalized (has camelCase), return as-is
  if (project.impactFactor != null || project.impact_factor == null) {
    return project;
  }

  // Map snake_case to camelCase (Supabase returns snake_case)
  return {
    ...project,
    impactFactor: (project as any).impact_factor ?? project.impactFactor,
    impactUnitSingularEn: (project as any).impact_unit_singular_en ?? project.impactUnitSingularEn,
    impactUnitPluralEn: (project as any).impact_unit_plural_en ?? project.impactUnitPluralEn,
    impactUnitSingularDe: (project as any).impact_unit_singular_de ?? project.impactUnitSingularDe,
    impactUnitPluralDe: (project as any).impact_unit_plural_de ?? project.impactUnitPluralDe,
    ctaTemplateEn: (project as any).cta_template_en ?? project.ctaTemplateEn,
    ctaTemplateDe: (project as any).cta_template_de ?? project.ctaTemplateDe,
    pastTemplateEn: (project as any).past_template_en ?? project.pastTemplateEn,
    pastTemplateDe: (project as any).past_template_de ?? project.pastTemplateDe,
    impactTiers: (project as any).impact_tiers ?? project.impactTiers,
    impactPointsMultiplier: (project as any).impact_points_multiplier ?? project.impactPointsMultiplier,
  } as Project;
}

/**
 * Checks if project has new impact tracking data
 * Supports both linear (impact_factor) and non-linear (impact_tiers) projects
 */
function hasImpactData(project: Project): boolean {
  const normalized = normalizeProject(project);

  // Check if project has impact_tiers (non-linear)
  if (normalized.impactTiers && Array.isArray(normalized.impactTiers) && normalized.impactTiers.length > 0) {
    // For impact_tiers, we need units and templates from project
    return !!(
      normalized.impactUnitSingularEn &&
      normalized.impactUnitPluralEn &&
      normalized.impactUnitSingularDe &&
      normalized.impactUnitPluralDe &&
      normalized.impactTiers.some(tier =>
        tier.impact_factor != null &&
        tier.cta_template_en && tier.cta_template_de &&
        tier.past_template_en && tier.past_template_de
      )
    );
  }

  // Check for linear impact factor
  return !!(
    normalized.impactFactor != null &&
    normalized.impactUnitSingularEn &&
    normalized.impactUnitPluralEn &&
    normalized.impactUnitSingularDe &&
    normalized.impactUnitPluralDe &&
    normalized.pastTemplateEn &&
    normalized.pastTemplateDe &&
    normalized.ctaTemplateEn &&
    normalized.ctaTemplateDe
  );
}

/**
 * Unified Impact Calculator with Fallback Logic
 * 
 * Phase 4.1: Calculates impact using new system (impact_factor/impact_tiers) with fallback to old system
 * 
 * Priority:
 * 1. New system: impact_factor or impact_tiers (if project has new impact data)
 * 2. Fallback: Old donation tier interpolation system
 * 
 * @param project - Project object (supports both camelCase and snake_case)
 * @param donationAmount - Donation amount in dollars
 * @param language - Language code ('en' or 'de') for unit selection
 * @returns Impact calculation result with impact value, unit, and metadata
 */
export function calculateImpactUnified(
  project: Project,
  donationAmount: number,
  language: 'en' | 'de' = 'en'
): {
  impact: number;
  unit: string;
  exactMatch: boolean;
  source: 'new_linear' | 'new_tiers' | 'old_tiers';
} {
  const normalized = normalizeProject(project);

  // Check if project has new impact tracking data
  if (hasImpactData(normalized)) {
    // NEW SYSTEM: Use impact_factor or impact_tiers

    // 1. Check for impact_tiers (non-linear)
    if (normalized.impactTiers && Array.isArray(normalized.impactTiers) && normalized.impactTiers.length > 0) {
      // Find matching tier
      const tier = normalized.impactTiers.find(t =>
        donationAmount >= t.min_amount && donationAmount < t.max_amount
      ) || normalized.impactTiers[normalized.impactTiers.length - 1]; // Fallback to last tier

      if (tier && tier.impact_factor != null) {
        const calculatedImpact = donationAmount * tier.impact_factor;
        const unitSingular = language === 'en' ? normalized.impactUnitSingularEn! : normalized.impactUnitSingularDe!;
        const unitPlural = language === 'en' ? normalized.impactUnitPluralEn! : normalized.impactUnitPluralDe!;
        const selectedUnit = calculatedImpact === 1 ? unitSingular : unitPlural;

        return {
          impact: calculatedImpact,
          unit: selectedUnit,
          exactMatch: false,
          source: 'new_tiers'
        };
      }
    }

    // 2. Linear calculation with impact_factor
    if (normalized.impactFactor != null) {
      const calculatedImpact = donationAmount * Number(normalized.impactFactor);
      const unitSingular = language === 'en' ? normalized.impactUnitSingularEn! : normalized.impactUnitSingularDe!;
      const unitPlural = language === 'en' ? normalized.impactUnitPluralEn! : normalized.impactUnitPluralDe!;
      const selectedUnit = calculatedImpact === 1 ? unitSingular : unitPlural;

      return {
        impact: calculatedImpact,
        unit: selectedUnit,
        exactMatch: false,
        source: 'new_linear'
      };
    }
  }

  // FALLBACK: Old donation tier interpolation system
  const oldResult = calculateImpact(project, donationAmount);
  return {
    ...oldResult,
    source: 'old_tiers'
  };
}

/**
 * Calculates the impact value for a given donation amount using the project's impact tiers
 * Uses nearest match logic to find the closest donation tier
 * 
 * @deprecated Use calculateImpactUnified() instead for new projects with impact_factor
 * This function remains for backward compatibility with old projects
 */
export function calculateImpact(project: Project, donationAmount: number): {
  impact: number;
  unit: string;
  exactMatch: boolean;
} {
  // Extract donation tiers and corresponding impacts
  const tiers = [
    { donation: project.donation1, impact: project.impact1 },
    { donation: project.donation2, impact: project.impact2 },
    { donation: project.donation3, impact: project.impact3 },
    { donation: project.donation4, impact: project.impact4 },
    { donation: project.donation5, impact: project.impact5 },
    { donation: project.donation6, impact: project.impact6 },
    { donation: project.donation7, impact: project.impact7 },
  ].filter(tier => tier.donation && tier.impact); // Filter out null/undefined values

  if (tiers.length === 0) {
    return {
      impact: 0,
      unit: project.impactUnit || "impact units",
      exactMatch: false
    };
  }

  // Sort tiers by donation amount
  tiers.sort((a, b) => a.donation - b.donation);

  // Find exact match
  const exactMatch = tiers.find(tier => tier.donation === donationAmount);
  if (exactMatch) {
    return {
      impact: exactMatch.impact,
      unit: project.impactUnit || "impact units",
      exactMatch: true
    };
  }

  // Find nearest match using interpolation
  if (donationAmount <= tiers[0].donation) {
    // Use the lowest tier for small donations
    const ratio = donationAmount / tiers[0].donation;
    return {
      impact: Math.round(tiers[0].impact * ratio * 100) / 100,
      unit: project.impactUnit || "impact units",
      exactMatch: false
    };
  }

  if (donationAmount >= tiers[tiers.length - 1].donation) {
    // Use the highest tier ratio for large donations
    const highestTier = tiers[tiers.length - 1];
    const ratio = donationAmount / highestTier.donation;
    return {
      impact: Math.round(highestTier.impact * ratio * 100) / 100,
      unit: project.impactUnit || "impact units",
      exactMatch: false
    };
  }

  // Interpolate between two closest tiers
  let lowerTier = tiers[0];
  let upperTier = tiers[1];

  for (let i = 0; i < tiers.length - 1; i++) {
    if (donationAmount > tiers[i].donation && donationAmount < tiers[i + 1].donation) {
      lowerTier = tiers[i];
      upperTier = tiers[i + 1];
      break;
    }
  }

  // Linear interpolation
  const donationRange = upperTier.donation! - lowerTier.donation!;
  const impactRange = upperTier.impact! - lowerTier.impact!;
  const donationDiff = donationAmount - lowerTier.donation!;
  const interpolatedImpact = lowerTier.impact! + (donationDiff / donationRange) * impactRange;

  return {
    impact: Math.round(interpolatedImpact * 100) / 100,
    unit: project.impactUnit || "impact units",
    exactMatch: false
  };
}

/**
 * Gets all available donation tiers for a project
 */
export function getAvailableTiers(project: Project): Array<{ donation: number; impact: number }> {
  return [
    { donation: project.donation1, impact: project.impact1 },
    { donation: project.donation2, impact: project.impact2 },
    { donation: project.donation3, impact: project.impact3 },
    { donation: project.donation4, impact: project.impact4 },
    { donation: project.donation5, impact: project.impact5 },
    { donation: project.donation6, impact: project.impact6 },
    { donation: project.donation7, impact: project.impact7 },
  ]
    .filter(tier => tier.donation && tier.impact)
    .sort((a, b) => a.donation! - b.donation!);
}

/**
 * Formats impact value for display according to rules:
 * - People: Whole number if ≥1, else decimal
 * - kg/Liter: 1 decimal place
 * - Other: Whole number if possible, else 1 decimal
 */
export function formatImpactValue(impact: number, unitType: string): string {
  const isPersonType = unitType.toLowerCase().includes('person') || 
                       unitType.toLowerCase().includes('people') ||
                       unitType.toLowerCase().includes('child') ||
                       unitType.toLowerCase().includes('children');
  
  if (isPersonType) {
    // People: Whole number if ≥1, else decimal
    if (impact >= 1) {
      return Math.floor(impact).toString();
    } else {
      return impact.toFixed(2);
    }
  } else if (unitType.toLowerCase().includes('kg') || 
             unitType.toLowerCase().includes('liter') || 
             unitType.toLowerCase().includes('l')) {
    // kg/Liter: 1 decimal place
    return impact.toFixed(1);
  } else {
    // Other: Whole number if possible, else 1 decimal
    return impact % 1 === 0 ? impact.toString() : impact.toFixed(1);
  }
}

/**
 * Generates CTA text from template
 * Template format: "Support {project} with ${amount} and help {impact} {unit} {freitext_cta} — earn {points} Impact Points"
 * 
 * @param project - Project object
 * @param amount - Donation amount
 * @param impactResult - Result from calculateImpactUnified
 * @param language - Language code
 * @returns Generated CTA text or null if templates not available
 */
export function generateCtaText(
  project: Project,
  amount: number,
  impactResult: { impact: number; unit: string },
  language: 'en' | 'de' = 'en'
): string | null {
  const normalized = normalizeProject(project);
  
  // Check if project has new impact templates
  const ctaTemplate = language === 'de' 
    ? (normalized.ctaTemplateDe || normalized.ctaTemplateEn)
    : (normalized.ctaTemplateEn);
  
  if (!ctaTemplate) {
    return null; // No template available, use fallback
  }
  
  const formattedImpact = formatImpactValue(impactResult.impact, impactResult.unit);
  const points = Math.floor(amount * (normalized.impactPointsMultiplier ?? (normalized as any)?.impact_points_multiplier ?? 10));
  
  // Render CTA template based on language
  if (language === 'de') {
    // German: "Unterstütze {project} mit ${amount} und hilf {impact} {unit} {freitext_cta} — verdiene {points} Impact Points"
    return `Unterstütze ${project.title} mit $${amount} und hilf ${formattedImpact} ${impactResult.unit} ${ctaTemplate} — verdiene ${points} Impact Points`;
  } else {
    // English: "Support {project} with ${amount} and help {impact} {unit} {freitext_cta} — earn {points} Impact Points"
    return `Support ${project.title} with $${amount} and help ${formattedImpact} ${impactResult.unit} ${ctaTemplate} — earn ${points} Impact Points`;
  }
}

/**
 * Formats impact value for display
 * @deprecated Use formatImpactValue() instead
 */
export function formatImpact(impact: number, unit: string): string {
  const formattedImpact = impact % 1 === 0 ? impact.toString() : impact.toFixed(2);
  return `${formattedImpact} ${unit}`;
}