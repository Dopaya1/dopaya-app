/**
 * Dopaya Brand Colors
 * 
 * Centralized color constants for consistent theming across all components.
 * This replaces the duplicate BRAND_COLORS definitions in 10+ files.
 * 
 * Usage:
 * import { BRAND_COLORS } from '@/constants/colors';
 * 
 * Last updated: January 2025
 */

export const BRAND_COLORS = {
  // Primary brand colors
  primaryNavy: '#1a1a3a',
  primaryOrange: '#f2662d', 
  
  // Background colors
  bgWhite: '#fefefe',
  bgBeige: '#f8f6f1',
  bgCool: '#F9FAFB',
  
  // Text colors
  textPrimary: '#1a1a3a',
  textSecondary: '#6b7280',
  textMuted: '#9ca3af',
  
  // Border and UI colors
  borderSubtle: '#e5e7eb',
  
  // Accent colors
  supportTeal: '#059669'
} as const;

// Type for TypeScript support
export type BrandColor = keyof typeof BRAND_COLORS;

// Helper function to get color value
export const getBrandColor = (color: BrandColor): string => BRAND_COLORS[color];
