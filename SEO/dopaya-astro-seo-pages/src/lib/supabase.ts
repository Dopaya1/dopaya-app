import { createClient } from '@supabase/supabase-js';

// Use the same environment variables as main Dopaya site
const supabaseUrl = 'https://mpueatfperbxbbojlrwd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wdWVhdGZwZXJieGJib2pscndkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwODk3NzAsImV4cCI6MjA2MTY2NTc3MH0.GPBxZ2yEbtB3Ws_nKWeDaE-yuyH-uvufV-Mq9aN8hEc';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types matching the Dopaya schema
export interface Project {
  id: number;
  title: string;
  slug: string;
  description: string;
  summary?: string;
  missionStatement?: string;
  keyImpact?: string;
  aboutUs?: string;
  impactAchievements?: string;
  fundUsage?: string;
  selectionReasoning?: string;
  imageUrl: string;
  category: string;
  country: string;
  founderName?: string;
  founderImage?: string;
  founderBio?: string;
  website?: string;
  email?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
  facebookUrl?: string;
  linkedinUrl?: string;
  goal?: number;
  raised: number;
  donors: number;
  featured: boolean;
  percentCompleted: number;
  impactPoints: number;
  status: string;
  createdAt: string;
  impactFactor?: number;
  impactUnitSingularEn?: string;
  impactUnitPluralEn?: string;
  ctaTemplateEn?: string;
  pastTemplateEn?: string;
}

export interface Brand {
  id: number;
  name: string;
  /** Only brands with status = 'active' are shown; 'draft' is hidden */
  status?: string;
  logoPath?: string;
  logo_url?: string;
  logoUrl?: string;
  /** Supabase often returns snake_case (website_url); use this or websiteUrl/website */
  website_url?: string;
  websiteUrl?: string;
  website?: string;
  description?: string;
  /** German description from Supabase (used when locale is de) */
  description_de?: string;
  category?: string;
  country?: string;
  featured: boolean;
  displayOrder: number;
  createdAt: string;
}

export interface Reward {
  id: number;
  title: string;
  /** German title from Supabase (used when locale is de) */
  title_de?: string;
  description: string;
  /** German description from Supabase (used when locale is de) */
  description_de?: string;
  imageUrl: string;
  category: string;
  partnerLevel: string;
  pointsCost: number;
  featured: boolean;
  discount?: string;
  discountName?: string;
  companyName?: string;
  redemptionInstructions?: string;
  createdAt: string;
}

export interface Backer {
  id: number;
  name: string;
  shortDescription?: string;
  websiteUrl?: string;
  logoPath?: string;
  featured: boolean;
  createdAt: string;
}

// Data fetching functions
export async function getProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('status', 'active')
    .order('featured', { ascending: false });
    
  if (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
  
  return data || [];
}

export async function getProjectsByCategory(category: string): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('category', category)
    .eq('status', 'active')
    .order('featured', { ascending: false });
    
  if (error) {
    console.error('Error fetching projects by category:', error);
    return [];
  }
  
  return data || [];
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', slug)
    .single();
    
  if (error) {
    console.error('Error fetching project by slug:', error);
    return null;
  }
  
  return data;
}

/** Returns all brands from Supabase (used by formula3 and brand detail pages for logo, description, rewards). */
export async function getBrands(): Promise<Brand[]> {
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .order('display_order', { ascending: true });
    
  if (error) {
    console.error('Error fetching brands:', error);
    return [];
  }
  
  return data || [];
}

export async function getRewards(): Promise<Reward[]> {
  const { data, error } = await supabase
    .from('rewards')
    .select('*')
    // Column is pointsCost in this Supabase schema
    .order('pointsCost', { ascending: true });
    
  if (error) {
    console.error('Error fetching rewards:', error);
    return [];
  }
  
  return data || [];
}

export async function getRewardsByBrand(companyName: string): Promise<Reward[]> {
  const { data, error } = await supabase
    .from('rewards')
    .select('*')
    .eq('company_name', companyName)
    // Column is pointsCost in this Supabase schema
    .order('pointsCost', { ascending: true });
    
  if (error) {
    console.error('Error fetching rewards by brand:', error);
    return [];
  }
  
  return data || [];
}

export async function getBackers(): Promise<Backer[]> {
  const { data, error } = await supabase
    .from('backers')
    .select('*')
    .eq('featured', true)
    .order('name', { ascending: true });
    
  if (error) {
    console.error('Error fetching backers:', error);
    return [];
  }
  
  return data || [];
}