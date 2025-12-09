// Direct query to check if redemption exists
// Run this to verify what's actually in the database

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function checkRedemptions() {
  console.log('Checking redemptions table...\n');
  
  // 1. Check table structure
  console.log('1. Table structure:');
  const { data: columns, error: columnsError } = await supabase.rpc('exec_sql', {
    sql: `
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'redemptions'
      ORDER BY ordinal_position;
    `
  });
  console.log('Columns:', columns || columnsError);
  
  // 2. Check all redemptions (with service role key, bypasses RLS)
  console.log('\n2. All redemptions (last 10):');
  const { data: allRedemptions, error: allError } = await supabase
    .from('redemptions')
    .select('*')
    .order('id', { ascending: false })
    .limit(10);
  
  if (allError) {
    console.error('Error:', allError);
  } else {
    console.log('Found', allRedemptions?.length || 0, 'redemptions');
    console.log(JSON.stringify(allRedemptions, null, 2));
  }
  
  // 3. Check redemptions for user 42 (camelCase)
  console.log('\n3. Redemptions for user 42 (camelCase):');
  const { data: user42Camel, error: user42CamelError } = await supabase
    .from('redemptions')
    .select('*')
    .eq('userId', 42)
    .order('id', { ascending: false });
  
  if (user42CamelError) {
    console.error('Error:', user42CamelError);
  } else {
    console.log('Found', user42Camel?.length || 0, 'redemptions');
    console.log(JSON.stringify(user42Camel, null, 2));
  }
  
  // 4. Check redemptions for user 42 (snake_case)
  console.log('\n4. Redemptions for user 42 (snake_case):');
  const { data: user42Snake, error: user42SnakeError } = await supabase
    .from('redemptions')
    .select('*')
    .eq('user_id', 42)
    .order('id', { ascending: false });
  
  if (user42SnakeError) {
    console.error('Error:', user42SnakeError);
  } else {
    console.log('Found', user42Snake?.length || 0, 'redemptions');
    console.log(JSON.stringify(user42Snake, null, 2));
  }
  
  // 5. Check specific redemption ID 41
  console.log('\n5. Redemption ID 41:');
  const { data: redemption41, error: redemption41Error } = await supabase
    .from('redemptions')
    .select('*')
    .eq('id', 41)
    .single();
  
  if (redemption41Error) {
    console.error('Error:', redemption41Error);
  } else {
    console.log('Found redemption 41:');
    console.log(JSON.stringify(redemption41, null, 2));
  }
}

checkRedemptions().catch(console.error);


