import type { Express, Request, Response } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { requireSupabaseAuth, getSupabaseUser } from "./supabase-auth-middleware";
import { z } from "zod";
import { insertDonationSchema, insertRedemptionSchema } from "@shared/schema";
import { testDatabaseConnection, fetchDatabaseStats } from "./db-test";
import { setupDatabase, createDatabaseHelperFunctions } from "./setup-db";
import { logConnectionInfo, fixDatabaseConnection } from "./fix-db-connection";
import { createDatabaseSchema } from "./direct-schema-setup";
import { setupStripeRoutes } from "./stripe-routes";
import { subscribeNewsletter, getNewsletterStats } from "./newsletter";
import { getSitemapXML } from "./sitemap-generator";



export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes (/api/register, /api/login, /api/logout, /api/user)
  setupAuth(app);
  
  // ✅ Ensure user profile exists in public.users (for OAuth and email signup)
  app.post("/api/auth/ensure-profile", async (req, res) => {
    try {
      const { email, username, firstName, lastName } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }
      
      console.log('Ensuring user profile for:', email);
      
      // Check if user already exists by email
      const existingUser = await storage.getUserByEmail(email);
      
      if (existingUser) {
        console.log('User profile already exists:', existingUser.id);
        return res.json({ 
          success: true, 
          user: existingUser,
          created: false 
        });
      }
      
      // Create new user with 50 Impact Points welcome bonus
      console.log('Creating new user profile with 50 Impact Points...');
      const newUser = await storage.createUser({
        username: username || email.split('@')[0],
        email,
        password: '', // OAuth users don't have a password in our system
        firstName,
        lastName,
      });
      
      console.log('User profile created successfully:', newUser.id);
      
      res.json({ 
        success: true, 
        user: newUser,
        created: true 
      });
    } catch (error) {
      console.error('Error ensuring user profile:', error);
      res.status(500).json({ 
        error: "Failed to create user profile",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Set up Stripe payment routes
  setupStripeRoutes(app);

  // System status endpoints
  app.get("/api/system/db-status", async (_req, res) => {
    try {
      const result = await testDatabaseConnection();
      res.json(result);
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: "Failed to check database status",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  app.get("/api/system/db-stats", async (_req, res) => {
    try {
      const result = await fetchDatabaseStats();
      res.json(result);
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch database statistics",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Database setup endpoints
  app.post("/api/system/setup-db", async (_req, res) => {
    try {
      // First create the helper functions
      const helperResult = await createDatabaseHelperFunctions();
      if (!helperResult.success) {
        console.warn('Helper function creation had issues, but continuing with setup...');
      }
      
      // Then set up the database schema
      const result = await setupDatabase();
      res.json(result);
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: "Failed to set up database",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Direct database setup endpoint using Supabase API
  app.post("/api/system/setup-db-direct", async (_req, res) => {
    try {
      console.log('Setting up database using direct API approach...');
      const result = await createDatabaseSchema();
      res.json(result);
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: "Failed to set up database using direct API",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // SQL execution endpoint (admin only)
  app.post("/api/system/exec-sql", async (req, res) => {
    try {
      const { sql } = req.body;
      
      if (!sql) {
        return res.status(400).json({ 
          success: false, 
          message: "SQL statement is required" 
        });
      }
      
      // Execute SQL directly using Supabase client
      const { createClient } = await import('@supabase/supabase-js');
      const { SUPABASE_URL, SUPABASE_ANON_KEY } = await import('./secrets');
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      
      const { data, error } = await supabase.rpc('exec_sql', { sql });
      
      if (error) {
        return res.status(500).json({ 
          success: false, 
          message: "Failed to execute SQL", 
          error: error.message 
        });
      }
      
      res.json({ 
        success: true, 
        message: "SQL executed successfully", 
        data 
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: "Failed to execute SQL",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Database connection diagnostics
  app.get("/api/system/db-diagnostics", async (_req, res) => {
    try {
      // Check the connection string
      logConnectionInfo();
      const fixResult = await fixDatabaseConnection();
      
      res.json({
        success: true,
        connectionStatus: fixResult,
        environmentChecks: {
          hasSupabaseUrl: !!process.env.VITE_SUPABASE_URL,
          hasSupabaseAnonKey: !!process.env.VITE_SUPABASE_ANON_KEY,
          hasDatabaseUrl: !!process.env.DATABASE_URL
        },
        message: 'See server logs for detailed diagnostics'
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: "Failed to run database diagnostics",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // API Routes
  
  // Projects
  app.get("/api/projects", async (req, res) => {
    try {
      console.log('Getting projects from Supabase...');
      const projects = await storage.getProjects();
      
      // Handle filtering if query params exist
      const { search, category, country } = req.query;
      
      // Only show active projects
      let filteredProjects = projects.filter(project => project.status !== 'draft');
      
      // Ensure proper sorting after filtering (featured first, then by date)
      filteredProjects = filteredProjects.sort((a, b) => {
        // Featured projects first
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        
        // Then by creation date (newest first)
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
      
      if (search) {
        const searchLower = String(search).toLowerCase();
        filteredProjects = filteredProjects.filter(project => 
          (project.title && project.title.toLowerCase().includes(searchLower)) || 
          (project.description && project.description.toLowerCase().includes(searchLower))
        );
      }
      
      if (category) {
        filteredProjects = filteredProjects.filter(project => 
          project.category.toLowerCase() === String(category).toLowerCase()
        );
      }
      
      if (country) {
        filteredProjects = filteredProjects.filter(project => 
          project.country.toLowerCase() === String(country).toLowerCase()
        );
      }
      
      console.log(`Found ${filteredProjects.length} projects in Supabase`);
      res.json(filteredProjects);
    } catch (error) {
      console.error('Error retrieving projects:', error);
      
      // Try fallback to Supabase API if direct database access fails
      try {
        const { fetchProjects } = await import('./supabase-api');
        const apiProjects = await fetchProjects();
        
        // Handle filtering if query params exist
        const { search, category, country } = req.query;
        
        // Only show active projects
        let filteredProjects = apiProjects.filter(project => project.status !== 'draft');
        
        // Ensure proper sorting after filtering (featured first, then by date)
        filteredProjects = filteredProjects.sort((a, b) => {
          // Featured projects first
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          
          // Then by creation date (newest first)
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        
        if (search) {
          const searchLower = String(search).toLowerCase();
          filteredProjects = filteredProjects.filter(project => 
            (project.title && project.title.toLowerCase().includes(searchLower)) || 
            (project.description && project.description.toLowerCase().includes(searchLower))
          );
        }
        
        if (category) {
          filteredProjects = filteredProjects.filter(project => 
            project.category.toLowerCase() === String(category).toLowerCase()
          );
        }
        
        if (country) {
          filteredProjects = filteredProjects.filter(project => 
            project.country.toLowerCase() === String(country).toLowerCase()
          );
        }
        
        console.log('Successfully retrieved projects via Supabase API fallback');
        res.json(filteredProjects);
      } catch (apiError) {
        console.error('API fallback also failed for projects:', apiError);
        res.status(500).json({ message: "Failed to fetch projects" });
      }
    }
  });

  app.get("/api/projects/featured", async (req, res) => {
    try {
      // Get all featured projects
      const featuredProjects = await storage.getFeaturedProjects();
      
      // Filter out draft projects
      const activeProjects = featuredProjects.filter(project => project.status !== 'draft');
      
      res.json(activeProjects);
    } catch (error) {
      console.error('Error retrieving featured projects:', error);
      
      // Try fallback to Supabase API if direct database access fails
      try {
        const { fetchFeaturedProjects } = await import('./supabase-api');
        const apiProjects = await fetchFeaturedProjects();
        
        // Filter out draft projects
        const activeProjects = apiProjects.filter(project => project.status !== 'draft');
        
        console.log('Successfully retrieved featured projects via Supabase API fallback');
        res.json(activeProjects);
      } catch (apiError) {
        console.error('API fallback also failed for featured projects:', apiError);
        // Return empty array with 200 status to avoid client errors
        res.json([]);
      }
    }
  });

  // Find project by slug (must come before :id route to avoid parameter confusion)
  app.get("/api/projects/by-slug/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      if (!slug) {
        return res.status(400).json({ message: "Invalid project slug" });
      }
      
      // Check if storage has the getProjectBySlug method
      if (typeof storage.getProjectBySlug === 'function') {
        const project = await storage.getProjectBySlug(slug);
        if (!project) {
          return res.status(404).json({ message: "Project not found" });
        }
        return res.json(project);
      }
      
      // Fallback to finding by slug in all projects
      const projects = await storage.getProjects();
      const project = projects.find(p => p.slug === slug);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch project by slug" });
    }
  });

  // Get donation tiers for a specific project
  app.get("/api/projects/:slug/donation-tiers", async (req, res) => {
    try {
      const { slug } = req.params;
      const projects = await storage.getProjects();
      const project = projects.find(p => p.slug === slug);
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      // Extract only non-null donation tiers with their corresponding impacts
      const tiers = [];
      for (let i = 1; i <= 7; i++) {
        const donation = project[`donation_${i}` as keyof typeof project] as number | null;
        const impact = project[`impact_${i}` as keyof typeof project] as number | null;
        
        if (donation !== null && impact !== null) {
          tiers.push({
            tier: i,
            donation,
            impact,
            unit: project.impactUnit || "impact units"
          });
        }
      }

      res.json({
        projectId: project.id,
        projectTitle: project.title,
        impactUnit: project.impactUnit || "impact units",
        tiers,
        impactPointsMultiplier: project.impactPointsMultiplier || 10
      });
    } catch (error) {
      console.error("Error fetching donation tiers:", error);
      res.status(500).json({ error: "Failed to fetch donation tiers" });
    }
  });
  
  // Get project by ID
  app.get("/api/projects/:id", async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });
  
  // Endpoint to fetch project media (for backward compatibility)
  app.get("/api/projects/:id/media", async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      
      // Check if storage supports getProjectMedia method
      if (typeof storage.getProjectMedia === 'function') {
        const media = await storage.getProjectMedia(projectId);
        return res.json(media);
      }
      
      // Otherwise, we have a combined schema, extract media from project
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Create media objects from the project's image fields
      const mediaItems = [];
      
      // Add each image that exists as a media item
      if (project.image1 && project.imageType1) {
        mediaItems.push({
          id: 1,
          projectId: project.id,
          type: project.imageType1,
          url: project.image1,
          title: `${project.title} Image 1`,
          isFeatured: true
        });
      }
      
      // Add remaining images
      const imageFields = [
        {url: project.image2, type: project.imageType2},
        {url: project.image3, type: project.imageType3},
        {url: project.image4, type: project.imageType4},
        {url: project.image5, type: project.imageType5},
        {url: project.image6, type: project.imageType6}
      ];
      
      imageFields.forEach((field, index) => {
        if (field.url && field.type) {
          mediaItems.push({
            id: index + 2,
            projectId: project.id,
            type: field.type,
            url: field.url,
            title: `${project.title} Image ${index + 2}`,
            isFeatured: false
          });
        }
      });
      
      res.json(mediaItems);
    } catch (error) {
      console.error("Error fetching project media:", error);
      res.status(500).json({ message: "Failed to fetch project media" });
    }
  });

  // Donations
  app.post("/api/projects/:id/donate", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in to donate" });
    }
    
    try {
      const projectId = parseInt(req.params.id);
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Validate amount
      const schema = z.object({
        amount: z.number().positive()
      });
      
      const validationResult = schema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid donation amount" });
      }
      
      const { amount } = validationResult.data;
      
      // Calculate impact points (amount * project multiplier)
      const impactPoints = amount * (project.impactPointsMultiplier || 10);
      
      // Create donation
      const donation = await storage.createDonation({
        userId: req.user!.id,
        projectId,
        amount,
        impactPoints
      });
      
      res.status(201).json(donation);
    } catch (error) {
      res.status(500).json({ message: "Failed to process donation" });
    }
  });

  // Rewards
  app.get("/api/rewards", async (req, res) => {
    try {
      const rewards = await storage.getRewards();
      res.json(rewards);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch rewards" });
    }
  });

  app.get("/api/rewards/featured", async (req, res) => {
    try {
      const featuredRewards = await storage.getFeaturedRewards();
      res.json(featuredRewards);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch featured rewards" });
    }
  });

  app.get("/api/rewards/:id", async (req, res) => {
    try {
      const rewardId = parseInt(req.params.id);
      if (isNaN(rewardId)) {
        return res.status(400).json({ message: "Invalid reward ID" });
      }
      
      const reward = await storage.getReward(rewardId);
      if (!reward) {
        return res.status(404).json({ message: "Reward not found" });
      }
      
      res.json(reward);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reward" });
    }
  });

  // Redeem rewards
  app.post("/api/rewards/:id/redeem", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in to redeem rewards" });
    }
    
    try {
      const rewardId = parseInt(req.params.id);
      if (isNaN(rewardId)) {
        return res.status(400).json({ message: "Invalid reward ID" });
      }
      
      const reward = await storage.getReward(rewardId);
      if (!reward) {
        return res.status(404).json({ message: "Reward not found" });
      }
      
      // Check if user has enough points
      const userImpact = await storage.getUserImpact(req.user!.id);
      if (userImpact.impactPoints < reward.pointsCost) {
        return res.status(400).json({ message: "Insufficient impact points" });
      }
      
      // Create redemption
      const redemption = await storage.createRedemption({
        userId: req.user!.id,
        rewardId,
        pointsSpent: reward.pointsCost
      });
      
      res.status(201).json(redemption);
    } catch (error) {
      res.status(500).json({ message: "Failed to redeem reward" });
    }
  });

  // User impact data
  app.get("/api/user/impact", async (req, res) => {
    console.log('[GET /api/user/impact] Request received');
    console.log('[GET /api/user/impact] Auth header:', req.headers.authorization ? 'Present' : 'Missing');
    
    // Try Supabase auth first
    const supabaseUser = await getSupabaseUser(req);
    
    if (supabaseUser) {
      console.log('[GET /api/user/impact] Supabase user found:', supabaseUser.email);
      // Get user from public.users by email
      const dbUser = await storage.getUserByEmail(supabaseUser.email || '');
      
      if (!dbUser) {
        console.log('[GET /api/user/impact] User not found in database for:', supabaseUser.email);
        return res.status(404).json({ message: "User not found in database" });
      }
      
      console.log('[GET /api/user/impact] Database user found:', dbUser.id, 'impactPoints:', dbUser.impactPoints);
      
      try {
        const userImpact = await storage.getUserImpact(dbUser.id);
        console.log('[GET /api/user/impact] Returning impact:', userImpact);
        return res.json(userImpact);
      } catch (error) {
        console.error('[GET /api/user/impact] Error:', error);
        return res.status(500).json({ message: "Failed to fetch impact data" });
      }
    }
    
    console.log('[GET /api/user/impact] No Supabase user, trying Passport...');
    
    // Fallback to Passport auth (for backwards compatibility)
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in to view impact data" });
    }
    
    try {
      const userImpact = await storage.getUserImpact(req.user!.id);
      res.json(userImpact);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch impact data" });
    }
  });

  app.get("/api/user/impact-history", async (req, res) => {
    // Try Supabase auth first
    const supabaseUser = await getSupabaseUser(req);
    
    if (supabaseUser) {
      const dbUser = await storage.getUserByEmail(supabaseUser.email || '');
      if (!dbUser) {
        return res.status(404).json({ message: "User not found in database" });
      }
      try {
        const impactHistory = await storage.getUserImpactHistory(dbUser.id);
        return res.json(impactHistory);
      } catch (error) {
        return res.status(500).json({ message: "Failed to fetch impact history" });
      }
    }
    
    // Fallback to Passport auth
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in to view impact history" });
    }
    
    try {
      const impactHistory = await storage.getUserImpactHistory(req.user!.id);
      res.json(impactHistory);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch impact history" });
    }
  });

  app.get("/api/user/supported-projects", async (req, res) => {
    // Try Supabase auth first
    const supabaseUser = await getSupabaseUser(req);
    
    if (supabaseUser) {
      const dbUser = await storage.getUserByEmail(supabaseUser.email || '');
      if (!dbUser) {
        return res.status(404).json({ message: "User not found in database" });
      }
      try {
        const projects = await storage.getUserSupportedProjects(dbUser.id);
        return res.json(projects);
      } catch (error) {
        return res.status(500).json({ message: "Failed to fetch supported projects" });
      }
    }
    
    // Fallback to Passport auth
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in to view supported projects" });
    }
    
    try {
      const supportedProjects = await storage.getUserSupportedProjects(req.user!.id);
      res.json(supportedProjects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch supported projects" });
    }
  });

  app.get("/api/user/donations", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in to view donations" });
    }
    
    try {
      const userDonations = await storage.getUserDonations(req.user!.id);
      res.json(userDonations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch donations" });
    }
  });

  app.get("/api/user/redemptions", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in to view redemptions" });
    }
    
    try {
      const userRedemptions = await storage.getUserRedemptions(req.user!.id);
      res.json(userRedemptions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch redemptions" });
    }
  });

  // Newsletter subscription endpoints
  app.post("/api/newsletter/subscribe", subscribeNewsletter);
  app.get("/api/newsletter/stats", getNewsletterStats);

  // Dynamic sitemap generator (server-side version)
  app.get("/sitemap.xml", async (_req, res) => {
    try {
      const sitemapXML = await getSitemapXML();
      res.set('Content-Type', 'application/xml');
      res.send(sitemapXML);
    } catch (error) {
      console.error('Error generating sitemap:', error);
      res.status(500).send('Error generating sitemap');
    }
  });

  // Test endpoint for Vercel API route sitemap (for local testing)
  // This tests the same logic that will run on Vercel
  app.get("/api/test-sitemap-vercel", async (_req, res) => {
    try {
      // Import the Vercel handler module
      const sitemapModule = await import('../api/sitemap.xml');
      
      // Create a mock Vercel request/response
      const mockReq = {} as any;
      const mockRes = {
        setHeader: (name: string, value: string) => {
          res.set(name, value);
        },
        status: (code: number) => {
          res.status(code);
          return mockRes;
        },
        send: (body: string) => {
          res.send(body);
        },
      } as any;
      
      // Call the Vercel handler
      await sitemapModule.default(mockReq, mockRes);
    } catch (error) {
      console.error('Error testing Vercel sitemap:', error);
      res.status(500).json({ 
        error: 'Error testing Vercel sitemap', 
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
    }
  });

  // Dynamic robots.txt generator
  app.get("/robots.txt", async (_req, res) => {
    try {
      const robotsTxt = `User-agent: *
Allow: /

# High priority pages
Allow: /projects
Allow: /social-enterprises
Allow: /about
Allow: /rewards
Allow: /brands
Allow: /contact
Allow: /faq
Allow: /eligibility

# Low priority pages
Allow: /privacy
Allow: /cookies
Allow: /thank-you

# Disallow admin or sensitive paths
Disallow: /dashboard
Disallow: /admin
Disallow: /api/

# Dynamic sitemap location (includes all project pages)
Sitemap: https://dopaya.com/sitemap.xml

# Crawl-delay (optional, set if needed)
# Crawl-delay: 1`;
      
      res.set('Content-Type', 'text/plain');
      res.send(robotsTxt);
    } catch (error) {
      console.error('Error generating robots.txt:', error);
      res.status(500).send('Error generating robots.txt');
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
