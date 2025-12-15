import { createClient } from '@supabase/supabase-js';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
// Import the corrected DATABASE_URL from our secrets file
import { DATABASE_URL, SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_PROJECT_ID } from './secrets';

import { applyDatabaseUrlFix } from './fix-db-connection';

// Apply fixes to DATABASE_URL if needed
applyDatabaseUrlFix();

// This is for direct PostgreSQL connections using the connection string
const connectionString = process.env.DATABASE_URL || DATABASE_URL;

// For SQL queries with error handling
let sql;
let db;

if (!connectionString) {
  console.error('DATABASE_URL environment variable is empty or not set');
}

try {
  // Log a redacted version of the connection string for debugging
  const redactedUrl = connectionString.replace(/\/\/([^:]+):[^@]+@/, '//[USERNAME]:[PASSWORD]@');
  console.log('Initializing PostgreSQL connection with URL:', redactedUrl);
  
  // Include the correct host format
  console.log(`Using Supabase Project ID: ${SUPABASE_PROJECT_ID}`);
  
  sql = postgres(connectionString, { 
    max: 5, // Reduce max connections
    connect_timeout: 30, // Increase timeout to 30 seconds
    idle_timeout: 20, // 20 seconds before connection is closed when idle
    onnotice: msg => console.log('Database notice:', msg),
    // SSL verification enabled by default - Supabase uses valid certificates
  });
  db = drizzle(sql);
  console.log('PostgreSQL connection initialized');
} catch (error) {
  console.error('Failed to initialize PostgreSQL connection:', error);
  console.error('If using Supabase, make sure DATABASE_URL uses format: postgresql://postgres:[PASSWORD]@[PROJECT_ID].supabase.co:5432/postgres');
  
  // Create placeholder objects that will throw appropriate errors when used
  sql = postgres(":memory:", { max: 1 });
  db = drizzle(sql);
}

export { sql, db };

// Supabase client for storage and other operations
// LAZY INITIALIZATION: Client is created on first access, not at module load time
// This ensures environment variables are loaded before client initialization
let supabaseInstance: any = null;

function getSupabaseClient() {
  // Return cached instance if already initialized
  if (supabaseInstance) {
    return supabaseInstance;
  }

  // Get environment variables at call time (after .env is loaded)
  const supabaseUrl = SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const supabaseAnonKey = SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl) {
  console.error('Missing Supabase URL in environment variables');
} else {
    console.log('[supabase.ts] Using Supabase URL:', supabaseUrl);
}

if (!supabaseAnonKey) {
  console.error('Missing Supabase anon key in environment variables');
}

if (!supabaseServiceKey) {
  console.warn('Missing Supabase service key - using anon key with limited permissions');
}

// Using service key if available, falling back to anon key for storage operations
const supabaseKey = supabaseServiceKey || supabaseAnonKey;

// Create Supabase client with error handling
try {
    supabaseInstance = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
    console.log('[supabase.ts] ✅ Supabase client initialized (lazy)');
} catch (error) {
    console.error('[supabase.ts] ❌ Failed to initialize Supabase client:', error);
  // Create a placeholder client that will report errors appropriately
    supabaseInstance = {
    storage: {
      getBucket: async () => ({ data: null, error: new Error('Supabase client failed to initialize') }),
      createBucket: async () => ({ error: new Error('Supabase client failed to initialize') }),
      from: () => ({
        upload: async () => ({ error: new Error('Supabase client failed to initialize') }),
        getPublicUrl: () => ({ data: { publicUrl: null } }),
        remove: async () => ({ error: new Error('Supabase client failed to initialize') }),
        list: async () => ({ data: null, error: new Error('Supabase client failed to initialize') })
      })
    }
  };
}

  return supabaseInstance;
}

// Export a getter that lazily initializes the client
export const supabase = new Proxy({} as any, {
  get(_target, prop) {
    const client = getSupabaseClient();
    return client[prop];
  }
});

// Define storage bucket names
export const STORAGE_BUCKETS = {
  PROJECT_IMAGES: 'project-images',
  PROJECT_DOCUMENTS: 'project-documents',
  PROJECT_VIDEOS: 'project-videos'
};

/**
 * Uploads a file to the specified Supabase Storage bucket
 * @param bucketName - Name of the storage bucket
 * @param filePath - Path where file will be stored in the bucket
 * @param file - File data to upload
 * @param contentType - MIME type of the file
 * @returns URL of the uploaded file if successful
 */
export async function uploadFile(
  bucketName: string, 
  filePath: string, 
  file: Buffer | Blob | File, 
  contentType: string
): Promise<string | null> {
  try {
    const client = getSupabaseClient();
    // Ensure the bucket exists
    const { data: bucketExists } = await client.storage.getBucket(bucketName);
    
    if (!bucketExists) {
      // Create bucket if it doesn't exist
      const { error: createBucketError } = await client.storage.createBucket(bucketName, {
        public: true, // Make files publicly accessible
      });
      
      if (createBucketError) {
        console.error(`Error creating bucket ${bucketName}:`, createBucketError);
        return null;
      }
    }

    // Upload the file
    const { data, error } = await client.storage
      .from(bucketName)
      .upload(filePath, file, {
        contentType,
        upsert: true,
      });

    if (error) {
      console.error('Error uploading file:', error);
      return null;
    }

    // Get the public URL
    const { data: { publicUrl } } = client.storage
      .from(bucketName)
      .getPublicUrl(data.path);

    return publicUrl;
  } catch (error) {
    console.error('Error in uploadFile:', error);
    return null;
  }
}

/**
 * Deletes a file from Supabase Storage
 * @param bucketName - Name of the storage bucket
 * @param filePath - Path of the file in the bucket
 * @returns boolean indicating success/failure
 */
export async function deleteFile(bucketName: string, filePath: string): Promise<boolean> {
  try {
    const client = getSupabaseClient();
    const { error } = await client.storage
      .from(bucketName)
      .remove([filePath]);

    if (error) {
      console.error('Error deleting file:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteFile:', error);
    return false;
  }
}

/**
 * Gets a list of files from a Supabase Storage bucket with a specific prefix
 * @param bucketName - Name of the storage bucket
 * @param prefix - Folder prefix to list files from
 * @returns Array of file objects or null on error
 */
export async function listFiles(bucketName: string, prefix: string = '') {
  try {
    const client = getSupabaseClient();
    const { data, error } = await client.storage
      .from(bucketName)
      .list(prefix);

    if (error) {
      console.error('Error listing files:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in listFiles:', error);
    return null;
  }
}