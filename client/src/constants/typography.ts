/**
 * Typography Constants
 * Standardized font classes for consistent typography across the application
 * 
 * Usage: import { TYPOGRAPHY } from '@/constants/typography'
 * Example: className={TYPOGRAPHY.hero}
 */

export const TYPOGRAPHY = {
  // Hero headlines - Main page titles (matches current hero section)
  hero: "text-4xl md:text-5xl font-bold leading-tight",
  
  // Section headlines - Major section titles
  section: "text-3xl md:text-4xl font-semibold leading-normal",
  
  // Subsection headlines - Card titles, smaller headings
  subsection: "text-xl font-semibold leading-normal",
  
  // Body text - Regular content
  body: "text-base font-normal leading-relaxed",
  
  // Large body text - For emphasis or important content
  bodyLarge: "text-lg font-normal leading-relaxed",
  
  // Small text - Captions, labels
  small: "text-sm font-normal leading-normal",
  
  // Extra small text - Fine print
  xs: "text-xs font-normal leading-normal"
} as const;

// Type for TypeScript support
export type TypographyKey = keyof typeof TYPOGRAPHY;
