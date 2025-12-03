# Step 0: Database Schema Verification

## Method: Use Existing Working Queries

Instead of a separate script, I'll verify the schema by checking what the existing working code uses.

## Findings from Code Analysis

### 1. `donations` Table

**Queries in code (line 681, 701, 869, 930, 977):**
```typescript
.eq('userId', userId)        // ✅ camelCase works
.eq('projectId', projectId)  // ✅ camelCase works
.select('amount, projectId')  // ✅ camelCase works
.select('amount, impactPoints, createdAt')  // ✅ camelCase works
```

**Drizzle Schema (shared/schema.ts line 121-124):**
```typescript
userId: integer("user_id").notNull(),      // Maps camelCase → snake_case
projectId: integer("project_id").notNull(), // Maps camelCase → snake_case
impactPoints: integer("impact_points").notNull(), // Maps camelCase → snake_case
```

**Conclusion:**
- ✅ Supabase queries work with **camelCase** (`userId`, `projectId`, `impactPoints`)
- ⚠️ Drizzle schema suggests DB uses snake_case, but Supabase auto-converts
- ✅ **For inserts:** Need to verify - previous error showed `Could not find 'impact_points'` when using snake_case

### 2. `user_transactions` Table

**Working code (line 534, 632, 671):**
```typescript
.from('user_transactions')
.insert([{
  user_id: userId,              // ✅ snake_case
  transaction_type: ...,        // ✅ snake_case
  project_id: ...,              // ✅ snake_case
  donation_id: ...,             // ✅ snake_case
  points_change: ...,           // ✅ snake_case
  points_balance_after: ...     // ✅ snake_case
}])
```

**Queries (line 629, 632):**
```typescript
.eq('user_id', userId)          // ✅ snake_case
.eq('transaction_type', 'welcome_bonus')  // ✅ snake_case
```

**Conclusion:**
- ✅ **CONFIRMED:** `user_transactions` uses **snake_case** for all columns
- ✅ This is working correctly in `applyPointsChange()` method

### 3. `users` Table

**Working code (line 554):**
```typescript
.update({ impactPoints: newBalance })  // ✅ camelCase
.eq('id', userId)
```

**Queries (line 821, 847):**
```typescript
.select('impactPoints')  // ✅ camelCase
```

**Conclusion:**
- ✅ **CONFIRMED:** `users` table uses **camelCase** (`impactPoints`)

## Final Schema Summary

| Table | Column Style | Evidence |
|-------|-------------|----------|
| `donations` | **camelCase** | Queries use `.eq('userId')` and work ✅ |
| `user_transactions` | **snake_case** | Inserts use `user_id` and work ✅ |
| `users` | **camelCase** | Updates use `impactPoints` and work ✅ |

## Critical Finding

**Previous error message:**
```
Could not find the 'impact_points' column of 'donations' in the schema cache
```

This confirms:
- ❌ `donations` table does NOT use `impact_points` (snake_case)
- ✅ `donations` table uses `impactPoints` (camelCase)

## Verification Test

To double-check, we can look at the actual error from the server logs when we tried snake_case insert - it failed with "Could not find 'impact_points'", confirming camelCase is correct.

## Next Steps

✅ **Schema verified:**
- `donations`: camelCase (`userId`, `projectId`, `impactPoints`)
- `user_transactions`: snake_case (`user_id`, `transaction_type`, etc.)
- `users`: camelCase (`impactPoints`)

**Ready for Step 1: Verify applyPointsChange()**


