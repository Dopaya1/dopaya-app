import type { Express, Request, Response } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { requireSupabaseAuth, getSupabaseUser } from "./supabase-auth-middleware";
import { z } from "zod";
import { insertDonationSchema, insertRedemptionSchema, type User } from "@shared/schema";
import { testDatabaseConnection, fetchDatabaseStats } from "./db-test";
import { setupDatabase, createDatabaseHelperFunctions } from "./setup-db";
import { logConnectionInfo, fixDatabaseConnection } from "./fix-db-connection";
import { createDatabaseSchema } from "./direct-schema-setup";
import { setupStripeRoutes } from "./stripe-routes";
import { subscribeNewsletter, getNewsletterStats } from "./newsletter";
import { getSitemapXML } from "./sitemap-generator";
import { generateImpactSnapshot, hasImpact } from "./impact-generator";

// Normalize Supabase snake_case fields to camelCase for impact generator
function mapProjectImpactFields(project: any) {
  return {
    ...project,
    impactFactor: project.impactFactor ?? project.impact_factor,
    impactUnitSingularEn: project.impactUnitSingularEn ?? project.impact_unit_singular_en,
    impactUnitPluralEn: project.impactUnitPluralEn ?? project.impact_unit_plural_en,
    impactUnitSingularDe: project.impactUnitSingularDe ?? project.impact_unit_singular_de,
    impactUnitPluralDe: project.impactUnitPluralDe ?? project.impact_unit_plural_de,
    ctaTemplateEn: project.ctaTemplateEn ?? project.cta_template_en,
    ctaTemplateDe: project.ctaTemplateDe ?? project.cta_template_de,
    pastTemplateEn: project.pastTemplateEn ?? project.past_template_en,
    pastTemplateDe: project.pastTemplateDe ?? project.past_template_de,
    impactTiers: project.impactTiers ?? project.impact_tiers,
    impactPointsMultiplier: project.impactPointsMultiplier ?? project.impact_points_multiplier,
  };
}



export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes (/api/register, /api/login, /api/logout, /api/user)
  setupAuth(app);
  
  // User sync is now handled automatically by database trigger (handle_new_user)
  // No application-level sync needed
  
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
  
  // Debug endpoint to list all projects (for troubleshooting)
  app.get("/api/debug/projects", async (req, res) => {
    try {
      const projects = await storage.getProjects();
      return res.json({
        total: projects.length,
        storageType: storage.constructor?.name,
        projects: projects.map(p => ({ id: p.id, slug: p.slug, title: p.title }))
      });
    } catch (error) {
      console.error('[GET /api/debug/projects] Error:', error);
      return res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

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
        return res.status(404).json({ message: "Project not found" });
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
      res.status(500).json({ message: "Failed to fetch donation tiers" });
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
    try {
      console.log('[POST /api/projects/:id/donate] ========== REQUEST ==========');
      console.log('[POST /api/projects/:id/donate] Authorization header:', req.headers.authorization ? 'Present' : 'Missing');
      console.log('[POST /api/projects/:id/donate] Authorization header value:', req.headers.authorization ? req.headers.authorization.substring(0, 30) + '...' : 'N/A');
      console.log('[POST /api/projects/:id/donate] All headers:', JSON.stringify(req.headers, null, 2));
      
      // Try Supabase auth first (same pattern as /api/user/impact)
      const supabaseUser = await getSupabaseUser(req);
      console.log('[POST /api/projects/:id/donate] Supabase user:', supabaseUser ? { email: supabaseUser.email, id: supabaseUser.id } : 'null');
      
      let userId: number | undefined;
      
      if (supabaseUser) {
        let dbUser: User | undefined;
        
        // ========== DIAGNOSTIC: Inspect storage instance ==========
        console.log('[POST /api/projects/:id/donate] 🔍 ========== STORAGE DIAGNOSTICS ==========');
        console.log('[POST /api/projects/:id/donate] 🔍 Storage instance type:', storage.constructor?.name || 'Unknown');
        console.log('[POST /api/projects/:id/donate] 🔍 Storage instance:', storage);
        console.log('[POST /api/projects/:id/donate] 🔍 Storage methods available:', {
          getUserByAuthId: typeof storage.getUserByAuthId,
          createUserMinimal: typeof storage.createUserMinimal,
          getUserByEmail: typeof storage.getUserByEmail,
          createUser: typeof storage.createUser,
          createDonation: typeof storage.createDonation
        });
        // Try to check if it's SupabaseStorage instance
        try {
          const { SupabaseStorage } = await import('./supabase-storage-new');
          console.log('[POST /api/projects/:id/donate] 🔍 Is SupabaseStorage?', storage instanceof SupabaseStorage);
        } catch (e) {
          console.log('[POST /api/projects/:id/donate] 🔍 Could not check SupabaseStorage type:', e);
        }
        console.log('[POST /api/projects/:id/donate] 🔍 ===========================================');
        
        // ========== USER LOOKUP FLOW (Step 3.7.5) ==========
        // Step 1: Try lookup by auth_user_id first (preferred - more reliable)
        console.log('[POST /api/projects/:id/donate] 🔍 Step 1: Looking up user by auth_user_id:', supabaseUser.id);
        if (storage.getUserByAuthId && typeof storage.getUserByAuthId === 'function') {
          dbUser = await storage.getUserByAuthId(supabaseUser.id);
          if (dbUser) {
            console.log('[POST /api/projects/:id/donate] ✅ Step 1 SUCCESS: User found by auth_user_id:', { id: dbUser.id, email: dbUser.email, auth_user_id: dbUser.auth_user_id });
          } else {
            console.log('[POST /api/projects/:id/donate] ⚠️ Step 1: User NOT found by auth_user_id');
          }
        } else {
          console.warn('[POST /api/projects/:id/donate] ⚠️ Step 1 SKIPPED: getUserByAuthId method not available');
        }
        
        // Step 2: Fallback to email lookup if auth_user_id lookup fails
        if (!dbUser && supabaseUser.email) {
          console.log('[POST /api/projects/:id/donate] 🔍 Step 2: Fallback - Looking up user by email:', supabaseUser.email);
          dbUser = await storage.getUserByEmail(supabaseUser.email);
          if (dbUser) {
            console.log('[POST /api/projects/:id/donate] ✅ Step 2 SUCCESS: User found by email:', { id: dbUser.id, email: dbUser.email, auth_user_id: dbUser.auth_user_id || 'NOT SET' });
          } else {
            console.log('[POST /api/projects/:id/donate] ⚠️ Step 2: User NOT found by email');
          }
        }
        
        // Step 3: If still not found, create minimal user on-the-fly
        if (!dbUser) {
          console.log('[POST /api/projects/:id/donate] 🔍 Step 3: User not found in DB, creating minimal user on-the-fly...');
          try {
            // Derive username from email prefix
            const username = supabaseUser.email?.split('@')[0] || `user_${Date.now()}`;
            
            // Derive name from metadata
            const fullName = supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || '';
            const nameParts = fullName.split(' ').filter(Boolean);
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';
            
            // Try createUserMinimal first (if available - SupabaseStorage)
            if (storage.createUserMinimal && typeof storage.createUserMinimal === 'function') {
              console.log('[POST /api/projects/:id/donate] Using createUserMinimal method');
              dbUser = await storage.createUserMinimal({
                username,
                email: supabaseUser.email || '',
                firstName,
                lastName,
                auth_user_id: supabaseUser.id
              });
              console.log('[POST /api/projects/:id/donate] ✅ Step 3 SUCCESS: User created via createUserMinimal:', { id: dbUser.id, email: dbUser.email, auth_user_id: dbUser.auth_user_id || 'NOT SET' });
            } else {
              // Fallback: Use standard createUser method (works with both SupabaseStorage and MemStorage)
              console.log('[POST /api/projects/:id/donate] createUserMinimal not available, using createUser fallback');
              // Note: createUser will hash the password, but for Supabase auth users we want empty password
              // We'll pass empty string and the createUser method will handle it
              const userData: any = {
                username,
                email: supabaseUser.email || '',
                firstName,
                lastName,
                password: '' // Empty password for Supabase auth users (will be hashed but that's ok)
              };
              dbUser = await storage.createUser(userData);
              // After creation, update auth_user_id if we have it (since InsertUser doesn't include it)
              if (supabaseUser.id && dbUser) {
                // Try to update auth_user_id using direct Supabase call
                try {
                  const { createClient } = await import('@supabase/supabase-js');
                  const { SUPABASE_URL, SUPABASE_ANON_KEY } = await import('./secrets');
                  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '';
                  const supabaseKey = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;
                  const supabase = createClient(SUPABASE_URL, supabaseKey);
                  
                  const { error: updateError } = await supabase
                    .from('users')
                    .update({ auth_user_id: supabaseUser.id })
                    .eq('id', dbUser.id);
                  
                  if (updateError) {
                    console.warn('[POST /api/projects/:id/donate] ⚠️ Could not update auth_user_id:', updateError);
                  } else {
                    console.log('[POST /api/projects/:id/donate] ✅ Updated auth_user_id for user:', dbUser.id);
                    // Refresh user data
                    const updatedUser = await storage.getUser(dbUser.id);
                    if (updatedUser) dbUser = updatedUser;
                  }
                } catch (updateErr) {
                  console.warn('[POST /api/projects/:id/donate] ⚠️ Could not update auth_user_id:', updateErr);
                }
              }
              console.log('[POST /api/projects/:id/donate] ✅ Step 3 SUCCESS: User created via createUser fallback:', { id: dbUser.id, email: dbUser.email, auth_user_id: dbUser.auth_user_id || 'NOT SET' });
            }
          } catch (createError) {
            console.error('[POST /api/projects/:id/donate] ❌ Failed to create user:', createError);
            // If it's a unique constraint violation, try to fetch the existing user
            if (createError instanceof Error && (createError.message.includes('unique') || createError.message.includes('duplicate')) || 
                (createError as any)?.code === '23505') {
              console.log('[POST /api/projects/:id/donate] Unique constraint violation, fetching existing user...');
              // Try to get by email one more time
              if (supabaseUser.email) {
                dbUser = await storage.getUserByEmail(supabaseUser.email);
                if (dbUser) {
                  console.log('[POST /api/projects/:id/donate] ✅ Found existing user after unique violation:', { id: dbUser.id, email: dbUser.email });
                }
              }
            }
            
            if (!dbUser) {
              console.error('[POST /api/projects/:id/donate] ❌ Step 3 FAILED: User creation failed:', createError);
              return res.status(500).json({ 
                message: "Failed to resolve user"
              });
            } else {
              console.log('[POST /api/projects/:id/donate] ✅ Step 3 RECOVERED: User found after unique constraint violation:', { id: dbUser.id, email: dbUser.email });
            }
          }
        }
        
        if (!dbUser) {
          console.error('[POST /api/projects/:id/donate] ❌ CRITICAL: Failed to resolve user after all steps');
          return res.status(500).json({ message: "Failed to resolve user" });
        }
        
        console.log('[POST /api/projects/:id/donate] ✅ USER RESOLVED: Using user ID:', dbUser.id);
        userId = dbUser.id;
      } else {
        // Fallback to Passport auth
        console.log('[POST /api/projects/:id/donate] Checking Passport auth...');
        if (!req.isAuthenticated()) {
          console.log('[POST /api/projects/:id/donate] ❌ Not authenticated (neither Supabase nor Passport)');
          return res.status(401).json({ message: "You must be logged in to donate" });
        }
        userId = req.user!.id;
        console.log('[POST /api/projects/:id/donate] Using Passport user ID:', userId);
      }
      
      console.log('[POST /api/projects/:id/donate] Using user ID:', userId);
      
      console.log('[POST /api/projects/:id/donate] ========== PROJECT LOOKUP ==========');
      console.log('[POST /api/projects/:id/donate] Requested project ID from params:', req.params.id);
      console.log('[POST /api/projects/:id/donate] Request body:', JSON.stringify(req.body, null, 2));
      console.log('[POST /api/projects/:id/donate] Request query:', JSON.stringify(req.query, null, 2));
      
      const projectId = parseInt(req.params.id);
      if (isNaN(projectId)) {
        console.error('[POST /api/projects/:id/donate] ❌ Invalid project ID:', req.params.id);
        return res.status(400).json({ message: "Invalid project ID" });
      }
      
      console.log('[POST /api/projects/:id/donate] Parsed project ID:', projectId);
      console.log('[POST /api/projects/:id/donate] Storage type:', storage.constructor?.name);
      console.log('[POST /api/projects/:id/donate] Calling storage.getProject...');
      
      let project = await storage.getProject(projectId);
      
      if (!project) {
        console.error('[POST /api/projects/:id/donate] ❌ Project not found by ID:', projectId);
        
        // Try to get all projects to see what's available
        try {
          const allProjects = await storage.getProjects();
          console.log('[POST /api/projects/:id/donate] Total projects available:', allProjects.length);
          console.log('[POST /api/projects/:id/donate] Available project IDs:', allProjects.map(p => ({ id: p.id, slug: p.slug, title: p.title })));
          
          // Check if there's a project with a similar ID (maybe the ID changed)
          const projectWithSimilarId = allProjects.find(p => p.id.toString().includes(projectId.toString()) || projectId.toString().includes(p.id.toString()));
          if (projectWithSimilarId) {
            console.log('[POST /api/projects/:id/donate] ⚠️ Found project with similar ID:', projectWithSimilarId);
          }
        } catch (e) {
          console.error('[POST /api/projects/:id/donate] Could not fetch all projects:', e);
        }
        
        // Try to extract slug from referer header or request body/query
        let slug = req.body?.slug || req.query?.slug;
        
        // If no slug in body/query, try to extract from referer header
        if (!slug && req.headers.referer) {
          const refererMatch = req.headers.referer.match(/\/support\/([^/?]+)/);
          if (refererMatch) {
            slug = refererMatch[1];
            console.log('[POST /api/projects/:id/donate] Extracted slug from referer:', slug);
          }
        }
        
        // Try to look up by slug as fallback
        if (slug && storage.getProjectBySlug && typeof storage.getProjectBySlug === 'function') {
          console.log('[POST /api/projects/:id/donate] Attempting fallback lookup by slug:', slug);
          project = await storage.getProjectBySlug(slug);
          if (project) {
            console.log('[POST /api/projects/:id/donate] ✅ Project found by slug fallback:', { id: project.id, slug: project.slug, title: project.title });
            console.log('[POST /api/projects/:id/donate] ⚠️ Using project ID from slug lookup:', project.id, 'instead of requested:', projectId);
          } else {
            console.log('[POST /api/projects/:id/donate] ❌ Project not found by slug either:', slug);
          }
        } else {
          console.log('[POST /api/projects/:id/donate] ⚠️ Cannot use slug fallback - slug not available or method not available');
        }
        
        if (!project) {
          return res.status(404).json({ message: "Project not found" });
        }
      }
      
      console.log('[POST /api/projects/:id/donate] ✅ Project found:', { id: project.id, title: project.title, slug: project.slug });
      console.log('[POST /api/projects/:id/donate] ===========================================');
      
      // Use the actual project ID from the found project (in case we used slug fallback)
      const actualProjectId = project.id;
      
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
      
      // Log donation data before creation
      console.log('[POST /api/projects/:id/donate] Creating donation with:', {
        userId,
        projectId: actualProjectId,
        requestedProjectId: projectId,
        amount,
        impactPoints,
        projectMultiplier: project.impactPointsMultiplier
      });
      
      // Check for duplicate donation (same user, project, amount within last 5 seconds)
      const { createClient } = await import('@supabase/supabase-js');
      // Read directly from process.env to ensure .env is loaded
      const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
      const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
      const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '';
      
      if (SUPABASE_URL && SUPABASE_ANON_KEY) {
        // Use service role key for backend operations (bypasses RLS)
        const supabaseKey = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;
        const supabase = createClient(SUPABASE_URL, supabaseKey);
        
        const fiveSecondsAgo = new Date(Date.now() - 5000);
        const { data: recentDonations, error: duplicateCheckError } = await supabase
          .from('donations')
          .select('id, userId, projectId, amount, createdAt')
          .eq('userId', userId)
          .eq('projectId', actualProjectId)
          .eq('amount', amount)
          .gte('createdAt', fiveSecondsAgo.toISOString())
          .order('createdAt', { ascending: false })
          .limit(1);
        
        if (duplicateCheckError && duplicateCheckError.code !== 'PGRST116') {
          // PGRST116 = no rows returned (expected if no duplicate exists)
          console.warn('[POST /api/projects/:id/donate] ⚠️ Error checking for duplicate donation:', duplicateCheckError.message);
          // Continue anyway - non-critical error
        }
        
        if (recentDonations && recentDonations.length > 0) {
          const existingDonation = recentDonations[0];
          console.log('[POST /api/projects/:id/donate] ⚠️ Duplicate donation detected, returning existing donation:', {
            id: existingDonation.id,
            userId: existingDonation.userId,
            projectId: existingDonation.projectId,
            amount: existingDonation.amount,
            createdAt: existingDonation.createdAt
          });
          return res.status(200).json(existingDonation); // Return existing donation (idempotent)
        }
      } else {
        console.warn('[POST /api/projects/:id/donate] ⚠️ Missing Supabase credentials for duplicate check, skipping idempotency check');
        // Continue to create donation - idempotency check is non-critical
      }
      
      // Create donation
      const donation = await storage.createDonation({
        userId: userId,
        projectId: actualProjectId, // Use actual project ID from found project
        amount,
        impactPoints
      });
      
      res.status(201).json(donation);
    } catch (error) {
      console.error('[POST /api/projects/:id/donate] ========== ROUTE ERROR ==========');
      console.error('[POST /api/projects/:id/donate] ❌ Error:', error);
      console.error('[POST /api/projects/:id/donate] Error message:', error instanceof Error ? error.message : String(error));
      console.error('[POST /api/projects/:id/donate] Error stack:');
      console.error(error instanceof Error ? error.stack : 'No stack trace available');
      console.error('[POST /api/projects/:id/donate] Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      console.error('[POST /api/projects/:id/donate] ========== END ROUTE ERROR ==========');
      
      // Return generic error message (NO stack trace to client)
      res.status(500).json({ 
        message: "Failed to process donation"
      });
    }
  });

  // Donations - Flat route (matches Vercel Function for local development)
  // This route mirrors api/projects-donate.ts to ensure local and production work identically
  app.post("/api/projects-donate", async (req, res) => {
    try {
      // CORS handling
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
      if (req.method === 'OPTIONS') {
        return res.status(200).end();
      }

      const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
      const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

      if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        return res.status(500).json({ message: 'Supabase credentials not configured' });
      }

      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

      // Auth
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Missing bearer token' });
      }
      const token = authHeader.substring(7);
      const { data: authData, error: authError } = await supabase.auth.getUser(token);
      if (authError || !authData?.user) {
        return res.status(401).json({ message: 'Invalid or missing user' });
      }
      const supaUser = authData.user;

      // Resolve DB user (same logic as Vercel Function)
      let dbUser;
      const { data: byAuth } = await supabase.from('users').select('*').eq('auth_user_id', supaUser.id).maybeSingle();
      dbUser = byAuth || null;
      if (!dbUser && supaUser.email) {
        const { data: byEmail } = await supabase.from('users').select('*').eq('email', supaUser.email).maybeSingle();
        dbUser = byEmail || null;
      }
      if (!dbUser) {
        // Create user on-the-fly (same as Vercel Function)
        const username = (supaUser.email || `user_${Date.now()}`).split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
        const firstName = (supaUser.user_metadata?.full_name || '').split(' ')[0] || '';
        const lastName = (supaUser.user_metadata?.full_name || '').split(' ').slice(1).join(' ') || '';
        const { data: created, error: createErr } = await supabase
          .from('users')
          .insert({
            username,
            email: supaUser.email,
            firstName,
            lastName,
            auth_user_id: supaUser.id,
            impactPoints: 50, // Welcome Bonus - matches Vercel Function
          })
          .select()
          .maybeSingle();
        if (createErr || !created) {
          return res.status(500).json({ message: 'Failed to resolve user' });
        }
        dbUser = created;
      }
      const userId = dbUser.id;

      // Validate amount
      const amount = typeof req.body?.amount === 'number' ? req.body.amount : Number(req.body?.amount);
      if (!amount || isNaN(amount) || amount <= 0) {
        return res.status(400).json({ message: 'Invalid donation amount' });
      }

      // Project lookup: projectId from body, fallback slug
      const bodyProjectId = typeof req.body?.projectId === 'number' ? req.body.projectId : Number(req.body?.projectId);
      let project = null;
      if (!isNaN(bodyProjectId)) {
        const { data: proj } = await supabase.from('projects').select('*').eq('id', bodyProjectId).maybeSingle();
        project = proj || null;
      }
      if (!project && req.body?.slug) {
        const { data: projBySlug } = await supabase.from('projects').select('*').eq('slug', req.body.slug).maybeSingle();
        project = projBySlug || null;
      }
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      const actualProjectId = project.id;
      const mappedProject = mapProjectImpactFields(project);
      const impactMultiplier = (mappedProject.impactPointsMultiplier ?? 10) || 10;
      const impactPoints = Math.floor(amount * impactMultiplier);

      // Impact snapshot generation (optional, safe fallback if data missing)
      let calculatedImpact: number | undefined;
      let impactSnapshot: any = null;
      let generatedPastEn: string | undefined;
      let generatedPastDe: string | undefined;
      try {
        if (hasImpact(mappedProject as any)) {
          const snapshotEn = generateImpactSnapshot(mappedProject as any, amount, 'en');
          const snapshotDe = generateImpactSnapshot(mappedProject as any, amount, 'de');

          calculatedImpact = snapshotEn.calculated_impact;
          generatedPastEn = snapshotEn.generated_text_past;
          generatedPastDe = snapshotDe.generated_text_past;

          impactSnapshot = {
            en: snapshotEn,
            de: snapshotDe,
            amount,
            projectId: actualProjectId,
          };
        }
      } catch (impactError) {
        console.warn('[POST /api/projects-donate] Impact snapshot generation skipped:', impactError);
      }

      // Update project stats (raised, donors)
      try {
        const { data: projectData } = await supabase
          .from('projects')
          .select('raised, donors')
          .eq('id', actualProjectId)
          .single();

        if (projectData) {
          await supabase
            .from('projects')
            .update({
              raised: (projectData.raised || 0) + amount,
              donors: (projectData.donors || 0) + 1
            })
            .eq('id', actualProjectId);
        }
      } catch (projectError) {
        console.error('[POST /api/projects-donate] Error updating project stats:', projectError);
      }

      // Insert donation (include impact data if available)
      const donationPayload: Record<string, any> = {
        userId,
        projectId: actualProjectId,
        amount,
        impactPoints,
        status: 'pending',
      };
      if (calculatedImpact !== undefined) {
        donationPayload.calculated_impact = calculatedImpact;
      }
      if (impactSnapshot) {
        donationPayload.impact_snapshot = impactSnapshot;
      }
      if (generatedPastEn) {
        donationPayload.generated_text_past_en = generatedPastEn;
      }
      if (generatedPastDe) {
        donationPayload.generated_text_past_de = generatedPastDe;
      }

      const { data: donation, error: donationErr } = await supabase
        .from('donations')
        .insert(donationPayload)
        .select()
        .maybeSingle();

      if (donationErr || !donation) {
        return res.status(500).json({ message: 'Failed to create donation', error: donationErr?.message });
      }

      // Apply points change: update balance then create transaction
      if (impactPoints > 0) {
        try {
          const { data: user, error: userError } = await supabase
            .from('users')
            .select('impactPoints')
            .eq('id', userId)
            .single();

          if (userError || !user) {
            throw new Error(`User ${userId} not found: ${userError?.message}`);
          }

          const currentBalance = (user as any).impactPoints ?? 0;
          const newBalance = currentBalance + impactPoints;

          const { error: updateError } = await supabase
            .from('users')
            .update({ impactPoints: newBalance })
            .eq('id', userId);
          if (updateError) {
            throw new Error(`Failed to update balance: ${updateError.message}`);
          }

          const { error: transactionError } = await supabase
            .from('user_transactions')
            .insert([{
              user_id: userId,
              transaction_type: 'donation',
              project_id: actualProjectId,
              donation_id: donation.id,
              support_amount: amount,
              points_change: impactPoints,
              points_balance_after: newBalance,
              description: `Support: $${amount} for project ${actualProjectId}`,
            }]);

          if (transactionError) {
            // rollback balance
            await supabase.from('users').update({ impactPoints: currentBalance }).eq('id', userId);
            throw new Error(`Failed to create transaction: ${transactionError.message}`);
          }
        } catch (pointsError) {
          console.error('[POST /api/projects-donate] Failed to apply points change:', pointsError);
        }
      }

      return res.status(201).json(donation);
    } catch (error) {
      console.error('[POST /api/projects-donate] Error:', error);
      return res.status(500).json({
        message: 'Failed to process donation',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
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

  // Shared handler function for reward redemption (used by both routes)
  async function handleRewardRedemption(req: Request, rewardId: number, routeName: string) {
    console.log(`[${routeName}] ========== REQUEST ==========`);
    console.log(`[${routeName}] Authorization header:`, req.headers.authorization ? 'Present' : 'Missing');
    
    // Try Supabase auth first
    const supabaseUser = await getSupabaseUser(req);
    console.log(`[${routeName}] Supabase user:`, supabaseUser ? { email: supabaseUser.email, id: supabaseUser.id } : 'null');
    
    let userId: number | undefined;
    
    if (supabaseUser) {
      let dbUser: User | undefined;
      
      // Step 1: Try lookup by auth_user_id first
      console.log(`[${routeName}] 🔍 Step 1: Looking up user by auth_user_id:`, supabaseUser.id);
      if (storage.getUserByAuthId && typeof storage.getUserByAuthId === 'function') {
        dbUser = await storage.getUserByAuthId(supabaseUser.id);
        if (dbUser) {
          console.log(`[${routeName}] ✅ Step 1 SUCCESS: User found by auth_user_id:`, { id: dbUser.id, email: dbUser.email, auth_user_id: dbUser.auth_user_id });
        } else {
          console.log(`[${routeName}] ⚠️ Step 1: User NOT found by auth_user_id`);
        }
      } else {
        console.warn(`[${routeName}] ⚠️ Step 1 SKIPPED: getUserByAuthId method not available`);
      }
      
      // Step 2: Fallback to email lookup
      if (!dbUser && supabaseUser.email) {
        console.log(`[${routeName}] 🔍 Step 2: Fallback - Looking up user by email:`, supabaseUser.email);
        dbUser = await storage.getUserByEmail(supabaseUser.email);
        if (dbUser) {
          console.log(`[${routeName}] ✅ Step 2 SUCCESS: User found by email:`, { id: dbUser.id, email: dbUser.email, auth_user_id: dbUser.auth_user_id || 'NOT SET' });
        } else {
          console.log(`[${routeName}] ⚠️ Step 2: User NOT found by email`);
        }
      }
      
      // Step 3: Create user if not found
      if (!dbUser) {
        console.log(`[${routeName}] 🔍 Step 3: User not found in DB, creating minimal user on-the-fly...`);
        try {
          const username = supabaseUser.email?.split('@')[0] || `user_${Date.now()}`;
          const fullName = supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || '';
          const nameParts = fullName.split(' ').filter(Boolean);
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';
          
          if (storage.createUserMinimal && typeof storage.createUserMinimal === 'function') {
            console.log(`[${routeName}] Using createUserMinimal method`);
            dbUser = await storage.createUserMinimal({
              username,
              email: supabaseUser.email || '',
              firstName,
              lastName,
              auth_user_id: supabaseUser.id
            });
            console.log(`[${routeName}] ✅ Step 3 SUCCESS: User created via createUserMinimal:`, { id: dbUser.id, email: dbUser.email, auth_user_id: dbUser.auth_user_id || 'NOT SET' });
          } else {
            console.log(`[${routeName}] createUserMinimal not available, using createUser fallback`);
            const userData: any = {
              username,
              email: supabaseUser.email || '',
              firstName,
              lastName,
              password: ''
            };
            dbUser = await storage.createUser(userData);
            if (supabaseUser.id && dbUser) {
              try {
                const { createClient } = await import('@supabase/supabase-js');
                const { SUPABASE_URL, SUPABASE_ANON_KEY } = await import('./secrets');
                const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '';
                const supabaseKey = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;
                const supabase = createClient(SUPABASE_URL, supabaseKey);
                
                const { error: updateError } = await supabase
                  .from('users')
                  .update({ auth_user_id: supabaseUser.id })
                  .eq('id', dbUser.id);
                
                if (updateError) {
                  console.warn(`[${routeName}] ⚠️ Could not update auth_user_id:`, updateError);
                } else {
                  console.log(`[${routeName}] ✅ Updated auth_user_id for user:`, dbUser.id);
                  const updatedUser = await storage.getUser(dbUser.id);
                  if (updatedUser) dbUser = updatedUser;
                }
              } catch (updateErr) {
                console.warn(`[${routeName}] ⚠️ Could not update auth_user_id:`, updateErr);
              }
            }
            console.log(`[${routeName}] ✅ Step 3 SUCCESS: User created via createUser fallback:`, { id: dbUser.id, email: dbUser.email, auth_user_id: dbUser.auth_user_id || 'NOT SET' });
          }
        } catch (createError) {
          console.error(`[${routeName}] ❌ Failed to create user:`, createError);
          if (createError instanceof Error && (createError.message.includes('unique') || createError.message.includes('duplicate')) || 
              (createError as any)?.code === '23505') {
            console.log(`[${routeName}] Unique constraint violation, fetching existing user...`);
            if (supabaseUser.email) {
              dbUser = await storage.getUserByEmail(supabaseUser.email);
              if (dbUser) {
                console.log(`[${routeName}] ✅ Step 3 RECOVERED: User found after unique constraint violation:`, { id: dbUser.id, email: dbUser.email });
              }
            }
          }
          
          if (!dbUser) {
            throw new Error("Failed to resolve user after all steps");
          }
        }
      }
      
      if (!dbUser) {
        throw new Error("Failed to resolve user after all steps");
      }
      
      console.log(`[${routeName}] ✅ USER RESOLVED: Using user ID:`, dbUser.id);
      userId = dbUser.id;
    } else {
      // Fallback to Passport auth
      console.log(`[${routeName}] Checking Passport auth...`);
      if (!req.isAuthenticated()) {
        throw new Error("You must be logged in to redeem rewards");
      }
      userId = req.user!.id;
      console.log(`[${routeName}] Using Passport user ID:`, userId);
    }
    
    // Validate rewardId
    if (isNaN(rewardId)) {
      throw new Error("Invalid reward ID");
    }
    
    // Get reward
    const reward = await storage.getReward(rewardId);
    if (!reward) {
      throw new Error("Reward not found");
    }
    
    // Check if user has enough points
    const userImpact = await storage.getUserImpact(userId);
    if (userImpact.impactPoints < reward.pointsCost) {
      throw new Error("Insufficient impact points");
    }
    
    // Create redemption
    console.log(`[${routeName}] ========== REDEMPTION REQUEST ==========`);
    console.log(`[${routeName}] Parsed rewardId:`, rewardId);
    console.log(`[${routeName}] Reward from DB:`, { id: reward.id, title: reward.title, pointsCost: reward.pointsCost });
    console.log(`[${routeName}] Calling createRedemption with:`, { userId, rewardId, pointsSpent: reward.pointsCost, status: "pending" });
    
    const redemption = await storage.createRedemption({
      userId,
      rewardId,
      pointsSpent: reward.pointsCost,
      status: "pending"
    });
    
    console.log(`[${routeName}] Redemption returned from createRedemption:`, { id: redemption.id, rewardId: redemption.rewardId, userId: redemption.userId });
    console.log(`[${routeName}] ✅ Redemption created successfully:`, redemption);
    
    return redemption;
  }

  // Redeem rewards (flat route for frontend compatibility - localhost only)
  // Production uses Tech/api/rewards-redeem.ts (serverless function)
  app.post("/api/rewards-redeem", async (req, res) => {
    try {
      // Get rewardId from body (frontend sends it in body, not URL)
      const rewardId = typeof req.body?.rewardId === 'number' 
        ? req.body.rewardId 
        : Number(req.body?.rewardId);
      
      if (!rewardId || isNaN(rewardId)) {
        return res.status(400).json({ message: 'Invalid reward ID' });
      }
      
      const redemption = await handleRewardRedemption(req, rewardId, '[POST /api/rewards-redeem]');
      res.status(201).json(redemption);
    } catch (error) {
      console.error('[POST /api/rewards-redeem] ❌ Error:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      const statusCode = errorMessage.includes('logged in') ? 401 : 
                        errorMessage.includes('not found') ? 404 :
                        errorMessage.includes('Insufficient') ? 400 : 500;
      res.status(statusCode).json({ 
        message: errorMessage.includes('logged in') ? errorMessage : "Failed to redeem reward", 
        error: errorMessage 
      });
    }
  });

  // Redeem rewards (original route - keep for backwards compatibility)
  app.post("/api/rewards/:id/redeem", async (req, res) => {
    try {
      const rewardId = parseInt(req.params.id);
      if (isNaN(rewardId)) {
        return res.status(400).json({ message: "Invalid reward ID" });
      }
      
      const redemption = await handleRewardRedemption(req, rewardId, '[POST /api/rewards/:id/redeem]');
      res.status(201).json(redemption);
    } catch (error) {
      console.error('[POST /api/rewards/:id/redeem] ❌ Error:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      const statusCode = errorMessage.includes('logged in') ? 401 : 
                        errorMessage.includes('not found') ? 404 :
                        errorMessage.includes('Insufficient') ? 400 : 500;
      res.status(statusCode).json({ 
        message: errorMessage.includes('logged in') ? errorMessage : "Failed to redeem reward", 
        error: errorMessage 
      });
    }
  });

  // Welcome bonus transaction endpoint
  app.post("/api/user/welcome-bonus", async (req, res) => {
    console.log('[welcome-bonus] Endpoint called');
    let userId: number | undefined;
    try {
      // Try Supabase auth first (same pattern as /api/user/impact)
      const supabaseUser = await getSupabaseUser(req);
      console.log('[welcome-bonus] Supabase user:', supabaseUser ? supabaseUser.email : 'none');
      
      if (supabaseUser) {
        // ========== USER LOOKUP FLOW ==========
        // Step 1: Try lookup by auth_user_id first (preferred - more reliable)
        let dbUser: User | undefined;
        console.log('[welcome-bonus] 🔍 Step 1: Looking up user by auth_user_id:', supabaseUser.id);
        if (storage.getUserByAuthId && typeof storage.getUserByAuthId === 'function') {
          dbUser = await storage.getUserByAuthId(supabaseUser.id);
          if (dbUser) {
            console.log('[welcome-bonus] ✅ Step 1 SUCCESS: User found by auth_user_id:', { id: dbUser.id, email: dbUser.email, auth_user_id: dbUser.auth_user_id });
          } else {
            console.log('[welcome-bonus] ⚠️ Step 1: User NOT found by auth_user_id');
          }
        } else {
          console.warn('[welcome-bonus] ⚠️ Step 1 SKIPPED: getUserByAuthId method not available');
        }
        
        // Step 2: Fallback to email lookup if auth_user_id lookup fails
        if (!dbUser && supabaseUser.email) {
          console.log('[welcome-bonus] 🔍 Step 2: Fallback - Looking up user by email:', supabaseUser.email);
          dbUser = await storage.getUserByEmail(supabaseUser.email);
          if (dbUser) {
            console.log('[welcome-bonus] ✅ Step 2 SUCCESS: User found by email:', { id: dbUser.id, email: dbUser.email, auth_user_id: dbUser.auth_user_id || 'NOT SET' });
          } else {
            console.log('[welcome-bonus] ⚠️ Step 2: User NOT found by email');
          }
        }
        
        // Step 3: If still not found, create minimal user on-the-fly
        if (!dbUser) {
          console.log('[welcome-bonus] 🔍 Step 3: User not found in database, creating user on-the-fly...');
          try {
            // Derive username from email prefix
            const username = supabaseUser.email?.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '') || `user_${Date.now()}`;
            
            // Derive name from metadata (Google OAuth provides full_name)
            const fullName = supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || '';
            const nameParts = fullName.split(' ').filter(Boolean);
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';
            
            // Try createUserMinimal first (if available - SupabaseStorage)
            if (storage.createUserMinimal && typeof storage.createUserMinimal === 'function') {
              console.log('[welcome-bonus] Using createUserMinimal method');
              dbUser = await storage.createUserMinimal({
                username,
                email: supabaseUser.email || '',
                firstName,
                lastName,
                auth_user_id: supabaseUser.id
              });
              console.log('[welcome-bonus] ✅ Step 3 SUCCESS: User created via createUserMinimal:', { id: dbUser.id, email: dbUser.email, auth_user_id: dbUser.auth_user_id || 'NOT SET' });
            } else {
              console.log('[welcome-bonus] ❌ Step 3 FAILED: createUserMinimal not available, cannot create user');
              return res.status(404).json({ message: "User not found in database and cannot be created" });
        }
          } catch (createError: any) {
            console.error('[welcome-bonus] ❌ Step 3 FAILED: Failed to create user:', createError);
            return res.status(500).json({ message: "Failed to create user", error: createError.message });
          }
        }
        
        userId = dbUser.id;
        console.log('[welcome-bonus] Database user ID:', userId);
      } else {
        // Fallback to Passport auth
        if (!req.isAuthenticated()) {
          console.log('[welcome-bonus] Not authenticated');
          return res.status(401).json({ message: "You must be logged in" });
        }
        userId = req.user!.id;
        console.log('[welcome-bonus] Passport user ID:', userId);
      }
      
      // Check if welcome bonus transaction already exists (duplicate prevention)
      // Use getSupabaseClient from supabase-storage-new (already uses SERVICE_ROLE_KEY if available)
      console.log('[welcome-bonus] 🔍 Importing getSupabaseClient from supabase-storage-new...');
      let supabase;
      try {
        const supabaseStorageModule = await import('./supabase-storage-new');
        console.log('[welcome-bonus] 🔍 Module imported, checking for getSupabaseClient...');
        console.log('[welcome-bonus] 🔍 Module keys:', Object.keys(supabaseStorageModule));
        
        const getSupabaseClient = (supabaseStorageModule as any).getSupabaseClient;
        
        if (!getSupabaseClient || typeof getSupabaseClient !== 'function') {
          console.error('[welcome-bonus] ❌ getSupabaseClient not found in supabase-storage-new module');
          console.error('[welcome-bonus] ❌ Available exports:', Object.keys(supabaseStorageModule));
          return res.status(500).json({ 
            message: "Server configuration error: getSupabaseClient function not available",
            error: "getSupabaseClient is required to create transactions"
          });
        }
        
        console.log('[welcome-bonus] 🔍 Calling getSupabaseClient()...');
        supabase = getSupabaseClient();
        console.log('[welcome-bonus] ✅ getSupabaseClient() returned successfully');
        console.log('[welcome-bonus] ✅ Using getSupabaseClient (automatically uses SERVICE_ROLE_KEY if available)');
      } catch (importError: any) {
        console.error('[welcome-bonus] ❌ Failed to import or use getSupabaseClient:', {
          error: importError,
          message: importError?.message,
          stack: importError?.stack
        });
        return res.status(500).json({ 
          message: "Failed to initialize Supabase client",
          error: importError?.message || String(importError)
        });
      }
      
      // Check welcome_bonus_applied flag first (more reliable than transaction check)
      const { data: userRecord, error: userError } = await supabase
        .from('users')
        .select('welcome_bonus_applied')
        .eq('id', userId)
        .single();
      
      if (!userError && userRecord && userRecord.welcome_bonus_applied === true) {
        // Welcome bonus already applied, return success (idempotent)
        console.log('[welcome-bonus] Welcome bonus already applied (welcome_bonus_applied flag is true)');
        return res.status(200).json({ message: "Welcome bonus already applied" });
      }
      
      // Fallback: Check transaction table (for backwards compatibility)
      const { data: existingTransaction, error: checkError } = await supabase
        .from('user_transactions')
        .select('id')
        .eq('user_id', userId)
        .eq('transaction_type', 'welcome_bonus')
        .maybeSingle();
      
      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 = no rows returned (expected if no transaction exists)
        console.error('[welcome-bonus] Error checking for existing transaction:', checkError);
        // Continue anyway - non-critical error
      }
      
      if (existingTransaction) {
        // Welcome bonus already exists, return success (idempotent)
        console.log('[welcome-bonus] Transaction already exists');
        return res.status(200).json({ message: "Welcome bonus already applied" });
      }
      
      // Check if user has 50 points (from database trigger)
      const user = await storage.getUser(userId);
      if (!user) {
        console.log('[welcome-bonus] User not found:', userId);
        return res.status(404).json({ message: "User not found" });
      }
      
      const userImpactPoints = (user as any).impactPoints ?? 0;
      console.log('[welcome-bonus] User impact points:', userImpactPoints);
      
      // Check if user qualifies for welcome bonus:
      // 1. Has exactly 50 points (from trigger) - record transaction
      // 2. Has 0 points and 0 donations - new user, give bonus and record transaction
      const userTotalDonations = (user as any).totalDonations ?? 0;
      const isNewUser = userImpactPoints === 0 && userTotalDonations === 0;
      const hasWelcomeBonus = userImpactPoints === 50;
      
      if (!isNewUser && !hasWelcomeBonus) {
        // User doesn't qualify - has points but not 50, or has donations
        console.log('[welcome-bonus] User does not qualify (has', userImpactPoints, 'points,', userTotalDonations, 'donations)');
        return res.status(200).json({ message: "User does not qualify for welcome bonus" });
      }
      
      // IMPORTANT: Determine points_change BEFORE updating user points
      // If user already has 50 points: points_change = 0 (just document, don't add points)
      // If user has 0 points: points_change = 50 (give bonus)
      const pointsChange = userImpactPoints === 50 ? 0 : 50;
      const balanceAfter = 50; // Should always be 50 after welcome bonus
      
      // If user has 0 points, give them 50 points first
      if (isNewUser && userImpactPoints === 0) {
        console.log('[welcome-bonus] New user detected (0 points, 0 donations), applying 50 Impact Points...');
        // Update user's impact points to 50
        const { error: updateError } = await supabase
          .from('users')
          .update({ impactPoints: 50 })
          .eq('id', userId);
        
        if (updateError) {
          console.error('[welcome-bonus] Failed to update user impact points:', updateError);
          throw new Error(`Failed to update user impact points: ${updateError.message}`);
        }
        console.log('[welcome-bonus] User impact points updated to 50');
      }
      
      // IMPORTANT: User now has 50 points (either from trigger or from update above)
      // Record the transaction with points_change = 0 if user already had 50, or 50 if they were new
      
      console.log('[welcome-bonus] Creating transaction:', {
        userId,
        currentPoints: userImpactPoints,
        pointsChange,
        balanceAfter,
        reason: userImpactPoints === 50 ? 'User already has 50 points, documenting transaction only' : 'New user, giving 50 points'
      });
      
      const { data: insertedData, error: transactionError } = await supabase
        .from('user_transactions')
        .insert([{
          user_id: userId,
          transaction_type: 'welcome_bonus',
          project_id: null,
          donation_id: null,
          support_amount: null,
          reward_id: null,
          redemption_id: null,
          points_change: pointsChange, // 0 if already has 50, 50 if new user
          points_balance_after: balanceAfter, // Always 50 after welcome bonus
          description: 'Welcome bonus: 50 Impact Points for joining Dopaya',
          metadata: null
        }])
        .select(); // Return inserted row for verification
      
      if (transactionError) {
        console.error('[welcome-bonus] ❌ FAILED to create transaction:', {
          error: transactionError,
          message: transactionError.message,
          code: transactionError.code,
          details: transactionError.details,
          hint: transactionError.hint,
          userId: userId
        });
        // Don't throw - return error details so we can debug
        return res.status(500).json({ 
          message: "Failed to create welcome bonus transaction", 
          error: transactionError.message,
          code: transactionError.code,
          details: transactionError.details,
          hint: transactionError.hint
        });
      }
      
      if (!insertedData || insertedData.length === 0) {
        console.error('[welcome-bonus] ❌ Transaction insert returned no data');
        return res.status(500).json({ message: "Transaction created but no data returned" });
      }
      
      // Set welcome_bonus_applied flag to true
      try {
        const { error: flagError } = await supabase
          .from('users')
          .update({ welcome_bonus_applied: true })
          .eq('id', userId);
        
        if (flagError) {
          console.warn('[welcome-bonus] ⚠️ Could not set welcome_bonus_applied flag (column may not exist):', flagError);
          // Don't fail - transaction was created successfully
        } else {
          console.log('[welcome-bonus] ✅ welcome_bonus_applied flag set to true');
        }
      } catch (flagErr) {
        console.warn('[welcome-bonus] ⚠️ Error setting welcome_bonus_applied flag:', flagErr);
        // Don't fail - transaction was created successfully
      }
      
      console.log('[welcome-bonus] ✅ Transaction created successfully:', {
        transactionId: insertedData[0]?.id,
        userId: userId,
        transactionType: insertedData[0]?.transaction_type,
        pointsChange: insertedData[0]?.points_change
      });
      res.status(201).json({ 
        message: "Welcome bonus applied successfully", 
        transactionId: insertedData[0]?.id,
        transaction: insertedData[0]
      });
    } catch (error: any) {
      console.error('[welcome-bonus] ❌ EXCEPTION applying welcome bonus:', {
        error: error,
        message: error?.message,
        stack: error?.stack,
        userId: userId
      });
      // Return 500 with error details for debugging
      res.status(500).json({ 
        message: "Welcome bonus application failed", 
        error: error?.message || String(error),
        stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      });
    }
  });

  // Test endpoint to debug authentication
  app.get("/api/test-auth", async (req, res) => {
    console.log('[GET /api/test-auth] ========== TEST AUTH ==========');
    console.log('[GET /api/test-auth] Authorization header:', req.headers.authorization ? 'Present' : 'Missing');
    if (req.headers.authorization) {
      console.log('[GET /api/test-auth] Auth header preview:', req.headers.authorization.substring(0, 30) + '...');
    }
    
    const supabaseUser = await getSupabaseUser(req);
    console.log('[GET /api/test-auth] Supabase user:', supabaseUser ? { email: supabaseUser.email, id: supabaseUser.id } : 'null');
    
    if (supabaseUser) {
      return res.json({ 
        success: true, 
        message: 'Authenticated',
        user: { email: supabaseUser.email, id: supabaseUser.id }
      });
    } else {
      return res.status(401).json({ 
        success: false, 
        message: 'Not authenticated',
        hasAuthHeader: !!req.headers.authorization
      });
    }
  });

  // Mark welcome modal as shown endpoint
  app.post("/api/user/mark-welcome-shown", async (req, res) => {
    console.log('[mark-welcome-shown] Endpoint called');
    let userId: number | undefined;
    try {
      // Try Supabase auth first
      const supabaseUser = await getSupabaseUser(req);
      console.log('[mark-welcome-shown] Supabase user:', supabaseUser ? supabaseUser.email : 'none');
      
      if (supabaseUser) {
        // User lookup flow (same as welcome-bonus)
        let dbUser: User | undefined;
        if (storage.getUserByAuthId && typeof storage.getUserByAuthId === 'function') {
          dbUser = await storage.getUserByAuthId(supabaseUser.id);
        }
        if (!dbUser && supabaseUser.email) {
          dbUser = await storage.getUserByEmail(supabaseUser.email);
        }
        if (!dbUser) {
          return res.status(404).json({ message: "User not found in database" });
        }
        userId = dbUser.id;
      } else {
        // Fallback to Passport auth
        if (!req.isAuthenticated()) {
          return res.status(401).json({ message: "You must be logged in" });
        }
        userId = req.user!.id;
      }
      
      // Get Supabase client
      const supabaseStorageModule = await import('./supabase-storage-new');
      const getSupabaseClient = (supabaseStorageModule as any).getSupabaseClient;
      if (!getSupabaseClient || typeof getSupabaseClient !== 'function') {
        return res.status(500).json({ message: "Server configuration error" });
      }
      const supabase = getSupabaseClient();
      
      // Update welcome_shown flag (idempotent - safe to call multiple times) for this user
      const { error: updateError } = await supabase
        .from('users')
        .update({ welcome_shown: true })
        .eq('id', userId);
      
      if (updateError) {
        // Column might not exist yet - log warning but don't fail
        console.warn('[mark-welcome-shown] ⚠️ Could not set welcome_shown flag (column may not exist):', updateError);
      }
      
      // Also update all rows with the same email (handles multiple auth providers)
      if (supabaseUser?.email) {
        const emailLower = supabaseUser.email.toLowerCase();
        const { error: emailUpdateError } = await supabase
          .from('users')
          .update({ welcome_shown: true })
          .eq('email', emailLower);
        if (emailUpdateError) {
          console.warn('[mark-welcome-shown] ⚠️ Could not set welcome_shown for email rows:', emailUpdateError);
        }
      }
      
      console.log('[mark-welcome-shown] ✅ welcome_shown flag set to true for user (and email rows if any):', userId);
      return res.status(200).json({ message: "Welcome modal marked as shown" });
    } catch (error: any) {
      console.error('[mark-welcome-shown] ❌ Error:', error);
      return res.status(500).json({ 
        message: "Failed to mark welcome modal as shown", 
        error: error?.message || String(error)
      });
    }
  });

  // User impact data
  app.get("/api/user/impact", async (req, res) => {
    console.log('[GET /api/user/impact] Request received');
    console.log('[GET /api/user/impact] Auth header:', req.headers.authorization ? 'Present' : 'Missing');
    
    // Try Supabase auth first
    const supabaseUser = await getSupabaseUser(req);
    
    if (supabaseUser) {
      console.log('[GET /api/user/impact] Supabase user found:', supabaseUser.email, 'auth_user_id:', supabaseUser.id);
      
      // ========== USER LOOKUP FLOW ==========
      // Step 1: Try lookup by auth_user_id first (preferred - more reliable)
      let dbUser: User | undefined;
      console.log('[GET /api/user/impact] 🔍 Step 1: Looking up user by auth_user_id:', supabaseUser.id);
      if (storage.getUserByAuthId && typeof storage.getUserByAuthId === 'function') {
        dbUser = await storage.getUserByAuthId(supabaseUser.id);
        if (dbUser) {
          console.log('[GET /api/user/impact] ✅ Step 1 SUCCESS: User found by auth_user_id:', { id: dbUser.id, email: dbUser.email, auth_user_id: dbUser.auth_user_id });
        } else {
          console.log('[GET /api/user/impact] ⚠️ Step 1: User NOT found by auth_user_id');
        }
      } else {
        console.warn('[GET /api/user/impact] ⚠️ Step 1 SKIPPED: getUserByAuthId method not available');
      }
      
      // Step 2: Fallback to email lookup if auth_user_id lookup fails
      if (!dbUser && supabaseUser.email) {
        console.log('[GET /api/user/impact] 🔍 Step 2: Fallback - Looking up user by email:', supabaseUser.email);
        dbUser = await storage.getUserByEmail(supabaseUser.email);
        if (dbUser) {
          console.log('[GET /api/user/impact] ✅ Step 2 SUCCESS: User found by email:', { id: dbUser.id, email: dbUser.email, auth_user_id: dbUser.auth_user_id || 'NOT SET' });
        } else {
          console.log('[GET /api/user/impact] ⚠️ Step 2: User NOT found by email');
        }
      }
      
      // Step 3: If still not found, create minimal user on-the-fly
      if (!dbUser) {
        console.log('[GET /api/user/impact] 🔍 Step 3: User not found in database, creating user on-the-fly...');
        
        // Create user on-the-fly (fallback if database trigger doesn't work)
        try {
          // Derive username from email prefix
          const username = supabaseUser.email?.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '') || `user_${Date.now()}`;
          
          // Derive name from metadata (Google OAuth provides full_name)
          const fullName = supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || '';
          const nameParts = fullName.split(' ').filter(Boolean);
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';
          
          // Try createUserMinimal first (if available - SupabaseStorage)
          if (storage.createUserMinimal && typeof storage.createUserMinimal === 'function') {
            console.log('[GET /api/user/impact] Using createUserMinimal method');
            dbUser = await storage.createUserMinimal({
              username,
              email: supabaseUser.email || '',
              firstName,
              lastName,
              auth_user_id: supabaseUser.id
            });
            console.log('[GET /api/user/impact] ✅ Step 3 SUCCESS: User created via createUserMinimal:', { id: dbUser.id, email: dbUser.email, auth_user_id: dbUser.auth_user_id || 'NOT SET' });
            
            // User created with 50 Impact Points, now get impact data
            const userImpact = await storage.getUserImpact(dbUser.id);
            return res.json(userImpact);
          } else {
            // Fallback: Return default values
            console.log('[GET /api/user/impact] ⚠️ Step 3 FAILED: createUserMinimal not available, returning default values');
        return res.json({
          impactPoints: 50, // Default welcome bonus
          impactPointsChange: 0,
          amountDonated: 0,
          amountDonatedChange: 0,
          projectsSupported: 0,
          projectsSupportedChange: 0,
          userLevel: 'aspirer',
          userStatus: 'aspirer', // 50 < 100, so aspirer
        });
          }
        } catch (createError: any) {
          console.error('[GET /api/user/impact] ❌ Step 3 FAILED: Failed to create user:', createError);
          // Return default values as fallback
          return res.json({
            impactPoints: 50, // Default welcome bonus
            impactPointsChange: 0,
            amountDonated: 0,
            amountDonatedChange: 0,
            projectsSupported: 0,
            projectsSupportedChange: 0,
            userLevel: 'aspirer',
            userStatus: 'aspirer', // 50 < 100, so aspirer
          });
        }
      }
      
      console.log('[GET /api/user/impact] Database user found:', dbUser.id, 'impactPoints:', dbUser.impactPoints);
      
      try {
        const userImpact = await storage.getUserImpact(dbUser.id);
        
        // Get welcome flags from user record (handle missing columns gracefully)
        // CRITICAL: Check by EMAIL FIRST to handle cases where Google login creates a new user record
        let welcome_shown = false;
        let welcome_bonus_applied = false;
        try {
          const supabaseStorageModule = await import('./supabase-storage-new');
          const getSupabaseClient = (supabaseStorageModule as any).getSupabaseClient;
          if (getSupabaseClient && typeof getSupabaseClient === 'function') {
            const supabase = getSupabaseClient();
            
            // STEP 1: Check by EMAIL FIRST (most reliable - works across auth providers)
            if (supabaseUser.email) {
              const emailLower = supabaseUser.email.toLowerCase();
              console.log('[GET /api/user/impact] 🔍 Checking welcome flags by email:', emailLower);
              
              // Get ALL users with this email and find one with welcome_shown=true
              const { data: emailUsers, error: emailError } = await supabase
                .from('users')
                .select('id, welcome_shown, welcome_bonus_applied')
                .eq('email', emailLower);
              
              if (!emailError && emailUsers && emailUsers.length > 0) {
                // Check if ANY user with this email has welcome_shown=true
                const userWithWelcomeShown = emailUsers.find(u => u.welcome_shown === true);
                const userWithBonusApplied = emailUsers.find(u => u.welcome_bonus_applied === true);
                
                if (userWithWelcomeShown) {
                  welcome_shown = true;
                  console.log('[GET /api/user/impact] ✅ Found user with welcome_shown=true by email:', userWithWelcomeShown.id);
                  
                  // Sync ALL users with this email to have welcome_shown=true
                  await supabase
                    .from('users')
                    .update({ welcome_shown: true })
                    .eq('email', emailLower);
                  console.log('[GET /api/user/impact] ✅ Synced all users with email to welcome_shown=true');
                }
                
                if (userWithBonusApplied) {
                  welcome_bonus_applied = true;
                  console.log('[GET /api/user/impact] ✅ Found user with welcome_bonus_applied=true by email:', userWithBonusApplied.id);
                  
                  // Sync ALL users with this email to have welcome_bonus_applied=true
                  await supabase
                    .from('users')
                    .update({ welcome_bonus_applied: true })
                    .eq('email', emailLower);
                  console.log('[GET /api/user/impact] ✅ Synced all users with email to welcome_bonus_applied=true');
                }
              }
            }
            
            // STEP 2: Fallback - check current user's flag (in case email check didn't find anything)
            if (!welcome_shown) {
              const { data: userData } = await supabase
                .from('users')
                .select('welcome_shown, welcome_bonus_applied')
                .eq('id', dbUser.id)
                .single();
              if (userData) {
                welcome_shown = userData.welcome_shown === true;
                welcome_bonus_applied = userData.welcome_bonus_applied === true;
              }
            }
          }
        } catch (flagError) {
          // Columns might not exist yet - default to false
          console.log('[GET /api/user/impact] Could not fetch welcome flags (columns may not exist):', flagError);
        }
        
        console.log('[GET /api/user/impact] Returning impact:', { ...userImpact, welcome_shown, welcome_bonus_applied });
        return res.json({ ...userImpact, welcome_shown, welcome_bonus_applied });
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
      
      // Get welcome flags from user record (handle missing columns gracefully)
      let welcome_shown = false;
      let welcome_bonus_applied = false;
      try {
        const supabaseStorageModule = await import('./supabase-storage-new');
        const getSupabaseClient = (supabaseStorageModule as any).getSupabaseClient;
        if (getSupabaseClient && typeof getSupabaseClient === 'function') {
          const supabase = getSupabaseClient();
          const { data: userData } = await supabase
            .from('users')
            .select('welcome_shown, welcome_bonus_applied')
            .eq('id', req.user!.id)
            .single();
          if (userData) {
            welcome_shown = userData.welcome_shown === true;
            welcome_bonus_applied = userData.welcome_bonus_applied === true;
          }
        }
      } catch (flagError) {
        // Columns might not exist yet - default to false
        console.log('[GET /api/user/impact] Could not fetch welcome flags (columns may not exist):', flagError);
      }
      
      res.json({ ...userImpact, welcome_shown, welcome_bonus_applied });
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
        // Return empty array instead of 404 - user might be created by trigger soon
        return res.json([]);
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
        // Return empty array instead of 404 - user might be created by trigger soon
        return res.json([]);
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

  app.get("/api/user/supported-projects-with-donations", async (req, res) => {
    // Try Supabase auth first
    const supabaseUser = await getSupabaseUser(req);
    
    if (supabaseUser) {
      const dbUser = await storage.getUserByEmail(supabaseUser.email || '');
      if (!dbUser) {
        // Return empty array instead of 404 - user might be created by trigger soon
        return res.json([]);
      }
      try {
        // Check if storage has the new method
        if (storage.getUserSupportedProjectsWithDonations && typeof storage.getUserSupportedProjectsWithDonations === 'function') {
          const projectsWithDonations = await storage.getUserSupportedProjectsWithDonations(dbUser.id);
          return res.json(projectsWithDonations);
        } else {
          // Fallback to old method
          const projects = await storage.getUserSupportedProjects(dbUser.id);
          return res.json(projects.map(p => ({
            project: p,
            totalAmount: 0,
            totalImpactPoints: 0,
            donationCount: 0,
            lastDonationDate: null,
            donations: []
          })));
        }
      } catch (error) {
        console.error('[GET /api/user/supported-projects-with-donations] Error:', error);
        return res.status(500).json({ message: "Failed to fetch supported projects with donations" });
      }
    }
    
    // Fallback to Passport auth
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in to view supported projects" });
    }
    
    try {
      // Check if storage has the new method
      if (storage.getUserSupportedProjectsWithDonations && typeof storage.getUserSupportedProjectsWithDonations === 'function') {
        const projectsWithDonations = await storage.getUserSupportedProjectsWithDonations(req.user!.id);
        res.json(projectsWithDonations);
      } else {
        // Fallback to old method
        const projects = await storage.getUserSupportedProjects(req.user!.id);
        res.json(projects.map(p => ({
          project: p,
          totalAmount: 0,
          totalImpactPoints: 0,
          donationCount: 0,
          lastDonationDate: null,
          donations: []
        })));
      }
    } catch (error) {
      console.error('[GET /api/user/supported-projects-with-donations] Error:', error);
      res.status(500).json({ message: "Failed to fetch supported projects with donations" });
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

  app.get("/api/user/redemptions-with-rewards", async (req, res) => {
    // Try Supabase auth first
    const supabaseUser = await getSupabaseUser(req);
    
    if (supabaseUser) {
      const dbUser = await storage.getUserByEmail(supabaseUser.email || '');
      if (!dbUser) {
        // Return empty array instead of 404 - user might be created by trigger soon
        return res.json([]);
      }
      try {
        // Check if storage has the new method
        if (storage.getUserRedemptionsWithRewards && typeof storage.getUserRedemptionsWithRewards === 'function') {
          const redemptionsWithRewards = await storage.getUserRedemptionsWithRewards(dbUser.id);
          return res.json(redemptionsWithRewards);
        } else {
          // Fallback to old method
          const redemptions = await storage.getUserRedemptions(dbUser.id);
          return res.json(redemptions.map((r: any) => ({
            redemption: r,
            reward: r.rewards || r.reward || {},
            pointsSpent: r.pointsSpent || r.points_spent || 0,
            redemptionDate: r.createdAt || r.created_at ? new Date(r.createdAt || r.created_at) : null,
            status: r.status || 'pending'
          })));
        }
      } catch (error) {
        console.error('[GET /api/user/redemptions-with-rewards] Error:', error);
        return res.status(500).json({ message: "Failed to fetch redemptions with rewards" });
      }
    }
    
    // Fallback to Passport auth
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in to view redemptions" });
    }
    
    try {
      // Check if storage has the new method
      if (storage.getUserRedemptionsWithRewards && typeof storage.getUserRedemptionsWithRewards === 'function') {
        const redemptionsWithRewards = await storage.getUserRedemptionsWithRewards(req.user!.id);
        res.json(redemptionsWithRewards);
      } else {
        // Fallback to old method
        const redemptions = await storage.getUserRedemptions(req.user!.id);
        res.json(redemptions.map((r: any) => ({
          redemption: r,
          reward: r.rewards || r.reward || {},
          pointsSpent: r.pointsSpent || r.points_spent || 0,
          redemptionDate: r.createdAt || r.created_at ? new Date(r.createdAt || r.created_at) : null,
          status: r.status || 'pending'
        })));
      }
    } catch (error) {
      console.error('[GET /api/user/redemptions-with-rewards] Error:', error);
      res.status(500).json({ message: "Failed to fetch redemptions with rewards" });
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
        message: 'Error testing Vercel sitemap'
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
