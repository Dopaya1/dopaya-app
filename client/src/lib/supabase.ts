import { createClient } from '@supabase/supabase-js';

// Environment variables with fallbacks
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mpueatfperbxbbojlrwd.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wdWVhdGZwZXJieGJib2pscndkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwODk3NzAsImV4cCI6MjA2MTY2NTc3MH0.GPBxZ2yEbtB3Ws_nKWeDaE-yuyH-uvufV-Mq9aN8hEc';

// Debug environment variables
console.log('Supabase URL:', supabaseUrl ? '✓ Set' : '✗ Missing');
console.log('Supabase Key:', supabaseAnonKey ? '✓ Set' : '✗ Missing');
console.log('Using URL:', supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test connection immediately
console.log('Testing Supabase connection...');
supabase.from('projects').select('id').limit(1).then(({ data, error }) => {
  if (error) {
    console.error('❌ Supabase connection test failed:', error);
  } else {
    console.log('✅ Supabase connection test successful:', data);
  }
}).catch(err => {
  console.error('❌ Supabase connection error:', err);
});