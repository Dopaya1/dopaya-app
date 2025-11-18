import { createClient } from '@supabase/supabase-js';
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

// Get Supabase credentials from environment
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function for password hashing (for OAuth users, password is empty)
async function hashPassword(password: string) {
  if (!password) return '';
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

// Get user by email
async function getUserByEmail(email: string) {
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
      console.error(`Error retrieving user with email ${email}:`, error);
      return undefined;
    }
    
    return data || undefined;
  } catch (error) {
    console.error(`Error retrieving user with email ${email}:`, error);
    return undefined;
  }
}

// Create user with 50 Impact Points
async function createUser(userData: {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
}) {
  try {
    const hashedPassword = await hashPassword(userData.password);
    
    // Create the user record with 50 Impact Points welcome bonus
    // Note: Database uses snake_case column names
    const { data, error } = await supabase
      .from('users')
      .insert([{ 
        email: userData.email,
        username: userData.username,
        password: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        impact_points: 50, // Welcome bonus for new users (database column name)
        total_donations: 0 // Initialize to 0 (database column name)
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
    throw error;
  }
}

export default async function handler(req: any, res: any) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, username, firstName, lastName } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    
    console.log('[ensure-profile] Ensuring user profile for:', email);
    
    // Check if user already exists by email
    const existingUser = await getUserByEmail(email);
    
    if (existingUser) {
      console.log('[ensure-profile] User profile already exists:', existingUser.id);
      return res.json({ 
        success: true, 
        user: existingUser,
        created: false 
      });
    }
    
    // Create new user with 50 Impact Points welcome bonus
    console.log('[ensure-profile] Creating new user profile with 50 Impact Points...');
    const newUser = await createUser({
      email,
      username: username || email.split('@')[0],
      password: '', // OAuth users don't have a password in our system
      firstName,
      lastName,
    });
    
    console.log('[ensure-profile] User profile created successfully:', newUser.id);
    
    return res.json({ 
      success: true, 
      user: newUser,
      created: true 
    });
  } catch (error) {
    console.error('[ensure-profile] Error ensuring user profile:', error);
    return res.status(500).json({ 
      error: "Failed to create user profile",
      details: error instanceof Error ? error.message : String(error)
    });
  }
}

