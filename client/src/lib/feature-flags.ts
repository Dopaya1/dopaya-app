/**
 * Feature flags helper for onboarding preview.
 *
 * LAUNCH MODE: Always enabled for all users.
 * Full platform access (Login, Support pages, Dashboard, Rewards) is now public.
 */
export function isOnboardingPreviewEnabled(): boolean {
  return true; // LAUNCH: Always enabled for all users
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

