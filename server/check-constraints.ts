/**
 * Check if unique constraint exists on auth_user_id
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, '..', '.env');
config({ path: envPath });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function checkConstraints() {
  console.log('\n========== CHECKING CONSTRAINTS ==========\n');
  
  try {
    // Try to insert a duplicate to see if constraint exists
    const testId = 'test-duplicate-check-' + Date.now();
    
    // First insert
    const { data: first, error: firstError } = await supabase
      .from('users')
      .insert([{
        username: `test_user_${Date.now()}`,
        email: `test_${Date.now()}@test.com`,
        password: '',
        auth_user_id: testId
      }])
      .select()
      .single();
    
    if (firstError) {
      console.log('First insert error:', firstError.message);
    } else {
      console.log('✅ First insert successful');
      
      // Try duplicate
      const { data: second, error: secondError } = await supabase
        .from('users')
        .insert([{
          username: `test_user_${Date.now()}_2`,
          email: `test_${Date.now()}_2@test.com`,
          password: '',
          auth_user_id: testId
        }])
        .select()
        .single();
      
      if (secondError && secondError.code === '23505') {
        console.log('✅ Unique constraint EXISTS on auth_user_id');
      } else if (secondError) {
        console.log('⚠️  Different error:', secondError.message);
      } else {
        console.log('❌ Unique constraint does NOT exist (duplicate allowed)');
      }
      
      // Cleanup
      if (first) {
        await supabase.from('users').delete().eq('id', first.id);
      }
      if (second) {
        await supabase.from('users').delete().eq('id', second.id);
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
  
  console.log('\n========== CONSTRAINT CHECK COMPLETE ==========\n');
}

checkConstraints();

