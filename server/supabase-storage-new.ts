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
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './secrets';
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

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
    const { data, error } = await supabase.storage
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
    const { data: urlData } = supabase.storage
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
    const { error } = await supabase.storage
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
      const { data, error } = await supabase
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
      const { data, error } = await supabase
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
      const { data, error } = await supabase
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

  async createUser(user: InsertUser): Promise<User> {
    try {
      // Hash the password
      const hashedPassword = await hashPassword(user.password);
      
      // Create the user record with 50 Impact Points welcome bonus
      const { data, error } = await supabase
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
      const { data, error } = await supabase
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
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .limit(1)
        .single();
      
      if (error) {
        console.error(`Error retrieving project with ID ${id} from Supabase:`, error);
        return undefined;
      }
      
      return data || undefined;
    } catch (error) {
      console.error(`Error retrieving project with ID ${id}:`, error);
      return undefined;
    }
  }

  async getProjectBySlug(slug: string): Promise<Project | undefined> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('slug', slug)
        .limit(1)
        .single();
      
      if (error) {
        console.error(`Error retrieving project with slug ${slug} from Supabase:`, error);
        return undefined;
      }
      
      return data || undefined;
    } catch (error) {
      console.error(`Error retrieving project with slug ${slug}:`, error);
      return undefined;
    }
  }

  async getFeaturedProjects(): Promise<Project[]> {
    try {
      console.log('Getting featured projects from Supabase...');
      const { data, error } = await supabase
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
      
      const { data, error } = await supabase
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
      
      const { data, error } = await supabase
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
      const { data, error } = await supabase
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
      const { data, error } = await supabase
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
      const { data, error } = await supabase
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
      const { data, error } = await supabase
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

  // Donation operations
  async createDonation(donation: InsertDonation): Promise<Donation> {
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
      const { data, error } = await supabase
        .from('donations')
        .insert([donation])
        .select()
        .single();
      
      if (error) {
        console.error('Error creating donation in Supabase:', error);
        throw new Error(`Failed to create donation: ${error.message}`);
      }
      
      return data;
    } catch (error) {
      console.error('Error creating donation:', error);
      throw new Error('Failed to create donation');
    }
  }

  async getUserDonations(userId: number): Promise<Donation[]> {
    try {
      const { data, error } = await supabase
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
      const { data, error } = await supabase
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
      const { data, error } = await supabase
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
      const { data, error } = await supabase
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
      const { data, error } = await supabase
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
      const { data, error } = await supabase
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
    try {
      const { data, error } = await supabase
        .from('redemptions')
        .insert([redemption])
        .select()
        .single();
      
      if (error) {
        console.error('Error creating redemption in Supabase:', error);
        throw new Error(`Failed to create redemption: ${error.message}`);
      }
      
      return data;
    } catch (error) {
      console.error('Error creating redemption:', error);
      throw new Error('Failed to create redemption');
    }
  }

  async getUserRedemptions(userId: number): Promise<Redemption[]> {
    try {
      const { data, error } = await supabase
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
      
      const impactPoints = (user as any).impactPoints ?? (user as any).impact_points ?? 0;
      const totalDonations = (user as any).totalDonations ?? (user as any).total_donations ?? 0;
      
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
        
        // Determine user status based on amountDonated (has made at least one donation)
        const userStatus: "aspirer" | "supporter" = amountDonated > 0 ? "supporter" : "aspirer";
        
        return {
          impactPoints,
          impactPointsChange: 0,
          amountDonated,
          amountDonatedChange: 0,
          projectsSupported: 0,
          projectsSupportedChange: 0,
          userStatus,
        };
      }
      
      // Calculate totals from donations
      const amountDonated = donations?.reduce((sum, d) => sum + d.amount, 0) || 0;
      
      // Count distinct projects supported
      const distinctProjectIds = new Set<number>();
      donations?.forEach(d => distinctProjectIds.add(d.projectId));
      const projectsSupported = distinctProjectIds.size;
      
      // Determine user status based on amountDonated (has made at least one donation)
      const userStatus: "aspirer" | "supporter" = amountDonated > 0 ? "supporter" : "aspirer";
      
      return {
        impactPoints, // ✅ From users table
        impactPointsChange: 0, // TODO: Calculate change if needed
        amountDonated,
        amountDonatedChange: 0, // TODO: Calculate change if needed
        projectsSupported,
        projectsSupportedChange: 0, // TODO: Calculate change if needed
        userStatus,
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