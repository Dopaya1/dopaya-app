/**
 * Language-aware Link component
 * Automatically preserves language prefix when navigating
 */

import { Link, LinkProps } from 'wouter';
import { useI18n } from '@/lib/i18n/i18n-context';
import { addLanguagePrefix } from '@/lib/i18n/utils';

interface LanguageLinkProps extends Omit<LinkProps, 'href'> {
  href: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Link component that automatically preserves language prefix
 * Usage: <LanguageLink href="/projects">Projects</LanguageLink>
 * In German context, this will navigate to /de/projects
 */
export function LanguageLink({ href, children, ...props }: LanguageLinkProps) {
  const { language } = useI18n();
  
  // Don't add language prefix for:
  // - External URLs (http://, https://, mailto:, tel:)
  // - Hash links (#)
  // - Auth routes (they shouldn't have language prefix)
  // - API routes
  const isExternal = href.startsWith('http://') || 
                     href.startsWith('https://') ||
                     href.startsWith('mailto:') ||
                     href.startsWith('tel:');
  const isHash = href.startsWith('#');
  const isAuthRoute = href.startsWith('/auth/');
  const isApiRoute = href.startsWith('/api/');
  
  if (isExternal || isHash || isAuthRoute || isApiRoute) {
    // For external links, hash links, auth routes, and API routes, use regular Link
    return <Link href={href} {...props}>{children}</Link>;
  }
  
  // Add language prefix for internal routes
  const localizedHref = addLanguagePrefix(href, language);
  
  return <Link href={localizedHref} {...props}>{children}</Link>;
}

