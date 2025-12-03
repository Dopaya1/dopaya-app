/**
 * Helper functions for getting language-specific project content
 * Falls back to English if German content is not available
 */

import type { Project } from "@shared/schema";
import type { Language } from "./types";

/**
 * Get project title in the specified language
 * Falls back to English if German translation is not available
 */
export function getProjectTitle(project: Project, language: Language): string {
  if (language === 'de' && project.titleDe) {
    return project.titleDe;
  }
  return project.title;
}

/**
 * Get project description in the specified language
 * Falls back to English if German translation is not available
 */
export function getProjectDescription(project: Project, language: Language): string {
  if (language === 'de' && project.descriptionDe) {
    return project.descriptionDe;
  }
  return project.description;
}

/**
 * Get project summary in the specified language
 * Falls back to English if German translation is not available
 */
export function getProjectSummary(project: Project, language: Language): string | null {
  if (language === 'de' && project.summaryDe) {
    return project.summaryDe;
  }
  return project.summary;
}

/**
 * Get project mission statement in the specified language
 * Falls back to English if German translation is not available
 */
export function getProjectMissionStatement(project: Project, language: Language): string | null {
  // Handle both camelCase (schema) and snake_case (database)
  const missionStatementDe = project.missionStatementDe || (project as any).mission_statement_de;
  if (language === 'de' && missionStatementDe) {
    return missionStatementDe;
  }
  return project.missionStatement || (project as any).mission_statement;
}

/**
 * Get project key impact in the specified language
 * Falls back to English if German translation is not available
 */
export function getProjectKeyImpact(project: Project, language: Language): string | null {
  // Handle both camelCase (schema) and snake_case (database)
  const keyImpactDe = project.keyImpactDe || (project as any).key_impact_de;
  if (language === 'de' && keyImpactDe) {
    return keyImpactDe;
  }
  return project.keyImpact || (project as any).key_impact;
}

/**
 * Get project about us in the specified language
 * Falls back to English if German translation is not available
 */
export function getProjectAboutUs(project: Project, language: Language): string | null {
  // Handle both camelCase (schema) and snake_case (database)
  const aboutUsDe = project.aboutUsDe || (project as any).about_us_de;
  if (language === 'de' && aboutUsDe) {
    return aboutUsDe;
  }
  return project.aboutUs || (project as any).about_us;
}

/**
 * Get project impact achievements in the specified language
 * Falls back to English if German translation is not available
 */
export function getProjectImpactAchievements(project: Project, language: Language): string | null {
  // Handle both camelCase (schema) and snake_case (database)
  const impactAchievementsDe = project.impactAchievementsDe || (project as any).impact_achievements_de;
  if (language === 'de' && impactAchievementsDe) {
    return impactAchievementsDe;
  }
  return project.impactAchievements || (project as any).impact_achievements;
}

/**
 * Get project fund usage in the specified language
 * Falls back to English if German translation is not available
 */
export function getProjectFundUsage(project: Project, language: Language): string | null {
  // Handle both camelCase (schema) and snake_case (database)
  const fundUsageDe = project.fundUsageDe || (project as any).fund_usage_de;
  if (language === 'de' && fundUsageDe) {
    return fundUsageDe;
  }
  return project.fundUsage || (project as any).fund_usage;
}

/**
 * Get project selection reasoning in the specified language
 * Falls back to English if German translation is not available
 */
export function getProjectSelectionReasoning(project: Project, language: Language): string | null {
  // Handle both camelCase (schema) and snake_case (database)
  const selectionReasoningDe = project.selectionReasoningDe || (project as any).selection_reasoning_de;
  if (language === 'de' && selectionReasoningDe) {
    return selectionReasoningDe;
  }
  return project.selectionReasoning || (project as any).selection_reasoning;
}

/**
 * Get project country in the specified language
 * Falls back to English if German translation is not available
 */
export function getProjectCountry(project: Project, language: Language): string {
  // Handle both camelCase (schema) and snake_case (database)
  const countryDe = project.countryDe || (project as any).country_de;
  if (language === 'de' && countryDe) {
    return countryDe;
  }
  return project.country || '';
}

/**
 * Get project impact unit in the specified language
 * Falls back to English if German translation is not available
 */
export function getProjectImpactUnit(project: Project, language: Language): string | null {
  // Handle both camelCase (schema) and snake_case (database)
  const impactUnitDe = project.impactUnitDe || (project as any).impact_unit_de;
  if (language === 'de' && impactUnitDe) {
    return impactUnitDe;
  }
  return project.impactUnit || (project as any).impact_unit || null;
}

/**
 * Get project impact noun in the specified language
 * Falls back to English if German translation is not available
 */
export function getProjectImpactNoun(project: Project, language: Language): string | null {
  // Handle both camelCase (schema) and snake_case (database)
  const impactNounDe = project.impactNounDe || (project as any).impact_noun_de;
  if (language === 'de' && impactNounDe) {
    return impactNounDe;
  }
  return (project as any).impact_noun || (project as any).impactNoun || null;
}

/**
 * Get project impact verb in the specified language
 * Falls back to English if German translation is not available
 */
export function getProjectImpactVerb(project: Project, language: Language): string | null {
  // Handle both camelCase (schema) and snake_case (database)
  const impactVerbDe = project.impactVerbDe || (project as any).impact_verb_de;
  if (language === 'de' && impactVerbDe) {
    return impactVerbDe;
  }
  return (project as any).impact_verb || (project as any).impactVerb || null;
}

/**
 * Check if project has German content available
 */
export function hasGermanContent(project: Project): boolean {
  return !!project.titleDe;
}

/**
 * Check if a specific field has German content
 */
export function hasGermanField(project: Project, field: keyof Project): boolean {
  const germanField = `${field}De` as keyof Project;
  return !!project[germanField];
}

/**
 * Get backer short description in the specified language
 * Falls back to English if German translation is not available
 */
export function getBackerShortDescription(backer: any, language: Language): string {
  // Handle both camelCase (schema) and snake_case (database)
  const shortDescriptionDe = backer.shortDescriptionDe || backer.short_description_de;
  if (language === 'de' && shortDescriptionDe) {
    return shortDescriptionDe;
  }
  return backer.shortDescription || backer.short_description || backer.Shortdescription || '';
}

/**
 * Get brand description in the specified language
 * Falls back to English if German translation is not available
 */
export function getBrandDescription(brand: any, language: Language): string | null {
  // Handle camelCase (schema), snake_case (database), and Supabase camelCase with underscore
  const descriptionDe = brand.descriptionDe || brand.description_de || brand.Description_de;
  if (language === 'de' && descriptionDe) {
    return descriptionDe;
  }
  return brand.description || brand.Description || null;
}

/**
 * Get reward title in the specified language
 * Falls back to English if German translation is not available
 */
export function getRewardTitle(reward: any, language: Language): string {
  // Handle camelCase (schema), snake_case (database), and Supabase camelCase with underscore
  const titleDe = reward.titleDe || reward.title_de || reward.Title_de;
  if (language === 'de' && titleDe) {
    return titleDe;
  }
  return reward.title || reward.Title || '';
}

/**
 * Get project founder bio in the specified language
 * Falls back to English if German translation is not available
 */
export function getProjectFounderBio(project: Project, language: Language): string | null {
  // Handle camelCase (schema), snake_case (database), and camelCase with underscore (Supabase)
  const founderBioDe = project.founderBioDe || (project as any).founder_bio_de || (project as any).founderBio_de;
  if (language === 'de' && founderBioDe) {
    return founderBioDe;
  }
  return project.founderBio || (project as any).founder_bio || null;
}

