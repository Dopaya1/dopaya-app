import { IStorage } from './storage';
import {
  User, InsertUser,
  Project, InsertProject,
  Donation, InsertDonation,
  Reward, InsertReward,
  Redemption, InsertRedemption,
  UserImpact, UserImpactHistory,
  ProjectMedia, InsertProjectMedia,
  ProjectImpactMetrics, InsertProjectImpactMetrics
} from '@shared/schema';
import session from 'express-session';
import createMemoryStore from 'memorystore';
import { createClient } from '@supabase/supabase-js';
// Removed import from secrets.ts - we read directly from process.env to ensure .env is loaded first
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

// Storage buckets for media files
const STORAGE_BUCKETS = {
  PROJECT_IMAGES: 'project_images',
  PROJECT_DOCUMENTS: 'project_documents',
  PROJECT_VIDEOS: 'project_videos'
};

// Use memory store for session storage
const MemoryStore = createMemoryStore(session);

// Lazy initialization of Supabase client - only initialize when first used
// This ensures environment variables are loaded before initialization
let supabase: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient(): ReturnType<typeof createClient> {
  if (supabase) {
    return supabase;
  }
  
  // Read from process.env directly (not from secrets.ts) to ensure .env is loaded
  const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '';
  
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('[supabase-storage-new] ❌ Missing Supabase credentials');
    throw new Error(`Missing Supabase credentials: SUPABASE_URL=${!!SUPABASE_URL}, SUPABASE_ANON_KEY=${!!SUPABASE_ANON_KEY}`);
  }
  
  const supabaseKey = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;
  
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('[supabase-storage-new] ⚠️  Using ANON_KEY - RLS policies may block inserts. Consider setting SUPABASE_SERVICE_ROLE_KEY.');
  }
  
  try {
    supabase = createClient(SUPABASE_URL, supabaseKey);
  } catch (error) {
    console.error('[supabase-storage-new] ❌ Failed to create Supabase client:', error);
    throw error;
  }
  
  return supabase;
}

// Helper functions for password hashing
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Helper function to upload files to Supabase storage
async function uploadFile(bucketName: string, filePath: string, file: Buffer | Blob | File, contentType: string): Promise<string | null> {
  try {
      const { data, error } = await getSupabaseClient().storage
      .from(bucketName)
      .upload(filePath, file, {
        contentType,
        upsert: true
      });

    if (error) {
      console.error(`Error uploading file to ${bucketName}/${filePath}:`, error.message);
      return null;
    }

    // Get public URL for the file
      const { data: urlData } = getSupabaseClient().storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  } catch (error) {
    console.error(`Error in uploadFile function:`, error);
    return null;
  }
}

// Helper function to delete files from Supabase storage
async function deleteFile(bucketName: string, filePath: string): Promise<boolean> {
  try {
      const { error } = await getSupabaseClient().storage
      .from(bucketName)
      .remove([filePath]);

    if (error) {
      console.error(`Error deleting file from ${bucketName}/${filePath}:`, error.message);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`Error in deleteFile function:`, error);
    return false;
  }
}

export class SupabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    // Use memory store for sessions
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours - clear expired entries
    });
    console.log('Initialized Supabase storage with MemoryStore for sessions');
  }

  // Helper method to generate a URL-friendly slug from a title
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    try {
      // Select all columns - Supabase returns them as-is (camelCase if that's the column name)
      const { data, error } = await getSupabaseClient()
        .from('users')
        .select('*')
        .eq('id', id)
        .limit(1)
        .single();
      
      if (error) {
        console.error(`Error retrieving user with ID ${id} from Supabase:`, error);
        return undefined;
      }
      
      if (!data) {
        return undefined;
      }
      
      // Return data as-is - Supabase preserves column names
      // If column is "impactPoints" in DB, it will be "impactPoints" in data
      return data as User;
    } catch (error) {
      console.error(`Error retrieving user with ID ${id}:`, error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const { data, error } = await getSupabaseClient()
        .from('users')
        .select('*')
        .eq('username', username)
        .limit(1)
        .single();
      
      if (error) {
        console.error(`Error retrieving user with username ${username} from Supabase:`, error);
        return undefined;
      }
      
      return data || undefined;
    } catch (error) {
      console.error(`Error retrieving user with username ${username}:`, error);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      // Select all columns - Supabase returns them as-is (camelCase if that's the column name)
      const { data, error } = await getSupabaseClient()
        .from('users')
        .select('*')
        .eq('email', email)
        .limit(1)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned - user doesn't exist
          return undefined;
        }
        console.error(`Error retrieving user with email ${email} from Supabase:`, error);
        return undefined;
      }
      
      if (!data) {
        return undefined;
      }
      
      // Return data as-is - Supabase preserves column names
      // If column is "impactPoints" in DB, it will be "impactPoints" in data
      return data as User;
    } catch (error) {
      console.error(`Error retrieving user with email ${email}:`, error);
      return undefined;
    }
  }

  async getUserByAuthId(authUserId: string): Promise<User | undefined> {
    try {
      console.log('[getUserByAuthId] Looking up user by auth_user_id:', authUserId);
      const { data, error } = await getSupabaseClient()
        .from('users')
        .select('id, email, auth_user_id, impactPoints, username, firstName, lastName')
        .eq('auth_user_id', authUserId)
        .maybeSingle();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned - user doesn't exist
          console.log('[getUserByAuthId] User not found');
          return undefined;
        }
        console.error(`[getUserByAuthId] Error retrieving user with auth_user_id ${authUserId}:`, error);
        return undefined;
      }
      
      if (data) {
        console.log('[getUserByAuthId] ✅ User found:', { id: data.id, email: data.email });
      }
      
      return data as User | undefined;
    } catch (error) {
      console.error(`[getUserByAuthId] Exception retrieving user:`, error);
      return undefined;
    }
  }

  async createUserMinimal(params: {
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    auth_user_id?: string | null;
  }): Promise<User> {
    try {
      console.log('[createUserMinimal] Creating minimal user:', { 
        username: params.username, 
        email: params.email, 
        auth_user_id: params.auth_user_id 
      });
      
      // Insert minimal user (no password for Supabase auth users)
      const { data, error } = await getSupabaseClient()
        .from('users')
        .insert([{
          username: params.username,
          email: params.email,
          firstName: params.firstName || '',
          lastName: params.lastName || '',
          auth_user_id: params.auth_user_id || null,
          password: '', // Empty password for Supabase auth users
          impactPoints: 50, // Welcome bonus
          totalDonations: 0
        }])
        .select()
        .single();
      
      if (error) {
        // Handle unique constraint violation (concurrent creation)
        if (error.code === '23505') { // Unique violation
          console.log('[createUserMinimal] ⚠️ Unique constraint violation, fetching existing user...');
          
          // Try to fetch by auth_user_id first
          if (params.auth_user_id) {
            const existing = await this.getUserByAuthId(params.auth_user_id);
            if (existing) {
              console.log('[createUserMinimal] ✅ Found existing user by auth_user_id:', existing.id);
              return existing;
            }
          }
          
          // Fallback: fetch by email
          const existing = await this.getUserByEmail(params.email);
          if (existing) {
            console.log('[createUserMinimal] ✅ Found existing user by email:', existing.id);
            return existing;
          }
          
          // If we still can't find it, throw the original error
          console.error('[createUserMinimal] ❌ Unique violation but user not found:', error);
          throw new Error(`Failed to create user: ${error.message}`);
        }
        
        console.error('[createUserMinimal] ❌ Error creating user:', error);
        throw new Error(`Failed to create user: ${error.message}`);
      }
      
      console.log('[createUserMinimal] ✅ User created successfully:', data.id);
      return data;
    } catch (error) {
      console.error('[createUserMinimal] ❌ Exception creating user:', error);
      throw error;
    }
  }

  async createUser(user: InsertUser): Promise<User> {
    try {
      // Hash the password
      const hashedPassword = await hashPassword(user.password);
      
      // Create the user record with 50 Impact Points welcome bonus
      const { data, error } = await getSupabaseClient()
        .from('users')
        .insert([{ 
          ...user, 
          password: hashedPassword,
          impactPoints: 50, // Welcome bonus for new users
          totalDonations: 0 // Initialize to 0
        }])
        .select()
        .single();
      
      if (error) {
        console.error('Error creating user in Supabase:', error);
        throw new Error(`Failed to create user: ${error.message}`);
      }
      
      console.log('User created successfully with 50 Impact Points:', data.id);
      return data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  }

  // Project operations
  async getProjects(): Promise<Project[]> {
    try {
      console.log('Getting projects from Supabase...');
      const { data, error } = await getSupabaseClient()
        .from('projects')
        .select('*')
        .eq('status', 'active');
      
      if (error) {
        console.error('Error fetching projects from Supabase:', error);
        return [];
      }
      
      console.log(`Found ${data?.length || 0} projects in Supabase`);
      return data || [];
    } catch (error) {
      console.error('Error retrieving projects:', error);
      return [];
    }
  }

  async getProject(id: number): Promise<Project | undefined> {
    try {
      const SUPABASE_URL_FOR_LOG = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
      const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '';
      console.log(`[getProject] Looking up project ID: ${id}`);
      console.log(`[getProject] Using Supabase URL: ${SUPABASE_URL_FOR_LOG ? `✅ Set (${SUPABASE_URL_FOR_LOG.substring(0, 30)}...)` : '❌ MISSING'}`);
      console.log(`[getProject] Using key type: ${SUPABASE_SERVICE_ROLE_KEY ? 'SERVICE_ROLE' : 'ANON'}`);
      
      const { data, error } = await getSupabaseClient()
        .from('projects')
        .select('*')
        .eq('id', id)
        .limit(1)
        .single();
      
      if (error) {
        console.error(`[getProject] ❌ Error retrieving project with ID ${id} from Supabase:`, {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        return undefined;
      }
      
      if (data) {
        console.log(`[getProject] ✅ Project found:`, { id: data.id, title: data.title, slug: data.slug });
      } else {
        console.log(`[getProject] ⚠️ No project found with ID ${id}`);
      }
      
      return data || undefined;
    } catch (error) {
      console.error(`[getProject] ❌ Exception retrieving project with ID ${id}:`, error);
      return undefined;
    }
  }

  async getProjectBySlug(slug: string): Promise<Project | undefined> {
    try {
      const client = getSupabaseClient();
      
      const { data, error } = await client
        .from('projects')
        .select('*')
        .eq('slug', slug)
        .limit(1)
        .single();
      
      if (error) {
        // Log full error if status >= 400
        if (error.status && error.status >= 400) {
          console.error(`[getProjectBySlug] ❌ Supabase API error:`, {
            code: error.code,
            message: error.message,
            status: error.status
          });
        }
        return undefined;
      }
      
      if (data) {
        console.log(`[getProjectBySlug] ✅ Project found:`, { id: data.id, title: data.title, slug: data.slug });
      } else {
        console.log(`[getProjectBySlug] ⚠️ No project found with slug ${slug}`);
      }
      
      return data || undefined;
    } catch (error) {
      console.error(`[getProjectBySlug] ❌ Exception retrieving project with slug ${slug}:`, error);
      return undefined;
    }
  }

  async getFeaturedProjects(): Promise<Project[]> {
    try {
      console.log('Getting featured projects from Supabase...');
      const { data, error } = await getSupabaseClient()
        .from('projects')
        .select('*')
        .eq('status', 'active')
        .eq('featured', true)
        .order('createdAt', { ascending: false });
      
      if (error) {
        console.error('Error fetching featured projects from Supabase:', error);
        return [];
      }
      
      console.log(`Found ${data?.length || 0} featured projects in Supabase`);
      return data || [];
    } catch (error) {
      console.error('Error retrieving featured projects:', error);
      return [];
    }
  }

  async createProject(project: InsertProject): Promise<Project> {
    try {
      // Generate a slug if not provided
      const projectWithSlug = {
        ...project,
        slug: project.slug || this.generateSlug(project.title)
      };
      
      const { data, error } = await getSupabaseClient()
        .from('projects')
        .insert([projectWithSlug])
        .select()
        .single();
      
      if (error) {
        console.error('Error creating project in Supabase:', error);
        throw new Error(`Failed to create project: ${error.message}`);
      }
      
      return data;
    } catch (error) {
      console.error('Error creating project:', error);
      throw new Error('Failed to create project');
    }
  }

  async updateProject(id: number, project: Partial<Project>): Promise<Project | undefined> {
    try {
      // Generate a slug if title is being updated and slug is not provided
      if (project.title && !project.slug) {
        project.slug = this.generateSlug(project.title);
      }
      
      const { data, error } = await getSupabaseClient()
        .from('projects')
        .update(project)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error(`Error updating project with ID ${id} in Supabase:`, error);
        return undefined;
      }
      
      return data || undefined;
    } catch (error) {
      console.error(`Error updating project with ID ${id}:`, error);
      return undefined;
    }
  }

  // Project Media operations
  async getProjectMedia(projectId: number): Promise<ProjectMedia[]> {
    try {
      // Removed the sortOrder since the column doesn't exist
      const { data, error } = await getSupabaseClient()
        .from('project_media')
        .select('*')
        .eq('projectId', projectId);
      
      if (error) {
        console.error(`Error fetching media for project ${projectId} from Supabase:`, error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error(`Error fetching media for project ${projectId}:`, error);
      return [];
    }
  }

  async addProjectMedia(media: InsertProjectMedia): Promise<ProjectMedia | undefined> {
    try {
      const { data, error } = await getSupabaseClient()
        .from('project_media')
        .insert([media])
        .select()
        .single();
      
      if (error) {
        console.error('Error adding project media in Supabase:', error);
        return undefined;
      }
      
      return data || undefined;
    } catch (error) {
      console.error('Error adding project media:', error);
      return undefined;
    }
  }

  async deleteProjectMedia(id: number): Promise<boolean> {
    try {
      // First get the media to find the URL
      const { data: media, error: getError } = await supabase
        .from('project_media')
        .select('*')
        .eq('id', id)
        .single();
      
      if (getError || !media) {
        console.error(`Error retrieving media with ID ${id} for deletion:`, getError);
        return false;
      }
      
      // Try to delete from storage if URL exists
      if (media.url) {
        try {
          const urlPath = new URL(media.url).pathname.split('/').pop();
          if (urlPath) {
            await deleteFile(STORAGE_BUCKETS.PROJECT_IMAGES, urlPath);
          }
        } catch (storageError) {
          console.error(`Error deleting media file from storage:`, storageError);
        }
      }
      
      // Delete the record
      const { error: deleteError } = await supabase
        .from('project_media')
        .delete()
        .eq('id', id);
      
      if (deleteError) {
        console.error(`Error deleting media with ID ${id} from Supabase:`, deleteError);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error(`Error deleting project media with ID ${id}:`, error);
      return false;
    }
  }

  // Project Impact Metrics operations
  async getProjectImpactMetrics(projectId: number): Promise<ProjectImpactMetrics[]> {
    try {
      const { data, error } = await getSupabaseClient()
        .from('project_impact_metrics')
        .select('*')
        .eq('projectId', projectId)
        .order('id', { ascending: true });
      
      if (error) {
        console.error(`Error fetching impact metrics for project ${projectId} from Supabase:`, error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error(`Error fetching impact metrics for project ${projectId}:`, error);
      return [];
    }
  }

  async addProjectImpactMetric(metric: InsertProjectImpactMetrics): Promise<ProjectImpactMetrics | undefined> {
    try {
      const { data, error } = await getSupabaseClient()
        .from('project_impact_metrics')
        .insert([metric])
        .select()
        .single();
      
      if (error) {
        console.error('Error adding project impact metric in Supabase:', error);
        return undefined;
      }
      
      return data || undefined;
    } catch (error) {
      console.error('Error adding project impact metric:', error);
      return undefined;
    }
  }

  // Helper method to apply points change and create transaction record
  async applyPointsChange(
    userId: number,
    pointsChange: number,
    transactionData: {
      transactionType: 'welcome_bonus' | 'donation' | 'redemption';
      donationId?: number;
      projectId?: number;
      supportAmount?: number;
      redemptionId?: number;
      rewardId?: number;
      description?: string;
    }
  ): Promise<void> {
    const supabaseClient = getSupabaseClient(); // Ensure client is initialized
    
    // Try RPC function first (atomic at database level)
    // If RPC function doesn't exist, fall back to manual implementation
    try {
      const { data: rpcResult, error: rpcError } = await supabaseClient.rpc('apply_points_change', {
        p_user_id: userId,
        p_points_change: pointsChange,
        p_transaction_type: transactionData.transactionType,
        p_donation_id: transactionData.donationId || null,
        p_project_id: transactionData.projectId || null,
        p_support_amount: transactionData.supportAmount || null,
        p_reward_id: transactionData.rewardId || null,
        p_redemption_id: transactionData.redemptionId || null,
        p_description: transactionData.description || null
      });
      
      if (!rpcError && rpcResult) {
        // RPC function succeeded (atomic operation)
        console.log(`[applyPointsChange] ✅ Used RPC function. User ${userId}: ${pointsChange > 0 ? '+' : ''}${pointsChange} points. Balance: ${rpcResult.old_balance} → ${rpcResult.new_balance}`);
        return;
      }
      
      // RPC function doesn't exist or failed - check if it's a "function not found" error
      if (rpcError && rpcError.code === '42883') {
        // Function doesn't exist - use fallback
        console.log(`[applyPointsChange] ⚠️ RPC function not found (code 42883), using fallback implementation`);
      } else if (rpcError) {
        // Other RPC error - log and use fallback
        console.warn(`[applyPointsChange] ⚠️ RPC function error: ${rpcError.message}, using fallback implementation`);
      }
    } catch (rpcException) {
      // RPC call threw an exception - use fallback
      console.warn(`[applyPointsChange] ⚠️ RPC call exception: ${rpcException instanceof Error ? rpcException.message : String(rpcException)}, using fallback implementation`);
    }
    
    // FALLBACK: Manual implementation with retry logic for race conditions
    const maxRetries = 3;
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Get current balance
        const { data: user, error: userError } = await supabaseClient
          .from('users')
          .select('impactPoints')
          .eq('id', userId)
          .single();
        
        if (userError || !user) {
          throw new Error(`User ${userId} not found: ${userError?.message}`);
        }
        
        const currentBalance = (user as any).impactPoints ?? 0;
        const newBalance = currentBalance + pointsChange;
        
        // CRITICAL FIX: Update balance FIRST, then create transaction
        // This ensures that if balance update fails, no orphaned transaction is created
        // Update cached balance in users table (use camelCase for users table)
        const { error: updateError } = await supabaseClient
          .from('users')
          .update({ impactPoints: newBalance })
          .eq('id', userId);
        
        if (updateError) {
          throw new Error(`Failed to update balance: ${updateError.message}`);
        }
        
        // Only create transaction AFTER balance update succeeds
        // Insert transaction record (use snake_case for user_transactions table)
        const { error: transactionError } = await supabaseClient
          .from('user_transactions')
          .insert([{
            user_id: userId,
            transaction_type: transactionData.transactionType,
            project_id: transactionData.projectId || null,
            donation_id: transactionData.donationId || null,
            support_amount: transactionData.supportAmount || null,
            reward_id: transactionData.rewardId || null,
            redemption_id: transactionData.redemptionId || null,
            points_change: pointsChange,
            points_balance_after: newBalance,
            description: transactionData.description || null,
            metadata: null
          }]);
        
        if (transactionError) {
          // CRITICAL: If transaction creation fails, rollback the balance update
          console.error(`[applyPointsChange] ❌ Transaction creation failed, rolling back balance update...`);
          const { error: rollbackError } = await supabaseClient
            .from('users')
            .update({ impactPoints: currentBalance })
            .eq('id', userId);
          
          if (rollbackError) {
            console.error(`[applyPointsChange] ❌ CRITICAL: Failed to rollback balance update!`, rollbackError);
          } else {
            console.log(`[applyPointsChange] ✅ Balance rollback successful`);
          }
          
          throw new Error(`Failed to create transaction: ${transactionError.message}`);
        }
        
        console.log(`[applyPointsChange] ✅ Fallback method (attempt ${attempt}). User ${userId}: ${pointsChange > 0 ? '+' : ''}${pointsChange} points. Balance: ${currentBalance} → ${newBalance}`);
        return; // Success - exit retry loop
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // If this is the last attempt, throw the error
        if (attempt === maxRetries) {
          console.error(`[applyPointsChange] ❌ Failed after ${maxRetries} attempts for user ${userId}:`, lastError);
          throw lastError;
        }
        
        // Wait before retry (exponential backoff: 50ms, 100ms, 200ms)
        const waitTime = 50 * Math.pow(2, attempt - 1);
        console.warn(`[applyPointsChange] ⚠️ Attempt ${attempt} failed for user ${userId}, retrying in ${waitTime}ms...`, lastError.message);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
    
    // Should never reach here, but TypeScript needs it
    throw lastError || new Error(`Failed to apply points change for user ${userId} after ${maxRetries} attempts`);
  }

  // Donation operations
  async createDonation(donation: InsertDonation): Promise<Donation> {
    console.log('[createDonation] Called with:', {
      userId: donation.userId,
      projectId: donation.projectId,
      amount: donation.amount,
      impactPoints: donation.impactPoints,
      status: donation.status
    });
    try {
      // Update the project's raised amount and donors count
      try {
        const { data: project } = await supabase
          .from('projects')
          .select('raised, donors')
          .eq('id', donation.projectId)
          .single();
        
        if (project) {
          await supabase
            .from('projects')
            .update({
              raised: (project.raised || 0) + donation.amount,
              donors: (project.donors || 0) + 1
            })
            .eq('id', donation.projectId);
        }
      } catch (projectError) {
        console.error(`Error updating project stats for donation:`, projectError);
      }
      
      // Create the donation record
      // ACTUAL DATABASE SCHEMA USES camelCase (userId, projectId, impactPoints, createdAt)
      // stripeSessionId column does not exist in database - removed
      const donationForInsert: any = {
        userId: donation.userId,           // ✅ camelCase (matches actual DB)
        projectId: donation.projectId,     // ✅ camelCase (matches actual DB)
        amount: donation.amount,            // ✅ matches actual DB
        impactPoints: donation.impactPoints, // ✅ camelCase (matches actual DB)
        status: donation.status || 'pending' // ✅ matches actual DB
      };
      
      // Add optional impact tracking fields (Phase 1 Migration)
      if (donation.tipAmount !== undefined) {
        donationForInsert.tipAmount = donation.tipAmount;
      }
      if (donation.calculatedImpact !== undefined) {
        donationForInsert.calculated_impact = donation.calculatedImpact;
      }
      if (donation.impactSnapshot) {
        donationForInsert.impact_snapshot = donation.impactSnapshot;
      }
      if (donation.generatedTextPastEn) {
        donationForInsert.generated_text_past_en = donation.generatedTextPastEn;
      }
      if (donation.generatedTextPastDe) {
        donationForInsert.generated_text_past_de = donation.generatedTextPastDe;
      }
      
      // Check service role key for logging
      const SUPABASE_URL_FOR_LOG = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
      const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '';
      
      console.log('[createDonation] ========== DB INSERT ATTEMPT ==========');
      console.log('[createDonation] Supabase URL:', SUPABASE_URL_FOR_LOG ? `✅ Set (${SUPABASE_URL_FOR_LOG.substring(0, 30)}...)` : '❌ MISSING');
      console.log('[createDonation] Using key type:', SUPABASE_SERVICE_ROLE_KEY ? 'SERVICE_ROLE_KEY ✅' : 'ANON_KEY ⚠️');
      console.log('[createDonation] Inserting with camelCase (actual DB format):', JSON.stringify(donationForInsert, null, 2));
      console.log('[createDonation] Table: donations');
      console.log('[createDonation] Columns being inserted:', Object.keys(donationForInsert).join(', '));
      
      const { data, error } = await getSupabaseClient()
        .from('donations')
        .insert([donationForInsert])
        .select()
        .single();
      
      if (error) {
        console.error('[createDonation] ========== SUPABASE ERROR ==========');
        console.error('[createDonation] ❌ Error message:', error.message);
        console.error('[createDonation] ❌ Error code:', error.code);
        console.error('[createDonation] ❌ Error details:', error.details);
        console.error('[createDonation] ❌ Error hint:', error.hint);
        console.error('[createDonation] ❌ Full error object:', JSON.stringify(error, null, 2));
        console.error('[createDonation] ❌ Failed insert data:', JSON.stringify(donationForInsert, null, 2));
        console.error('[createDonation] ❌ Stack trace:');
        console.error(new Error().stack);
        console.error('[createDonation] ========== END ERROR ==========');
        throw new Error(`Failed to create donation: ${error.message}`);
      }
      
      console.log('[createDonation] ✅ Donation created successfully:', data?.id);
      
      // ============================================
      // STEP 3: Create transaction record and update balance
      // ============================================
      // Non-blocking: errors don't fail donation creation
      // Uses existing applyPointsChange() method (verified in Step 1)
      if (donation.impactPoints > 0) {
        try {
          await this.applyPointsChange(
            donation.userId,
            donation.impactPoints, // positive points earned
            {
              transactionType: 'donation',
              donationId: data.id,
              projectId: donation.projectId,
              supportAmount: donation.amount,
              description: `Support: $${donation.amount} for project ${donation.projectId}`
            }
          );
          console.log(`[createDonation] ✅ Transaction created for donation ${data.id}, user ${donation.userId}, +${donation.impactPoints} points`);
        } catch (transactionError) {
          // Non-critical: log error but don't fail the donation creation
          console.error(`[createDonation] ⚠️ Failed to create transaction for donation ${data.id}:`, transactionError);
          // Continue - donation was created successfully
        }
      }
      
      return data;
    } catch (error) {
      console.error('Error creating donation:', error);
      throw new Error('Failed to create donation');
    }
  }

  async getUserDonations(userId: number): Promise<Donation[]> {
    try {
      const { data, error } = await getSupabaseClient()
        .from('donations')
        .select('*, projects(title, slug, imageUrl)')
        .eq('userId', userId)
        .order('createdAt', { ascending: false });
      
      if (error) {
        console.error(`Error fetching donations for user ${userId} from Supabase:`, error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error(`Error fetching donations for user ${userId}:`, error);
      return [];
    }
  }

  async getProjectDonations(projectId: number): Promise<Donation[]> {
    try {
      const { data, error } = await getSupabaseClient()
        .from('donations')
        .select('*')
        .eq('projectId', projectId)
        .order('createdAt', { ascending: false });
      
      if (error) {
        console.error(`Error fetching donations for project ${projectId} from Supabase:`, error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error(`Error fetching donations for project ${projectId}:`, error);
      return [];
    }
  }

  // Reward operations
  async getRewards(): Promise<Reward[]> {
    try {
      const { data, error } = await getSupabaseClient()
        .from('rewards')
        .select('*');
      
      if (error) {
        console.error('Error fetching rewards from Supabase:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Error fetching rewards:', error);
      return [];
    }
  }

  async getReward(id: number): Promise<Reward | undefined> {
    try {
      const { data, error } = await getSupabaseClient()
        .from('rewards')
        .select('*')
        .eq('id', id)
        .limit(1)
        .single();
      
      if (error) {
        console.error(`Error retrieving reward with ID ${id} from Supabase:`, error);
        return undefined;
      }
      
      return data || undefined;
    } catch (error) {
      console.error(`Error retrieving reward with ID ${id}:`, error);
      return undefined;
    }
  }

  async getFeaturedRewards(): Promise<Reward[]> {
    try {
      const { data, error } = await getSupabaseClient()
        .from('rewards')
        .select('*')
        .eq('featured', true);
      
      if (error) {
        console.error('Error fetching featured rewards from Supabase:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Error fetching featured rewards:', error);
      return [];
    }
  }

  async createReward(reward: InsertReward): Promise<Reward> {
    try {
      const { data, error } = await getSupabaseClient()
        .from('rewards')
        .insert([reward])
        .select()
        .single();
      
      if (error) {
        console.error('Error creating reward in Supabase:', error);
        throw new Error(`Failed to create reward: ${error.message}`);
      }
      
      return data;
    } catch (error) {
      console.error('Error creating reward:', error);
      throw new Error('Failed to create reward');
    }
  }

  // Redemption operations
  async createRedemption(redemption: InsertRedemption): Promise<Redemption> {
    let redemptionId: number | null = null;
    
    try {
      // Step 1: Insert redemption record
      console.log('[createRedemption] ========== REDEMPTION INSERT ATTEMPT ==========');
      console.log('[createRedemption] Input data:', JSON.stringify(redemption, null, 2));
      
      // Try camelCase first (as per user's table structure)
      let redemptionData: any = {
        userId: redemption.userId,
        rewardId: redemption.rewardId,
        pointsSpent: redemption.pointsSpent,
        status: redemption.status || 'pending'
      };
      
      console.log('[createRedemption] Attempting insert with camelCase:', JSON.stringify(redemptionData, null, 2));
      console.log('[createRedemption] Table: redemptions');
      console.log('[createRedemption] Columns: userId, rewardId, pointsSpent, status');
      console.log('[createRedemption] VERIFY rewardId value:', redemptionData.rewardId);
      
      let { data, error } = await getSupabaseClient()
        .from('redemptions')
        .insert([redemptionData])
        .select()
        .single();
      
      // If camelCase fails, try snake_case as fallback
      if (error && (error.message.includes('column') || error.code === '42703' || error.code === 'PGRST116')) {
        console.log('[createRedemption] ========== CAMELCASE FAILED, TRYING SNAKE_CASE ==========');
        console.log('[createRedemption] Error message:', error.message);
        console.log('[createRedemption] Error code:', error.code);
        console.log('[createRedemption] Error details:', error.details);
        console.log('[createRedemption] Error hint:', error.hint);
        
        redemptionData = {
          user_id: redemption.userId,
          reward_id: redemption.rewardId,
          points_spent: redemption.pointsSpent,
          status: redemption.status || 'pending'
        };
        console.log('[createRedemption] Attempting insert with snake_case:', JSON.stringify(redemptionData, null, 2));
        console.log('[createRedemption] VERIFY reward_id value:', redemptionData.reward_id);
        
        const result = await getSupabaseClient()
          .from('redemptions')
          .insert([redemptionData])
          .select()
          .single();
        
        data = result.data;
        error = result.error;
      }
      
      if (error) {
        console.error('[createRedemption] ========== SUPABASE ERROR ==========');
        console.error('[createRedemption] ❌ Error message:', error.message);
        console.error('[createRedemption] ❌ Error code:', error.code);
        console.error('[createRedemption] ❌ Error details:', error.details);
        console.error('[createRedemption] ❌ Error hint:', error.hint);
        console.error('[createRedemption] ❌ Full error object:', JSON.stringify(error, null, 2));
        console.error('[createRedemption] ❌ Failed insert data:', JSON.stringify(redemptionData, null, 2));
        console.error('[createRedemption] ❌ Stack trace:');
        console.error(new Error().stack);
        console.error('[createRedemption] ========== END ERROR ==========');
        throw new Error(`Failed to create redemption: ${error.message}`);
      }
      
      redemptionId = data.id;
      console.log(`[createRedemption] ✅ Redemption record created: ${redemptionId}`);
      console.log(`[createRedemption] ✅ Full redemption data:`, JSON.stringify(data, null, 2));
      console.log(`[createRedemption] ✅ VERIFY rewardId in returned data:`, data.rewardId || data.reward_id);
      console.log(`[createRedemption] ✅ VERIFY userId in returned data:`, data.userId || data.user_id);
      console.log(`[createRedemption] ✅ VERIFY pointsSpent in returned data:`, data.pointsSpent || data.points_spent);
      console.log(`[createRedemption] ========== REDEMPTION INSERT SUCCESS ==========`);
      
      // VERIFY: Query the database directly to confirm the redemption was saved
      console.log(`[createRedemption] VERIFY: Querying database to confirm redemption ${redemptionId} exists...`);
      try {
        const verifyResult = await getSupabaseClient()
          .from('redemptions')
          .select('*')
          .eq('id', redemptionId)
          .single();

        if (verifyResult.error) {
          console.error(`[createRedemption] ❌ VERIFY FAILED: Could not find redemption ${redemptionId} in database!`, verifyResult.error);
          throw new Error(`Redemption ${redemptionId} was not found in database after creation!`);
        } else {
          console.log(`[createRedemption] ✅ VERIFY SUCCESS: Redemption ${redemptionId} found in database:`, JSON.stringify(verifyResult.data, null, 2));
          console.log(`[createRedemption] ✅ VERIFY rewardId in database:`, verifyResult.data.rewardId || verifyResult.data.reward_id);
        }
      } catch (verifyError) {
        console.error(`[createRedemption] ❌ VERIFY ERROR:`, verifyError);
        throw verifyError; // Don't proceed if redemption doesn't exist
      }
      
      // Step 2: Create transaction and update balance (atomic operation)
      // CRITICAL: If applyPointsChange fails, we must rollback the redemption
      // to maintain data consistency (no orphaned transactions)
      console.log(`[createRedemption] ========== STEP 2: CREATING TRANSACTION ==========`);
      console.log(`[createRedemption] Redemption ${redemptionId} confirmed in database, proceeding with transaction...`);
      console.log(`[createRedemption] About to call applyPointsChange with:`, {
        userId: redemption.userId,
        pointsChange: -redemption.pointsSpent,
        redemptionId: data.id,
        rewardId: redemption.rewardId
      });
      
      try {
        await this.applyPointsChange(
          redemption.userId,
          -redemption.pointsSpent, // negative (points are deducted)
          {
            transactionType: 'redemption',
            redemptionId: data.id,
            rewardId: redemption.rewardId,
            description: `Redeemed reward ${redemption.rewardId}`
          }
        );
        
        console.log(`[createRedemption] ✅ Redemption ${redemptionId} completed: Transaction created for user ${redemption.userId}, -${redemption.pointsSpent} points`);
        
        // FINAL VERIFY: Double-check redemption still exists after transaction
        const finalVerify = await getSupabaseClient()
          .from('redemptions')
          .select('id, rewardId, userId')
          .eq('id', redemptionId)
          .single();
        
        if (finalVerify.error || !finalVerify.data) {
          console.error(`[createRedemption] ⚠️ WARNING: Redemption ${redemptionId} not found after transaction creation!`, finalVerify.error);
        } else {
          console.log(`[createRedemption] ✅ FINAL VERIFY: Redemption ${redemptionId} still exists:`, finalVerify.data);
        }
        
        console.log(`[createRedemption] ========== REDEMPTION COMPLETE ==========`);
        return data;
        
      } catch (pointsError) {
        // Step 3: Rollback - delete redemption if applyPointsChange failed
        // This prevents orphaned transactions (transactions with redemption_id but no redemption)
        console.error(`[createRedemption] ========== ROLLBACK ATTEMPT ==========`);
        console.error(`[createRedemption] ❌ applyPointsChange failed for redemption ${redemptionId}, attempting rollback...`);
        console.error(`[createRedemption] ❌ Points error:`, pointsError);
        console.error(`[createRedemption] ❌ Points error message:`, pointsError instanceof Error ? pointsError.message : String(pointsError));
        console.error(`[createRedemption] ❌ Points error stack:`, pointsError instanceof Error ? pointsError.stack : 'No stack');
        
        try {
          console.log(`[createRedemption] Attempting to delete redemption ${redemptionId} from database...`);
          // Try both camelCase and snake_case for the delete operation
          let deleteResult = await getSupabaseClient()
            .from('redemptions')
            .delete()
            .eq('id', redemptionId)
            .select();
          
          // If that fails, try with different column name format
          if (deleteResult.error && deleteResult.error.message.includes('column')) {
            console.log(`[createRedemption] Delete with 'id' failed, trying alternative...`);
            deleteResult = await getSupabaseClient()
              .from('redemptions')
              .delete()
              .eq('id', redemptionId)
              .select();
          }
          
          const { error: deleteError, data: deleteData } = deleteResult;
          
          if (deleteError) {
            console.error(`[createRedemption] ❌ CRITICAL: Failed to rollback redemption ${redemptionId}:`, deleteError);
            console.error(`[createRedemption] ❌ Rollback error details:`, JSON.stringify(deleteError, null, 2));
            // Log to monitoring system in production
          } else {
            console.log(`[createRedemption] ✅ Rollback successful: Redemption ${redemptionId} deleted`);
            console.log(`[createRedemption] ✅ Deleted data:`, JSON.stringify(deleteData, null, 2));
          }
        } catch (rollbackError) {
          console.error(`[createRedemption] ❌ CRITICAL: Exception during rollback:`, rollbackError);
          console.error(`[createRedemption] ❌ Rollback exception:`, rollbackError instanceof Error ? rollbackError.message : String(rollbackError));
        }
        console.error(`[createRedemption] ========== END ROLLBACK ==========`);
        
        // Re-throw the original error
        throw pointsError;
      }
      
    } catch (error) {
      console.error('[createRedemption] ❌ Error creating redemption:', error);
      throw new Error('Failed to create redemption');
    }
  }

  async getUserRedemptions(userId: number): Promise<Redemption[]> {
    try {
      // Table uses camelCase: userId, rewardId, createdAt
      const { data, error } = await getSupabaseClient()
        .from('redemptions')
        .select('*, rewards(title, imageUrl, partnerLevel)')
        .eq('userId', userId)
        .order('createdAt', { ascending: false });
      
      if (error) {
        console.error(`Error fetching redemptions for user ${userId} from Supabase:`, error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error(`Error fetching redemptions for user ${userId}:`, error);
      return [];
    }
  }

  /**
   * Get user redemptions with full reward data
   * Returns redemptions with complete reward information for dashboard display
   */
  async getUserRedemptionsWithRewards(userId: number): Promise<Array<{
    redemption: Redemption;
    reward: Reward;
    pointsSpent: number;
    redemptionDate: Date | null;
    status: string;
  }>> {
    try {
      console.log(`[getUserRedemptionsWithRewards] Fetching redemptions for user ${userId}...`);
      
      // CRITICAL FIX: The automatic FK join is broken - it always joins to reward ID 37
      // Instead, we'll fetch redemptions first, then manually join rewards by rewardId
      // This ensures we get the correct reward for each redemption
      
      // Step 1: Fetch redemptions (without join)
      let { data: redemptions, error: redemptionsError } = await getSupabaseClient()
        .from('redemptions')
        .select('*')
        .eq('userId', userId)
        .order('createdAt', { ascending: false });
      
      // If camelCase fails, try snake_case
      if (redemptionsError && (redemptionsError.message.includes('column') || redemptionsError.code === '42703' || redemptionsError.code === 'PGRST116')) {
        console.log(`[getUserRedemptionsWithRewards] camelCase query failed, trying snake_case...`, redemptionsError.message);
        const result = await getSupabaseClient()
          .from('redemptions')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        
        redemptions = result.data;
        redemptionsError = result.error;
      }
      
      console.log(`[getUserRedemptionsWithRewards] Query result:`, {
        redemptionsCount: redemptions?.length || 0,
        error: redemptionsError ? redemptionsError.message : null
      });
      
      if (redemptionsError) {
        console.error(`[getUserRedemptionsWithRewards] Error fetching redemptions:`, redemptionsError);
        throw redemptionsError;
      }
      
      if (!redemptions || redemptions.length === 0) {
        console.log(`[getUserRedemptionsWithRewards] No redemptions found for user ${userId}`);
        return [];
      }
      
      // Step 2: Get unique reward IDs from redemptions
      const rewardIds = [...new Set(redemptions.map(r => r.rewardId || r.reward_id).filter(Boolean))];
      console.log(`[getUserRedemptionsWithRewards] Found ${rewardIds.length} unique reward IDs:`, rewardIds);
      
      // Step 3: Fetch all rewards in one query
      const { data: rewardsData, error: rewardsError } = await getSupabaseClient()
        .from('rewards')
        .select(`
          *,
          brands (*)
        `)
        .in('id', rewardIds);
      
      if (rewardsError) {
        console.error(`[getUserRedemptionsWithRewards] Error fetching rewards:`, rewardsError);
        throw rewardsError;
      }
      
      // Step 4: Create a map of rewardId -> reward for fast lookup
      const rewardsMap = new Map();
      if (rewardsData) {
        rewardsData.forEach(reward => {
          rewardsMap.set(reward.id, reward);
        });
      }
      
      console.log(`[getUserRedemptionsWithRewards] Loaded ${rewardsMap.size} rewards into map`);
      
      if (redemptionsError) {
        console.error(`[getUserRedemptionsWithRewards] Error fetching redemptions for user ${userId}:`, redemptionsError);
        console.error(`[getUserRedemptionsWithRewards] Error details:`, JSON.stringify(redemptionsError, null, 2));
        return [];
      }
      
      if (!redemptions || redemptions.length === 0) {
        console.log(`[getUserRedemptionsWithRewards] No redemptions found for user ${userId}`);
        return [];
      }
      
      console.log(`[getUserRedemptionsWithRewards] Found ${redemptions.length} redemptions for user ${userId}`);
      
      // Step 5: Map redemptions to return structure with manually joined rewards
      const result = redemptions.map((redemption: any) => {
        const redemptionDate = redemption.createdAt || redemption.created_at;
        
        // CRITICAL: Get rewardId from redemption (camelCase or snake_case)
        const finalRewardId = redemption.rewardId || redemption.reward_id;
        
        // MANUAL JOIN: Look up reward from map using rewardId
        const reward = finalRewardId ? rewardsMap.get(finalRewardId) : null;
        
        // Log for debugging
        console.log(`[getUserRedemptionsWithRewards] Redemption ${redemption.id}:`, {
          rewardId_from_redemption: finalRewardId,
          reward_found_in_map: reward ? { id: reward.id, title: reward.title } : 'NOT FOUND',
          rewardIds_in_map: Array.from(rewardsMap.keys())
        });
        
        if (!finalRewardId) {
          console.error(`[getUserRedemptionsWithRewards] ⚠️ WARNING: No rewardId found for redemption ${redemption.id}!`);
          console.error(`[getUserRedemptionsWithRewards] Full redemption object:`, JSON.stringify(redemption, null, 2));
        }
        
        if (!reward) {
          console.error(`[getUserRedemptionsWithRewards] ⚠️ WARNING: Reward ${finalRewardId} not found in map for redemption ${redemption.id}!`);
          console.error(`[getUserRedemptionsWithRewards] Available reward IDs in map:`, Array.from(rewardsMap.keys()));
        }
        
        return {
          redemption: {
            id: redemption.id,
            userId: redemption.userId || redemption.user_id,
            rewardId: finalRewardId, // Use rewardId directly (camelCase from table)
            pointsSpent: redemption.pointsSpent || redemption.points_spent,
            status: redemption.status || 'pending',
            createdAt: redemptionDate ? new Date(redemptionDate) : null
          } as Redemption,
          reward: reward as Reward, // Manually joined reward from map
          pointsSpent: redemption.pointsSpent || redemption.points_spent || 0,
          redemptionDate: redemptionDate ? new Date(redemptionDate) : null,
          status: redemption.status || 'pending'
        };
      });
      
      return result;
    } catch (error) {
      console.error(`Error fetching redemptions with rewards for user ${userId}:`, error);
      return [];
    }
  }

  // Impact statistics
  async getUserImpact(userId: number): Promise<UserImpact> {
    try {
      // ✅ Get user's current Impact Points from users table
      const user = await this.getUser(userId);
      if (!user) {
        console.error(`User ${userId} not found`);
        return {
          impactPoints: 0,
          impactPointsChange: 0,
          amountDonated: 0,
          amountDonatedChange: 0,
          projectsSupported: 0,
          projectsSupportedChange: 0,
          userStatus: "aspirer",
        };
      }
      
      // Get current Impact Points from users table
      // Debug: log what we actually got
      console.log(`[getUserImpact] User object keys:`, Object.keys(user));
      console.log(`[getUserImpact] User object:`, JSON.stringify(user, null, 2));
      
      // Use camelCase columns (snake_case columns removed)
      const impactPoints = (user as any).impactPoints ?? 0;
      const totalDonations = (user as any).totalDonations ?? 0;
      const welcome_shown = (user as any).welcome_shown === true;
      const welcome_bonus_applied = (user as any).welcome_bonus_applied === true;
      
      console.log(`[getUserImpact] User ${userId}: impactPoints=${impactPoints}, totalDonations=${totalDonations}`);
      
      // Get total donations amount
      const { data: donations, error: donationsError } = await supabase
        .from('donations')
        .select('amount, projectId')
        .eq('userId', userId);
      
      if (donationsError) {
        console.error(`Error fetching donation impact for user ${userId}:`, donationsError);
        // Still return user's Impact Points even if donations fail
        const amountDonated = totalDonations; // Already extracted above
        
        // Determine user status based on impactPoints >= 100 (not amountDonated)
        const userStatus: "aspirer" | "changemaker" = impactPoints >= 100 ? "changemaker" : "aspirer";
        
        return {
          impactPoints,
          impactPointsChange: 0,
          amountDonated,
          amountDonatedChange: 0,
          projectsSupported: 0,
          projectsSupportedChange: 0,
          userStatus,
          welcome_shown,
          welcome_bonus_applied,
        };
      }
      
      // Calculate totals from donations
      const amountDonated = donations?.reduce((sum, d) => sum + d.amount, 0) || 0;
      
      // Count distinct projects supported
      const distinctProjectIds = new Set<number>();
      donations?.forEach(d => distinctProjectIds.add(d.projectId));
      const projectsSupported = distinctProjectIds.size;
      
      // Determine user status based on impactPoints >= 100 (not amountDonated)
      const userStatus: "aspirer" | "changemaker" = impactPoints >= 100 ? "changemaker" : "aspirer";
      
      return {
        impactPoints, // ✅ From users table
        impactPointsChange: 0, // TODO: Calculate change if needed
        amountDonated,
        amountDonatedChange: 0, // TODO: Calculate change if needed
        projectsSupported,
        projectsSupportedChange: 0, // TODO: Calculate change if needed
        userStatus,
        welcome_shown,
        welcome_bonus_applied,
      };
    } catch (error) {
      console.error(`Error calculating user impact for user ${userId}:`, error);
      return {
        impactPoints: 0,
        impactPointsChange: 0,
        amountDonated: 0,
        amountDonatedChange: 0,
        projectsSupported: 0,
        projectsSupportedChange: 0,
        userStatus: "aspirer",
        welcome_shown: false,
        welcome_bonus_applied: false,
      };
    }
  }

  async getUserImpactHistory(userId: number): Promise<UserImpactHistory[]> {
    try {
      // Get donations grouped by month
      const { data: donations, error: donationsError } = await supabase
        .from('donations')
        .select('amount, impactPoints, createdAt')
        .eq('userId', userId)
        .order('createdAt', { ascending: true });
      
      if (donationsError) {
        console.error(`Error fetching donation history for user ${userId}:`, donationsError);
        return [];
      }
      
      // Group by month
      const monthlyData: Record<string, { date: Date, amount: number, impactPoints: number }> = {};
      
      donations?.forEach(donation => {
        const date = new Date(donation.createdAt);
        const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = {
            date: new Date(date.getFullYear(), date.getMonth(), 1),
            amount: 0,
            impactPoints: 0,
          };
        }
        
        monthlyData[monthKey].amount += donation.amount;
        monthlyData[monthKey].impactPoints += donation.impactPoints || 0;
      });
      
      // Convert to array and sort by date
      return Object.values(monthlyData)
        .map(({ date, amount, impactPoints }) => ({
          date,
          amount,
          impactPoints,
        }))
        .sort((a, b) => a.date.getTime() - b.date.getTime());
    } catch (error) {
      console.error(`Error calculating user impact history for user ${userId}:`, error);
      return [];
    }
  }

  async getUserSupportedProjects(userId: number): Promise<Project[]> {
    try {
      // Get distinct project IDs from user donations
      const { data: donations, error: donationsError } = await supabase
        .from('donations')
        .select('projectId')
        .eq('userId', userId);
      
      if (donationsError || !donations || donations.length === 0) {
        console.error(`Error or no donations found for user ${userId}:`, donationsError);
        return [];
      }
      
      // Get unique project IDs
      const projectIds = [...new Set(donations.map(d => d.projectId))];
      
      // Get project details
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .in('id', projectIds);
      
      if (projectsError) {
        console.error(`Error fetching supported projects for user ${userId}:`, projectsError);
        return [];
      }
      
      return projects || [];
    } catch (error) {
      console.error(`Error fetching supported projects for user ${userId}:`, error);
      return [];
    }
  }

  /**
   * Get supported projects with aggregated donation data
   * Returns projects with total amount, total impact, donation count, and last donation date
   */
  async getUserSupportedProjectsWithDonations(userId: number): Promise<Array<{
    project: Project;
    totalAmount: number;
    totalImpactPoints: number;
    donationCount: number;
    lastDonationDate: Date | null;
    donations: Donation[];
  }>> {
    try {
      // Get all donations for the user with project details
      const { data: donations, error: donationsError } = await supabase
        .from('donations')
        .select('*')
        .eq('userId', userId)
        .order('createdAt', { ascending: false });
      
      if (donationsError || !donations || donations.length === 0) {
        console.error(`Error or no donations found for user ${userId}:`, donationsError);
        return [];
      }
      
      // Group donations by projectId
      const donationsByProject = new Map<number, Donation[]>();
      donations.forEach((donation: any) => {
        const projectId = donation.projectId;
        if (!donationsByProject.has(projectId)) {
          donationsByProject.set(projectId, []);
        }
        donationsByProject.get(projectId)!.push(donation);
      });
      
      // Get unique project IDs
      const projectIds = Array.from(donationsByProject.keys());
      
      // Get project details
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .in('id', projectIds);
      
      if (projectsError) {
        console.error(`Error fetching supported projects for user ${userId}:`, projectsError);
        return [];
      }
      
      // Aggregate data per project
      // Universal Fund is treated like a normal project - no special aggregation needed
      const result = (projects || []).map((project: any) => {
        const projectDonations = donationsByProject.get(project.id) || [];
        
        // Calculate aggregates
        const totalAmount = projectDonations.reduce((sum, d: any) => sum + (d.amount || 0), 0);
        const totalImpactPoints = projectDonations.reduce((sum, d: any) => sum + (d.impactPoints || 0), 0);
        const donationCount = projectDonations.length;
        
        // Get last donation date (most recent)
        const lastDonation = projectDonations[0]; // Already sorted by createdAt DESC
        const lastDonationDate = lastDonation?.createdAt 
          ? new Date(lastDonation.createdAt) 
          : null;
        
        return {
          project: project as Project,
          totalAmount,
          totalImpactPoints,
          donationCount,
          lastDonationDate,
          donations: projectDonations as Donation[]
        };
      });
      
      // Sort by last donation date (most recent first)
      result.sort((a, b) => {
        if (!a.lastDonationDate && !b.lastDonationDate) return 0;
        if (!a.lastDonationDate) return 1;
        if (!b.lastDonationDate) return -1;
        return b.lastDonationDate.getTime() - a.lastDonationDate.getTime();
      });
      
      return result;
    } catch (error) {
      console.error(`Error fetching supported projects with donations for user ${userId}:`, error);
      return [];
    }
  }

  // File upload methods
  async uploadProjectImage(projectId: number, file: Buffer | Blob | File, filename: string, contentType: string): Promise<string | null> {
    const filePath = `${projectId}/${Date.now()}_${filename}`;
    return await uploadFile(STORAGE_BUCKETS.PROJECT_IMAGES, filePath, file, contentType);
  }

  async uploadProjectDocument(projectId: number, file: Buffer | Blob | File, filename: string, contentType: string): Promise<string | null> {
    const filePath = `${projectId}/${Date.now()}_${filename}`;
    return await uploadFile(STORAGE_BUCKETS.PROJECT_DOCUMENTS, filePath, file, contentType);
  }

  async uploadProjectVideo(projectId: number, file: Buffer | Blob | File, filename: string, contentType: string): Promise<string | null> {
    const filePath = `${projectId}/${Date.now()}_${filename}`;
    return await uploadFile(STORAGE_BUCKETS.PROJECT_VIDEOS, filePath, file, contentType);
  }
}