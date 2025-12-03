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

// Define storage buckets
const STORAGE_BUCKETS = {
  PROJECT_IMAGES: 'project_images',
  PROJECT_DOCUMENTS: 'project_documents',
  PROJECT_VIDEOS: 'project_videos'
};

const scryptAsync = promisify(scrypt);

// Use memory store for session storage instead of Postgres due to connection issues
const MemoryStore = createMemoryStore(session);

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
    // Use memory store instead of PostgreSQL for sessions due to connection issues
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
      const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
      return result.length > 0 ? result[0] : undefined;
    } catch (error) {
      console.error('Error retrieving user:', error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
      return result.length > 0 ? result[0] : undefined;
    } catch (error) {
      console.error('Error retrieving user by username:', error);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
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
        console.error('Error retrieving user by email:', error);
        return undefined;
      }
      
      return data as User;
    } catch (error) {
      console.error('Error retrieving user by email:', error);
      return undefined;
    }
  }

  async createUser(user: InsertUser): Promise<User> {
    try {
      // Hash password if provided
      let hashedPassword = user.password;
      if (user.password && user.password.length > 0) {
        const salt = randomBytes(16).toString('hex');
        const buf = (await scryptAsync(user.password, salt, 64)) as Buffer;
        hashedPassword = `${buf.toString('hex')}.${salt}`;
      }
      
      const { data, error } = await supabase
        .from('users')
        .insert({
          username: user.username,
          password: hashedPassword,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          impactPoints: 50, // Welcome bonus for new users
          totalDonations: 0
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating user:', error);
        throw new Error(`Failed to create user: ${error.message}`);
      }
      
      return data as User;
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
        .eq('status', 'active')
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching projects from Supabase:', error);
        return [];
      }
      
      // Apply manual sorting to ensure correct order
      if (data && data.length > 0) {
        console.log('Applying manual sorting to ensure featured projects are first...');
        const sortedData = data.sort((a, b) => {
          // Featured projects first
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          
          // Then by creation date (newest first)
          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
          return dateB - dateA;
        });
        
        // Log first few projects to verify sorting
        console.log('First 3 projects after manual sorting:');
        sortedData.slice(0, 3).forEach((project, index) => {
          console.log(`${index + 1}. ${project.title} - featured: ${project.featured}, created: ${project.created_at}`);
        });
        
        console.log(`Found ${sortedData.length} projects in Supabase`);
        return sortedData;
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
      const result = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
      return result.length > 0 ? result[0] : undefined;
    } catch (error) {
      console.error(`Error retrieving project with id ${id}:`, error);
      return undefined;
    }
  }

  async getProjectBySlug(slug: string): Promise<Project | undefined> {
    try {
      const result = await db.select().from(projects).where(eq(projects.slug, slug)).limit(1);
      return result.length > 0 ? result[0] : undefined;
    } catch (error) {
      console.error(`Error retrieving project with slug ${slug}:`, error);
      return undefined;
    }
  }

  async getFeaturedProjects(): Promise<Project[]> {
    try {
      return await db.select().from(projects)
        .where(and(
          eq(projects.status, 'active'),
          eq(projects.featured, true)
        ))
        .orderBy(desc(projects.createdAt));
    } catch (error) {
      console.error('Error retrieving featured projects:', error);
      return [];
    }
  }

  async createProject(project: InsertProject): Promise<Project> {
    try {
      // Generate a slug if not provided
      if (!project.slug) {
        project.slug = this.generateSlug(project.title);
      }
      
      const [newProject] = await db.insert(projects).values({
        ...project,
        updatedAt: new Date()
      }).returning();
      
      return newProject;
    } catch (error) {
      console.error('Error creating project:', error);
      throw new Error('Failed to create project');
    }
  }

  async updateProject(id: number, project: Partial<Project>): Promise<Project | undefined> {
    try {
      const [updatedProject] = await db.update(projects)
        .set({
          ...project,
          updatedAt: new Date()
        })
        .where(eq(projects.id, id))
        .returning();
      
      return updatedProject;
    } catch (error) {
      console.error(`Error updating project with id ${id}:`, error);
      return undefined;
    }
  }

  // Project Media operations
  async getProjectMedia(projectId: number): Promise<ProjectMedia[]> {
    try {
      return await db.select()
        .from(projectMedia)
        .where(eq(projectMedia.projectId, projectId))
        .orderBy(asc(projectMedia.sortOrder));
    } catch (error) {
      console.error(`Error retrieving media for project ${projectId}:`, error);
      return [];
    }
  }

  async addProjectMedia(media: InsertProjectMedia): Promise<ProjectMedia | undefined> {
    try {
      const [newMedia] = await db.insert(projectMedia)
        .values(media)
        .returning();
      
      return newMedia;
    } catch (error) {
      console.error('Error adding project media:', error);
      return undefined;
    }
  }

  async deleteProjectMedia(id: number): Promise<boolean> {
    try {
      // First get the media item to find its URL
      const mediaItem = await db.select()
        .from(projectMedia)
        .where(eq(projectMedia.id, id))
        .limit(1);
      
      if (mediaItem.length === 0) {
        return false;
      }
      
      // Determine which bucket it's in based on type
      let bucketName = '';
      switch (mediaItem[0].type) {
        case 'image': bucketName = STORAGE_BUCKETS.PROJECT_IMAGES; break;
        case 'video': bucketName = STORAGE_BUCKETS.PROJECT_VIDEOS; break;
        case 'document': bucketName = STORAGE_BUCKETS.PROJECT_DOCUMENTS; break;
        default: bucketName = STORAGE_BUCKETS.PROJECT_IMAGES;
      }
      
      // Extract the file path from the URL
      const url = new URL(mediaItem[0].url);
      const filePath = url.pathname.split('/').pop() || '';
      
      // Delete from Storage if possible
      if (filePath) {
        await deleteFile(bucketName, filePath);
      }
      
      // Delete from database
      await db.delete(projectMedia)
        .where(eq(projectMedia.id, id));
      
      return true;
    } catch (error) {
      console.error(`Error deleting project media with id ${id}:`, error);
      return false;
    }
  }

  // Project Impact Metrics operations
  async getProjectImpactMetrics(projectId: number): Promise<ProjectImpactMetrics[]> {
    try {
      return await db.select()
        .from(projectImpactMetrics)
        .where(eq(projectImpactMetrics.projectId, projectId))
        .orderBy(asc(projectImpactMetrics.sortOrder));
    } catch (error) {
      console.error(`Error retrieving impact metrics for project ${projectId}:`, error);
      return [];
    }
  }

  async addProjectImpactMetric(metric: InsertProjectImpactMetrics): Promise<ProjectImpactMetrics | undefined> {
    try {
      const [newMetric] = await db.insert(projectImpactMetrics)
        .values(metric)
        .returning();
      
      return newMetric;
    } catch (error) {
      console.error('Error adding project impact metric:', error);
      return undefined;
    }
  }

  // Donation operations
  async createDonation(donation: InsertDonation): Promise<Donation> {
    try {
      const [newDonation] = await db.insert(donations)
        .values(donation)
        .returning();
      
      // Update project raised amount
      await db.update(projects)
        .set({
          raisedAmount: sqlExpression`${projects.raisedAmount} + ${donation.amount}`,
          updatedAt: new Date()
        })
        .where(eq(projects.id, donation.projectId));
      
      return newDonation;
    } catch (error) {
      console.error('Error creating donation:', error);
      throw new Error('Failed to create donation');
    }
  }

  async getUserDonations(userId: number): Promise<Donation[]> {
    try {
      return await db.select()
        .from(donations)
        .where(eq(donations.userId, userId))
        .orderBy(desc(donations.createdAt));
    } catch (error) {
      console.error(`Error retrieving donations for user ${userId}:`, error);
      return [];
    }
  }

  async getProjectDonations(projectId: number): Promise<Donation[]> {
    try {
      return await db.select()
        .from(donations)
        .where(eq(donations.projectId, projectId))
        .orderBy(desc(donations.createdAt));
    } catch (error) {
      console.error(`Error retrieving donations for project ${projectId}:`, error);
      return [];
    }
  }

  // Reward operations
  async getRewards(): Promise<Reward[]> {
    try {
      return await db.select().from(rewards);
    } catch (error) {
      console.error('Error retrieving rewards:', error);
      return [];
    }
  }

  async getReward(id: number): Promise<Reward | undefined> {
    try {
      const result = await db.select().from(rewards).where(eq(rewards.id, id)).limit(1);
      return result.length > 0 ? result[0] : undefined;
    } catch (error) {
      console.error(`Error retrieving reward with id ${id}:`, error);
      return undefined;
    }
  }

  async getFeaturedRewards(): Promise<Reward[]> {
    try {
      return await db.select().from(rewards).where(eq(rewards.featured, true));
    } catch (error) {
      console.error('Error retrieving featured rewards:', error);
      return [];
    }
  }

  async createReward(reward: InsertReward): Promise<Reward> {
    try {
      const [newReward] = await db.insert(rewards)
        .values(reward)
        .returning();
      
      return newReward;
    } catch (error) {
      console.error('Error creating reward:', error);
      throw new Error('Failed to create reward');
    }
  }

  // Redemption operations
  async createRedemption(redemption: InsertRedemption): Promise<Redemption> {
    try {
      const [newRedemption] = await db.insert(redemptions)
        .values(redemption)
        .returning();
      
      return newRedemption;
    } catch (error) {
      console.error('Error creating redemption:', error);
      throw new Error('Failed to create redemption');
    }
  }

  async getUserRedemptions(userId: number): Promise<Redemption[]> {
    try {
      return await db.select()
        .from(redemptions)
        .where(eq(redemptions.userId, userId))
        .orderBy(desc(redemptions.createdAt));
    } catch (error) {
      console.error(`Error retrieving redemptions for user ${userId}:`, error);
      return [];
    }
  }

  // Impact statistics
  async getUserImpact(userId: number): Promise<UserImpact> {
    try {
      // Get all donations for the user
      const userDonations = await this.getUserDonations(userId);
      // Get all redemptions for the user
      const userRedemptions = await this.getUserRedemptions(userId);
      
      // Calculate total impact points (earned - spent)
      const impactPointsEarned = userDonations.reduce((sum, donation) => sum + donation.impactPoints, 0);
      const impactPointsSpent = userRedemptions.reduce((sum, redemption) => sum + redemption.pointsSpent, 0);
      const impactPoints = impactPointsEarned - impactPointsSpent;
      
      // Calculate total amount donated
      const amountDonated = userDonations.reduce((sum, donation) => sum + donation.amount, 0);
      
      // Count unique projects supported
      const uniqueProjectIds = new Set(userDonations.map(donation => donation.projectId));
      const projectsSupported = uniqueProjectIds.size;
      
      // Simple two-status system:
      // - "aspirer": New user with 50 welcome points, no support yet
      // - "changemaker": Has supported at least one project ($10+)
      // Determine user status based on impactPoints >= 100 (not amountDonated)
      const userStatus: "aspirer" | "changemaker" = impactPoints >= 100 ? "changemaker" : "aspirer";
      
      // Hard-coded percentage changes for now - in a real app you would compare with previous time period
      return {
        impactPoints,
        impactPointsChange: 26,
        amountDonated,
        amountDonatedChange: 47,
        projectsSupported,
        projectsSupportedChange: -12,
        userStatus
      };
    } catch (error) {
      console.error(`Error calculating impact for user ${userId}:`, error);
      // Return default impact summary
      return {
        impactPoints: 0,
        impactPointsChange: 0,
        amountDonated: 0,
        amountDonatedChange: 0,
        projectsSupported: 0,
        projectsSupportedChange: 0,
        userStatus: "aspirer"
      };
    }
  }

  async getUserImpactHistory(userId: number): Promise<UserImpactHistory[]> {
    try {
      // Get all donations for the user
      const userDonations = await this.getUserDonations(userId);
      
      // Sort donations by date, handling null dates safely
      const sortedDonations = userDonations.sort(
        (a, b) => {
          const dateA = a.createdAt ? a.createdAt.getTime() : 0;
          const dateB = b.createdAt ? b.createdAt.getTime() : 0;
          return dateA - dateB;
        }
      );
      
      // If no donations, return empty history
      if (sortedDonations.length === 0) {
        return [];
      }
      
      // Group by month and accumulate points
      const history: UserImpactHistory[] = [];
      let runningTotal = 0;
      
      sortedDonations.forEach(donation => {
        if (donation.createdAt) {
          const date = donation.createdAt;
          const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getDate()}`;
          
          runningTotal += donation.impactPoints;
          
          history.push({
            date: monthYear,
            points: runningTotal
          });
        }
      });
      
      return history;
    } catch (error) {
      console.error(`Error retrieving impact history for user ${userId}:`, error);
      return [];
    }
  }

  async getUserSupportedProjects(userId: number): Promise<Project[]> {
    try {
      // Get all donations for the user
      const userDonations = await this.getUserDonations(userId);
      
      // Extract unique project IDs
      const projectIds = Array.from(new Set(userDonations.map(donation => donation.projectId)));
      
      if (projectIds.length === 0) {
        return [];
      }
      
      // Get all supported projects
      const supportedProjects: Project[] = [];
      for (const id of projectIds) {
        const project = await this.getProject(id);
        if (project) {
          supportedProjects.push(project);
        }
      }
      
      return supportedProjects;
    } catch (error) {
      console.error(`Error retrieving supported projects for user ${userId}:`, error);
      return [];
    }
  }

  // Utility methods for file uploads
  async uploadProjectImage(projectId: number, file: Buffer | Blob | File, filename: string, contentType: string): Promise<string | null> {
    try {
      // Create a clean filename
      const cleanFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `project_${projectId}/${cleanFilename}`;
      
      // Upload file to Supabase Storage
      const publicUrl = await uploadFile(
        STORAGE_BUCKETS.PROJECT_IMAGES,
        filePath,
        file,
        contentType
      );
      
      return publicUrl;
    } catch (error) {
      console.error('Error uploading project image:', error);
      return null;
    }
  }

  async uploadProjectDocument(projectId: number, file: Buffer | Blob | File, filename: string, contentType: string): Promise<string | null> {
    try {
      // Create a clean filename
      const cleanFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `project_${projectId}/${cleanFilename}`;
      
      // Upload file to Supabase Storage
      const publicUrl = await uploadFile(
        STORAGE_BUCKETS.PROJECT_DOCUMENTS,
        filePath,
        file,
        contentType
      );
      
      return publicUrl;
    } catch (error) {
      console.error('Error uploading project document:', error);
      return null;
    }
  }

  async uploadProjectVideo(projectId: number, file: Buffer | Blob | File, filename: string, contentType: string): Promise<string | null> {
    try {
      // Create a clean filename
      const cleanFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `project_${projectId}/${cleanFilename}`;
      
      // Upload file to Supabase Storage
      const publicUrl = await uploadFile(
        STORAGE_BUCKETS.PROJECT_VIDEOS,
        filePath,
        file,
        contentType
      );
      
      return publicUrl;
    } catch (error) {
      console.error('Error uploading project video:', error);
      return null;
    }
  }
}