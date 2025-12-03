#!/usr/bin/env tsx
/**
 * Quick test script to verify local setup
 * 
 * Usage: tsx scripts/test-local-auth.ts
 */

console.log('🧪 Local Testing Setup Check\n');
console.log('='.repeat(50));

// Check 1: Environment variables
console.log('\n1. Environment Variables:');
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (supabaseUrl) {
  console.log('  ✅ SUPABASE_URL: Set');
  console.log(`     ${supabaseUrl.substring(0, 30)}...`);
} else {
  console.log('  ❌ SUPABASE_URL: Missing');
}

if (supabaseKey) {
  console.log('  ✅ SUPABASE_ANON_KEY: Set');
} else {
  console.log('  ❌ SUPABASE_ANON_KEY: Missing');
}

// Check 2: Expected local URLs
console.log('\n2. Expected Local URLs:');
console.log('  Local Dev Server: http://localhost:3001');
console.log('  Auth Callback:    http://localhost:3001/auth/callback');
console.log('  API Endpoint:     http://localhost:3001/api/user/impact');

// Check 3: Supabase Configuration
console.log('\n3. Supabase Configuration Required:');
console.log('  📋 Go to: https://supabase.com/dashboard');
console.log('  📋 Navigate to: Authentication → URL Configuration');
console.log('  📋 Add to Redirect URLs:');
console.log('     - http://localhost:3001/auth/callback');
console.log('     - http://localhost:3001/**');
console.log('     - http://127.0.0.1:3001/auth/callback');

// Check 4: Testing instructions
console.log('\n4. How to Test:');
console.log('  1. Start dev server: npm run dev');
console.log('  2. Open: http://localhost:3001');
console.log('  3. Try logging in');
console.log('  4. Should redirect to: http://localhost:3001/auth/callback');
console.log('  5. NOT to: https://dopaya.com');

// Check 5: Troubleshooting
console.log('\n5. If Still Redirecting to Production:');
console.log('  - Clear browser cache and cookies');
console.log('  - Try incognito/private mode');
console.log('  - Verify Supabase redirect URLs are saved');
console.log('  - Check browser console for errors');
console.log('  - Verify dev server is running on port 3001');

console.log('\n' + '='.repeat(50));
console.log('✅ Setup check complete!\n');






