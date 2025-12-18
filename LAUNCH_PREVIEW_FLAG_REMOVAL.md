# 🚀 Launch Guide: Preview Flag Removal

**Date:** December 18, 2025  
**Status:** Ready for Implementation  
**Purpose:** Remove preview/onboarding flag system for public launch

---

## 📋 **Overview**

This document outlines the steps to remove the preview flag system and make all features (Login, Support Page, Dashboard, Rewards) accessible to all users.

**Current State:**
- ❌ Only users with `?previewOnboarding=1` can access full features
- ❌ Normal visitors see "Join Waitlist" button
- ❌ Support page redirects to project page without preview flag

**Target State:**
- ✅ All visitors see "Log In" button
- ✅ Support page accessible to everyone
- ✅ Full user flow (registration, dashboard, rewards, tours) available
- ✅ No functionality changes

---

## 🎯 **Two Strategies**

### **STRATEGY 1: Minimal Change (RECOMMENDED FOR LAUNCH)** ✅
- Change **1 line** in **1 file**
- 5 minutes work
- Safe, reversible
- Ready for immediate launch

### **STRATEGY 2: Full Cleanup (OPTIONAL - POST LAUNCH)**
- Remove all preview checks
- Clean up codebase
- 9 files affected
- Better for long-term maintenance

---

## 🚀 **STRATEGY 1: MINIMAL CHANGE (RECOMMENDED)**

### **STEP 1: Update Feature Flag**

**File:** `client/src/lib/feature-flags.ts`

**Find this (Line 10-34):**
```typescript
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
```

**Replace with:**
```typescript
export function isOnboardingPreviewEnabled(): boolean {
  return true; // LAUNCH: Always enabled for all users
}
```

**That's it! You're done!** ✅

---

### **STEP 2: Test Everything**

After deployment, verify:

#### **Navbar:**
- [ ] "Log In" button visible (not "Join Waitlist")
- [ ] After login: Impact Points visible in navbar
- [ ] After login: Dropdown menu with Dashboard/Rewards/Logout
- [ ] Mobile menu: Impact Points card visible
- [ ] Mobile menu: Rewards link visible

#### **Support Page:**
- [ ] `/support/project-slug` accessible without `?previewOnboarding=1`
- [ ] Not redirected to `/project/project-slug`
- [ ] Payment flow works
- [ ] Auth modal appears for non-logged-in users

#### **Projects Page:**
- [ ] Page accessible
- [ ] Tour can be triggered
- [ ] End-of-tour banner appears

#### **Dashboard:**
- [ ] Welcome modal shows for new users (50 IP bonus)
- [ ] Confetti animation for new users
- [ ] Tour starts for first-time users
- [ ] Progress bar for Aspirers (<100 IP)
- [ ] Changemaker status for 100+ IP

#### **Rewards Page:**
- [ ] Page accessible
- [ ] Rewards shown correctly
- [ ] Locked/unlocked states correct

---

### **STEP 3: Commit & Deploy**

```bash
cd Tech
git add client/src/lib/feature-flags.ts
git commit -m "feat: Enable full platform for all users (launch ready)

LAUNCH PREPARATION:
✅ Made isOnboardingPreviewEnabled() always return true
✅ All users now see Login instead of Waitlist
✅ Support page accessible without preview flag
✅ Full dashboard, rewards, tours available to everyone

CHANGE:
- feature-flags.ts: Return true instead of checking URL/sessionStorage
- This is the minimal launch-ready change
- No functionality altered, only visibility

Result: Platform ready for public launch!"

git push origin main
```

---

## 🧹 **STRATEGY 2: FULL CLEANUP (OPTIONAL - POST LAUNCH)**

After successful launch, you can clean up the codebase by removing all `previewEnabled` checks.

### **Why wait until after launch?**
- ✅ Launch with minimal risk
- ✅ Verify everything works first
- ✅ Then clean up code incrementally
- ✅ Can rollback Strategy 1 easily if needed

---

### **Files to Clean Up:**

| File | Changes | Lines Affected | Priority |
|------|---------|----------------|----------|
| `navbar.tsx` | Remove conditionals | ~15 | 🟡 Medium |
| `support-page.tsx` | Remove guards | ~10 | 🟡 Medium |
| `projects-page.tsx` | Remove conditionals | ~8 | 🟡 Medium |
| `dashboard-page.tsx` | Remove conditionals | ~20 | 🟡 Medium |
| `dashboard-v2.tsx` | Remove conditionals | ~15 | 🟡 Medium |
| `rewards-page.tsx` | Remove conditionals | ~10 | 🟡 Medium |
| `rewards-page-v2.tsx` | Remove conditionals | ~10 | 🟡 Medium |
| `auth-modal.tsx` | Remove redirects | ~5 | 🟢 Low |
| `auth-callback.tsx` | Remove checks | ~5 | 🟢 Low |

**Total:** ~100 lines to clean up across 9 files

---

### **Cleanup Changes by File:**

#### **1. NAVBAR** (`client/src/components/layout/navbar.tsx`)

**Remove:**
```typescript
import { isOnboardingPreviewEnabled } from "@/lib/feature-flags";

const previewEnabled = isOnboardingPreviewEnabled();
```

**Change Line 36:**
```typescript
// Before:
enabled: !!user && previewEnabled,

// After:
enabled: !!user,
```

**Change Lines 129-250 (Desktop CTA):**
```typescript
// Before:
{user ? (
  previewEnabled ? (
    <>
      {/* Rank Display + Dropdown */}
    </>
  ) : (
    <button onClick={handleLogout}>Log Out</button>
  )
) : (
  previewEnabled ? (
    <Button onClick={() => openAuthModal("login")}>Log In</Button>
  ) : (
    <Button>Join Waitlist</Button>
  )
)}

// After:
{user ? (
  <>
    {/* Rank Display + Dropdown */}
  </>
) : (
  <Button onClick={() => openAuthModal("login")}>Log In</Button>
)}
```

**Change Lines 312-317:**
```typescript
// Before:
{previewEnabled && (
  <div className="px-3 py-3 mb-3">
    {/* Rank Display */}
  </div>
)}

// After:
<div className="px-3 py-3 mb-3">
  {/* Rank Display */}
</div>
```

**Change Lines 346-352:**
```typescript
// Before:
{previewEnabled && (
  <LanguageLink href="/rewards">
    Rewards
  </LanguageLink>
)}

// After:
<LanguageLink href="/rewards">
  Rewards
</LanguageLink>
```

**Change Lines 368-379:**
```typescript
// Before:
{previewEnabled ? (
  <button onClick={() => openAuthModal("login")}>
    Log In
  </button>
) : (
  <button>Join Waitlist</button>
)}

// After:
<button onClick={() => openAuthModal("login")}>
  Log In
</button>
```

---

#### **2. SUPPORT PAGE** (`client/src/pages/support-page.tsx`)

**Remove:**
```typescript
import { isOnboardingPreviewEnabled } from "@/lib/feature-flags";

const previewEnabled = isOnboardingPreviewEnabled();
```

**Remove Lines 38-42 (Guard):**
```typescript
// DELETE THIS:
useEffect(() => {
  if (!previewEnabled && slug) {
    navigate(`/project/${slug}`);
  }
}, [previewEnabled, slug, navigate]);
```

**Change Line 112:**
```typescript
// Before:
if (!isLoading && project && !user && previewEnabled) {

// After:
if (!isLoading && project && !user) {
```

**Change Line 114:**
```typescript
// Before:
const supportPageUrl = `/support/${slug}${previewEnabled ? '?previewOnboarding=1' : ''}`;

// After:
const supportPageUrl = `/support/${slug}`;
```

**Remove Line 118:**
```typescript
// DELETE from console.log:
previewEnabled,
```

**Change Line 124:**
```typescript
// Before:
}, [isLoading, project, user, previewEnabled, slug]);

// After:
}, [isLoading, project, user, slug]);
```

**Remove Lines 134-140:**
```typescript
// DELETE THIS:
if (!previewEnabled) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <p className="text-gray-500 text-sm">
        This page is not available yet.
      </p>
    </div>
  );
}
```

**Change Lines 253-267 (All URL constructions):**
```typescript
// Before:
const url = `/rewards?unlock=1&maxPoints=100${
  previewEnabled ? "&previewOnboarding=1" : ""
}`;

// After:
const url = `/rewards?unlock=1&maxPoints=100`;

// Before:
const url = `/dashboard${previewEnabled ? "?previewOnboarding=1" : ""}`;

// After:
const url = `/dashboard`;
```

---

#### **3. PROJECTS PAGE** (`client/src/pages/projects-page.tsx`)

**Remove:**
```typescript
import { isOnboardingPreviewEnabled } from "@/lib/feature-flags";

const previewEnabled = isOnboardingPreviewEnabled();
```

**Change Line 103:**
```typescript
// Before:
if (previewEnabled && status === STATUS.FINISHED) {

// After:
if (status === STATUS.FINISHED) {
```

**Change Line 116:**
```typescript
// Before:
if (previewEnabled && user) {

// After:
if (user) {
```

**Change Line 143:**
```typescript
// Before:
}, [previewEnabled, user, projects, isLoading]);

// After:
}, [user, projects, isLoading]);
```

**Change Line 195:**
```typescript
// Before:
showTourTarget={previewEnabled && runTour}

// After:
showTourTarget={runTour}
```

**Change Line 200:**
```typescript
// Before:
{previewEnabled && showEndOfTourBanner && (

// After:
{showEndOfTourBanner && (
```

**Change Line 259:**
```typescript
// Before:
{previewEnabled && (
  <Joyride ... />
)}

// After:
<Joyride ... />
```

---

#### **4. DASHBOARD PAGE** (`client/src/pages/dashboard-page.tsx`)

**Remove:**
```typescript
import { isOnboardingPreviewEnabled } from "@/lib/feature-flags";

const previewEnabled = isOnboardingPreviewEnabled();
```

**Remove ALL instances of:**
- `&& previewEnabled` in conditions
- `if (previewEnabled && ...)` → `if (...)`
- `previewEnabled` from console.logs
- `previewEnabled` from dependency arrays
- `${previewEnabled ? "?previewOnboarding=1" : ""}` → `""`

**Affected Lines:**
- Line 60, 78, 83, 96, 110, 135, 146, 157, 199, 226, 249, 254, 269, 344, 373, 487, 562, 586, 600, 648, 799

**Example Change:**
```typescript
// Before:
if (previewEnabled && newUser === '1') {

// After:
if (newUser === '1') {
```

---

#### **5. AUTH MODAL** (`client/src/components/auth/auth-modal.tsx`)

**Remove:**
```typescript
import { isOnboardingPreviewEnabled } from "@/lib/feature-flags";

const previewEnabled = isOnboardingPreviewEnabled();
```

**Change Lines 196-198:**
```typescript
// Before:
let redirectUrl = `${window.location.origin}/auth/callback`;
if (previewEnabled) {
  redirectUrl += '?previewOnboarding=1';
}

// After:
const redirectUrl = `${window.location.origin}/auth/callback`;
```

**Change Lines 230-232:**
```typescript
// Before:
if (previewEnabled) {
  window.location.href = '/dashboard?previewOnboarding=1';
} else {
  window.location.href = '/waitlist';
}

// After:
window.location.href = '/dashboard';
```

**Change Line 426:**
```typescript
// Before:
if (previewEnabled) {
  return (
    <>
      {/* Inline Auth UI */}
    </>
  );
}

// After:
return (
  <>
    {/* Inline Auth UI */}
  </>
);
```

---

#### **6. SIMILAR CHANGES FOR:**
- `dashboard-v2.tsx` (same as dashboard-page.tsx)
- `rewards-page.tsx` (similar patterns)
- `rewards-page-v2.tsx` (similar patterns)
- `auth-callback.tsx` (remove preview URL handling)

---

## 📊 **Comparison: Strategy 1 vs Strategy 2**

| Aspect | Strategy 1 (Minimal) | Strategy 2 (Full Cleanup) |
|--------|---------------------|---------------------------|
| **Files Changed** | 1 | 9 |
| **Lines Changed** | 1 | ~100 |
| **Time Required** | 5 minutes | 2-3 hours |
| **Risk Level** | 🟢 Very Low | 🟡 Medium |
| **Reversibility** | ✅ Easy | ⚠️ Harder |
| **Code Quality** | ⚠️ Leaves dead code | ✅ Clean |
| **Launch Ready** | ✅ Immediate | ⚠️ Needs testing |

---

## ✅ **RECOMMENDED WORKFLOW**

### **PHASE 1: Launch (NOW)**
1. ✅ Implement **Strategy 1** (1 line change)
2. ✅ Test thoroughly in production
3. ✅ Monitor for 1-2 weeks
4. ✅ Verify everything works

### **PHASE 2: Cleanup (LATER)**
1. ✅ After successful launch
2. ✅ Implement **Strategy 2** incrementally
3. ✅ One file at a time
4. ✅ Test after each file change
5. ✅ Deploy gradually

---

## 🧪 **Testing Checklist**

### **Before Launch:**
- [ ] Reviewed all changes
- [ ] Understood both strategies
- [ ] Chose implementation strategy
- [ ] Backed up current code

### **After Strategy 1 Implementation:**
- [ ] Deployed to production
- [ ] Cleared browser cache
- [ ] Tested in incognito mode

### **User Flows to Test:**

#### **Anonymous Visitor:**
- [ ] Can see "Log In" button (not "Join Waitlist")
- [ ] Can register new account
- [ ] Redirected to dashboard after registration
- [ ] Sees welcome modal with 50 IP bonus

#### **New User (First Login):**
- [ ] Dashboard shows welcome modal
- [ ] Receives 50 Impact Points bonus
- [ ] Confetti animation plays
- [ ] Progress bar shows 0% → 50%
- [ ] Tour starts automatically

#### **Support Flow:**
- [ ] Can access `/support/project-slug` directly
- [ ] Not redirected to project page
- [ ] Auth modal appears if not logged in
- [ ] Payment flow completes successfully
- [ ] Impact Points updated after payment

#### **Navigation:**
- [ ] Projects page accessible
- [ ] Dashboard accessible
- [ ] Rewards page accessible
- [ ] All links work without preview flag

#### **Tours:**
- [ ] Dashboard tour (Step 1-2)
- [ ] Projects tour (Step 3)
- [ ] Tours can be skipped
- [ ] Tours don't restart unexpectedly

---

## 🚨 **Rollback Plan**

If something goes wrong after Strategy 1:

### **Quick Rollback:**
```typescript
// In feature-flags.ts, revert to:
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
        return false;
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
```

Then:
```bash
git add client/src/lib/feature-flags.ts
git commit -m "revert: Rollback preview flag to URL-based mode"
git push origin main
```

---

## 📝 **Post-Launch Monitoring**

### **Metrics to Watch:**

#### **First 24 Hours:**
- [ ] Registration rate
- [ ] Login success rate
- [ ] Support page access rate
- [ ] Payment completion rate
- [ ] Error rate in logs

#### **First Week:**
- [ ] User retention (Day 1, Day 3, Day 7)
- [ ] Tour completion rate
- [ ] Dashboard engagement
- [ ] Rewards page visits
- [ ] Average Impact Points per user

#### **Red Flags:**
- ⚠️ Registration rate drops >50%
- ⚠️ Error rate increases >10%
- ⚠️ Payment failure rate >5%
- ⚠️ Tour abandonment >80%

---

## 🎯 **Success Criteria**

### **Launch is Successful When:**
- ✅ All users see Login button (not Waitlist)
- ✅ Support page accessible without preview flag
- ✅ Registration flow works smoothly
- ✅ Welcome modal + confetti for new users
- ✅ Tours work correctly
- ✅ Payment flow completes
- ✅ No increase in error rates
- ✅ User feedback is positive

---

## 📚 **Related Documentation**

- `LEGAL_CHECKOUT_COMPLIANCE.md` - Checkout legal compliance
- `VERCEL_NODE_VERSION_FIX.md` - Vercel deployment fixes
- `PAYMENT_CLEANUP_MIGRATION.md` - Payment system migration
- `VERCEL_CACHE_FIX.md` - Build cache fixes

---

## 🎉 **Final Checklist**

### **Ready for Launch:**
- [ ] **Strategy 1** implemented
- [ ] Code committed and pushed
- [ ] Vercel deployment successful
- [ ] All tests passed
- [ ] Team notified
- [ ] Monitoring set up
- [ ] Rollback plan ready

### **Post-Launch:**
- [ ] Monitor metrics (24h)
- [ ] Address any issues
- [ ] Collect user feedback
- [ ] Plan **Strategy 2** cleanup
- [ ] Document lessons learned

---

**Launch Status:** 🚀 Ready to Go Live!  
**Recommended Action:** Implement Strategy 1 NOW  
**Cleanup:** Schedule Strategy 2 for 1-2 weeks post-launch

