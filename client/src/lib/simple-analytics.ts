// Simple analytics utilities that work with the GA4 setup in index.html
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

// Simple analytics functions that use the existing gtag setup
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value
    });
  }
};

export const trackPageView = (pagePath: string, pageTitle?: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', 'G-TW0YWV68V3', {
      page_path: pagePath,
      page_title: pageTitle || document.title
    });
  }
};

export const trackConversion = (eventName: string, value?: number, currency: string = 'USD') => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, {
      currency: currency,
      value: value
    });
  }
};

// Dopaya-specific tracking functions
export const trackDonation = (projectId: string, amount: number) => {
  trackEvent('donation_click', 'conversion', projectId, amount);
  trackConversion('donation_completed', amount);
};

export const trackProjectView = (projectId: string, projectName: string) => {
  trackEvent('project_view', 'engagement', projectName);
};

export const trackProjectClick = (projectId: string, projectName: string) => {
  trackEvent('project_click', 'engagement', projectName);
};

export const trackWaitlistSignup = (source: string) => {
  trackEvent('waitlist_signup', 'conversion', source);
  trackConversion('sign_up', 1);
};

export const trackFormSubmission = (formName: string, success: boolean) => {
  trackEvent(success ? 'form_submit_success' : 'form_submit_error', 'form', formName);
};

export const trackSearch = (query: string, resultsCount?: number) => {
  trackEvent('search', 'engagement', query, resultsCount);
};

export const trackSocialShare = (platform: string, content: string) => {
  trackEvent('share', 'social', platform);
};

// Performance tracking
export const trackPerformance = (metric: string, value: number) => {
  trackEvent('performance_metric', 'performance', metric, value);
};

// Simple hook for React components
export const useSimpleAnalytics = () => {
  return {
    trackEvent,
    trackPageView,
    trackConversion,
    trackDonation,
    trackProjectView,
    trackProjectClick,
    trackWaitlistSignup,
    trackFormSubmission,
    trackSearch,
    trackSocialShare,
    trackPerformance
  };
};
