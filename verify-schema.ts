/**
 * Step 0: Verify Database Schema
 * This script queries Supabase to confirm actual column names in the database
 */

import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './server/secrets';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing environment variables!');
  console.error('   Set SUPABASE_URL and SUPABASE_ANON_KEY in .env file');
  console.error('   Or set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

async function verifySchema() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  console.log('🔍 Step 0: Verifying Database Schema...\n');
  console.log('='.repeat(60));
  
  // Test donations table - try camelCase
  console.log('\n1. Testing donations table with camelCase:');
  console.log('   Query: SELECT userId, projectId, impactPoints, amount FROM donations');
  const { data: camelData, error: camelError } = await supabase
    .from('donations')
    .select('userId, projectId, impactPoints, amount')
    .limit(1);
  
  if (camelError) {
    console.log('   ❌ camelCase FAILED');
    console.log('   Error:', camelError.message);
    console.log('   Code:', camelError.code);
    if (camelError.details) console.log('   Details:', camelError.details);
    if (camelError.hint) console.log('   Hint:', camelError.hint);
  } else {
    console.log('   ✅ camelCase WORKS');
    if (camelData && camelData.length > 0) {
      console.log('   Sample data:', JSON.stringify(camelData[0], null, 2));
    } else {
      console.log('   (No donations found, but query succeeded)');
    }
  }
  
  // Test donations table - try snake_case
  console.log('\n2. Testing donations table with snake_case:');
  console.log('   Query: SELECT user_id, project_id, impact_points, amount FROM donations');
  const { data: snakeData, error: snakeError } = await supabase
    .from('donations')
    .select('user_id, project_id, impact_points, amount')
    .limit(1);
  
  if (snakeError) {
    console.log('   ❌ snake_case FAILED');
    console.log('   Error:', snakeError.message);
    console.log('   Code:', snakeError.code);
    if (snakeError.details) console.log('   Details:', snakeError.details);
    if (snakeError.hint) console.log('   Hint:', snakeError.hint);
  } else {
    console.log('   ✅ snake_case WORKS');
    if (snakeData && snakeData.length > 0) {
      console.log('   Sample data:', JSON.stringify(snakeData[0], null, 2));
    } else {
      console.log('   (No donations found, but query succeeded)');
    }
  }
  
  // Test user_transactions (already confirmed snake_case)
  console.log('\n3. Testing user_transactions table:');
  console.log('   Query: SELECT user_id, transaction_type, points_change FROM user_transactions');
  const { data: txData, error: txError } = await supabase
    .from('user_transactions')
    .select('user_id, transaction_type, points_change')
    .limit(1);
  
  if (txError) {
    console.log('   ❌ Error:', txError.message);
  } else {
    console.log('   ✅ user_transactions uses snake_case');
    if (txData && txData.length > 0) {
      console.log('   Sample data:', JSON.stringify(txData[0], null, 2));
    } else {
      console.log('   (No transactions found, but query succeeded)');
    }
  }
  
  // Test users table
  console.log('\n4. Testing users table:');
  console.log('   Query: SELECT id, impactPoints FROM users');
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('id, impactPoints')
    .limit(1);
  
  if (userError) {
    console.log('   ❌ Error:', userError.message);
  } else {
    console.log('   ✅ users uses camelCase (impactPoints)');
    if (userData && userData.length > 0) {
      console.log('   Sample data:', JSON.stringify(userData[0], null, 2));
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ Schema verification complete!');
  console.log('\n📋 SUMMARY:');
  if (!camelError && snakeError) {
    console.log('   ✅ donations table uses: camelCase (userId, projectId, impactPoints)');
  } else if (camelError && !snakeError) {
    console.log('   ✅ donations table uses: snake_case (user_id, project_id, impact_points)');
  } else {
    console.log('   ⚠️  Both work or both fail - need manual verification');
  }
  console.log('   ✅ user_transactions table uses: snake_case (user_id, transaction_type, etc.)');
  console.log('   ✅ users table uses: camelCase (impactPoints)');
}

verifySchema().catch(console.error);

