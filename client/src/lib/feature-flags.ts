/**
 * Feature flags helper for onboarding preview.
 *
 * Preview is enabled when:
 * - URL contains ?previewOnboarding=1 (persisted to sessionStorage), OR
 * - sessionStorage has onboardingPreview=1 (set in a prior navigation)
 *
 * Default: disabled (returns false) so public UX remains unchanged.
 */
export function isOnboardingPreviewEnabled(): boolean {
  try {
    if (typeof window === "undefined") return false;
    const SESSION_KEY = "onboardingPreview";
    const url = new URL(window.location.href);
    const param = url.searchParams.get("previewOnboarding");

    if (param === "1") {
      try {
        window.sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        // Ignore storage errors (e.g., private mode)
      }
      return true;
    }

    try {
      return window.sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      return false;
    }
  } catch {
    return false;
  }
}

/**
 * Utility to clear the preview flag for the current session.
 * This is useful for quickly turning off preview mode without reloading with a clean URL.
 */
export function disableOnboardingPreview(): void {
  try {
    if (typeof window === "undefined") return;
    window.sessionStorage.removeItem("onboardingPreview");
  } catch {
    // ignore
  }
}

