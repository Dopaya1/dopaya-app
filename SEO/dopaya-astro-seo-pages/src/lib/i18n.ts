/**
 * i18n helpers for programmatic Astro pages.
 * - t(locale, key, params?) — resolve dot-notation key, fallback to en, replace {param} placeholders.
 * - getLocaleUrl(path, locale) — path with /de prefix only for de; en = no prefix.
 * - getAlternateLocaleUrl(currentPath, currentLocale) — same page in the other locale (for switcher & hreflang).
 */

import { translations } from './translations.ts';
import type { Locale } from './translations.ts';

export type { Locale };

/**
 * Resolve a translation string by locale and dot-notation key.
 * Falls back to English if the key is missing for the requested locale.
 * Replaces {paramName} with values from params.
 */
export function t(
  locale: Locale,
  key: string,
  params?: Record<string, string | number>,
): string {
  const fallbackLocale: Locale = 'en';
  const loc = locale in translations ? locale : fallbackLocale;
  const fallback = translations[fallbackLocale];
  const dict = translations[loc] ?? fallback;

  const parts = key.split('.');
  let value: unknown = dict;
  for (const part of parts) {
    if (value != null && typeof value === 'object' && part in (value as object)) {
      value = (value as Record<string, unknown>)[part];
    } else {
      value = undefined;
      break;
    }
  }

  let str = typeof value === 'string' ? value : (fallback && getNested(fallback, parts)) ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    }
  }
  return str;
}

function getNested(obj: Record<string, Record<string, string>>, parts: string[]): string | undefined {
  let cur: unknown = obj;
  for (const part of parts) {
    if (cur != null && typeof cur === 'object' && part in (cur as object)) {
      cur = (cur as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return typeof cur === 'string' ? cur : undefined;
}

/**
 * Return the path with locale prefix only for de.
 * en: /brands/foo → /brands/foo
 * de: /brands/foo → /de/brands/foo
 */
export function getLocaleUrl(path: string, locale: Locale): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  if (locale === 'de') {
    return p === '/' ? '/de' : `/de${p}`;
  }
  return p;
}

/**
 * Return the same logical page in the other locale (for language switcher and hreflang).
 * en /brands/foo → /de/brands/foo
 * de /de/brands/foo → /brands/foo
 */
export function getAlternateLocaleUrl(currentPath: string, currentLocale: Locale): string {
  const p = currentPath.startsWith('/') ? currentPath : `/${currentPath}`;
  if (currentLocale === 'de') {
    if (p.startsWith('/de')) {
      const rest = p.slice(3) || '/';
      return rest;
    }
    return p;
  }
  // en: add /de prefix
  return p === '/' ? '/de' : `/de${p}`;
}
