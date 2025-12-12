import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision, numeric, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password"), // Nullable for Supabase auth users (no password needed)
  email: text("email"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  auth_user_id: text("auth_user_id"), // UUID from Supabase auth.users table
  impactPoints: integer("impactPoints").default(50), // Database uses camelCase, default 50 for new users
  totalDonations: integer("totalDonations").default(0), // Database uses camelCase
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
  
  // German translations (nullable - fallback to English if not available)
  titleDe: text("title_de"),
  descriptionDe: text("description_de"),
  slugDe: text("slug_de"),
  summaryDe: text("summary_de"),
  missionStatementDe: text("mission_statement_de"),
  keyImpactDe: text("key_impact_de"),
  aboutUsDe: text("about_us_de"),
  impactAchievementsDe: text("impact_achievements_de"),
  fundUsageDe: text("fund_usage_de"),
  selectionReasoningDe: text("selection_reasoning_de"),
  countryDe: text("country_de"),
  impactUnitDe: text("impact_unit_de"),
  impactNounDe: text("impact_noun_de"),
  impactVerbDe: text("impact_verb_de"),
  
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
  founderBioDe: text("founder_bio_de"),
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
  
  // Impact tracking system (Legacy - preserved for backward compatibility)
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
  
  // New Impact Tracking System (Phase 1 Migration)
  // Impact calculation
  impactFactor: numeric("impact_factor"), // Linear impact factor (e.g., 0.1 = 1$ = 0.1 units)
  
  // Units (for {unit} placeholder - automatic Singular/Plural)
  impactUnitSingularEn: text("impact_unit_singular_en"),
  impactUnitPluralEn: text("impact_unit_plural_en"),
  impactUnitSingularDe: text("impact_unit_singular_de"),
  impactUnitPluralDe: text("impact_unit_plural_de"),
  
  // Templates (only free-text part - {impact} and {unit} are automatically inserted)
  // Past: "{impact} {unit} {freitext_past}"
  // CTA: "Support {project} with ${amount} and help {impact} {unit} {freitext_cta} — earn {points} Impact Points"
  ctaTemplateEn: text("cta_template_en"),
  ctaTemplateDe: text("cta_template_de"),
  pastTemplateEn: text("past_template_en"),
  pastTemplateDe: text("past_template_de"),
  
  // Impact-Tiers for non-linear projects (optional - for exceptions)
  impactTiers: jsonb("impact_tiers"),
  
  // Optional: Backup of old presets
  impactPresets: jsonb("impact_presets"),
  
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
// NOTE: Actual database uses camelCase columns (userId, projectId, impactPoints, createdAt)
// Drizzle mapping below is for documentation - Supabase client queries use camelCase directly
export const donations = pgTable("donations", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),      // Actual DB column is "userId" (camelCase)
  projectId: integer("projectId").notNull(), // Actual DB column is "projectId" (camelCase)
  amount: integer("amount").notNull(),
  impactPoints: integer("impactPoints").notNull(), // Actual DB column is "impactPoints" (camelCase)
  // stripeSessionId removed - column doesn't exist in database
  status: text("status").default("pending"),
  createdAt: timestamp("createdAt").defaultNow(), // Actual DB column is "createdAt" (camelCase)
  
  // New Impact Tracking System (Phase 1 Migration)
  // Calculated impact value (immutable snapshot at donation time)
  calculatedImpact: numeric("calculated_impact"),
  
  // Full impact snapshot (JSONB with all data for debugging/audit)
  impactSnapshot: jsonb("impact_snapshot"),
  
  // Generated texts (for quick access without template rendering)
  // Note: Only Past texts are stored - CTA texts are only needed before donation (from project template)
  generatedTextPastEn: text("generated_text_past_en"),
  generatedTextPastDe: text("generated_text_past_de"),
});

export const insertDonationSchema = createInsertSchema(donations).omit({
  id: true,
  createdAt: true
});

export type InsertDonation = z.infer<typeof insertDonationSchema>;
export type Donation = typeof donations.$inferSelect;

// Reward schema
export const rewards = pgTable("rewards", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  titleDe: text("title_de"), // German title
  description: text("description").notNull(),
  descriptionDe: text("description_de"), // German description
  imageUrl: text("image_url").notNull(),
  category: text("category").notNull(),
  partnerLevel: text("partner_level").notNull(),
  pointsCost: integer("points_cost").notNull(),
  featured: boolean("featured").default(false),
  discount: text("discount"),
  discountName: text("discount_name"),
  companyName: text("company_name"),
  redemptionInstructions: text("redemption_instructions"),
  redemptionInstructionsDe: text("redemption_instructions_de"), // German redemption instructions
  createdAt: timestamp("created_at").defaultNow() // Added in Phase 1 migration
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
  userLevel: string;
  // Optional flags for onboarding and bonus state
  welcome_shown?: boolean;
  welcome_bonus_applied?: boolean;
}

// Impact History schema (for chart)
export interface UserImpactHistory {
  date: string;
  points: number;
}

// User Redemption schema
export const redemptions = pgTable("redemptions", {
  id: serial("id").primaryKey(),
  // userId is nullable to keep redemptions when a user is deleted (FK on delete set null)
  userId: integer("userId").references(() => users.id, { onDelete: "set null" }),
  rewardId: integer("rewardId").notNull(),
  pointsSpent: integer("pointsSpent").notNull(),
  status: text("status").notNull().default("pending"), // pending, fulfilled, or cancelled
  createdAt: timestamp("createdAt").defaultNow()
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
  shortDescriptionDe: text("short_description_de"), // German translation
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
  name: text("name").notNull(),
  logoPath: text("logo_path"), // URL or Supabase Storage path
  websiteUrl: text("website_url"),
  description: text("description"), // Short description of the brand
  descriptionDe: text("description_de"), // German description of the brand
  category: text("category"), // e.g., "Beauty & Wellness", "Food & Agriculture", "Sustainable Lifestyle"
  country: text("country"), // Country where the brand is based (e.g., "Switzerland")
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
