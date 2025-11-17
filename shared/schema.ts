import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  impactPoints: integer("impact_points").default(0), // Current point balance (one currency)
  totalDonations: integer("total_donations").default(0), // Total amount donated (for status check)
  createdAt: timestamp("created_at").defaultNow()
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  firstName: true,
  lastName: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Project schema (combined single table)
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  summary: text("summary"),
  missionStatement: text("mission_statement"),
  keyImpact: text("key_impact"),
  aboutUs: text("about_us"),
  impactAchievements: text("impact_achievements"),
  fundUsage: text("fund_usage"),
  selectionReasoning: text("selection_reasoning"),
  
  // Main image/video
  imageUrl: text("image_url").notNull(),
  coverImage: text("cover_image"), // Optional cover image for videos (thumbnail)
  
  // Additional media (up to 6 images/videos)
  image1: text("image1"),
  image2: text("image2"),
  image3: text("image3"),
  image4: text("image4"),
  image5: text("image5"),
  image6: text("image6"),
  imageType1: text("image_type1"),
  imageType2: text("image_type2"),
  imageType3: text("image_type3"),
  imageType4: text("image_type4"),
  imageType5: text("image_type5"),
  imageType6: text("image_type6"),
  
  // Project info
  category: text("category").notNull(),
  country: text("country").notNull(),
  founderName: text("founder_name"),
  founderImage: text("founder_image"),
  founderBio: text("founder_bio"),
  impactPointsMultiplier: integer("impact_points_multiplier").default(10),
  primarySdg: text("primary_sdg"),
  sdgGoals: text("sdg_goals").array(),
  
  // Contact info
  website: text("website"),
  email: text("email"),
  instagramUrl: text("instagram_url"),
  youtubeUrl: text("youtube_url"),
  facebookUrl: text("facebook_url"),
  linkedinUrl: text("linkedin_url"),
  tiktokUrl: text("tiktok_url"),
  
  // Impact tracking system
  impactUnit: text("impact_unit"),
  impact_noun: text("impact_noun"),
  impact_verb: text("impact_verb"),
  donation1: integer("donation_1"),
  donation2: integer("donation_2"),
  donation3: integer("donation_3"),
  donation4: integer("donation_4"),
  donation5: integer("donation_5"),
  donation6: integer("donation_6"),
  donation7: integer("donation_7"),
  impact1: doublePrecision("impact_1"),
  impact2: doublePrecision("impact_2"),
  impact3: doublePrecision("impact_3"),
  impact4: doublePrecision("impact_4"),
  impact5: doublePrecision("impact_5"),
  impact6: doublePrecision("impact_6"),
  impact7: doublePrecision("impact_7"),
  
  // Project status and metrics
  goal: integer("goal"),
  raised: integer("raised").default(0),
  donors: integer("donors").default(0),
  featured: boolean("featured").default(false),
  percentCompleted: integer("percent_completed").default(0),
  impactPoints: integer("impact_points").default(0),
  status: text("status").default("active"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true
});

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

// Donation schema
export const donations = pgTable("donations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  projectId: integer("project_id").notNull(),
  amount: integer("amount").notNull(),
  impactPoints: integer("impact_points").notNull(),
  stripeSessionId: text("stripe_session_id"),
  status: text("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow()
});

export const insertDonationSchema = createInsertSchema(donations).omit({
  id: true,
  createdAt: true
});

export type InsertDonation = z.infer<typeof insertDonationSchema>;
export type Donation = typeof donations.$inferSelect;

// User Transactions schema (audit trail for all Impact Points movements)
export const userTransactions = pgTable("user_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  transactionType: text("transaction_type").notNull(), // 'support' | 'redemption' | 'bonus' | 'adjustment' | 'welcome_bonus'
  
  // For support transactions
  projectId: integer("project_id").references(() => projects.id, { onDelete: "set null" }),
  donationId: integer("donation_id").references(() => donations.id, { onDelete: "set null" }),
  supportAmount: integer("support_amount"), // In cents ($10 = 1000)
  
  // For redemption transactions
  rewardId: integer("reward_id").references(() => rewards.id, { onDelete: "set null" }),
  redemptionId: integer("redemption_id").references(() => redemptions.id, { onDelete: "set null" }),
  
  // Impact Points tracking
  pointsChange: integer("points_change").notNull(), // Positive = earned, Negative = spent
  pointsBalanceAfter: integer("points_balance_after").notNull(), // Running balance (for audit)
  
  // Metadata
  description: text("description"), // Human-readable description
  metadata: text("metadata"), // JSON string for flexible additional data
  
  createdAt: timestamp("created_at").defaultNow()
});

export const insertUserTransactionSchema = createInsertSchema(userTransactions).omit({
  id: true,
  createdAt: true
});

export type InsertUserTransaction = z.infer<typeof insertUserTransactionSchema>;
export type UserTransaction = typeof userTransactions.$inferSelect;

// Reward schema
export const rewards = pgTable("rewards", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  category: text("category").notNull(),
  partnerLevel: text("partner_level").notNull(), // Legacy, keep for backward compatibility
  pointsCost: integer("points_cost").notNull(),
  featured: boolean("featured").default(false),
  
  // Legacy fields (keep for backward compatibility)
  discount: text("discount"),
  discountName: text("discount_name"),
  companyName: text("company_name"),
  
  // PHASE 1 FIELDS (aligned with actual database):
  brandId: integer("brand_id").references(() => brands.id, { onDelete: "set null" }),
  rewardType: text("reward_type").default("promo_code"), // 'promo_code' | 'freebie' | 'experience'
  promoCode: text("promo_code"), // The actual code users get (renamed from couponCode)
  redemptionInstructions: text("redemption_instructions"), // How to redeem
  retailValue: text("retail_value"), // e.g. "$15 value"
  isSingleUse: boolean("is_single_use").default(false), // Track if code is single-use
  availableFrom: timestamp("available_from"), // When reward becomes available
  availableUntil: timestamp("available_until"), // When reward expires
  inventoryCount: integer("inventory_count"), // NULL = unlimited
  inventoryRemaining: integer("inventory_remaining"), // Track usage
  status: text("status").default("active"), // 'active' | 'coming_soon' | 'out_of_stock'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const insertRewardSchema = createInsertSchema(rewards).omit({
  id: true
});

export type InsertReward = z.infer<typeof insertRewardSchema>;
export type Reward = typeof rewards.$inferSelect;

// User Impact schema (for frontend data)
export interface UserImpact {
  impactPoints: number;
  impactPointsChange: number;
  amountDonated: number;
  amountDonatedChange: number;
  projectsSupported: number;
  projectsSupportedChange: number;
  userStatus: "aspirer" | "supporter"; // Simple two-status system
}

// Impact History schema (for chart)
export interface UserImpactHistory {
  date: string;
  points: number;
}

// User Redemption schema
export const redemptions = pgTable("redemptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  rewardId: integer("reward_id").notNull(),
  pointsSpent: integer("points_spent").notNull(),
  
  // PHASE 1 FIELDS:
  promoCode: text("promo_code"), // The actual code given to user (for unique codes later)
  status: text("status").default("fulfilled"), // 'pending' | 'fulfilled' | 'cancelled'
  fulfilledAt: timestamp("fulfilled_at"),
  metadata: text("metadata"), // JSON string for shipping address, notes, etc.
  
  createdAt: timestamp("created_at").defaultNow()
});

export const insertRedemptionSchema = createInsertSchema(redemptions).omit({
  id: true,
  createdAt: true
});

export type InsertRedemption = z.infer<typeof insertRedemptionSchema>;
export type Redemption = typeof redemptions.$inferSelect;

// Backer schema
export const backers = pgTable("backers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  shortDescription: text("short_description"), // Handles both "Shortdescription" and "short_description"
  websiteUrl: text("website_url"), // Handles both "website:url" and "website_url"
  logoPath: text("logo_path"),
  featured: boolean("featured").default(false), // Handles both "Featured" and "featured"
  createdAt: timestamp("created_at").defaultNow()
});

export const insertBackerSchema = createInsertSchema(backers).omit({
  id: true,
  createdAt: true
});

export type InsertBacker = z.infer<typeof insertBackerSchema>;
export type Backer = typeof backers.$inferSelect;

// Project Backers junction table (many-to-many relationship)
export const projectBackers = pgTable("project_backers", {
  id: serial("id").primaryKey(),
  backerId: integer("backer_id").notNull().references(() => backers.id, { onDelete: "cascade" }),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow()
});

export const insertProjectBackerSchema = createInsertSchema(projectBackers).omit({
  id: true,
  createdAt: true
});

export type InsertProjectBacker = z.infer<typeof insertProjectBackerSchema>;
export type ProjectBacker = typeof projectBackers.$inferSelect;

// Project Press Mentions schema
export const projectPressMentions = pgTable("project_press_mentions", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  institutionName: text("institution_name"),
  institutionLogo: text("institution_logo"), // URL or Supabase Storage path
  headline: text("headline"),
  shortDescription: text("short_description"),
  link: text("link").notNull(), // URL to the press article
  createdAt: timestamp("created_at").defaultNow()
});

export const insertProjectPressMentionSchema = createInsertSchema(projectPressMentions).omit({
  id: true,
  createdAt: true
});

export type InsertProjectPressMention = z.infer<typeof insertProjectPressMentionSchema>;
export type ProjectPressMention = typeof projectPressMentions.$inferSelect;

// Brand Partners schema (for sustainable brand partners)
export const brands = pgTable("brands", {
  id: serial("id").primaryKey(),
  slug: text("slug").unique(), // For URLs like /brands/patagonia
  name: text("name").notNull(),
  logoUrl: text("logo_url"), // Brand logo (renamed from logoPath to match DB)
  heroImageUrl: text("hero_image_url"), // Large banner image for brand page
  websiteUrl: text("website_url"),
  description: text("description"), // Short description of the brand
  longDescription: text("long_description"), // Detailed description for brand page
  category: text("category"), // e.g., "Beauty & Wellness", "Food & Agriculture", "Sustainable Lifestyle"
  featured: boolean("featured").default(false), // For featured brands in hero sections
  displayOrder: integer("display_order").default(0), // For controlling display order
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const insertBrandSchema = createInsertSchema(brands).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type InsertBrand = z.infer<typeof insertBrandSchema>;
export type Brand = typeof brands.$inferSelect;

// Product Highlights schema (visual product showcases for brands)
export const productHighlights = pgTable("product_highlights", {
  id: serial("id").primaryKey(),
  brandId: integer("brand_id").notNull().references(() => brands.id, { onDelete: "cascade" }),
  title: text("title"), // e.g. "Nano Puff Jacket"
  imageUrl: text("image_url").notNull(), // Product image
  productLink: text("product_link"), // External link to brand's product page
  ordering: integer("ordering").default(0), // Display order
  createdAt: timestamp("created_at").defaultNow()
});

export const insertProductHighlightSchema = createInsertSchema(productHighlights).omit({
  id: true,
  createdAt: true
});

export type InsertProductHighlight = z.infer<typeof insertProductHighlightSchema>;
export type ProductHighlight = typeof productHighlights.$inferSelect;

// Impact Ranks table removed - using simple two-status system instead
// Status is derived from totalDonations: 0 = "Impact Aspirer", >0 = "Impact Supporter"
