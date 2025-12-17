/**
 * Project Field Mapper
 * 
 * Maps Supabase snake_case field names to camelCase for consistent usage
 * across the application, especially for impact tracking fields.
 * 
 * @module server/project-mapper
 */

/**
 * Normalizes Supabase snake_case fields to camelCase for impact generator
 * 
 * Supabase returns fields in snake_case (e.g., impact_factor)
 * but our TypeScript code expects camelCase (e.g., impactFactor)
 * 
 * This function creates a normalized object with both formats available,
 * prioritizing camelCase if it exists, falling back to snake_case.
 */
export function mapProjectImpactFields(project: any) {
  return {
    ...project,
    impactFactor: project.impactFactor ?? project.impact_factor,
    impactUnitSingularEn: project.impactUnitSingularEn ?? project.impact_unit_singular_en,
    impactUnitPluralEn: project.impactUnitPluralEn ?? project.impact_unit_plural_en,
    impactUnitSingularDe: project.impactUnitSingularDe ?? project.impact_unit_singular_de,
    impactUnitPluralDe: project.impactUnitPluralDe ?? project.impact_unit_plural_de,
    ctaTemplateEn: project.ctaTemplateEn ?? project.cta_template_en,
    ctaTemplateDe: project.ctaTemplateDe ?? project.cta_template_de,
    pastTemplateEn: project.pastTemplateEn ?? project.past_template_en,
    pastTemplateDe: project.pastTemplateDe ?? project.past_template_de,
    impactTiers: project.impactTiers ?? project.impact_tiers,
    impactPointsMultiplier: project.impactPointsMultiplier ?? project.impact_points_multiplier,
  };
}

