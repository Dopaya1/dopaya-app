/**
 * Mobile Optimization Constants
 * 
 * Universal mobile-first approach for consistent responsive design
 * across all pages and components.
 * 
 * NOTE: This file is primarily for reference and specialized mobile components.
 * For typography, use TYPOGRAPHY constants from @/constants/typography
 * For colors, use BRAND_COLORS from @/constants/colors
 * 
 * Usage:
 * import { MOBILE } from '@/constants/mobile';
 * 
 * Last updated: January 2025
 * 
 * Recent improvements:
 * - FAQ typography standardized across all pages
 * - Hero section mobile optimization completed
 * - Eligibility criteria 2-column mobile layout
 * - Consistent typography using TYPOGRAPHY constants
 */

export const MOBILE = {
  // Responsive spacing - Mobile-first approach
  spacing: {
    // Section padding - scales from mobile to desktop
    section: "py-12 md:py-16 lg:py-24",        // 48px → 64px → 96px
    hero: "py-8 md:py-12 lg:py-16",            // 32px → 48px → 64px
    container: "px-4 md:px-6 lg:px-8",         // 16px → 24px → 32px
    
    // Card and component spacing
    card: "p-4 md:p-6 lg:p-8",                 // 16px → 24px → 32px
    button: "px-4 py-2 md:px-6 md:py-3 lg:px-8 lg:py-4", // Responsive button padding
    small: "px-2 py-1 md:px-3 md:py-2",        // Small elements
  },

  // Responsive typography - Mobile-first scaling
  typography: {
    // Headlines scale down on mobile
    hero: "text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight",
    section: "text-xl md:text-2xl lg:text-3xl xl:text-4xl font-semibold leading-normal",
    subsection: "text-lg md:text-xl lg:text-2xl font-semibold leading-normal",
    
    // Body text stays readable on mobile
    body: "text-sm md:text-base lg:text-lg font-normal leading-relaxed",
    bodyLarge: "text-base md:text-lg lg:text-xl font-normal leading-relaxed",
    small: "text-xs md:text-sm font-normal leading-normal",
  },

  // Touch targets - Minimum 44px for accessibility
  touchTargets: {
    button: "min-h-[44px] min-w-[44px]",       // Minimum touch target
    link: "min-h-[44px] flex items-center",    // Links should be tappable
    input: "min-h-[44px] px-3 py-2",           // Form inputs
  },

  // Mobile-specific layouts
  layout: {
    // Grid systems that work on mobile
    grid2: "grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8",
    grid3: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8",
    grid4: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8",
    
    // Flex layouts that stack on mobile
    flexRow: "flex flex-col md:flex-row gap-4 md:gap-6 lg:gap-8",
    flexCenter: "flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6",
    
    // Container widths
    container: "max-w-7xl mx-auto",
    containerNarrow: "max-w-4xl mx-auto",
    containerWide: "max-w-7xl mx-auto",
  },

  // Mobile navigation
  navigation: {
    // Mobile menu spacing
    menuItem: "px-4 py-3 md:px-6 md:py-2",     // Menu items
    dropdown: "px-4 py-2 md:px-6 md:py-3",     // Dropdown items
    
    // Mobile-friendly navigation
    mobileMenu: "fixed inset-0 z-50 md:hidden", // Full-screen mobile menu
    desktopMenu: "hidden md:flex",              // Desktop-only menu
  },

  // Mobile-specific utilities
  utilities: {
    // Hide/show on different screen sizes
    mobileOnly: "block md:hidden",
    desktopOnly: "hidden md:block",
    tabletUp: "hidden sm:block",
    mobileDown: "block sm:hidden",
    
    // Mobile text alignment
    textCenter: "text-center md:text-left",
    textLeft: "text-left",
    
    // Mobile margins
    marginAuto: "mx-auto",
    marginMobile: "mx-4 md:mx-6 lg:mx-8",
  },

  // Recent improvements and best practices
  improvements: {
    // FAQ sections now use consistent typography
    faq: {
      question: "Use TYPOGRAPHY.subsection (text-xl font-semibold)",
      answer: "Use TYPOGRAPHY.body (text-base font-normal leading-relaxed)",
      note: "Applied across FAQ page, homepage FAQ, and social enterprises page"
    },
    
    // Hero section mobile optimization
    hero: {
      typography: "Use TYPOGRAPHY.hero for main headlines",
      buttons: "Full width on mobile (w-full), auto width on desktop (sm:w-auto)",
      layout: "Buttons side by side on desktop (sm:flex-row), stacked on mobile (flex-col)",
      note: "Desktop layout preserved, mobile optimizations added"
    },
    
    // Eligibility criteria mobile layout
    eligibility: {
      grid: "grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4",
      note: "2 columns on mobile, 2 on medium, 4 on large screens"
    },
    
    // Brands page mobile consistency
    brands: {
      textAlignment: "text-center lg:text-left for hero sections",
      buttons: "w-full sm:w-auto for full width on mobile, auto width on desktop",
      note: "Fixed to match mobile standards across all pages"
    },
    
    // Current best practices
    bestPractices: {
      typography: "Use TYPOGRAPHY constants for all text elements",
      colors: "Use BRAND_COLORS for consistent color scheme",
      spacing: "Use direct Tailwind classes (py-24, px-4, etc.) for spacing",
      mobile: "Mobile-first responsive design with proper breakpoints"
    }
  }
} as const;

// Type for TypeScript support
export type MobileKey = keyof typeof MOBILE;
export type MobileSpacingKey = keyof typeof MOBILE.spacing;
export type MobileTypographyKey = keyof typeof MOBILE.typography;
export type MobileLayoutKey = keyof typeof MOBILE.layout;
export type MobileImprovementsKey = keyof typeof MOBILE.improvements;
