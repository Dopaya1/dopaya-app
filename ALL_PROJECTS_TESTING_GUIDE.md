# 🧪 All Projects Universal Fund - Testing Guide

**Date:** December 18, 2025  
**Purpose:** Step-by-step testing instructions to validate the implementation  
**Critical:** Must verify that regular projects are NOT affected

---

## 🎯 **Testing Objectives**

1. ✅ Universal fund project appears and works correctly
2. ✅ Regular projects are COMPLETELY UNAFFECTED
3. ✅ Payment split logic works correctly
4. ✅ Impact points awarded correctly
5. ✅ User experience is smooth and clear

---

## 📋 **Pre-Testing Setup**

### **Step 1: Apply Database Migration**

Run the SQL migration to add the column and create the special project:

```bash
# Connect to your database (Supabase SQL Editor or psql)
# Copy and execute the contents of: ALL_PROJECTS_MIGRATION.sql
```

**Verify:**
```sql
-- Check if column exists
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'projects' AND column_name = 'is_universal_fund';

-- Check if special project was created
SELECT id, slug, title, is_universal_fund, featured, status 
FROM projects 
WHERE slug = 'all-projects';

-- Count active projects (for split calculation)
SELECT COUNT(*) as active_project_count 
FROM projects 
WHERE status = 'active' AND is_universal_fund = false;
```

### **Step 2: Upload Hero Image**

1. Create or download a hero image (see `ALL_PROJECTS_IMAGE_GUIDE.md`)
2. Upload to `/Tech/client/public/assets/all-projects-hero.jpg`
3. OR update database with different image path

### **Step 3: Deploy Code Changes**

```bash
cd Tech
git add .
git status  # Review changes
git commit -m "feat: Add Universal Fund for all projects support"
git push origin main
```

---

## 🧪 **Test Suite**

### **TEST 1: Visual Appearance (Projects Page)**

**Objective:** Verify the universal fund card appears first and is visually distinct

**Steps:**
1. Navigate to `/projects` (or `/de/projects` for German)
2. Observe the project grid

**Expected Results:**
- [ ] "Support All Projects" card appears as the FIRST card (top-left)
- [ ] Card has a gold/yellow border (ring-2 ring-yellow-400)
- [ ] Card shows "⭐ SPLIT ACROSS ALL" badge in top-right corner
- [ ] Badge has gradient yellow-to-orange background
- [ ] Card image loads correctly (mosaic or placeholder)
- [ ] Card title: "Support All Projects"
- [ ] Card category badge: "Universal Impact"

**Screenshot:** Take screenshot for documentation

---

### **TEST 2: Regular Projects Unaffected**

**Objective:** CRITICAL - Ensure regular projects display and function normally

**Steps:**
1. On `/projects`, scroll through all project cards
2. Click on any regular project (NOT the "All Projects" one)
3. Navigate to its project detail page
4. Click "Support" button

**Expected Results:**
- [ ] All regular projects display normally (no gold border)
- [ ] No "SPLIT ACROSS ALL" badge on regular projects
- [ ] Regular project detail pages load correctly
- [ ] Support flow for regular projects works as before
- [ ] No errors in console

**Critical:** If ANY regular project is affected, STOP and rollback!

---

### **TEST 3: Universal Fund Project Detail Page**

**Objective:** Verify the detail page for "All Projects" works

**Steps:**
1. Click on "Support All Projects" card from projects page
2. Should navigate to `/project/all-projects`

**Expected Results:**
- [ ] Page loads without errors
- [ ] Shows "Universal Impact Fund" badge
- [ ] Description explains the split concept
- [ ] "Support" button is visible
- [ ] Image displays correctly

---

### **TEST 4: Universal Fund Support Page (UI)**

**Objective:** Verify the support page shows split breakdown

**Steps:**
1. From "All Projects" detail page, click "Support"
2. Should navigate to `/support/all-projects`
3. Select an amount (e.g., $50)

**Expected Results:**
- [ ] Page loads successfully
- [ ] Title: "Support All Projects"
- [ ] "⭐ Universal Impact Fund" badge visible under title
- [ ] Subtitle text: "Your donation will be split equally across all active projects"
- [ ] After selecting amount, split breakdown box appears
- [ ] Split breakdown shows:
  - "🌍 Your donation will be split across all projects"
  - "$50 will be divided equally"
  - "$X to each of N active projects" (correct calculation)
  - Gradient yellow-to-orange background
- [ ] Impact points calculator shows correctly
- [ ] No errors in browser console

**Test Different Amounts:**
- [ ] $10 → split shown correctly
- [ ] $50 → split shown correctly
- [ ] $200 → split shown correctly
- [ ] Custom amount $75 → split shown correctly

---

### **TEST 5: Payment Flow (Test Mode)**

**Objective:** Complete a payment to verify split logic

**Steps:**
1. On `/support/all-projects`, select $10 amount
2. Note the number of active projects shown in split (e.g., "5 active projects")
3. Accept terms and click "Complete Payment"
4. Fill in test card: `4242 4242 4242 4242`, any future date, any CVV
5. Complete payment

**Expected Results:**
- [ ] Payment processes successfully
- [ ] Processing animation shows
- [ ] Mini-journey overlay appears (or redirects to rewards)
- [ ] NO ERRORS in browser console
- [ ] NO ERRORS in server logs

---

### **TEST 6: Database Verification (Backend Split)**

**Objective:** Verify split donations were created correctly in database

**Steps:**
After completing Test 5, check the database:

```sql
-- Get the user ID who just donated
SELECT id, email FROM users WHERE email = 'YOUR_TEST_EMAIL';

-- Check donations created (should be one per active project)
SELECT 
  d.id,
  d."userId",
  d."projectId",
  d.amount,
  d."tipAmount",
  d."impactPoints",
  d.status,
  p.title as project_title,
  p.is_universal_fund
FROM donations d
JOIN projects p ON d."projectId" = p.id
WHERE d."userId" = YOUR_USER_ID
ORDER BY d."createdAt" DESC
LIMIT 20;
```

**Expected Results:**
- [ ] Multiple donation records created (one per active project)
- [ ] Each donation has SAME amount (split equally)
- [ ] Donation amounts sum to total paid (e.g., 5 × $2 = $10)
- [ ] Only ONE donation has `impactPoints > 0` (first one)
- [ ] All donations have status = 'completed'
- [ ] NO donation to the "All Projects" project itself
- [ ] Donations are to REAL projects (is_universal_fund = false)

**Example for $10 with 5 active projects:**
```
id  | userId | projectId | amount | tipAmount | impactPoints | project_title
----+--------+-----------+--------+-----------+--------------+---------------
123 | 42     | 5         | 2      | 0         | 100          | Project A (first)
124 | 42     | 8         | 2      | 0         | 0            | Project B
125 | 42     | 12        | 2      | 0         | 0            | Project C
126 | 42     | 15        | 2      | 0         | 0            | Project D
127 | 42     | 19        | 2      | 0         | 0            | Project E
```

---

### **TEST 7: User Impact Points**

**Objective:** Verify user received correct impact points (once, not per-project)

**Steps:**
1. Check user's impact points before donation
2. Make $10 donation to "All Projects"
3. Check user's impact points after donation

**Expected Results:**
- [ ] User received 100 impact points (10 × 10 multiplier)
- [ ] NOT 500 points (would indicate points awarded per-project - BUG!)
- [ ] Dashboard shows updated points
- [ ] Navbar shows updated points
- [ ] Transaction record created in `user_transactions` table

**SQL Check:**
```sql
SELECT 
  impactPoints,
  totalDonations
FROM users
WHERE id = YOUR_USER_ID;

-- Check transactions
SELECT *
FROM user_transactions
WHERE user_id = YOUR_USER_ID
ORDER BY created_at DESC
LIMIT 5;
```

---

### **TEST 8: Dashboard Display**

**Objective:** Verify supported projects show correctly in dashboard

**Steps:**
1. After donating to "All Projects", navigate to `/dashboard`
2. Scroll to "Supported Projects" section

**Expected Results:**
- [ ] Dashboard loads successfully
- [ ] Shows ALL projects that received split donations
- [ ] "Supported Projects" count matches number of active projects
- [ ] Each project card shows in the supported projects grid
- [ ] NO "All Projects" card shown in supported projects (since it's just a container)

---

### **TEST 9: Regular Project Donation (Control Test)**

**Objective:** CRITICAL - Verify regular projects still work after implementation

**Steps:**
1. Navigate to ANY regular project (not "All Projects")
2. Click "Support"
3. Select $20 amount
4. Complete payment with test card

**Expected Results:**
- [ ] Payment completes successfully
- [ ] EXACTLY ONE donation record created
- [ ] Donation amount = $20 (NOT split)
- [ ] Impact points awarded correctly
- [ ] No split logic triggered
- [ ] Dashboard shows only that ONE project

**SQL Verification:**
```sql
-- After donating $20 to project ID 5
SELECT 
  COUNT(*) as donation_count,
  SUM(amount) as total_amount
FROM donations
WHERE "userId" = YOUR_USER_ID
  AND "createdAt" > NOW() - INTERVAL '5 minutes';

-- Should return: donation_count = 1, total_amount = 20
-- NOT: donation_count = 5+, total_amount = 20 (would be BUG)
```

---

### **TEST 10: Edge Cases**

**Objective:** Test unusual scenarios

**Test 10A: Large Amount**
- [ ] Donate $1000 to "All Projects"
- [ ] Verify split calculation correct ($1000 / N projects)
- [ ] Verify payment processes (no errors)

**Test 10B: Small Amount**
- [ ] Donate $10 to "All Projects" with 20 active projects
- [ ] Verify $0.50 per project (fractional amounts work)
- [ ] Verify database stores correct decimal values

**Test 10C: Custom Tip**
- [ ] Donate $50 + $5 tip (10%) to "All Projects"
- [ ] Verify support amount split across projects ($50 / N)
- [ ] Verify tip goes to Dopaya (not split)

**Test 10D: Only 1 Active Project**
- [ ] Temporarily set all but one project to 'draft'
- [ ] Donate to "All Projects"
- [ ] Verify donation goes to the single active project
- [ ] Re-activate projects after test

---

## 🚨 **Critical Failure Scenarios**

If ANY of these occur, STOP and ROLLBACK immediately:

1. ❌ Regular projects show gold border or split badge
2. ❌ Regular project donations get split across multiple projects
3. ❌ Donations fail to process (payment errors)
4. ❌ User gets 0 impact points or duplicate points
5. ❌ Database errors in logs
6. ❌ Frontend crashes or infinite loops

**Rollback Command:**
```sql
-- Emergency disable
UPDATE projects SET status = 'draft' WHERE slug = 'all-projects';
```

---

## ✅ **Success Criteria**

All tests must pass:

- [x] Universal fund card appears first and is visually distinct
- [x] Regular projects completely unaffected
- [x] Split breakdown UI shows correct calculations
- [x] Payment completes successfully
- [x] Correct number of donations created (one per active project)
- [x] Donations have correct split amounts
- [x] Impact points awarded once (not per-project)
- [x] Dashboard shows all supported projects
- [x] No errors in console or server logs
- [x] Regular project donations still work normally

---

## 📝 **Test Report Template**

```markdown
# All Projects Universal Fund - Test Report

**Date:** [Date]
**Tester:** [Name]
**Environment:** [Production/Staging/Local]

## Test Results

| Test # | Test Name | Status | Notes |
|--------|-----------|--------|-------|
| 1 | Visual Appearance | ✅/❌ | |
| 2 | Regular Projects Unaffected | ✅/❌ | |
| 3 | Project Detail Page | ✅/❌ | |
| 4 | Support Page UI | ✅/❌ | |
| 5 | Payment Flow | ✅/❌ | |
| 6 | Database Split | ✅/❌ | |
| 7 | Impact Points | ✅/❌ | |
| 8 | Dashboard Display | ✅/❌ | |
| 9 | Regular Project Control | ✅/❌ | |
| 10 | Edge Cases | ✅/❌ | |

## Issues Found

[List any issues discovered]

## Screenshots

[Attach relevant screenshots]

## Conclusion

✅ PASS - Ready for production
❌ FAIL - Needs fixes before launch
```

---

## 🎉 **Post-Testing Actions**

After all tests pass:

1. ✅ Document test results
2. ✅ Take screenshots for records
3. ✅ Update `ALL_PROJECTS_FUND_IMPLEMENTATION.md` with test results
4. ✅ Notify team that feature is ready
5. ✅ Monitor for 24-48 hours after launch
6. ✅ Collect user feedback

---

**Ready to test!** 🚀  
**Estimated testing time:** 30-45 minutes



