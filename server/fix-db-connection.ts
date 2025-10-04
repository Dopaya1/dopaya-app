/**
 * Utility for fixing database connection issues with Supabase
 */

// Import dotenv to ensure environment variables are loaded
import { DATABASE_URL, SUPABASE_PROJECT_ID } from './secrets';

/**
 * Formats a PostgreSQL connection string for Supabase compatibility
 * @param connectionString Original database connection string
 * @param projectId Supabase project ID
 * @returns Properly formatted connection string
 */
export function formatSupabaseConnectionString(connectionString: string, projectId: string): string {
  if (!connectionString || !projectId) {
    return connectionString;
  }

  try {
    // Parse the connection string
    const url = new URL(connectionString);
    
    // Extract credentials and other parts
    const username = url.username;
    const password = url.password;
    const pathname = url.pathname;
    const port = url.port || '5432';
    const search = url.search || '';
    
    // Build the corrected URL with Supabase's format
    const correctedHost = `${projectId}.supabase.co`;
    const correctedUrl = `postgresql://${username}:${password}@${correctedHost}:${port}${pathname}${search}`;
    
    // Return the fixed connection string
    return correctedUrl;
  } catch (error) {
    console.error('Error formatting Supabase connection string:', error);
    return connectionString;
  }
}

/**
 * Logs information about the current database connection settings
 */
export function logConnectionInfo(): void {
  console.log('DATABASE_URL information:');
  
  try {
    if (!DATABASE_URL) {
      console.log('  - DATABASE_URL is not defined');
      return;
    }
    
    const url = new URL(DATABASE_URL);
    const redactedPassword = '********';
    
    console.log(`  - Protocol: ${url.protocol}`);
    console.log(`  - Username: ${url.username}`);
    console.log(`  - Password: ${redactedPassword}`);
    console.log(`  - Host: ${url.hostname}`);
    console.log(`  - Port: ${url.port || '5432 (default)'}`);
    console.log(`  - Database: ${url.pathname.replace('/', '')}`);
    
    // Check if the host is properly formatted for Supabase
    if (SUPABASE_PROJECT_ID && !url.hostname.includes(SUPABASE_PROJECT_ID)) {
      console.warn(`  - HOSTNAME MISMATCH: Host "${url.hostname}" does not match project ID "${SUPABASE_PROJECT_ID}"`);
      
      // Show the corrected URL (with password redacted)
      const correctedUrl = formatSupabaseConnectionString(DATABASE_URL, SUPABASE_PROJECT_ID);
      const redactedUrl = correctedUrl.replace(/\/\/([^:]+):([^@]+)@/, `//$1:${redactedPassword}@`);
      console.log(`  - Suggested URL: ${redactedUrl}`);
    } else {
      console.log('  - URL format appears to be correct');
    }
  } catch (error) {
    console.error('Error parsing DATABASE_URL:', error);
  }
}

/**
 * Attempts to fix common database connection issues
 */
/**
 * Attempts to fix common database connection issues and returns status
 */
export async function fixDatabaseConnection(): Promise<{success: boolean, message: string, fixedUrl?: string}> {
  logConnectionInfo();
  
  if (!DATABASE_URL) {
    return {
      success: false,
      message: 'DATABASE_URL environment variable is not defined'
    };
  }
  
  if (!SUPABASE_PROJECT_ID) {
    return {
      success: false,
      message: 'SUPABASE_PROJECT_ID could not be determined from VITE_SUPABASE_URL'
    };
  }
  
  try {
    const url = new URL(DATABASE_URL);
    let needsFix = false;
    let fixReason = '';
    
    // Check if the host has the db. prefix that needs to be removed
    if (url.hostname.startsWith('db.') && url.hostname.includes(SUPABASE_PROJECT_ID)) {
      needsFix = true;
      fixReason = 'DATABASE_URL contains "db." prefix which should be removed for direct PostgreSQL connections';
    }
    // Check if the host doesn't contain the project ID
    else if (!url.hostname.includes(SUPABASE_PROJECT_ID)) {
      needsFix = true;
      fixReason = `DATABASE_URL host (${url.hostname}) doesn't match Supabase project ID format`;
    }
    
    if (needsFix) {
      // Generate a fixed URL
      const fixedUrl = formatSupabaseConnectionString(DATABASE_URL, SUPABASE_PROJECT_ID);
      
      // Return warning details
      return {
        success: false,
        message: fixReason,
        fixedUrl
      };
    }
    
    return {
      success: true,
      message: 'Database connection string appears to be correctly formatted'
    };
  } catch (error) {
    return {
      success: false,
      message: `Error analyzing DATABASE_URL: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Applies the fixed database URL format to process.env.DATABASE_URL for immediate use
 * Note: This doesn't permanently change environment variables across restarts
 */
export function applyDatabaseUrlFix(): boolean {
  try {
    if (!process.env.DATABASE_URL || !SUPABASE_PROJECT_ID) {
      return false;
    }
    
    const fixedUrl = formatSupabaseConnectionString(process.env.DATABASE_URL, SUPABASE_PROJECT_ID);
    
    // Only apply if the URL changed
    if (fixedUrl !== process.env.DATABASE_URL) {
      console.log('Applying DATABASE_URL fix for this session');
      // Override the environment variable for the current process
      process.env.DATABASE_URL = fixedUrl;
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error applying DATABASE_URL fix:', error);
    return false;
  }
}