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
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials - API access will not work');
}

// Create a single instance of the Supabase client to reuse
let supabaseClient: SupabaseClient;

try {
  supabaseClient = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
  console.log('Supabase API client initialized');
} catch (error) {
  console.error('Failed to initialize Supabase API client:', error);
  // Provide a dummy client that logs errors
  supabaseClient = {
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

export const supabaseApi = supabaseClient;

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
      console.error('Error fetching projects via Supabase API:', error);
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