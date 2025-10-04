import { useEffect } from 'react';
import { useLocation } from 'wouter';

/**
 * Hook that scrolls to top of page whenever the route changes
 * This ensures consistent navigation behavior across all pages
 */
export function useScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    // Scroll to top immediately when location changes
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [location]);
}