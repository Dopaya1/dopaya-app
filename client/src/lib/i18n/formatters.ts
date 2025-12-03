/**
 * Locale-aware formatting functions using Intl API
 */

import type { Language } from './types';
import { getLocale } from './utils';

/**
 * Format currency value
 * @param value - Amount to format
 * @param currency - Currency code (default: CHF)
 * @param language - Language for locale (default: 'en')
 */
export function formatCurrency(
  value: number,
  currency: string = 'CHF',
  language: Language = 'en'
): string {
  const locale = getLocale(language);
  
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    }).format(value);
  } catch (error) {
    console.warn('Currency formatting error:', error);
    return `${currency} ${value.toFixed(2)}`;
  }
}

/**
 * Format number with locale-specific formatting
 * @param value - Number to format
 * @param language - Language for locale (default: 'en')
 */
export function formatNumber(value: number, language: Language = 'en'): string {
  const locale = getLocale(language);
  
  try {
    return new Intl.NumberFormat(locale).format(value);
  } catch (error) {
    console.warn('Number formatting error:', error);
    return value.toString();
  }
}

/**
 * Format date with locale-specific formatting
 * @param date - Date to format (Date object or ISO string)
 * @param language - Language for locale (default: 'en')
 * @param options - Intl.DateTimeFormatOptions
 */
export function formatDate(
  date: Date | string,
  language: Language = 'en',
  options?: Intl.DateTimeFormatOptions
): string {
  const locale = getLocale(language);
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  };
  
  try {
    return new Intl.DateTimeFormat(locale, defaultOptions).format(dateObj);
  } catch (error) {
    console.warn('Date formatting error:', error);
    return dateObj.toLocaleDateString();
  }
}

/**
 * Format percentage value
 * @param value - Percentage value (0-100)
 * @param language - Language for locale (default: 'en')
 */
export function formatPercent(value: number, language: Language = 'en'): string {
  const locale = getLocale(language);
  
  try {
    return new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    }).format(value / 100);
  } catch (error) {
    console.warn('Percentage formatting error:', error);
    return `${value}%`;
  }
}

