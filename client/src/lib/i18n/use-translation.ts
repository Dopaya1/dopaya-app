/**
 * useTranslation hook
 * Provides translation functions with interpolation and pluralization support
 */

import { useMemo } from 'react';
import { useI18n } from './i18n-context';
import { translations } from './translations';
import type { TranslationKeys, TranslationParams, PluralTranslation } from './types';

/**
 * Get nested value from object using dot notation
 * Example: getNestedValue(obj, 'nav.socialEnterprises')
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

/**
 * Replace placeholders in string with values
 * Example: replaceParams('Hello {name}', { name: 'World' }) -> 'Hello World'
 */
function replaceParams(text: string, params?: TranslationParams): string {
  if (!params) return text;
  
  return text.replace(/\{(\w+)\}/g, (match, key) => {
    return params[key]?.toString() || match;
  });
}

/**
 * Main translation hook
 * Usage: const { t, plural, language } = useTranslation();
 */
export function useTranslation() {
  const { language } = useI18n();
  
  const t = useMemo(() => {
    return (key: string, params?: TranslationParams): string => {
      const translation = getNestedValue(translations[language], key);
      
      if (!translation) {
        // In development, show the key to help identify missing translations
        if (process.env.NODE_ENV === 'development') {
          console.warn(`Missing translation key: ${key} (language: ${language})`);
          return `[${key}]`;
        }
        // Fallback to English
        const englishTranslation = getNestedValue(translations.en, key);
        if (englishTranslation) {
          return typeof englishTranslation === 'string' 
            ? replaceParams(englishTranslation, params)
            : String(englishTranslation);
        }
        return key;
      }
      
      // Handle string translations
      if (typeof translation === 'string') {
        return replaceParams(translation, params);
      }
      
      return String(translation);
    };
  }, [language]);
  
  const plural = useMemo(() => {
    return (
      key: string,
      count: number,
      params?: TranslationParams
    ): string => {
      const translation = getNestedValue(translations[language], key);
      
      if (!translation) {
        // Fallback to English
        const englishTranslation = getNestedValue(translations.en, key);
        if (englishTranslation && typeof englishTranslation === 'object' && 'singular' in englishTranslation) {
          const pluralObj = englishTranslation as PluralTranslation;
          const form = count === 1 ? pluralObj.singular : pluralObj.plural;
          return replaceParams(form, { count, ...params });
        }
        
        if (process.env.NODE_ENV === 'development') {
          console.warn(`Missing plural translation key: ${key} (language: ${language})`);
          return `[${key}]`;
        }
        return key;
      }
      
      // Handle plural translation object
      if (typeof translation === 'object' && 'singular' in translation && 'plural' in translation) {
        const pluralObj = translation as PluralTranslation;
        const form = count === 1 ? pluralObj.singular : pluralObj.plural;
        return replaceParams(form, { count, ...params });
      }
      
      // If it's a string, use it as-is (backward compatibility)
      return replaceParams(String(translation), { count, ...params });
    };
  }, [language]);
  
  return {
    t,
    plural,
    language,
  };
}

