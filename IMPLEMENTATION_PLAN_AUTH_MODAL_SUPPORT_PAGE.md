# Implementation Plan: Auth Modal on Support Page

## Goal
Show authentication modal directly on the support page when user is not authenticated, instead of redirecting to homepage.

## Benefits
- ✅ User stays in context (no redirects)
- ✅ Simpler state management (no sessionStorage restore needed)
- ✅ Better UX (seamless flow)
- ✅ Easier Stripe integration later

## Implementation Steps

### Step 1: Add AuthModal Import
**File:** `Tech/client/src/pages/support-page.tsx`
**Change:** Add import for AuthModal component
**Line:** After line 17 (after SupportMiniJourney import)
**Code:**
```typescript
import { AuthModal } from "@/components/auth/auth-modal";
```

### Step 2: Add State Variable
**File:** `Tech/client/src/pages/support-page.tsx`
**Change:** Add state for controlling auth modal visibility
**Line:** After line 94 (after showMiniJourney state)
**Code:**
```typescript
const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
```

### Step 3: Add useEffect to Show Modal When Not Authenticated
**File:** `Tech/client/src/pages/support-page.tsx`
**Change:** Add useEffect hook to automatically show modal when user is not authenticated
**Line:** After line 109 (after totalAmount calculation, before early returns)
**Code:**
```typescript
// Show auth modal when user is not authenticated
// Only show after project has loaded (to avoid showing on loading state)
useEffect(() => {
  if (!isLoading && project && !user && previewEnabled) {
    setShowAuthModal(true);
  }
}, [isLoading, project, user, previewEnabled]);
```

### Step 4: Add useEffect to Close Modal When User Authenticates
**File:** `Tech/client/src/pages/support-page.tsx`
**Change:** Add useEffect hook to automatically close modal when user becomes authenticated
**Line:** After Step 3 useEffect
**Code:**
```typescript
// Close auth modal when user becomes authenticated
useEffect(() => {
  if (user && showAuthModal) {
    setShowAuthModal(false);
  }
}, [user, showAuthModal]);
```

### Step 5: Render AuthModal Component
**File:** `Tech/client/src/pages/support-page.tsx`
**Change:** Add AuthModal component at the end of JSX, before closing fragment
**Line:** After line 737 (after closing </div> of main content, before closing </>)
**Code:**
```typescript
{/* Auth Modal - shown when user is not authenticated */}
<AuthModal
  isOpen={showAuthModal}
  onClose={() => {
    // Don't allow closing modal if user is not authenticated
    // User must authenticate to continue
    if (!user) {
      return;
    }
    setShowAuthModal(false);
  }}
  defaultTab="register"
/>
```

### Step 6: Test Basic Flow
**Test:** Navigate to support page without authentication
**Expected:** Auth modal should open automatically
**Test:** Try to close modal (click X or outside)
**Expected:** Modal should NOT close (user must authenticate)

### Step 7: Test Authentication Flow
**Test:** Authenticate via Google or email
**Expected:** Modal closes automatically, user can see support page
**Test:** User can select amount and continue

### Step 8: Remove Old Redirect Logic (After Steps 6-7 Pass)
**File:** `Tech/client/src/pages/support-page.tsx`
**Change:** Remove redirect logic from Continue button onClick handler
**Line:** Around line 691-704 (in Continue button onClick)
**Remove:**
```typescript
// Check if user is authenticated
if (!user) {
  // Store support context for after auth
  sessionStorage.setItem('pendingSupportAmount', currentSupportAmount.toString());
  sessionStorage.setItem('pendingSupportReturnUrl', `/support/${project.slug}${previewEnabled ? '?previewOnboarding=1' : ''}`);
  sessionStorage.setItem('openPaymentDialog', 'true');
  
  // Redirect to homepage with auth modal
  window.location.href = `/?auth=register&previewOnboarding=1`;
  return;
}
```
**Replace with:**
```typescript
// User must be authenticated to continue (modal should have shown if not authenticated)
if (!user) {
  setShowAuthModal(true);
  return;
}
```

### Step 9: Remove sessionStorage Restore Logic (After Step 8)
**File:** `Tech/client/src/pages/support-page.tsx`
**Change:** Remove useEffect that restores support amount from sessionStorage
**Line:** Around lines 71-86
**Remove:**
```typescript
// Restore support amount after returning from auth
// Only run when user changes (logs in), not when supportAmount changes
useEffect(() => {
  if (user && !supportAmount) {
    const pendingAmount = sessionStorage.getItem('pendingSupportAmount');
    if (pendingAmount) {
      const amount = parseFloat(pendingAmount);
      if (amount > 0) {
        setSupportAmount(amount);
        setCustomAmount(amount);
        setIsCustomAmount(true);
        sessionStorage.removeItem('pendingSupportAmount');
      }
    }
  }
}, [user]); // Removed supportAmount from dependencies to prevent infinite loop
```

### Step 10: Final Testing
**Test:** Complete flow from start to finish
1. Navigate to support page without auth → modal shows
2. Authenticate → modal closes, can see support page
3. Select amount → can continue
4. Click Continue → processing animation shows (if authenticated)

## Revert Strategy

If anything breaks, revert changes in reverse order:

1. **Revert Step 9:** Restore sessionStorage logic (if removed)
2. **Revert Step 8:** Restore redirect logic in Continue button
3. **Revert Step 5:** Remove AuthModal component from JSX
4. **Revert Step 4:** Remove useEffect to close modal
5. **Revert Step 3:** Remove useEffect to show modal
6. **Revert Step 2:** Remove showAuthModal state
7. **Revert Step 1:** Remove AuthModal import

**Quick Revert Command:**
```bash
cd /Users/patrick/Cursor/Dopaya/Tech
git checkout -- client/src/pages/support-page.tsx
```

## Files Modified
- `Tech/client/src/pages/support-page.tsx` (only file that needs changes)

## Testing Checklist
- [ ] Step 6: Modal shows when not authenticated
- [ ] Step 6: Modal cannot be closed without auth
- [ ] Step 7: Modal closes after authentication
- [ ] Step 7: User can see support page after auth
- [ ] Step 10: Complete flow works end-to-end

## Notes
- No changes needed to auth-callback.tsx (we're not redirecting anymore)
- No changes needed to App.tsx (we're using existing AuthModal component)
- No changes needed to auth-modal.tsx (using existing component as-is)

