# 💳 Payment Integration Migration Guide

**Status:** Ready for Implementation  
**Type:** Embedded Stripe Payment Elements  
**Estimated Time:** 1-2 Development Days  
**Risk Level:** Low (Libraries already installed)

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Current vs. New Architecture](#current-vs-new-architecture)
3. [Prerequisites](#prerequisites)
4. [Step-by-Step Implementation](#step-by-step-implementation)
5. [Code Changes Documentation](#code-changes-documentation)
6. [Testing Guide](#testing-guide)
7. [Deployment Checklist](#deployment-checklist)
8. [Rollback Plan](#rollback-plan)
9. [FAQ & Troubleshooting](#faq--troubleshooting)

---

## 🎯 Overview

### What Are We Changing?

**FROM (Current - TEST MODE):**
- Support page directly calls `/api/projects-donate`
- No real payment processing
- Donations created immediately without payment

**TO (New - Real Payments):**
- Support page shows embedded Stripe payment form
- Real payment processing with Stripe
- Donations created only after successful payment

### Why Embedded Instead of Redirect?

✅ **User stays on dopaya.com** - Better conversion rate  
✅ **Libraries already installed** - No new dependencies  
✅ **Fast implementation** - Only ~200 lines of code  
✅ **Better UX** - Project info and impact visible during payment  
✅ **No separate success page needed** - Direct to processing animation

---

## 🏗️ Current vs. New Architecture

### Current Flow (TEST MODE)

```
User on Support Page
    ↓
Selects Amount + Tip
    ↓
Clicks "Continue"
    ↓
Direct API Call: POST /api/projects-donate
    ↓
Donation Created (status: pending)
    ↓
Impact Points Awarded
    ↓
Processing Animation
    ↓
Mini-Journey Modal
```

### New Flow (Real Payments)

```
User on Support Page
    ↓
Selects Amount + Tip
    ↓
Clicks "Continue"
    ↓
API Call: POST /api/create-payment-intent
    ↓
Payment Modal Appears (Embedded Stripe Elements)
    ↓
User Enters Card Details
    ↓
Clicks "Pay $XXX"
    ↓
Stripe Processes Payment
    ↓
[Webhook] POST /api/stripe/webhook
    ↓
Donation Created (status: completed)
    ↓
Impact Points Awarded
    ↓
Processing Animation (on original page)
    ↓
Mini-Journey Modal
```

---

## ✅ Prerequisites

### 1. Environment Variables

Check that these are set in your `.env`:

```bash
# Frontend (required)
VITE_STRIPE_PUBLIC_KEY=pk_test_... # For development
# VITE_STRIPE_PUBLIC_KEY=pk_live_... # For production

# Backend (required)
STRIPE_SECRET_KEY=sk_test_... # For development
# STRIPE_SECRET_KEY=sk_live_... # For production

STRIPE_WEBHOOK_SECRET=whsec_... # From Stripe Dashboard
```

### 2. Verify Installed Packages

Run in `Tech/` directory:

```bash
npm list @stripe/stripe-js @stripe/react-stripe-js
```

Expected output:
```
@stripe/stripe-js@7.8.0
@stripe/react-stripe-js@3.9.0
```

If missing, install:
```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

### 3. Stripe Account Setup

- [ ] Stripe account created and verified
- [ ] Test mode enabled for development
- [ ] Webhook endpoint configured (see Step 6)
- [ ] Payment methods enabled (Card, Apple Pay, Google Pay)

---

## 🚀 Step-by-Step Implementation

### Step 1: Create Embedded Payment Form Component

**File:** `Tech/client/src/components/payment/embedded-payment-form.tsx` (NEW FILE)

```typescript
import { useState } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface PaymentFormProps {
  clientSecret: string;
  totalAmount: number;
  projectTitle: string;
  onSuccess: () => void;
  onCancel: () => void;
}

/**
 * Inner Payment Form Component
 * Has access to Stripe context via Elements wrapper
 */
function PaymentFormInner({ 
  totalAmount, 
  projectTitle,
  onSuccess, 
  onCancel 
}: Omit<PaymentFormProps, 'clientSecret'>) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      console.error('Stripe not loaded');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      console.log('[Payment] Confirming payment...');
      
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.href, // Fallback only
        },
        redirect: 'if_required', // CRITICAL: Stay on page!
      });

      if (error) {
        console.error('[Payment] Error:', error);
        setErrorMessage(error.message || 'Payment failed. Please try again.');
        setIsProcessing(false);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        console.log('[Payment] ✅ Success!', paymentIntent.id);
        onSuccess();
      } else {
        console.error('[Payment] Unexpected status:', paymentIntent?.status);
        setErrorMessage('Payment status unclear. Please contact support.');
        setIsProcessing(false);
      }
    } catch (err: any) {
      console.error('[Payment] Exception:', err);
      setErrorMessage(err.message || 'An unexpected error occurred');
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Project Info */}
      <div className="text-center pb-4 border-b border-gray-200">
        <p className="text-sm text-gray-600">Supporting</p>
        <p className="text-lg font-semibold text-gray-900">{projectTitle}</p>
        <p className="text-2xl font-bold text-[#f2662d] mt-2">
          ${totalAmount.toFixed(2)}
        </p>
      </div>

      {/* Stripe Payment Element */}
      <div className="min-h-[200px]">
        <PaymentElement 
          options={{
            layout: 'tabs',
            paymentMethodOrder: ['card', 'apple_pay', 'google_pay']
          }}
        />
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-800">{errorMessage}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isProcessing}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!stripe || isProcessing}
          className="flex-1 bg-[#FFC107] hover:bg-[#FFD54F] text-gray-900 font-semibold"
          style={{ backgroundColor: "#FFC107" }}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            `Pay $${totalAmount.toFixed(2)}`
          )}
        </Button>
      </div>

      {/* Security Badge */}
      <p className="text-xs text-center text-gray-500">
        🔒 Secured by Stripe • Your payment information is encrypted
      </p>
    </form>
  );
}

/**
 * Outer Component - Wraps form in Stripe Elements Provider
 */
export function EmbeddedPaymentForm({ 
  clientSecret, 
  totalAmount, 
  projectTitle,
  onSuccess, 
  onCancel 
}: PaymentFormProps) {
  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#f2662d',
        borderRadius: '8px',
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <PaymentFormInner 
        totalAmount={totalAmount}
        projectTitle={projectTitle}
        onSuccess={onSuccess} 
        onCancel={onCancel} 
      />
    </Elements>
  );
}
```

**What This Does:**
- Creates embedded payment form using Stripe Elements
- Handles payment confirmation without page redirect
- Shows loading states and error messages
- Styled to match Dopaya branding

---

### Step 2: Add Payment Intent Backend Endpoint

**File:** `Tech/server/stripe-routes.ts`

**Action:** Add new endpoint BEFORE the webhook handler (around line 16, after `setupStripeRoutes` function starts)

```typescript
// ADD THIS NEW ENDPOINT (after line 85, before webhook)

/**
 * Create Payment Intent for embedded checkout
 * Used by support page for real payment processing
 */
app.post("/api/create-payment-intent", async (req: Request, res: Response) => {
  if (!stripe) {
    return res.status(503).json({ error: "Payment processing is currently unavailable" });
  }

  try {
    console.log('[Payment Intent] Request received:', req.body);

    // Extract data from request
    const { 
      amount,           // Support amount (without tip)
      tipAmount,        // Tip amount
      totalAmount,      // Total to charge
      projectId, 
      projectTitle, 
      projectSlug,
      impactPoints,
      userEmail,
      userId 
    } = req.body;

    // Validation
    if (!totalAmount || totalAmount < 5) {
      return res.status(400).json({ error: "Minimum payment amount is $5" });
    }

    if (!projectId || !userId) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    // Create Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // Convert to cents
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true, // Enable all payment methods (Card, Apple Pay, Google Pay)
      },
      metadata: {
        // Store all donation data in metadata for webhook
        userId: userId.toString(),
        projectId: projectId.toString(),
        projectSlug: projectSlug || '',
        projectTitle: projectTitle || '',
        supportAmount: amount.toString(),
        tipAmount: tipAmount.toString(),
        totalAmount: totalAmount.toString(),
        impactPoints: impactPoints.toString(),
        userEmail: userEmail || '',
      },
      description: `Support ${projectTitle} on Dopaya`,
      receipt_email: userEmail || undefined,
    });

    console.log('[Payment Intent] ✅ Created:', paymentIntent.id);

    res.json({ 
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error: any) {
    console.error('[Payment Intent] ❌ Error:', error);
    res.status(500).json({ 
      error: "Failed to create payment intent",
      message: error.message 
    });
  }
});
```

**What This Does:**
- Creates Stripe Payment Intent with all donation metadata
- Returns `clientSecret` to frontend for embedded form
- Validates amounts and required parameters
- Enables all payment methods (Card, Apple Pay, Google Pay)

---

### Step 3: Update Webhook Handler

**File:** `Tech/server/stripe-routes.ts`

**Action:** Modify the webhook handler to handle BOTH `checkout.session.completed` AND `payment_intent.succeeded`

**Find:** Line ~110 in `stripe-routes.ts` where webhook handles `checkout.session.completed`

**Replace:**
```typescript
// OLD CODE (only handles checkout.session.completed)
if (event.type === 'checkout.session.completed') {
  const session = event.data.object as Stripe.Checkout.Session;
  // ... existing donation creation logic ...
}
```

**With:**
```typescript
// Handle both Checkout (old) and Payment Intent (new embedded)
if (event.type === 'checkout.session.completed') {
  // EXISTING CODE - keep for backwards compatibility with old modal
  const session = event.data.object as Stripe.Checkout.Session;
  
  try {
    const { userId, projectId, amount } = session.metadata || {};
    
    if (userId && amount) {
      console.log(`[Stripe Webhook - Checkout] Processing donation: User ${userId}, Amount $${amount}, Project ${projectId || 'General'}`);
      
      // ... keep all existing donation creation logic ...
      // (Lines 113-244 - do NOT change!)
    }
  } catch (error) {
    console.error('[Stripe Webhook - Checkout] Error:', error);
  }
}

// NEW: Handle Payment Intent (embedded payment form)
if (event.type === 'payment_intent.succeeded') {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;
  
  try {
    const { 
      userId, 
      projectId, 
      projectSlug,
      projectTitle,
      supportAmount,
      tipAmount,
      totalAmount,
      impactPoints 
    } = paymentIntent.metadata || {};
    
    if (userId && projectId && supportAmount) {
      console.log(`[Stripe Webhook - Payment Intent] Processing donation: User ${userId}, Amount $${supportAmount}, Project ${projectId}`);
      
      // Convert userId from metadata
      const numericUserId = parseInt(userId, 10);
      if (isNaN(numericUserId)) {
        throw new Error(`Invalid userId: ${userId}`);
      }
      
      // Parse amounts
      const parsedProjectId = parseInt(projectId, 10);
      const parsedSupportAmount = parseFloat(supportAmount);
      const parsedTipAmount = parseFloat(tipAmount || '0');
      const parsedImpactPoints = parseInt(impactPoints || '0', 10);
      
      if (isNaN(parsedProjectId) || isNaN(parsedSupportAmount)) {
        throw new Error('Invalid projectId or amount');
      }
      
      // Get project for impact calculation
      const project = await storage.getProject(parsedProjectId);
      let finalImpactPoints = parsedImpactPoints;
      
      if (!finalImpactPoints && project) {
        finalImpactPoints = Math.floor(parsedSupportAmount * (project.impactPointsMultiplier || 10));
      }
      
      // Create donation (this also creates transaction and awards points)
      const donation = await storage.createDonation({
        userId: numericUserId,
        projectId: parsedProjectId,
        amount: Math.round(parsedSupportAmount), // Integer for database
        impactPoints: finalImpactPoints,
        status: 'completed' // Payment succeeded
      });
      
      console.log(`[Stripe Webhook - Payment Intent] ✅ Donation created: ID ${donation.id}, +${finalImpactPoints} Impact Points`);
      
      // Note: Transaction is automatically created by createDonation() method
      // Note: Impact Points are automatically awarded by createDonation() method
    } else {
      console.warn('[Stripe Webhook - Payment Intent] Missing required metadata:', paymentIntent.metadata);
    }
  } catch (error) {
    console.error('[Stripe Webhook - Payment Intent] Error processing payment:', error);
    // Don't throw - return success to Stripe to prevent retries
  }
}
```

**What This Does:**
- Adds support for `payment_intent.succeeded` events (from embedded form)
- Keeps existing `checkout.session.completed` for backwards compatibility
- Creates donation with all metadata from Payment Intent
- Awards Impact Points automatically via `createDonation()`

---

### Step 4: Update Support Page - Add State & Imports

**File:** `Tech/client/src/pages/support-page.tsx`

**Action 1:** Add import at top (around line 17)

```typescript
// EXISTING IMPORTS
import { SupportMiniJourney } from "@/components/donation/support-mini-journey";
import { AuthModal } from "@/components/auth/auth-modal";
import { apiRequest, queryClient } from "@/lib/queryClient";

// ADD THIS NEW IMPORT
import { EmbeddedPaymentForm } from "@/components/payment/embedded-payment-form";
```

**Action 2:** Add state variables (around line 82, after existing state declarations)

```typescript
// EXISTING STATE
const [showMiniJourney, setShowMiniJourney] = useState<boolean>(false);
const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

// ADD THESE NEW STATE VARIABLES
const [clientSecret, setClientSecret] = useState<string | null>(null);
const [paymentProcessing, setPaymentProcessing] = useState<boolean>(false);
```

**What This Does:**
- Imports the new payment form component
- Adds state to track payment modal visibility and processing status

---

### Step 5: Update Support Page - Modify Button Handler

**File:** `Tech/client/src/pages/support-page.tsx`

**Action:** Replace the button onClick handler (Lines 652-690)

**OLD CODE:**
```typescript
onClick={async () => {
  if (!hasSelectedAmount || currentSupportAmount <= 0 || !meetsMinimumAmount) return;
  if (!project?.id || !user) {
    alert("You must be logged in to donate.");
    return;
  }

  try {
    console.log('[TEST MODE] Creating donation via support page');

    // Use direct API endpoint (bypasses Stripe, creates donation + transaction automatically)
    const response = await apiRequest("POST", `/api/projects-donate`, {
      projectId: project.id,
      amount: currentSupportAmount,
      slug: project.slug
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(errorData.message || `Server error: ${response.status}`);
    }

    const donation = await response.json();
    console.log('[TEST MODE] ✅ Donation created:', donation);

    // Invalidate impact query to update navbar immediately
    queryClient.invalidateQueries({ queryKey: ["/api/user/impact"] });
    console.log('[TEST MODE] ✅ Invalidated impact query - navbar will update');

    // Show processing animation after successful donation
    setShowProcessingImpact(true);
  } catch (error: any) {
    console.error('[TEST MODE] Donation failed:', error);
    alert(`Donation failed: ${error.message || 'Unknown error'}`);
    return;
  }
}}
```

**NEW CODE:**
```typescript
onClick={async () => {
  if (!hasSelectedAmount || currentSupportAmount <= 0 || !meetsMinimumAmount) return;
  if (!project?.id || !user) {
    alert("You must be logged in to donate.");
    return;
  }

  try {
    console.log('[Payment] Creating payment intent...');
    setPaymentProcessing(true);

    // Create Payment Intent on backend
    const response = await apiRequest("POST", `/api/create-payment-intent`, {
      projectId: project.id,
      projectTitle: project.title,
      projectSlug: project.slug,
      amount: currentSupportAmount,
      tipAmount: tipAmount,
      totalAmount: totalAmount,
      impactPoints: impactPoints,
      userEmail: user.email,
      userId: user.id,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(errorData.message || `Server error: ${response.status}`);
    }

    const { clientSecret } = await response.json();
    console.log('[Payment] ✅ Payment intent created');

    // Show payment modal
    setClientSecret(clientSecret);
    setPaymentProcessing(false);
  } catch (error: any) {
    console.error('[Payment] Failed to create payment intent:', error);
    alert(`Failed to initialize payment: ${error.message || 'Unknown error'}`);
    setPaymentProcessing(false);
  }
}}
```

**What This Does:**
- Changes from direct donation creation to payment intent creation
- Shows payment modal when clientSecret is received
- Passes all donation data to backend for webhook processing

---

### Step 6: Update Support Page - Add Payment Modal

**File:** `Tech/client/src/pages/support-page.tsx`

**Action:** Add payment modal BEFORE the AuthModal (around line 703, before `{/* Auth Modal */}`)

```typescript
      {/* Auth Modal - shown when user is not authenticated */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => {
          if (!user) {
            return;
          }
          setShowAuthModal(false);
        }}
        defaultTab="register"
      />

      {/* ADD THIS NEW PAYMENT MODAL */}
      {clientSecret && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8 animate-in fade-in zoom-in duration-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Complete Payment
            </h2>
            
            <EmbeddedPaymentForm
              clientSecret={clientSecret}
              totalAmount={totalAmount}
              projectTitle={project.title}
              onSuccess={() => {
                console.log('[Payment] ✅ Payment successful');
                
                // Close payment modal
                setClientSecret(null);
                
                // Invalidate queries to update navbar
                queryClient.invalidateQueries({ queryKey: ["/api/user/impact"] });
                
                // Show processing animation
                setShowProcessingImpact(true);
              }}
              onCancel={() => {
                console.log('[Payment] ❌ Payment cancelled');
                setClientSecret(null);
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
```

**What This Does:**
- Shows payment modal when `clientSecret` is set
- Centers modal with backdrop blur
- Handles success: closes modal, shows processing animation
- Handles cancel: closes modal, user can try again

---

### Step 7: Optional - Remove Payment Method Section

**File:** `Tech/client/src/pages/support-page.tsx`

**Action:** Comment out or remove the Payment Method section (Lines 592-605)

**BEFORE:**
```typescript
{/* Payment method */}
{hasSelectedAmount && currentSupportAmount > 0 && meetsMinimumAmount && (
  <div className="space-y-3 pt-10">
    <h3 className="text-lg font-semibold text-gray-900">{t("support.paymentMethod")}</h3>
    <div className="flex items-center space-x-3 p-4 border-2 border-gray-300 rounded-lg bg-white">
      <div className="h-4 w-4 rounded-full border-2 border-[#f2662d] bg-[#f2662d] flex items-center justify-center">
        <div className="h-2 w-2 rounded-full bg-white" />
      </div>
      <span className="text-sm font-medium text-gray-900">
        {t("support.creditDebitCard")}
      </span>
    </div>
  </div>
)}
```

**AFTER (Option A - Remove completely):**
```typescript
{/* Payment Method section removed - shown in payment modal */}
```

**AFTER (Option B - Keep with modified text):**
```typescript
{/* Payment method */}
{hasSelectedAmount && currentSupportAmount > 0 && meetsMinimumAmount && (
  <div className="space-y-3 pt-10">
    <h3 className="text-lg font-semibold text-gray-900">{t("support.paymentMethod")}</h3>
    <div className="flex items-center space-x-3 p-4 border-2 border-gray-300 rounded-lg bg-white">
      <span className="text-sm text-gray-600">
        💳 Card, Apple Pay, Google Pay (shown on next step)
      </span>
    </div>
  </div>
)}
```

**Recommendation:** Option A (remove) to reduce redundancy and save space.

---

## 🧪 Testing Guide

### Test 1: Local Development Setup

1. **Start Development Server:**
   ```bash
   cd Tech
   npm run dev
   ```

2. **Verify Environment Variables:**
   - Open browser console
   - Check for Stripe initialization logs
   - Should NOT see errors about missing `VITE_STRIPE_PUBLIC_KEY`

3. **Expected Console Output:**
   ```
   [Vite] connected
   Stripe.js loaded successfully
   ```

### Test 2: Payment Intent Creation

1. Navigate to: `http://localhost:8080/support/bonji?previewOnboarding=1`
2. Login if needed
3. Select amount: $50
4. Adjust tip: 10%
5. Click "Continue"

**Expected Behavior:**
- Browser console shows: `[Payment] Creating payment intent...`
- Backend console shows: `[Payment Intent] Request received:...`
- Backend console shows: `[Payment Intent] ✅ Created: pi_xxx`
- Payment modal appears with Stripe form

**If It Fails:**
- Check browser console for errors
- Check backend console for errors
- Verify `STRIPE_SECRET_KEY` is set
- Verify user is authenticated

### Test 3: Successful Payment (Test Mode)

**Use Stripe Test Card:**
```
Card Number: 4242 4242 4242 4242
Expiry: Any future date (e.g., 12/25)
CVC: Any 3 digits (e.g., 123)
ZIP: Any 5 digits (e.g., 12345)
```

**Steps:**
1. Payment modal is open
2. Enter test card details above
3. Click "Pay $55.00"

**Expected Behavior:**
- Button shows: "Processing..."
- After 1-2 seconds: Modal closes
- Processing animation appears
- Console shows: `[Payment] ✅ Payment successful`
- Backend webhook receives event
- Donation created in database
- Impact Points awarded

**Verify in Database:**
```sql
SELECT * FROM donations ORDER BY created_at DESC LIMIT 1;
-- Should show: status = 'completed', amount = 50, impactPoints = 500

SELECT * FROM user_transactions ORDER BY created_at DESC LIMIT 1;
-- Should show: transaction_type = 'donation', points_change = 500
```

### Test 4: Failed Payment

**Use Stripe Test Card (Card Declined):**
```
Card Number: 4000 0000 0000 0002
Expiry: Any future date
CVC: Any 3 digits
```

**Expected Behavior:**
- Button shows: "Processing..."
- Error message appears: "Your card was declined"
- Modal stays open
- User can try again with different card

### Test 5: Cancel Payment

**Steps:**
1. Payment modal is open
2. Click "Cancel" button

**Expected Behavior:**
- Modal closes immediately
- User returns to support page
- All form data is preserved (amount, tip)
- User can click "Continue" again

### Test 6: Mobile Testing

**Test on:**
- iPhone (Safari)
- Android (Chrome)
- Mobile viewport in Chrome DevTools

**Verify:**
- [ ] Payment modal is responsive
- [ ] Stripe form fits properly
- [ ] Apple Pay button appears (on iOS)
- [ ] Google Pay button appears (on Android)
- [ ] Buttons are easy to tap
- [ ] No horizontal scrolling

### Test 7: Webhook Testing (Local)

**Setup Stripe CLI:**
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:8080/api/stripe/webhook
```

**This will output:**
```
> Ready! Your webhook signing secret is whsec_xxxx
```

**Update `.env` with this webhook secret:**
```bash
STRIPE_WEBHOOK_SECRET=whsec_xxxx
```

**Test webhook:**
```bash
# Trigger test payment_intent.succeeded event
stripe trigger payment_intent.succeeded
```

**Expected Backend Console Output:**
```
[Stripe Webhook - Payment Intent] Processing donation: User X, Amount $10, Project Y
[Stripe Webhook - Payment Intent] ✅ Donation created: ID 123, +100 Impact Points
```

---

## 📦 Deployment Checklist

### Pre-Deployment

- [ ] All code changes tested locally
- [ ] Test payments working with test cards
- [ ] Webhook tested with Stripe CLI
- [ ] Environment variables documented
- [ ] Database migrations (if any) applied
- [ ] Code reviewed and approved

### Production Stripe Setup

1. **Switch to Live Mode in Stripe Dashboard**
   ```
   https://dashboard.stripe.com → Toggle "Test Mode" OFF
   ```

2. **Get Production Keys:**
   - Publishable Key: `pk_live_...`
   - Secret Key: `sk_live_...`

3. **Configure Production Webhook:**
   - URL: `https://dopaya.com/api/stripe/webhook`
   - Events to send:
     - `payment_intent.succeeded`
     - `checkout.session.completed` (for backwards compatibility)
   - Copy webhook signing secret: `whsec_...`

4. **Update Production Environment Variables:**
   ```bash
   # In Vercel Dashboard or .env.production
   VITE_STRIPE_PUBLIC_KEY=pk_live_...
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

### Deployment Steps

1. **Commit changes:**
   ```bash
   git add .
   git commit -m "feat: implement embedded Stripe payment integration"
   git push origin main
   ```

2. **Deploy to Vercel:**
   - Automatic deployment on push
   - Or manual: `vercel --prod`

3. **Verify environment variables in Vercel:**
   - Go to: Project Settings → Environment Variables
   - Verify all 3 Stripe variables are set
   - Verify they are for "Production" environment

4. **Test production deployment:**
   - Navigate to: `https://dopaya.com/support/bonji?previewOnboarding=1`
   - Complete a REAL payment with real card
   - Verify donation appears in database
   - Verify you receive Stripe email confirmation

### Post-Deployment Monitoring

- [ ] Monitor Stripe Dashboard for payments
- [ ] Check webhook delivery status (should be 100% success)
- [ ] Monitor backend logs for errors
- [ ] Check Sentry/error tracking (if configured)
- [ ] Verify first 5 real donations complete successfully

---

## 🔄 Rollback Plan

### If You Need to Revert Quickly

**Option 1: Instant Rollback (No Code Changes)**

Disable the payment modal by setting environment variable:

```bash
# Add to .env
VITE_DISABLE_PAYMENT_MODAL=true
```

Then update `support-page.tsx` button handler (one line):

```typescript
onClick={async () => {
  // Add this check at the top
  if (import.meta.env.VITE_DISABLE_PAYMENT_MODAL) {
    // Fall back to old TEST MODE behavior
    const response = await apiRequest("POST", `/api/projects-donate`, {
      projectId: project.id,
      amount: currentSupportAmount,
      slug: project.slug
    });
    // ... rest of old code ...
    return;
  }
  
  // ... new payment code ...
}}
```

**Option 2: Git Revert**

```bash
# Revert to before payment changes
git log --oneline  # Find commit before payment migration
git revert <commit-hash>
git push origin main
```

**Option 3: Keep Both Flows (Feature Flag)**

Add a feature flag to switch between TEST MODE and REAL PAYMENTS:

```typescript
// In support-page.tsx
const USE_REAL_PAYMENTS = true; // Set to false to disable

onClick={async () => {
  if (USE_REAL_PAYMENTS) {
    // New payment intent flow
  } else {
    // Old direct donation flow
  }
}}
```

### What to Monitor Post-Deployment

1. **Payment Success Rate:**
   - Target: >95% success rate
   - Check: Stripe Dashboard → Payments

2. **Webhook Delivery:**
   - Target: 100% delivery rate
   - Check: Stripe Dashboard → Developers → Webhooks

3. **Error Rates:**
   - Check backend logs for errors
   - Check browser console for client errors

4. **User Complaints:**
   - Monitor support channels
   - Look for: "payment not working", "can't donate"

### Emergency Contacts

- **Stripe Support:** https://support.stripe.com
- **Stripe Status:** https://status.stripe.com
- **Your Stripe Account:** https://dashboard.stripe.com

---

## ❓ FAQ & Troubleshooting

### Q: Payment modal doesn't appear

**Check:**
1. Browser console for errors
2. Is `VITE_STRIPE_PUBLIC_KEY` set?
3. Is `clientSecret` being set in state?
4. Backend returning `clientSecret` in response?

**Debug:**
```javascript
// Add console logs in support-page.tsx
console.log('Payment Intent Response:', response);
console.log('Client Secret:', clientSecret);
```

### Q: "Stripe is not loaded" error

**Cause:** `VITE_STRIPE_PUBLIC_KEY` is missing or incorrect

**Fix:**
```bash
# Check .env file
echo $VITE_STRIPE_PUBLIC_KEY

# Should start with pk_test_ or pk_live_
# If missing, add to .env:
VITE_STRIPE_PUBLIC_KEY=pk_test_...

# Restart dev server
npm run dev
```

### Q: Payment succeeds but donation not created

**Check:**
1. Webhook is receiving events?
   - Stripe Dashboard → Developers → Webhooks → Click webhook → View logs
2. Webhook signature verification passing?
   - Check backend logs for signature errors
3. Is `STRIPE_WEBHOOK_SECRET` set correctly?

**Fix:**
```bash
# Test webhook locally
stripe listen --forward-to localhost:8080/api/stripe/webhook

# Trigger test event
stripe trigger payment_intent.succeeded

# Check backend console for logs
```

### Q: Apple Pay / Google Pay not showing

**Apple Pay Requirements:**
- Must be on HTTPS (or localhost)
- Must be viewed in Safari on iOS/macOS
- User must have cards set up in Apple Wallet

**Google Pay Requirements:**
- Must be on HTTPS (or localhost)
- Must be viewed in Chrome/Edge
- User must be logged into Google account with saved payment methods

**Note:** Test cards don't work with Apple Pay / Google Pay. Use real cards or test in production.

### Q: "Payment processing is currently unavailable" error

**Cause:** `STRIPE_SECRET_KEY` is not set on backend

**Fix:**
```bash
# Check backend environment
echo $STRIPE_SECRET_KEY

# Should start with sk_test_ or sk_live_
# If missing, add to .env
STRIPE_SECRET_KEY=sk_test_...

# Restart server
npm run dev
```

### Q: Duplicate donations being created

**Cause:** Webhook being called multiple times or payment_intent.succeeded firing multiple times

**Fix:** Add idempotency check in webhook handler:

```typescript
// In stripe-routes.ts webhook handler
const existingDonation = await storage.getDonationByStripePaymentIntent(paymentIntent.id);
if (existingDonation) {
  console.log('[Webhook] Donation already exists, skipping');
  return res.json({ received: true });
}
```

### Q: Old TEST MODE still running

**Check:** Did you update the button onClick handler in `support-page.tsx`?

**Fix:** Verify line 652-690 in `support-page.tsx` calls `/api/create-payment-intent` not `/api/projects-donate`

---

## 📊 Summary of Changes

### New Files Created (1)
- `Tech/client/src/components/payment/embedded-payment-form.tsx` (~150 lines)

### Modified Files (2)
- `Tech/server/stripe-routes.ts` (+120 lines)
  - New endpoint: `/api/create-payment-intent`
  - Updated webhook: Handle `payment_intent.succeeded`
  
- `Tech/client/src/pages/support-page.tsx` (+50 lines, -15 lines)
  - New imports and state
  - Updated button handler
  - New payment modal
  - Removed payment method section

### Total Code Changes
- **Lines Added:** ~270
- **Lines Removed:** ~15
- **Net Change:** ~255 lines
- **Files Changed:** 3
- **New Dependencies:** 0 (already installed!)

---

## ✅ Implementation Status Tracker

Copy this to track your progress:

```markdown
### Implementation Checklist

#### Setup
- [ ] Verify Stripe libraries installed
- [ ] Check environment variables set
- [ ] Stripe account in test mode

#### Code Changes
- [ ] Step 1: Create `embedded-payment-form.tsx`
- [ ] Step 2: Add `/api/create-payment-intent` endpoint
- [ ] Step 3: Update webhook handler
- [ ] Step 4: Add imports & state to support page
- [ ] Step 5: Update button onClick handler
- [ ] Step 6: Add payment modal to support page
- [ ] Step 7: Remove payment method section (optional)

#### Testing
- [ ] Test 1: Dev server starts without errors
- [ ] Test 2: Payment intent creation works
- [ ] Test 3: Successful payment with test card
- [ ] Test 4: Failed payment shows error
- [ ] Test 5: Cancel payment works
- [ ] Test 6: Mobile responsive
- [ ] Test 7: Webhook receives events

#### Deployment
- [ ] Code committed and pushed
- [ ] Production environment variables set
- [ ] Webhook configured in Stripe Dashboard
- [ ] Deployed to production
- [ ] First test payment successful

#### Monitoring
- [ ] Payments showing in Stripe Dashboard
- [ ] Webhooks delivering 100%
- [ ] No errors in logs
- [ ] Users successfully donating
```

---

## 📚 Additional Resources

- **Stripe Payment Element Docs:** https://stripe.com/docs/payments/payment-element
- **Stripe Test Cards:** https://stripe.com/docs/testing
- **Stripe Webhook Guide:** https://stripe.com/docs/webhooks
- **React Stripe.js Docs:** https://stripe.com/docs/stripe-js/react

---

**Last Updated:** December 2025  
**Version:** 1.0  
**Author:** Senior Developer Team  
**Status:** ✅ Ready for Implementation

