# Testing URL Parameters Guide

## Overview
This guide explains how to test the onboarding flow offline using URL parameters. No need to register new users repeatedly!

## Prerequisites
- Preview mode must be enabled: Add `?previewOnboarding=1` to any URL
- You must be logged in (any user account works)

## Available Test Parameters

### 1. Clear All State
**URL:** `?previewOnboarding=1&clearState=1`

Clears all sessionStorage flags for fresh testing:
- Removes `welcomeModalShown`
- Removes `welcomeModalClosed`
- Removes `onboardingTourCompleted`
- Removes `onboardingTourDismissed`
- Removes `onboardingTourStepIndex`
- Removes `signupFirstFlow`
- Removes `checkNewUser`

**Use this first** to reset everything before testing.

### 2. Show Welcome Modal Step 1
**URL:** `?previewOnboarding=1&modal1=1`

Shows the first step of the welcome modal:
- "Welcome to Dopaya!"
- Shows 50 Impact Points starter bonus
- Progress bar at 50%
- "Next →" button

### 3. Show Welcome Modal Step 2
**URL:** `?previewOnboarding=1&modal2=1`

Shows the second step of the welcome modal:
- "Ready to make your first impact?"
- Three action tiles:
  - Support a project
  - Discover inspiring social enterprises
  - View your dashboard

### 4. Start Tooltip Tour
**URL:** `?previewOnboarding=1&tour=1`

Starts the tooltip tour directly (assumes welcome modal is closed):
- Step 1: "You're halfway to your first reward..."
- Step 2: "Click here to choose a project..."

**Note:** This will only work if the welcome modal is not open. Use `?clearState=1` first if needed.

### 5. Trigger New User Flow
**URL:** `?previewOnboarding=1&newUser=1`

Triggers the complete new user flow:
- Sets `signupFirstFlow` flag
- Dashboard will check impact data
- If user has 50 IP and 0 donations, shows welcome modal automatically

### 6. Start Tour (Legacy)
**URL:** `?previewOnboarding=1&startTour=1`

Legacy parameter for starting the tour. Use `?tour=1` instead for cleaner testing.

## Testing Workflows

### Test Complete Flow
```
1. http://localhost:3001/dashboard?previewOnboarding=1&clearState=1
2. http://localhost:3001/dashboard?previewOnboarding=1&newUser=1
   → Should show welcome modal step 1
   → Click "Next" to see step 2
   → Close modal
   → Tooltip tour should start automatically
```

### Test Welcome Modal Only
```
1. http://localhost:3001/dashboard?previewOnboarding=1&clearState=1
2. http://localhost:3001/dashboard?previewOnboarding=1&modal1=1
   → See step 1
3. http://localhost:3001/dashboard?previewOnboarding=1&modal2=1
   → See step 2
```

### Test Tooltip Tour Only
```
1. http://localhost:3001/dashboard?previewOnboarding=1&clearState=1
2. http://localhost:3001/dashboard?previewOnboarding=1&tour=1
   → Tour starts immediately
```

### Test Individual Steps
```
# Step 1 of Welcome Modal
http://localhost:3001/dashboard?previewOnboarding=1&clearState=1&modal1=1

# Step 2 of Welcome Modal
http://localhost:3001/dashboard?previewOnboarding=1&clearState=1&modal2=1

# Tooltip Tour
http://localhost:3001/dashboard?previewOnboarding=1&clearState=1&tour=1
```

## URL Parameter Combinations

You can combine parameters, but some combinations don't make sense:

✅ **Valid Combinations:**
- `?previewOnboarding=1&clearState=1` - Reset everything
- `?previewOnboarding=1&modal1=1` - Show modal step 1
- `?previewOnboarding=1&modal2=1` - Show modal step 2
- `?previewOnboarding=1&tour=1` - Start tour
- `?previewOnboarding=1&newUser=1` - Trigger new user flow

❌ **Invalid Combinations:**
- `?modal1=1&modal2=1` - Only one modal step at a time
- `?modal1=1&tour=1` - Tour won't start if modal is open

## Tips

1. **Always start with `clearState=1`** to ensure clean testing
2. **Test one thing at a time** - don't combine conflicting parameters
3. **Check browser console** for debug logs showing which parameters were detected
4. **URLs auto-clean** - parameters are removed after being processed (except `previewOnboarding=1`)
5. **SessionStorage persists** - use `clearState=1` to reset between tests

## Troubleshooting

### Modal not showing?
- Check that `previewOnboarding=1` is in the URL
- Check browser console for errors
- Try `clearState=1` first to reset flags

### Tour not starting?
- Make sure welcome modal is closed
- Check that `welcomeModalClosed` flag is set in sessionStorage
- Try `clearState=1` then `tour=1`

### State not clearing?
- Manually clear sessionStorage in browser DevTools
- Or use `clearState=1` parameter

## Production Notes

⚠️ **These parameters only work when `previewOnboarding=1` is enabled.**

In production (without preview mode), these parameters are ignored for security.


