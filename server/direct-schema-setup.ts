import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './secrets';

/**
 * Creates database tables directly using Supabase SQL interface
 * This is a more direct approach that bypasses the RPC functions
 */
export async function createDatabaseSchema() {
  try {
    console.log('Creating database schema directly via Supabase SQL interface...');
    
    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Define schema SQL directly in code instead of loading from file
    const schemaSql = `
      -- Users table
      CREATE TABLE IF NOT EXISTS "users" (
        "id" SERIAL PRIMARY KEY,
        "username" TEXT NOT NULL UNIQUE,
        "password" TEXT NOT NULL,
        "email" TEXT,
        "firstName" TEXT,
        "lastName" TEXT,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      
      -- Projects table
      CREATE TABLE IF NOT EXISTS "projects" (
        "id" SERIAL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "summary" TEXT,
        "slug" TEXT NOT NULL UNIQUE,
        "imageUrl" TEXT NOT NULL,
        "category" TEXT NOT NULL,
        "country" TEXT NOT NULL,
        "founderNames" TEXT,
        "focusArea" TEXT,
        "goal" INTEGER,
        "raised" INTEGER DEFAULT 0,
        "donors" INTEGER DEFAULT 0,
        "featured" BOOLEAN DEFAULT FALSE,
        "percentCompleted" INTEGER DEFAULT 0,
        "impactPoints" INTEGER DEFAULT 0,
        "status" TEXT DEFAULT 'active',
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "sdgGoals" TEXT[]
      );
      
      -- Project Media table for storing images, videos, and documents
      CREATE TABLE IF NOT EXISTS "project_media" (
        "id" SERIAL PRIMARY KEY,
        "projectId" INTEGER NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
        "mediaType" TEXT NOT NULL,
        "url" TEXT NOT NULL,
        "title" TEXT,
        "description" TEXT,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "sortOrder" INTEGER DEFAULT 0
      );
      
      -- Project Impact Metrics table
      CREATE TABLE IF NOT EXISTS "project_impact_metrics" (
        "id" SERIAL PRIMARY KEY,
        "projectId" INTEGER NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
        "metricName" TEXT NOT NULL,
        "metricValue" TEXT NOT NULL,
        "metricUnit" TEXT,
        "metricIcon" TEXT,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      
      -- Donations table
      CREATE TABLE IF NOT EXISTS "donations" (
        "id" SERIAL PRIMARY KEY,
        "userId" INTEGER REFERENCES "users"("id") ON DELETE SET NULL,
        "projectId" INTEGER NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
        "amount" INTEGER NOT NULL,
        "impactPoints" INTEGER NOT NULL DEFAULT 0,
        "message" TEXT,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "status" TEXT DEFAULT 'completed'
      );
      
      -- Rewards table
      CREATE TABLE IF NOT EXISTS "rewards" (
        "id" SERIAL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "imageUrl" TEXT NOT NULL,
        "category" TEXT NOT NULL,
        "featured" BOOLEAN DEFAULT FALSE,
        "partnerLevel" TEXT NOT NULL,
        "pointsCost" INTEGER NOT NULL
      );
      
      -- Redemptions table (for when users redeem rewards)
      CREATE TABLE IF NOT EXISTS "redemptions" (
        "id" SERIAL PRIMARY KEY,
        "userId" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "rewardId" INTEGER NOT NULL REFERENCES "rewards"("id") ON DELETE CASCADE,
        "pointsSpent" INTEGER NOT NULL,
        "status" TEXT DEFAULT 'pending',
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    // Use Supabase SQL API directly
    try {
      // Execute the schema SQL using the SQL function
      // This needs to be done as separate statements because Supabase SQL API
      // doesn't support executing multiple statements at once
      const statements = schemaSql.split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0);
      
      for (const statement of statements) {
        try {
          // Using Supabase REST API is not working, so we'll use the client functions instead
          const { error } = await supabase.rpc('exec_sql', { 
            sql: statement + ';' 
          });
          
          if (error) {
            console.log(`Error executing statement: ${error.message}`);
          }
        } catch (stmtError) {
          console.log(`Statement error: ${stmtError}`);
          // Continue with other statements even if one fails
        }
      }
    } catch (error) {
      console.error('Failed to execute SQL directly:', error);
    }
    
    // Attempt to create tables individually through Supabase SDK
    try {
      // Users table
      const { error: usersError } = await supabase.from('users')
        .select('id')
        .limit(1);
      
      if (usersError && usersError.code === '42P01') {
        console.log('Creating users table...');
        const createUsersSQL = `
        CREATE TABLE IF NOT EXISTS "users" (
          "id" SERIAL PRIMARY KEY,
          "username" TEXT NOT NULL UNIQUE,
          "password" TEXT NOT NULL,
          "email" TEXT,
          "firstName" TEXT,
          "lastName" TEXT,
          "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );`;
        
        await supabase.rpc('exec_sql', { sql: createUsersSQL });
      }
      
      // Projects table
      const { error: projectsError } = await supabase.from('projects')
        .select('id')
        .limit(1);
      
      if (projectsError && projectsError.code === '42P01') {
        console.log('Creating projects table...');
        const createProjectsSQL = `
        CREATE TABLE IF NOT EXISTS "projects" (
          "id" SERIAL PRIMARY KEY,
          "title" TEXT NOT NULL,
          "description" TEXT NOT NULL,
          "summary" TEXT,
          "slug" TEXT NOT NULL UNIQUE,
          "imageUrl" TEXT NOT NULL,
          "category" TEXT NOT NULL,
          "country" TEXT NOT NULL,
          "founderNames" TEXT,
          "focusArea" TEXT,
          "goal" INTEGER,
          "raised" INTEGER DEFAULT 0,
          "donors" INTEGER DEFAULT 0,
          "featured" BOOLEAN DEFAULT FALSE,
          "percentCompleted" INTEGER DEFAULT 0,
          "impactPoints" INTEGER DEFAULT 0,
          "status" TEXT DEFAULT 'active',
          "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          "sdgGoals" TEXT[]
        );`;
        
        await supabase.rpc('exec_sql', { sql: createProjectsSQL });
      }
      
      // Add other tables as needed
      
    } catch (apiError) {
      console.error('Failed to create tables through Supabase API:', apiError);
    }
    
    // Create the SQL execution function if it doesn't exist
    try {
      const createSqlFn = `
      CREATE OR REPLACE FUNCTION exec_sql(sql text) RETURNS void AS $$
      BEGIN
        EXECUTE sql;
      END;
      $$ LANGUAGE plpgsql;`;
      
      // Try to use Supabase PostgreSQL client API
      try {
        // Check if function exists first
        const { data: fnExists, error: fnCheckError } = await supabase
          .from('pg_proc')
          .select('proname')
          .eq('proname', 'exec_sql')
          .limit(1);
          
        if (fnCheckError) {
          console.log('Could not check if exec_sql function exists:', fnCheckError.message);
        }
        
        // If function doesn't exist (or we couldn't check), try to create it 
        if (!fnExists || fnExists.length === 0) {
          // Use a direct query to create the function
          const { error } = await supabase.rpc('exec_sql', { 
            sql: createSqlFn 
          });
          
          if (error) {
            console.log('Error creating exec_sql function:', error.message);
          } else {
            console.log('Successfully created exec_sql function');
          }
        } else {
          console.log('exec_sql function already exists');
        }
      } catch (innerError) {
        console.log('Error checking or creating exec_sql function:', innerError);
      }
    } catch (fnError) {
      console.warn('Failed to create SQL execution function:', fnError);
    }
    
    return {
      success: true,
      message: 'Database schema creation attempted'
    };
  } catch (error) {
    console.error('Failed to create database schema:', error);
    return {
      success: false,
      message: `Schema creation failed: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}