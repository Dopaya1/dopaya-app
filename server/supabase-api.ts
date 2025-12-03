import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import { 
  User, InsertUser,
  Project, InsertProject,
  Donation, InsertDonation,
  Reward, InsertReward,
  Redemption, InsertRedemption,
  ProjectMedia, InsertProjectMedia,
  ProjectImpactMetrics, InsertProjectImpactMetrics,
} from '@shared/schema';

// Direct access to Supabase via REST API
// This is used when direct PostgreSQL access is not available
// LAZY INITIALIZATION: Client is created on first access, not at module load time
// This ensures environment variables are loaded before client initialization
let supabaseClientInstance: SupabaseClient | null = null;

function getSupabaseApiClient(): SupabaseClient {
  // Return cached instance if already initialized
  if (supabaseClientInstance) {
    return supabaseClientInstance;
  }

  // Get environment variables at call time (after .env is loaded)
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
    console.error('[supabase-api.ts] ❌ Missing Supabase credentials - API access will not work');
}

// Create a single instance of the Supabase client to reuse
try {
    supabaseClientInstance = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
    console.log('[supabase-api.ts] ✅ Supabase API client initialized (lazy)');
} catch (error) {
    console.error('[supabase-api.ts] ❌ Failed to initialize Supabase API client:', error);
  // Provide a dummy client that logs errors
    supabaseClientInstance = {
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ error: new Error('Supabase client failed to initialize') }),
          maybeSingle: async () => ({ error: new Error('Supabase client failed to initialize') }),
          order: () => ({
            limit: () => ({
              data: [], error: new Error('Supabase client failed to initialize')
            })
          }),
          data: [], error: new Error('Supabase client failed to initialize')
        }),
        order: () => ({
          limit: () => ({
            data: [], error: new Error('Supabase client failed to initialize')
          })
        }),
        data: [], error: new Error('Supabase client failed to initialize')
      }),
      insert: () => ({ error: new Error('Supabase client failed to initialize') }),
      update: () => ({ 
        eq: () => ({ error: new Error('Supabase client failed to initialize') }) 
      }),
      delete: () => ({ 
        eq: () => ({ error: new Error('Supabase client failed to initialize') }) 
      })
    })
  } as any;
}

  return supabaseClientInstance;
}

// Export a getter that lazily initializes the client
export const supabaseApi = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseApiClient();
    return (client as any)[prop];
  }
});

// Test the Supabase API connection
export async function testSupabaseApiConnection() {
  try {
    // Try to fetch a single project to test the connection
    const { data, error } = await supabaseApi
      .from('projects')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('Supabase API connection test failed:', error);
      return {
        success: false,
        message: 'Supabase API connection failed',
        error: error.message
      };
    }
    
    console.log('Supabase API connection test successful:', data);
    return {
      success: true,
      message: 'Supabase API connection successful',
      details: { count: data.length }
    };
  } catch (error) {
    console.error('Supabase API connection test failed with exception:', error);
    return {
      success: false,
      message: 'Supabase API connection failed with exception',
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

// Helper functions for database operations using the Supabase API directly
export async function fetchProjects(): Promise<Project[]> {
  try {
    const { data, error } = await supabaseApi
      .from('projects')
      .select('*')
      .order('featured', { ascending: false })
      .order('created_at', { ascending: false });
    
    if (error) {
      // Log full error if status >= 400
      if (error.status && error.status >= 400) {
        console.error('[supabase-api.ts] ❌ Supabase API error:', {
          code: error.code,
          message: error.message,
          status: error.status
        });
      }
      return [];
    }
    
    // Apply manual sorting as fallback to ensure correct order
    if (data && data.length > 0) {
      console.log('Applying manual sorting to API fallback results...');
      const sortedData = data.sort((a, b) => {
        // Featured first
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        
        // Then by creation date (newest first)
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      });
      return sortedData as Project[];
    }
    
    return data as Project[];
  } catch (error) {
    console.error('Exception fetching projects via Supabase API:', error);
    return [];
  }
}

export async function fetchFeaturedProjects(): Promise<Project[]> {
  try {
    const { data, error } = await supabaseApi
      .from('projects')
      .select('*')
      .eq('featured', true)
      .limit(6);
    
    if (error) {
      console.error('Error fetching featured projects via Supabase API:', error);
      return [];
    }
    
    return data as Project[];
  } catch (error) {
    console.error('Exception fetching featured projects via Supabase API:', error);
    return [];
  }
}

export async function fetchRewards(): Promise<Reward[]> {
  try {
    const { data, error } = await supabaseApi
      .from('rewards')
      .select('*');
    
    if (error) {
      console.error('Error fetching rewards via Supabase API:', error);
      return [];
    }
    
    return data as Reward[];
  } catch (error) {
    console.error('Exception fetching rewards via Supabase API:', error);
    return [];
  }
}

export async function fetchFeaturedRewards(): Promise<Reward[]> {
  try {
    const { data, error } = await supabaseApi
      .from('rewards')
      .select('*')
      .eq('featured', true)
      .limit(6);
    
    if (error) {
      console.error('Error fetching featured rewards via Supabase API:', error);
      return [];
    }
    
    return data as Reward[];
  } catch (error) {
    console.error('Exception fetching featured rewards via Supabase API:', error);
    return [];
  }
}