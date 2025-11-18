# Confetti Animation - Easy Removal Guide

## ⚠️ How to Remove Confetti

The confetti animation is designed to be easily removable. Follow these steps:

### Step 1: Remove CDN Script
**File:** `client/index.html`
- Find and delete this line (around line 39-40):
  ```html
  <!-- CONFETTI LIBRARY (CDN) - Easy to remove: delete this script tag -->
  <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.2/dist/confetti.browser.min.js"></script>
  ```

### Step 2: Remove Confetti Utility File
**File:** `client/src/lib/confetti.ts`
- Delete this entire file

### Step 3: Remove Import and Code from Dashboard
**File:** `client/src/pages/dashboard-page.tsx`

1. **Remove the import** (around line 21-22):
   ```typescript
   // CONFETTI: Easy to remove - delete this import and the triggerConfetti() calls below
   import { triggerConfetti, pulseImpactPointsBadge } from "@/lib/confetti";
   ```

2. **Replace the confetti block** (around lines 153-185) with:
   ```typescript
   if (!welcomeShown) {
     console.log('[Dashboard] New user detected (50 IP, 0 donations) → showing welcome modal');
     setSignupWelcomeStep(1);
     setShowWelcomeModal(true);
     sessionStorage.setItem('welcomeModalShown', 'true');
     sessionStorage.removeItem('welcomeModalClosed');
     setRunTour(false);
   }
   ```

3. **Remove confetti flag from clearState** (around line 68):
   - Delete: `sessionStorage.removeItem('confettiShown');`

4. **Remove test confetti parameter** (around lines 44-45 and 75-85):
   - Delete the `testConfetti` variable and the test confetti block

### Step 4: Remove CSS (Optional)
**File:** `client/src/index.css`
- The `.sr-only` class and `@keyframes pulse` can stay (they're useful for accessibility)
- Or remove them if you don't need them elsewhere

## What Gets Removed

- ✅ CDN script (~15KB)
- ✅ Confetti utility file (~150 lines)
- ✅ Dashboard integration code (~30 lines)
- ✅ Test URL parameter

## Total Cleanup

- **Files deleted:** 1 (`confetti.ts`)
- **Lines removed:** ~50-60 lines across 2 files
- **CDN dependency:** Removed

## Testing After Removal

After removal, test that:
1. New user signup still shows welcome modal (just without confetti)
2. No console errors about missing `confetti` or `triggerConfetti`
3. Welcome modal appears immediately after signup

## Current Implementation

The confetti:
- ✅ Triggers after signup success + 50 points credited
- ✅ Runs for 3 seconds (burst + drizzle phases)
- ✅ Uses Dopaya brand colors
- ✅ Respects `prefers-reduced-motion`
- ✅ Announces via aria-live for screen readers
- ✅ Shows welcome modal after completion
- ✅ Reduces particle count on mobile (< 768px)

