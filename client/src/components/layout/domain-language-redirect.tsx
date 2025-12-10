import { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';

/**
 * Redirects users from dopaya.ch domain to /de pages automatically
 * Only handles non-root paths (root is handled by Vercel redirect)
 * Runs AFTER AuthTokenRedirect to avoid conflicts
 */
export function DomainLanguageRedirect() {
  const [location, navigate] = useLocation();
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return;

    // Only redirect once per path to avoid loops
    if (hasRedirectedRef.current) return;

    const hostname = window.location.hostname;
    const isDopayaCh = hostname === 'dopaya.ch' || hostname === 'www.dopaya.ch';

    // Only redirect if on dopaya.ch domain
    if (!isDopayaCh) return;

    // Don't redirect if already on /de path
    if (location.startsWith('/de')) {
      hasRedirectedRef.current = true;
      return;
    }

    // Don't redirect root (handled by Vercel)
    if (location === '/') {
      return;
    }

    // Don't redirect auth callback or API routes (critical for auth flow)
    if (location.startsWith('/auth/callback') || location.startsWith('/api/')) {
      return;
    }

    // Don't redirect if there are auth tokens in hash (let AuthTokenRedirect handle it first)
    const hashString = window.location.hash.substring(1);
    if (hashString) {
      const hashParams = new URLSearchParams(hashString);
      if (hashParams.get('access_token') || hashParams.get('refresh_token')) {
        // Auth flow in progress, don't interfere
        return;
      }
    }

    // Redirect to /de version of current path
    const newPath = `/de${location}`;
    const searchParams = window.location.search;
    const hash = window.location.hash;
    const fullPath = `${newPath}${searchParams}${hash}`;
    
    console.log(`[DomainLanguageRedirect] Redirecting ${hostname} from ${location} to ${fullPath}`);
    hasRedirectedRef.current = true;
    navigate(fullPath);
  }, [location, navigate]);

  // Reset redirect flag when location changes (but not if it's a /de path)
  useEffect(() => {
    if (!location.startsWith('/de') && location !== '/') {
      hasRedirectedRef.current = false;
    }
  }, [location]);

  return null;
}

