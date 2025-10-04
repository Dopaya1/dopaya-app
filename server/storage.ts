import { 
  users, type User, type InsertUser,
  projects, type Project, type InsertProject,
  donations, type Donation, type InsertDonation,
  rewards, type Reward, type InsertReward,
  redemptions, type Redemption, type InsertRedemption,
  UserImpact, UserImpactHistory
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserDonationStats(userId: number, stats: { impactPointsToAdd: number; donationAmountToAdd: number }): Promise<void>;
  
  // Project operations
  getProjects(): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  getProjectBySlug?(slug: string): Promise<Project | undefined>; // Optional for backward compatibility
  getFeaturedProjects(): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<Project>): Promise<Project | undefined>;
  
  // Project Media operations (optional for backward compatibility)
  getProjectMedia?(projectId: number): Promise<any[]>;
  addProjectMedia?(media: any): Promise<any | undefined>;
  deleteProjectMedia?(id: number): Promise<boolean>;
  
  // Project Impact Metrics operations (optional)
  getProjectImpactMetrics?(projectId: number): Promise<any[]>;
  addProjectImpactMetric?(metric: any): Promise<any | undefined>;
  
  // Donation operations
  createDonation(donation: InsertDonation): Promise<Donation>;
  getUserDonations(userId: number): Promise<Donation[]>;
  getProjectDonations(projectId: number): Promise<Donation[]>;
  
  // Reward operations
  getRewards(): Promise<Reward[]>;
  getReward(id: number): Promise<Reward | undefined>;
  getFeaturedRewards(): Promise<Reward[]>;
  createReward(reward: InsertReward): Promise<Reward>;
  
  // Redemption operations
  createRedemption(redemption: InsertRedemption): Promise<Redemption>;
  getUserRedemptions(userId: number): Promise<Redemption[]>;
  
  // Impact statistics
  getUserImpact(userId: number): Promise<UserImpact>;
  getUserImpactHistory(userId: number): Promise<UserImpactHistory[]>;
  getUserSupportedProjects(userId: number): Promise<Project[]>;
  
  // File upload operations (optional)
  uploadProjectImage?(projectId: number, file: Buffer | Blob | File, filename: string, contentType: string): Promise<string | null>;
  uploadProjectDocument?(projectId: number, file: Buffer | Blob | File, filename: string, contentType: string): Promise<string | null>;
  uploadProjectVideo?(projectId: number, file: Buffer | Blob | File, filename: string, contentType: string): Promise<string | null>;
  
  // Session store
  sessionStore: any; // Using any to avoid TypeScript errors
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private projects: Map<number, Project>;
  private donations: Map<number, Donation>;
  private rewards: Map<number, Reward>;
  private redemptions: Map<number, Redemption>;
  sessionStore: any; // Using any to avoid TypeScript errors

  private userIdCounter: number = 1;
  private projectIdCounter: number = 1;
  private donationIdCounter: number = 1;
  private rewardIdCounter: number = 1;
  private redemptionIdCounter: number = 1;
  
  // Helper method to generate slugs
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  }

  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.donations = new Map();
    this.rewards = new Map();
    this.redemptions = new Map();
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // Cleanup expired sessions every 24h
    });
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: now,
      impactPoints: 0,
      totalDonations: 0
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserDonationStats(userId: number, stats: { impactPointsToAdd: number; donationAmountToAdd: number }): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.impactPoints = (user.impactPoints || 0) + stats.impactPointsToAdd;
      user.totalDonations = (user.totalDonations || 0) + stats.donationAmountToAdd;
      this.users.set(userId, user);
    }
  }

  // Project operations
  async getProjects(): Promise<Project[]> {
    const allProjects = Array.from(this.projects.values());
    
    // Sort by featured first (true values first), then by createdAt (newest first)
    return allProjects.sort((a, b) => {
      // First sort by featured status (featured projects first)
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      
      // If both have same featured status, sort by createdAt (newest first)
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  }

  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async getFeaturedProjects(): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(project => project.featured);
  }

  async createProject(project: InsertProject): Promise<Project> {
    const id = this.projectIdCounter++;
    const now = new Date();
    const newProject: Project = { 
      ...project, 
      id, 
      createdAt: now,
      email: project.email || null,
      impactPoints: project.impactPoints || 0,
      status: project.status || "active"
    };
    this.projects.set(id, newProject);
    return newProject;
  }

  async updateProject(id: number, project: Partial<Project>): Promise<Project | undefined> {
    const existingProject = this.projects.get(id);
    if (!existingProject) {
      return undefined;
    }
    
    const updatedProject = { ...existingProject, ...project };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  // Donation operations
  async createDonation(donation: InsertDonation): Promise<Donation> {
    const id = this.donationIdCounter++;
    const now = new Date();
    const newDonation: Donation = { 
      ...donation, 
      id, 
      createdAt: now,
      status: donation.status || "pending",
      stripeSessionId: donation.stripeSessionId || null
    };
    this.donations.set(id, newDonation);
    
    // Update project raised amount
    const project = this.projects.get(donation.projectId);
    if (project) {
      project.raised = (project.raised || 0) + donation.amount;
      this.projects.set(project.id, project);
    }
    
    return newDonation;
  }

  async getUserDonations(userId: number): Promise<Donation[]> {
    return Array.from(this.donations.values()).filter(
      donation => donation.userId === userId
    );
  }

  async getProjectDonations(projectId: number): Promise<Donation[]> {
    return Array.from(this.donations.values()).filter(
      donation => donation.projectId === projectId
    );
  }

  // Reward operations
  async getRewards(): Promise<Reward[]> {
    return Array.from(this.rewards.values());
  }

  async getReward(id: number): Promise<Reward | undefined> {
    return this.rewards.get(id);
  }

  async getFeaturedRewards(): Promise<Reward[]> {
    return Array.from(this.rewards.values()).filter(reward => reward.featured);
  }

  async createReward(reward: InsertReward): Promise<Reward> {
    const id = this.rewardIdCounter++;
    const newReward: Reward = { 
      ...reward, 
      id,
      featured: reward.featured || null,
      discount: reward.discount || null,
      discountName: reward.discountName || null,
      companyName: reward.companyName || null
    };
    this.rewards.set(id, newReward);
    return newReward;
  }

  // Redemption operations
  async createRedemption(redemption: InsertRedemption): Promise<Redemption> {
    const id = this.redemptionIdCounter++;
    const now = new Date();
    const newRedemption: Redemption = { ...redemption, id, createdAt: now };
    this.redemptions.set(id, newRedemption);
    return newRedemption;
  }

  async getUserRedemptions(userId: number): Promise<Redemption[]> {
    return Array.from(this.redemptions.values()).filter(
      redemption => redemption.userId === userId
    );
  }

  // Impact statistics
  async getUserImpact(userId: number): Promise<UserImpact> {
    const userDonations = await this.getUserDonations(userId);
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
    
    // Determine user level based on impact points
    let userLevel = "First Steps";
    if (impactPoints >= 20000) {
      userLevel = "Impact Legend";
    } else if (impactPoints >= 5000) {
      userLevel = "Changemaker";
    } else if (impactPoints >= 1000) {
      userLevel = "Supporter";
    }
    
    // Calculate percentage changes (mocked for now)
    // In a real application, these would be calculated based on historical data
    return {
      impactPoints,
      impactPointsChange: 26,
      amountDonated,
      amountDonatedChange: 47,
      projectsSupported,
      projectsSupportedChange: -12,
      userLevel
    };
  }

  async getUserImpactHistory(userId: number): Promise<UserImpactHistory[]> {
    const userDonations = await this.getUserDonations(userId);
    
    // Sort donations by date
    const sortedDonations = [...userDonations].sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    );
    
    // Group by month and accumulate points
    const history: UserImpactHistory[] = [];
    let runningTotal = 0;
    
    if (sortedDonations.length === 0) {
      // Return placeholder data for new users
      return [
        { date: "Jan 1", points: 0 },
        { date: "Feb 15", points: 3000 },
        { date: "Mar 3", points: 6500 },
        { date: "Apr 10", points: 13000 },
        { date: "May 1", points: 26000 },
      ];
    }
    
    sortedDonations.forEach(donation => {
      const date = donation.createdAt;
      const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getDate()}`;
      
      runningTotal += donation.impactPoints;
      
      history.push({
        date: monthYear,
        points: runningTotal
      });
    });
    
    return history;
  }

  async getUserSupportedProjects(userId: number): Promise<Project[]> {
    const userDonations = await this.getUserDonations(userId);
    const projectIds = new Set(userDonations.map(donation => donation.projectId));
    
    const supportedProjects: Project[] = [];
    for (const id of projectIds) {
      const project = await this.getProject(id);
      if (project) {
        supportedProjects.push(project);
      }
    }
    
    return supportedProjects;
  }

  async updateUserDonationStats(userId: number, stats: { impactPointsToAdd: number; donationAmountToAdd: number }): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      const updatedUser: User = {
        ...user,
        impactPoints: (user.impactPoints || 0) + stats.impactPointsToAdd,
        totalDonations: (user.totalDonations || 0) + stats.donationAmountToAdd
      };
      this.users.set(userId, updatedUser);
    }
  }

  // Initialize with sample data
  private initializeSampleData() {
    // Sample projects
    const sampleProjects: InsertProject[] = [
      {
        title: "CleanWater Initiative",
        description: "Providing clean water access to rural communities in East Africa.",
        slug: "cleanwater-initiative",
        imageUrl: "https://images.unsplash.com/photo-1508522750368-b5c883e1d917",
        category: "Education",
        country: "Kenya",
        status: "Active",
        summary: "Innovative water filtration technology that's transforming rural communities.",
        founderNames: "Michael Kimani, Sarah Ochieng",
        focusArea: "Water & Sanitation",
        impactMultiplier: 10,
        raisedAmount: 32500,
        featured: true,
        website: "https://cleanwater-initiative.org",
        foundedDate: "2019",
        teamSize: "10-20 employees",
        fundingStage: "Seed",
        totalFunding: "$850K",
        sdgGoals: ["Clean Water & Sanitation", "Good Health & Well-being", "No Poverty"]
      },
      {
        title: "CleanTech Energy",
        description: "Renewable energy solutions for off-grid communities in rural areas.",
        slug: "cleantech-energy",
        imageUrl: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8",
        category: "Energy",
        country: "India",
        status: "Active",
        summary: "Changing how rural communities access sustainable electricity.",
        founderNames: "Rahul Sharma, Priya Patel",
        focusArea: "Renewable Energy",
        impactMultiplier: 8,
        raisedAmount: 41200,
        featured: true,
        website: "https://cleantech-energy.co",
        foundedDate: "2018",
        teamSize: "25-50 employees",
        fundingStage: "Series A",
        totalFunding: "$2.5M",
        sdgGoals: ["Climate Action", "Affordable & Clean Energy", "Industry, Innovation & Infrastructure"]
      },
      {
        title: "HealthTech Global",
        description: "Expanding healthcare access through telemedicine in underserved areas.",
        slug: "healthtech-global",
        imageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40",
        category: "Health",
        country: "Brazil",
        status: "Active",
        summary: "Bringing healthcare to remote areas through innovative telemedicine.",
        founderNames: "Lucas Santos, Maria Silva",
        focusArea: "Healthcare Access",
        impactMultiplier: 12,
        raisedAmount: 28700,
        featured: true,
        website: "https://healthtech-global.com.br",
        foundedDate: "2020",
        teamSize: "15-30 employees",
        fundingStage: "Pre-seed",
        totalFunding: "$1.2M",
        sdgGoals: ["Good Health & Well-being", "Reduced Inequalities", "Sustainable Cities & Communities"]
      },
      {
        title: "MicroLoans",
        description: "Empowering entrepreneurs through microfinance in developing regions.",
        slug: "microloans",
        imageUrl: "https://images.unsplash.com/photo-1601761457448-de2b986181f1",
        category: "Finance",
        country: "Philippines",
        status: "Active",
        summary: "Creating economic opportunity through accessible small business loans.",
        founderNames: "Juan Reyes, Anna Torres",
        focusArea: "Economic Empowerment",
        impactMultiplier: 7,
        raisedAmount: 56400,
        featured: true,
        website: "https://microloans.ph",
        foundedDate: "2017",
        teamSize: "15-30 employees",
        fundingStage: "Series B",
        totalFunding: "$4.2M",
        sdgGoals: ["No Poverty", "Decent Work & Economic Growth", "Reduced Inequalities"]
      },
      {
        title: "Greenovate Solutions",
        description: "Building sustainable carbon capture innovations through decentralized carbon capture technology.",
        slug: "greenovate-solutions",
        imageUrl: "https://images.unsplash.com/photo-1590496793929-36417d3117ee",
        category: "Environment",
        country: "India",
        status: "Active",
        summary: "Carbon capture technologies for developing nations with minimal infrastructure impact.",
        founderNames: "Vikram Desai, Anjali Sharma",
        focusArea: "Sustainable Development",
        impactMultiplier: 10,
        raisedAmount: 72600,
        featured: false,
        website: "https://greenovate.co.in",
        foundedDate: "2019",
        teamSize: "20-40 employees",
        fundingStage: "Series A",
        totalFunding: "$3.1M",
        sdgGoals: ["Climate Action", "Responsible Consumption & Production", "Industry, Innovation & Infrastructure"]
      }
    ];
    
    for (const project of sampleProjects) {
      this.createProject(project);
    }
    
    // Sample rewards
    const sampleRewards: InsertReward[] = [
      {
        title: "20% Off Bundle",
        description: "Exclusive discount on eco-friendly travel packages to Southeast Asia.",
        imageUrl: "https://images.unsplash.com/photo-1508599589920-14cfa1c1fe4d",
        category: "Travel",
        partnerLevel: "Prime Partner",
        pointsCost: 10000,
        featured: true
      },
      {
        title: "Organic Gift Box",
        description: "Premium organic skincare set from sustainable beauty brand Gaia.",
        imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e",
        category: "Wellness",
        partnerLevel: "Partner",
        pointsCost: 5000,
        featured: true
      },
      {
        title: "Free 3-Month Subscription",
        description: "Premium access to eco-conscious media streaming platform.",
        imageUrl: "https://images.unsplash.com/photo-1588286887454-276ecbef548a",
        category: "Tech",
        partnerLevel: "Gold Partner",
        pointsCost: 7500,
        featured: true
      },
      {
        title: "Zero Waste Starter Kit",
        description: "Complete set of sustainable everyday essentials for eco-conscious living.",
        imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7",
        category: "Lifestyle",
        partnerLevel: "Partner",
        pointsCost: 3000,
        featured: true
      }
    ];
    
    for (const reward of sampleRewards) {
      this.createReward(reward);
    }
  }
}

import { SupabaseStorage } from './supabase-storage-new';

// Determine which storage implementation to use
// Use Supabase if DATABASE_URL is present, otherwise fall back to memory storage
const useSupabase = !!process.env.DATABASE_URL;

// Try to use Supabase storage, but fall back to in-memory storage if there's an error
let storageInstance: IStorage;
try {
  if (useSupabase) {
    storageInstance = new SupabaseStorage();
    console.log('Using Supabase storage implementation with updated client');
  } else {
    storageInstance = new MemStorage();
    console.log('Using in-memory storage implementation');
  }
} catch (error) {
  console.error('Error initializing Supabase storage, falling back to in-memory storage:', error);
  storageInstance = new MemStorage();
}

export const storage = storageInstance;

console.log(`Using ${useSupabase ? 'Supabase' : 'Memory'} storage implementation`);
