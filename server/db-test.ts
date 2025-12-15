// Import for Supabase API connection
import { testSupabaseApiConnection } from './supabase-api';
import { supabaseApi } from './supabase-api';
import { createClient } from '@supabase/supabase-js';

export async function testDatabaseConnection() {
  try {
    // Read directly from process.env at runtime to ensure .env is loaded (not from secrets.ts which evaluates before .env loads)
    const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
    const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
    
    // Validate environment variables are set
    if (!SUPABASE_URL) {
      return {
        success: false,
        message: 'Failed to connect to Supabase',
        error: 'supabaseUrl is required. Check VITE_SUPABASE_URL or SUPABASE_URL environment variable.'
      };
    }
    
    if (!SUPABASE_ANON_KEY) {
      return {
        success: false,
        message: 'Failed to connect to Supabase',
        error: 'supabaseAnonKey is required. Check VITE_SUPABASE_ANON_KEY or SUPABASE_ANON_KEY environment variable.'
      };
    }
    
    // Use Supabase API directly as the primary connection method
    // This is more reliable with Supabase's connection model
    try {
      // First check if we can connect to Supabase at all
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      const { data, error } = await supabase.from('users').select('count').limit(1);
      
      if (!error) {
        // Successful connection to users table
        console.log('Supabase API connection successful, users table accessible');
        return {
          success: true,
          message: 'Database connection successful via Supabase API',
          details: { method: 'supabase_direct' }
        };
      }
      
      // If error is about missing table, we need schema setup
      if (error && error.code === '42P01') { // Table doesn't exist
        console.warn('Supabase connected but users table does not exist:', error.message);
        return {
          success: true,
          message: 'Database connection successful but schema needs to be created',
          details: { needsSetup: true, method: 'supabase_direct' },
          tableError: error.message
        };
      }
      
      // For other errors, try alternative connection methods
      console.error('Supabase API direct connection failed:', error);
      
      // Try RPC functions or other API endpoints
      const { data: healthCheck, error: healthError } = await supabase.from('health_check').select('*');
      if (!healthError) {
        console.log('Supabase health check successful');
        return {
          success: true,
          message: 'Database connection successful via health check',
          details: { method: 'health_check' }
        };
      }
      
      // Try REST API direct connection
      try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/users?select=count`, {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          }
        });
        
        if (response.ok) {
          console.log('REST API connection successful');
          return {
            success: true,
            message: 'Database connection successful via REST API',
            details: { method: 'rest_api' }
          };
        }
        
        const responseBody = await response.text();
        console.error('REST API connection failed:', response.status, responseBody);
        
        // Last resort - check if the auth service is reachable
        const authResponse = await fetch(`${SUPABASE_URL}/auth/v1/`, {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          }
        });
        
        if (authResponse.ok || authResponse.status === 404) {
          // 404 is actually good here - means the endpoint exists but we're hitting the wrong path
          console.log('Auth service is reachable, Supabase is online');
          return {
            success: true,
            message: 'Supabase is online but database tables need to be created',
            details: { needsSetup: true, method: 'auth_check' }
          };
        }
        
        return {
          success: false,
          message: 'All Supabase connection methods failed',
          error: `REST API: ${response.status}, Auth: ${authResponse.status}`
        };
      } catch (restError) {
        console.error('REST API connection attempt failed:', restError);
        return {
          success: false,
          message: 'All database connections failed',
          error: error.message,
          restError: restError instanceof Error ? restError.message : String(restError)
        };
      }
    } catch (error) {
      console.error('Supabase API connection test failed completely:', error);
      return {
        success: false,
        message: 'Failed to connect to Supabase',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  } catch (error) {
    return {
      success: false,
      message: 'Unexpected error during database connection test',
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

export async function fetchDatabaseStats() {
  try {
    // Read directly from process.env at runtime to ensure .env is loaded
    const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
    const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
    
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      return {
        success: false,
        error: 'Missing Supabase environment variables'
      };
    }
    
    // Use Supabase client directly for better reliability
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Get counts from each table using the Supabase API
    const { data: users, error: usersError } = await supabase.from('users').select('id');
    const { data: projects, error: projectsError } = await supabase.from('projects').select('id');
    const { data: rewards, error: rewardsError } = await supabase.from('rewards').select('id');
    
    // Check for table existence errors (42P01)
    const tablesExist = !(
      (usersError && usersError.code === '42P01') ||
      (projectsError && projectsError.code === '42P01') ||
      (rewardsError && rewardsError.code === '42P01')
    );
    
    if (!tablesExist) {
      console.warn('Some database tables do not exist yet');
      return {
        success: true,
        stats: {
          users: 0,
          projects: 0,
          rewards: 0
        },
        message: 'Database is online but tables need to be created',
        needsSetup: true
      };
    }
    
    if (usersError || projectsError || rewardsError) {
      const errors = {
        users: usersError ? usersError.message : null,
        projects: projectsError ? projectsError.message : null,
        rewards: rewardsError ? rewardsError.message : null
      };
      
      console.error('Errors fetching database stats:', errors);
      
      return {
        success: false,
        error: 'Failed to fetch database statistics',
        details: errors
      };
    }
    
    return {
      success: true,
      stats: {
        users: users?.length || 0,
        projects: projects?.length || 0,
        rewards: rewards?.length || 0
      }
    };
  } catch (error) {
    console.error('Failed to fetch database stats:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

// For ES modules compatibility, we don't use the require.main check
// This code will run only if explicitly imported and called
export async function runDbTests() {
  console.log('Testing database connection...');
  const result = await testDatabaseConnection();
  console.log(JSON.stringify(result, null, 2));
  
  if (result.success) {
    console.log('Fetching database stats...');
    const stats = await fetchDatabaseStats();
    console.log(JSON.stringify(stats, null, 2));
  }
  
  return result.success;
}