/**
 * Script to inspect the current users table schema
 * Run with: npx tsx server/check-users-schema.ts
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Load .env
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

async function checkSchema() {
  console.log('\n========== INSPECTING users TABLE SCHEMA ==========\n');
  
  try {
    // Get column information
    const { data: columns, error: columnsError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default,
          character_maximum_length
        FROM information_schema.columns
        WHERE table_schema = 'public' 
          AND table_name = 'users'
        ORDER BY ordinal_position;
      `
    });
    
    if (columnsError) {
      // Try alternative method
      console.log('Trying alternative method to get schema...');
      const { data: sample, error: sampleError } = await supabase
        .from('users')
        .select('*')
        .limit(1);
      
      if (sampleError) {
        console.error('❌ Error:', sampleError);
        return;
      }
      
      if (sample && sample.length > 0) {
        console.log('Sample row structure:');
        console.log(JSON.stringify(sample[0], null, 2));
      } else {
        console.log('⚠️  No rows in users table to inspect structure');
      }
    } else {
      console.log('Columns in users table:');
      console.table(columns);
    }
    
    // Check for auth_user_id column
    const { data: authIdCheck, error: authIdError } = await supabase
      .from('users')
      .select('auth_user_id')
      .limit(1);
    
    if (authIdError && authIdError.code === '42703') {
      console.log('\n❌ auth_user_id column does NOT exist');
    } else {
      console.log('\n✅ auth_user_id column EXISTS');
    }
    
    // Check indexes
    const { data: indexes, error: indexesError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT 
          indexname,
          indexdef
        FROM pg_indexes
        WHERE schemaname = 'public' 
          AND tablename = 'users';
      `
    });
    
    if (!indexesError && indexes) {
      console.log('\nIndexes on users table:');
      console.table(indexes);
    }
    
    // Check constraints
    const { data: constraints, error: constraintsError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT 
          conname as constraint_name,
          contype as constraint_type
        FROM pg_constraint
        WHERE conrelid = 'public.users'::regclass;
      `
    });
    
    if (!constraintsError && constraints) {
      console.log('\nConstraints on users table:');
      console.table(constraints);
    }
    
    console.log('\n========== SCHEMA INSPECTION COMPLETE ==========\n');
    
  } catch (error) {
    console.error('❌ Error inspecting schema:', error);
  }
}

checkSchema();

