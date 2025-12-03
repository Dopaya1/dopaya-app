/**
 * i18n utility functions for language detection and URL handling
 */

import type { Language } from './types';

const LANGUAGE_STORAGE_KEY = 'dopaya_lang';
const SUPPORTED_LANGUAGES: Language[] = ['en', 'de'];
const DEFAULT_LANGUAGE: Language = 'en';

/**
 * Detect language from URL path
 * Returns language code if found in path (e.g., /de/...), null otherwise
 */
export function detectLanguageFromUrl(pathname: string): Language | null {
  const pathSegments = pathname.split('/').filter(Boolean);
  const firstSegment = pathSegments[0];
  
  if (firstSegment && SUPPORTED_LANGUAGES.includes(firstSegment as Language)) {
    return firstSegment as Language;
  }
  
  return null;
}

/**
 * Get language from localStorage
 */
export function getLanguageFromStorage(): Language | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored && SUPPORTED_LANGUAGES.includes(stored as Language)) {
      return stored as Language;
    }
  } catch (error) {
    console.warn('Failed to read language from localStorage:', error);
  }
  
  return null;
}

/**
 * Detect browser language
 * Returns language if browser language is German, null otherwise
 */
export function detectBrowserLanguage(): Language | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const browserLang = navigator.language || (navigator as any).userLanguage;
    if (browserLang && (browserLang.startsWith('de') || browserLang.startsWith('DE'))) {
      return 'de';
    }
  } catch (error) {
    console.warn('Failed to detect browser language:', error);
  }
  
  return null;
}

/**
 * Detect current language with priority:
 * 1. URL path (/de/...)
 * 2. localStorage (dopaya_lang)
 * 3. Browser language (if German)
 * 4. Default (English)
 */
export function detectLanguage(pathname: string = window.location.pathname): Language {
  // Priority 1: URL path
  const urlLang = detectLanguageFromUrl(pathname);
  if (urlLang) return urlLang;
  
  // Priority 2: localStorage
  const storageLang = getLanguageFromStorage();
  if (storageLang) return storageLang;
  
  // Priority 3: Browser language
  const browserLang = detectBrowserLanguage();
  if (browserLang) return browserLang;
  
  // Priority 4: Default
  return DEFAULT_LANGUAGE;
}

/**
 * Save language preference to localStorage
 */
export function saveLanguageToStorage(language: Language): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch (error) {
    console.warn('Failed to save language to localStorage:', error);
  }
}

/**
 * Remove language prefix from path
 * Example: /de/projects -> /projects
 */
export function removeLanguagePrefix(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];
  
  if (firstSegment && SUPPORTED_LANGUAGES.includes(firstSegment as Language)) {
    return '/' + segments.slice(1).join('/');
  }
  
  return pathname;
}

/**
 * Add language prefix to path
 * Example: /projects + 'de' -> /de/projects
 */
export function addLanguagePrefix(pathname: string, language: Language): string {
  // Don't add prefix for default language (English)
  if (language === DEFAULT_LANGUAGE) {
    return pathname;
  }
  
  // Remove leading slash, add language prefix
  const cleanPath = pathname.startsWith('/') ? pathname.slice(1) : pathname;
  return `/${language}/${cleanPath}`;
}

/**
 * Get locale string for Intl APIs
 * Returns locale string like 'en-US' or 'de-CH'
 */
export function getLocale(language: Language): string {
  const localeMap: Record<Language, string> = {
    en: 'en-US',
    de: 'de-CH', // Swiss German locale
  };
  
  return localeMap[language] || 'en-US';
}

/**
 * Check if a path should have language prefix
 */
export function shouldHaveLanguagePrefix(pathname: string): boolean {
  return !pathname.startsWith('/auth/') && 
         !pathname.startsWith('/api/') &&
         pathname !== '/';
}

