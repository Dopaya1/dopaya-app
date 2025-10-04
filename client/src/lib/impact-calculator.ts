import { Project } from "@shared/schema";

/**
 * Calculates the impact value for a given donation amount using the project's impact tiers
 * Uses nearest match logic to find the closest donation tier
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
 * Formats impact value for display
 */
export function formatImpact(impact: number, unit: string): string {
  const formattedImpact = impact % 1 === 0 ? impact.toString() : impact.toFixed(2);
  return `${formattedImpact} ${unit}`;
}