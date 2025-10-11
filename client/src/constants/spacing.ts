/**
 * Dopaya Spacing Constants
 * 
 * Standardized spacing patterns based on homepage design.
 * This ensures consistent vertical rhythm across all pages.
 * 
 * Usage:
 * import { SPACING } from '@/constants/spacing';
 * 
 * Last updated: January 2025
 */

export const SPACING = {
  // Section spacing - Main content sections
  section: "py-24",                    // 96px - Homepage standard
  
  // Hero spacing - Landing/hero sections  
  hero: "py-16",                       // 64px - Homepage hero
  
  // Container spacing - Inner content padding
  container: "px-4",                   // 16px - Standard container padding
  
  // Card spacing - Component internal spacing
  card: "p-6",                         // 24px - Standard card padding
  
  // Button spacing - CTA elements
  button: "px-8 py-4",                 // 32px horizontal, 16px vertical
  
  // Small spacing - Fine details
  small: "px-2 py-1",                  // 8px horizontal, 4px vertical
  
  // Medium spacing - Secondary elements
  medium: "px-4 py-2",                 // 16px horizontal, 8px vertical
  
  // Large spacing - Important elements
  large: "px-6 py-3",                  // 24px horizontal, 12px vertical
} as const;

// Type for TypeScript support
export type SpacingKey = keyof typeof SPACING;

// Helper function to get spacing value
export const getSpacing = (spacing: SpacingKey): string => SPACING[spacing];
