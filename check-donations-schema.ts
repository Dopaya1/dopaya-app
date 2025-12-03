/**
 * Quick script to check actual donations table schema
 * Run with: npx tsx check-donations-schema.ts
 */

import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './server/secrets';

async function checkSchema() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  console.log('🔍 Checking donations table schema...\n');
  
  // Try to query with camelCase
  console.log('1. Testing camelCase query (userId, projectId, impactPoints):');
  const { data: camelData, error: camelError } = await supabase
    .from('donations')
    .select('userId, projectId, impactPoints, amount, status')
    .limit(1);
  
  if (camelError) {
    console.log('   ❌ camelCase failed:', camelError.message);
  } else {
    console.log('   ✅ camelCase works!');
    if (camelData && camelData.length > 0) {
      console.log('   Sample data:', camelData[0]);
    }
  }
  
  // Try to query with snake_case
  console.log('\n2. Testing snake_case query (user_id, project_id, impact_points):');
  const { data: snakeData, error: snakeError } = await supabase
    .from('donations')
    .select('user_id, project_id, impact_points, amount, status')
    .limit(1);
  
  if (snakeError) {
    console.log('   ❌ snake_case failed:', snakeError.message);
  } else {
    console.log('   ✅ snake_case works!');
    if (snakeData && snakeData.length > 0) {
      console.log('   Sample data:', snakeData[0]);
    }
  }
  
  // Try to insert a test record with camelCase
  console.log('\n3. Testing camelCase insert:');
  const testDonation = {
    userId: 999999, // Non-existent user ID to avoid foreign key issues
    projectId: 999999, // Non-existent project ID
    amount: 1,
    impactPoints: 10,
    status: 'test'
  };
  
  const { data: insertData, error: insertError } = await supabase
    .from('donations')
    .insert([testDonation])
    .select()
    .single();
  
  if (insertError) {
    console.log('   ❌ camelCase insert failed:', {
      message: insertError.message,
      code: insertError.code,
      details: insertError.details,
      hint: insertError.hint
    });
  } else {
    console.log('   ✅ camelCase insert works!');
    // Delete test record
    await supabase.from('donations').delete().eq('id', insertData.id);
    console.log('   🗑️  Test record deleted');
  }
  
  // Try to insert with snake_case
  console.log('\n4. Testing snake_case insert:');
  const testDonationSnake = {
    user_id: 999999,
    project_id: 999999,
    amount: 1,
    impact_points: 10,
    status: 'test'
  };
  
  const { data: insertDataSnake, error: insertErrorSnake } = await supabase
    .from('donations')
    .insert([testDonationSnake])
    .select()
    .single();
  
  if (insertErrorSnake) {
    console.log('   ❌ snake_case insert failed:', {
      message: insertErrorSnake.message,
      code: insertErrorSnake.code,
      details: insertErrorSnake.details,
      hint: insertErrorSnake.hint
    });
  } else {
    console.log('   ✅ snake_case insert works!');
    // Delete test record
    await supabase.from('donations').delete().eq('id', insertDataSnake.id);
    console.log('   🗑️  Test record deleted');
  }
  
  console.log('\n✅ Schema check complete!');
}

checkSchema().catch(console.error);


