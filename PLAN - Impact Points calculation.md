IMPORTANT: Execute this plan step-by-step. AFTER EACH STEP, RUN THE TEST CHECKLIST BELOW AND REPORT RESULTS. Do NOT proceed to the next step until I (Patrick) confirm success. ALWAYS double-check and use the correct Supabase keys and environment variables (SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE) before running or deploying any code.

Minimal Impact Points Transaction Sync
Goal
Simple implementation: every point change creates a transaction record and updates the cached balance. No complex architecture, no phases.

Principle
One helper function, three call sites. That's it.

Current State
✅ user_transactions table exists in DB
✅ users.impactPoints column exists (cached balance)
✅ donations table exists
✅ redemptions table exists
✅ Database trigger handle_new_user creates users with 50 IP
❌ No transaction records created
❌ Balance not updated on donations/redemptions
Implementation (4 Simple Steps)
Step 1: Add Simple Helper Function
File: Tech/server/supabase-storage-new.ts

Add one method applyPointsChange():

async applyPointsChange(
  userId: number,
  pointsChange: number,
  transactionData: {
    transactionType: 'welcome_bonus' | 'donation' | 'redemption';
    donationId?: number;
    projectId?: number;
    supportAmount?: number;
    redemptionId?: number;
    rewardId?: number;
    description?: string;
  }
): Promise<void>
What it does:

Get current users.impactPoints
Calculate new balance: currentBalance + pointsChange
Insert transaction record into user_transactions (with points_balance_after)
Update users.impactPoints to new balance
Rollback: Remove the method.

---

Step 2: Add Welcome Bonus Transaction
File: Tech/client/src/pages/auth-callback.tsx OR SQL trigger update

Option A (Application code - simpler):

After user is authenticated and profile exists, check if user has 50 IP and no transactions. If so, call API endpoint to create welcome bonus transaction.

Option B (Database trigger):

Modify handle_new_user trigger to insert transaction record after setting impactPoints = 50.

Simplest: Add API endpoint /api/user/welcome-bonus that calls applyPointsChange(), call it from auth-callback.tsx when detecting new user.

Rollback: Remove the call or revert trigger.

---

Step 3: Update createDonation()
File: Tech/server/supabase-storage-new.ts

After creating donation record (line ~537), add:

// Create transaction and update balance
await this.applyPointsChange(
  donation.userId,
  donation.impactPoints, // positive
  {
    transactionType: 'donation',
    donationId: data.id,
    projectId: donation.projectId,
    supportAmount: donation.amount,
    description: `Support: ${donation.amount} for project ${donation.projectId}`
  }
);
Rollback: Remove the call, keep existing donation creation.

---

Step 4: Update createRedemption()
File: Tech/server/supabase-storage-new.ts

After creating redemption record (line ~677), add:

// Create transaction and update balance
await this.applyPointsChange(
  redemption.userId,
  -redemption.pointsSpent, // negative
  {
    transactionType: 'redemption',
    redemptionId: data.id,
    rewardId: redemption.rewardId,
    description: `Redeemed reward ${redemption.rewardId}`
  }
);
Rollback: Remove the call, keep existing redemption creation.

---

File Changes Summary
Modified Files (3-4 total):

Tech/server/supabase-storage-new.ts - Add helper + 2 call sites
Tech/client/src/pages/auth-callback.tsx - Add welcome bonus transaction (or SQL trigger update)
Tech/server/routes.ts - Add welcome bonus endpoint (if doing Option A)
SQL script (optional) - Update trigger if doing Option B
No Changes Needed:

Schema files (use existing DB structure)
Other routes (they already call storage methods)
Frontend (reads from users.impactPoints as before)
---

Testing Checklist
After each step:

[ ] Step 1: Helper function compiles
[ ] Step 2: New user gets welcome bonus transaction
[ ] Step 3: Donation creates transaction + updates balance
[ ] Step 4: Redemption creates transaction + updates balance
Final test:

[ ] Create user → verify 50 IP + transaction
[ ] Support $10 → verify +100 IP + transaction (if multiplier = 10)
[ ] Redeem 50 IP → verify -50 IP + transaction
[ ] Check users.impactPoints matches sum of transactions
---

Rollback
If anything breaks:

Remove applyPointsChange() calls from createDonation() and createRedemption()
Remove welcome bonus transaction code
System works as before (just without transaction tracking)
