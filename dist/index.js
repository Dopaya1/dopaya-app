// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
import session from "express-session";
import createMemoryStore from "memorystore";
var MemoryStore = createMemoryStore(session);
var MemStorage = class {
  users;
  projects;
  donations;
  rewards;
  redemptions;
  sessionStore;
  userIdCounter = 1;
  projectIdCounter = 1;
  donationIdCounter = 1;
  rewardIdCounter = 1;
  redemptionIdCounter = 1;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.projects = /* @__PURE__ */ new Map();
    this.donations = /* @__PURE__ */ new Map();
    this.rewards = /* @__PURE__ */ new Map();
    this.redemptions = /* @__PURE__ */ new Map();
    this.sessionStore = new MemoryStore({
      checkPeriod: 864e5
      // Cleanup expired sessions every 24h
    });
    this.initializeSampleData();
  }
  // User operations
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  async createUser(insertUser) {
    const id = this.userIdCounter++;
    const now = /* @__PURE__ */ new Date();
    const user = { ...insertUser, id, createdAt: now };
    this.users.set(id, user);
    return user;
  }
  // Project operations
  async getProjects() {
    return Array.from(this.projects.values());
  }
  async getProject(id) {
    return this.projects.get(id);
  }
  async getFeaturedProjects() {
    return Array.from(this.projects.values()).filter((project) => project.featured);
  }
  async createProject(project) {
    const id = this.projectIdCounter++;
    const now = /* @__PURE__ */ new Date();
    const newProject = { ...project, id, createdAt: now };
    this.projects.set(id, newProject);
    return newProject;
  }
  async updateProject(id, project) {
    const existingProject = this.projects.get(id);
    if (!existingProject) {
      return void 0;
    }
    const updatedProject = { ...existingProject, ...project };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }
  // Donation operations
  async createDonation(donation) {
    const id = this.donationIdCounter++;
    const now = /* @__PURE__ */ new Date();
    const newDonation = { ...donation, id, createdAt: now };
    this.donations.set(id, newDonation);
    const project = this.projects.get(donation.projectId);
    if (project) {
      project.raisedAmount = (project.raisedAmount || 0) + donation.amount;
      this.projects.set(project.id, project);
    }
    return newDonation;
  }
  async getUserDonations(userId) {
    return Array.from(this.donations.values()).filter(
      (donation) => donation.userId === userId
    );
  }
  async getProjectDonations(projectId) {
    return Array.from(this.donations.values()).filter(
      (donation) => donation.projectId === projectId
    );
  }
  // Reward operations
  async getRewards() {
    return Array.from(this.rewards.values());
  }
  async getReward(id) {
    return this.rewards.get(id);
  }
  async getFeaturedRewards() {
    return Array.from(this.rewards.values()).filter((reward) => reward.featured);
  }
  async createReward(reward) {
    const id = this.rewardIdCounter++;
    const newReward = { ...reward, id };
    this.rewards.set(id, newReward);
    return newReward;
  }
  // Redemption operations
  async createRedemption(redemption) {
    const id = this.redemptionIdCounter++;
    const now = /* @__PURE__ */ new Date();
    const newRedemption = { ...redemption, id, createdAt: now };
    this.redemptions.set(id, newRedemption);
    return newRedemption;
  }
  async getUserRedemptions(userId) {
    return Array.from(this.redemptions.values()).filter(
      (redemption) => redemption.userId === userId
    );
  }
  // Impact statistics
  async getUserImpact(userId) {
    const userDonations = await this.getUserDonations(userId);
    const userRedemptions = await this.getUserRedemptions(userId);
    const impactPointsEarned = userDonations.reduce((sum, donation) => sum + donation.impactPoints, 0);
    const impactPointsSpent = userRedemptions.reduce((sum, redemption) => sum + redemption.pointsSpent, 0);
    const impactPoints = impactPointsEarned - impactPointsSpent;
    const amountDonated = userDonations.reduce((sum, donation) => sum + donation.amount, 0);
    const uniqueProjectIds = new Set(userDonations.map((donation) => donation.projectId));
    const projectsSupported = uniqueProjectIds.size;
    let userLevel = "First Steps";
    if (impactPoints >= 2e4) {
      userLevel = "Impact Legend";
    } else if (impactPoints >= 5e3) {
      userLevel = "Changemaker";
    } else if (impactPoints >= 1e3) {
      userLevel = "Supporter";
    }
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
  async getUserImpactHistory(userId) {
    const userDonations = await this.getUserDonations(userId);
    const sortedDonations = [...userDonations].sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    );
    const history = [];
    let runningTotal = 0;
    if (sortedDonations.length === 0) {
      return [
        { date: "Jan 1", points: 0 },
        { date: "Feb 15", points: 3e3 },
        { date: "Mar 3", points: 6500 },
        { date: "Apr 10", points: 13e3 },
        { date: "May 1", points: 26e3 }
      ];
    }
    sortedDonations.forEach((donation) => {
      const date = donation.createdAt;
      const monthYear = `${date.toLocaleString("default", { month: "short" })} ${date.getDate()}`;
      runningTotal += donation.impactPoints;
      history.push({
        date: monthYear,
        points: runningTotal
      });
    });
    return history;
  }
  async getUserSupportedProjects(userId) {
    const userDonations = await this.getUserDonations(userId);
    const projectIds = new Set(userDonations.map((donation) => donation.projectId));
    const supportedProjects = [];
    for (const id of projectIds) {
      const project = await this.getProject(id);
      if (project) {
        supportedProjects.push(project);
      }
    }
    return supportedProjects;
  }
  // Initialize with sample data
  initializeSampleData() {
    const sampleProjects = [
      {
        title: "CleanWater Initiative",
        description: "Providing clean water access to rural communities in East Africa.",
        imageUrl: "https://images.unsplash.com/photo-1508522750368-b5c883e1d917",
        category: "Education",
        country: "Kenya",
        founderNames: "Michael Kimani, Sarah Ochieng",
        focusArea: "Water & Sanitation",
        impactMultiplier: 10,
        raisedAmount: 32500,
        featured: true
      },
      {
        title: "CleanTech Energy",
        description: "Renewable energy solutions for off-grid communities in rural areas.",
        imageUrl: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8",
        category: "Energy",
        country: "India",
        founderNames: "Rahul Sharma, Priya Patel",
        focusArea: "Renewable Energy",
        impactMultiplier: 8,
        raisedAmount: 41200,
        featured: true
      },
      {
        title: "HealthTech Global",
        description: "Expanding healthcare access through telemedicine in underserved areas.",
        imageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40",
        category: "Health",
        country: "Brazil",
        founderNames: "Lucas Santos, Maria Silva",
        focusArea: "Healthcare Access",
        impactMultiplier: 12,
        raisedAmount: 28700,
        featured: true
      },
      {
        title: "MicroLoans",
        description: "Empowering entrepreneurs through microfinance in developing regions.",
        imageUrl: "https://images.unsplash.com/photo-1601761457448-de2b986181f1",
        category: "Finance",
        country: "Philippines",
        founderNames: "Juan Reyes, Anna Torres",
        focusArea: "Economic Empowerment",
        impactMultiplier: 7,
        raisedAmount: 56400,
        featured: true
      },
      {
        title: "Greenovate Solutions",
        description: "Building sustainable carbon capture innovations through decentralized carbon capture technology.",
        imageUrl: "https://images.unsplash.com/photo-1590496793929-36417d3117ee",
        category: "Environment",
        country: "India",
        founderNames: "Vikram Desai, Anjali Sharma",
        focusArea: "Sustainable Development",
        impactMultiplier: 10,
        raisedAmount: 72600,
        featured: false
      }
    ];
    for (const project of sampleProjects) {
      this.createProject(project);
    }
    const sampleRewards = [
      {
        title: "20% Off Bundle",
        description: "Exclusive discount on eco-friendly travel packages to Southeast Asia.",
        imageUrl: "https://images.unsplash.com/photo-1508599589920-14cfa1c1fe4d",
        category: "Travel",
        partnerLevel: "Prime Partner",
        pointsCost: 1e4,
        featured: true
      },
      {
        title: "Organic Gift Box",
        description: "Premium organic skincare set from sustainable beauty brand Gaia.",
        imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e",
        category: "Wellness",
        partnerLevel: "Partner",
        pointsCost: 5e3,
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
        pointsCost: 3e3,
        featured: true
      }
    ];
    for (const reward of sampleRewards) {
      this.createReward(reward);
    }
  }
};
var storage = new MemStorage();

// server/auth.ts
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session2 from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { z } from "zod";
var scryptAsync = promisify(scrypt);
async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}
async function comparePasswords(supplied, stored) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = await scryptAsync(supplied, salt, 64);
  return timingSafeEqual(hashedBuf, suppliedBuf);
}
function setupAuth(app2) {
  const sessionSettings = {
    secret: process.env.SESSION_SECRET || "dopaya-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 1e3 * 60 * 60 * 24 * 7,
      // 1 week
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      path: "/"
    }
  };
  app2.set("trust proxy", 1);
  app2.use(session2(sessionSettings));
  app2.use(passport.initialize());
  app2.use(passport.session());
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !await comparePasswords(password, user.password)) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      } catch (error) {
        return done(error);
      }
    })
  );
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
  const registrationSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    email: z.string().email("Invalid email format").optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional()
  });
  app2.post("/api/register", async (req, res, next) => {
    try {
      const validationResult = registrationSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: validationResult.error.errors
        });
      }
      const userData = validationResult.data;
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      const user = await storage.createUser({
        ...userData,
        password: await hashPassword(userData.password)
      });
      req.login(user, (err) => {
        if (err) return next(err);
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      next(error);
    }
  });
  app2.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      req.login(user, (err2) => {
        if (err2) return next(err2);
        const { password, ...userWithoutPassword } = user;
        res.status(200).json(userWithoutPassword);
      });
    })(req, res, next);
  });
  app2.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });
  app2.get("/api/user", (req, res) => {
    console.log("Auth state:", {
      isAuthenticated: req.isAuthenticated(),
      session: req.session,
      user: req.user ? { id: req.user.id, username: req.user.username } : null,
      cookies: req.headers.cookie
    });
    if (!req.isAuthenticated()) {
      console.log("User not authenticated, returning 401");
      return res.sendStatus(401);
    }
    console.log("User authenticated, returning user data");
    const { password, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  });
}

// server/routes.ts
import { z as z2 } from "zod";
async function registerRoutes(app2) {
  setupAuth(app2);
  app2.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getProjects();
      const { search, category, country } = req.query;
      let filteredProjects = projects;
      if (search) {
        const searchLower = String(search).toLowerCase();
        filteredProjects = filteredProjects.filter(
          (project) => project.title.toLowerCase().includes(searchLower) || project.description.toLowerCase().includes(searchLower)
        );
      }
      if (category) {
        filteredProjects = filteredProjects.filter(
          (project) => project.category.toLowerCase() === String(category).toLowerCase()
        );
      }
      if (country) {
        filteredProjects = filteredProjects.filter(
          (project) => project.country.toLowerCase() === String(country).toLowerCase()
        );
      }
      res.json(filteredProjects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });
  app2.get("/api/projects/featured", async (req, res) => {
    try {
      const featuredProjects = await storage.getFeaturedProjects();
      res.json(featuredProjects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch featured projects" });
    }
  });
  app2.get("/api/projects/:id", async (req, res) => {
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
  app2.post("/api/projects/:id/donate", async (req, res) => {
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
      const schema = z2.object({
        amount: z2.number().positive()
      });
      const validationResult = schema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid donation amount" });
      }
      const { amount } = validationResult.data;
      const impactPoints = amount * (project.impactMultiplier || 10);
      const donation = await storage.createDonation({
        userId: req.user.id,
        projectId,
        amount,
        impactPoints
      });
      res.status(201).json(donation);
    } catch (error) {
      res.status(500).json({ message: "Failed to process donation" });
    }
  });
  app2.get("/api/rewards", async (req, res) => {
    try {
      const rewards = await storage.getRewards();
      res.json(rewards);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch rewards" });
    }
  });
  app2.get("/api/rewards/featured", async (req, res) => {
    try {
      const featuredRewards = await storage.getFeaturedRewards();
      res.json(featuredRewards);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch featured rewards" });
    }
  });
  app2.get("/api/rewards/:id", async (req, res) => {
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
  app2.post("/api/rewards/:id/redeem", async (req, res) => {
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
      const userImpact = await storage.getUserImpact(req.user.id);
      if (userImpact.impactPoints < reward.pointsCost) {
        return res.status(400).json({ message: "Insufficient impact points" });
      }
      const redemption = await storage.createRedemption({
        userId: req.user.id,
        rewardId,
        pointsSpent: reward.pointsCost
      });
      res.status(201).json(redemption);
    } catch (error) {
      res.status(500).json({ message: "Failed to redeem reward" });
    }
  });
  app2.get("/api/user/impact", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in to view impact data" });
    }
    try {
      const userImpact = await storage.getUserImpact(req.user.id);
      res.json(userImpact);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch impact data" });
    }
  });
  app2.get("/api/user/impact-history", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in to view impact history" });
    }
    try {
      const impactHistory = await storage.getUserImpactHistory(req.user.id);
      res.json(impactHistory);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch impact history" });
    }
  });
  app2.get("/api/user/supported-projects", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in to view supported projects" });
    }
    try {
      const supportedProjects = await storage.getUserSupportedProjects(req.user.id);
      res.json(supportedProjects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch supported projects" });
    }
  });
  app2.get("/api/user/donations", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in to view donations" });
    }
    try {
      const userDonations = await storage.getUserDonations(req.user.id);
      res.json(userDonations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch donations" });
    }
  });
  app2.get("/api/user/redemptions", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in to view redemptions" });
    }
    try {
      const userRedemptions = await storage.getUserRedemptions(req.user.id);
      res.json(userRedemptions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch redemptions" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
