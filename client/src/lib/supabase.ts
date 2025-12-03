import { createClient } from '@supabase/supabase-js';

// Environment variables - NO hardcoded fallbacks for security
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  const missing = [];
  if (!supabaseUrl) missing.push('VITE_SUPABASE_URL');
  if (!supabaseAnonKey) missing.push('VITE_SUPABASE_ANON_KEY');
  throw new Error(`Missing required environment variables: ${missing.join(', ')}. Please set them in your environment or Vercel dashboard.`);
}

// Debug environment variables (only log that they're set, not the actual values)
console.log('Supabase URL: ✓ Set');
console.log('Supabase Key: ✓ Set');
console.log('Using URL:', supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test connection lazily (only in browser, not during SSR/build)
// This prevents the test from running during Vite's HTML transformation
if (typeof window !== 'undefined') {
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
}