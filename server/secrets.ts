// Environment variables and secrets

// Supabase variables
// Support both VITE_ prefixed (for frontend build) and non-prefixed (for serverless functions)
export const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

// Parse the project ID from Supabase URL (e.g., https://your-project-id.supabase.co)
export const SUPABASE_PROJECT_ID = SUPABASE_URL ? SUPABASE_URL.match(/https:\/\/([^.]+)/)?.[1] || '' : '';

// Original Database URL (may need correction for Supabase)
const ORIGINAL_DATABASE_URL = process.env.DATABASE_URL || '';

// Fix DATABASE_URL if needed by replacing the host with correct Supabase format
export const DATABASE_URL = (() => {
  if (!ORIGINAL_DATABASE_URL || !SUPABASE_PROJECT_ID) return ORIGINAL_DATABASE_URL;
  
  try {
    // Parse the original URL
    const url = new URL(ORIGINAL_DATABASE_URL);
    
    // Check if the host contains "db." prefix which needs to be removed
    if (url.host.startsWith('db.') && url.host.includes(SUPABASE_PROJECT_ID)) {
      console.log(`Fixing DATABASE_URL host by removing "db." prefix. Project ID: ${SUPABASE_PROJECT_ID}`);
      // Remove the "db." prefix from the hostname
      url.host = url.host.replace('db.', '');
      return url.toString();
    }
    
    // Check if the host is completely incorrect
    if (!url.host.includes(SUPABASE_PROJECT_ID)) {
      console.log(`Fixing DATABASE_URL host. Project ID: ${SUPABASE_PROJECT_ID}`);
      // Use the correct Supabase pooled DB hostname format
      url.host = `${SUPABASE_PROJECT_ID}.supabase.co`;
      return url.toString();
    }
    
    return ORIGINAL_DATABASE_URL;
  } catch (error) {
    console.error('Error parsing DATABASE_URL:', error);
    return ORIGINAL_DATABASE_URL;
  }
})();

// Session secret for express-session
export const SESSION_SECRET = process.env.SESSION_SECRET || 'dopaya-super-secret-key-change-in-prod';

// Validate required secrets
console.log('\n========== SECRETS VALIDATION ==========');
if (!SUPABASE_URL) {
  console.error('❌ Missing SUPABASE_URL environment variable (check VITE_SUPABASE_URL or SUPABASE_URL)');
} else {
  console.log('✅ SUPABASE_URL:', SUPABASE_URL ? `✅ Set (${SUPABASE_URL.substring(0, 30)}...)` : '❌ MISSING');
}

if (!SUPABASE_ANON_KEY) {
  console.error('❌ Missing SUPABASE_ANON_KEY environment variable (check VITE_SUPABASE_ANON_KEY or SUPABASE_ANON_KEY)');
} else {
  console.log('✅ SUPABASE_ANON_KEY: Set (length:', SUPABASE_ANON_KEY.length, ')');
}

const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '';
if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('⚠️  Missing SUPABASE_SERVICE_ROLE_KEY - RLS policies may block inserts');
} else {
  console.log('✅ SUPABASE_SERVICE_ROLE_KEY: Set (length:', SUPABASE_SERVICE_ROLE_KEY.length, ')');
}

if (!DATABASE_URL) {
  console.error('❌ Missing DATABASE_URL environment variable');
} else {
  console.log('✅ DATABASE_URL: Set');
}
console.log('========================================\n');

// Stripe secrets (if needed later)
export const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
export const STRIPE_PUBLISHABLE_KEY = process.env.VITE_STRIPE_PUBLIC_KEY;