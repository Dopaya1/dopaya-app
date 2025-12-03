/**
 * Run migration to add unique constraint on auth_user_id
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, '..', '.env');
config({ path: envPath });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function runMigration() {
  console.log('\n========== RUNNING MIGRATION ==========\n');
  
  try {
    // Read migration SQL
    const migrationPath = resolve(__dirname, '..', 'migrations', '001_add_auth_user_id_constraint.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');
    
    console.log('Migration SQL:');
    console.log(migrationSQL);
    console.log('\n');
    
    // Execute migration using Supabase RPC (if available) or direct SQL
    // Note: Supabase doesn't support direct SQL execution via client
    // This needs to be run in Supabase SQL Editor
    console.log('⚠️  Supabase client cannot execute arbitrary SQL.');
    console.log('📝 Please run this migration in Supabase SQL Editor:');
    console.log('\n' + migrationSQL + '\n');
    console.log('Or use the Supabase dashboard:');
    console.log('1. Go to SQL Editor');
    console.log('2. Paste the SQL above');
    console.log('3. Run it');
    
    // Alternative: Try to check if constraint exists by attempting to create a duplicate
    console.log('\n========== CHECKING CONSTRAINT STATUS ==========\n');
    
    // Get a sample user with auth_user_id
    const { data: sampleUser } = await supabase
      .from('users')
      .select('auth_user_id')
      .not('auth_user_id', 'is', null)
      .limit(1)
      .single();
    
    if (sampleUser && sampleUser.auth_user_id) {
      console.log('✅ Found user with auth_user_id:', sampleUser.auth_user_id);
      console.log('ℹ️  To verify constraint, try creating a duplicate in Supabase dashboard');
    } else {
      console.log('⚠️  No users with auth_user_id found to test constraint');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  console.log('\n========== MIGRATION CHECK COMPLETE ==========\n');
}

runMigration();

