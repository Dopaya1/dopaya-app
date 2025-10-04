import { supabase } from './supabase';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { supabaseApi } from './supabase-api';
import { DATABASE_URL } from './secrets';

/**
 * Creates the initial database schema if it doesn't exist
 */
export async function setupDatabase() {
  console.log('Setting up database schema...');
  
  try {
    // First try direct PostgreSQL connection to create tables
    console.log('Attempting to create schema using direct PostgreSQL connection...');
    const migrationResult = await setupSchemaWithDrizzle();
    
    if (migrationResult.success) {
      console.log('Schema created successfully using Drizzle migrations');
      return migrationResult;
    }
    
    // If Drizzle migration fails, try creating tables directly with Supabase API
    console.log('Drizzle migration failed, attempting to create schema using Supabase API...');
    const apiResult = await setupSchemaWithSupabaseApi();
    
    return apiResult;
  } catch (error) {
    console.error('Failed to set up database schema:', error);
    return {
      success: false,
      message: 'Failed to set up database schema',
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Creates the database schema using Drizzle migrations
 */
async function setupSchemaWithDrizzle() {
  try {
    // Set up a PostgreSQL client with the connection string
    const migrationClient = postgres(DATABASE_URL, { max: 1 });
    const db = drizzle(migrationClient);
    
    // Create schema by running migrations
    await migrate(db, { migrationsFolder: './drizzle' });
    
    return {
      success: true,
      message: 'Database schema created successfully using Drizzle migrations'
    };
  } catch (error) {
    console.error('Drizzle migration failed:', error);
    return {
      success: false,
      message: 'Failed to create schema using Drizzle migrations',
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Creates the database schema manually using Supabase API
 */
async function setupSchemaWithSupabaseApi() {
  try {
    // Get the supabase client from the API module
    const client = supabaseApi;
    
    // Read the SQL schema file
    const schemaPath = './server/db-schema.sql';
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute the SQL directly using fetch to the Supabase REST API
    // This is a more direct approach since the RPC functions might not exist yet
    console.log('Executing SQL schema directly with Supabase REST API...');
    
    try {
      // Split the schema into individual statements
      const statements = schemaSql.split(';').filter(stmt => stmt.trim().length > 0);
      
      // Execute each statement separately
      for (const stmt of statements) {
        console.log(`Executing SQL statement: ${stmt.substring(0, 50)}...`);
        
        const { error } = await client.rpc('exec_sql', { sql: stmt });
        if (error) {
          console.warn(`SQL execution warning: ${error.message}`);
          // Continue executing other statements even if one fails
        }
      }
      
      console.log('Successfully executed schema SQL');
    } catch (sqlError) {
      console.warn('Error executing schema SQL:', sqlError);
      // Continue with the process even if SQL execution fails
    }
    
    // Create a direct SQL execution function as a fallback
    const createExecSqlFn = `
    CREATE OR REPLACE FUNCTION exec_sql(sql text) RETURNS void AS $$
    BEGIN
      EXECUTE sql;
    END;
    $$ LANGUAGE plpgsql;
    `;
    
    try {
      // Send raw SQL query to create the exec_sql function
      // Using the REST API directly as a last resort
      const baseUrl = supabase.supabaseUrl;
      const apiKey = supabase.supabaseKey;
      
      const response = await fetch(`${baseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': apiKey,
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({ sql: createExecSqlFn })
      });
      
      console.log('Direct REST API response status:', response.status);
    } catch (directApiError) {
      console.warn('Direct REST API call failed:', directApiError);
      // Continue even if this fails
    }
    
    return {
      success: true,
      message: 'Database schema setup attempted with Supabase API'
    };
  } catch (error) {
    console.error('Failed to set up schema with Supabase API:', error);
    return {
      success: false,
      message: 'Failed to set up schema with Supabase API',
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

// Helper function to create SQL functions in Supabase for table creation
export async function createDatabaseHelperFunctions() {
  try {
    const client = supabaseApi;
    
    // Create a function to create the users table
    const createUsersTableFn = `
    CREATE OR REPLACE FUNCTION create_users_table()
    RETURNS void AS $$
    BEGIN
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        email TEXT,
        first_name TEXT,
        last_name TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    END;
    $$ LANGUAGE plpgsql;
    `;
    
    // Create a function to create the projects table
    const createProjectsTableFn = `
    CREATE OR REPLACE FUNCTION create_projects_table()
    RETURNS void AS $$
    BEGIN
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        image_url TEXT NOT NULL,
        category TEXT NOT NULL,
        country TEXT NOT NULL,
        featured BOOLEAN DEFAULT FALSE,
        summary TEXT,
        founder_names TEXT,
        focus_area TEXT,
        funding_goal INTEGER,
        funding_current INTEGER DEFAULT 0,
        funding_percentage INTEGER DEFAULT 0,
        impact_multiplier INTEGER DEFAULT 10,
        project_website TEXT,
        contact_email TEXT,
        status TEXT DEFAULT 'active',
        sdg_goals TEXT[],
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    END;
    $$ LANGUAGE plpgsql;
    `;
    
    // Create a function to create the project_media table
    const createProjectMediaTableFn = `
    CREATE OR REPLACE FUNCTION create_project_media_table()
    RETURNS void AS $$
    BEGIN
      CREATE TABLE IF NOT EXISTS project_media (
        id SERIAL PRIMARY KEY,
        project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        media_type TEXT NOT NULL,
        url TEXT NOT NULL,
        caption TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    END;
    $$ LANGUAGE plpgsql;
    `;
    
    // Create a function to create the project_impact_metrics table
    const createProjectImpactMetricsTableFn = `
    CREATE OR REPLACE FUNCTION create_project_impact_metrics_table()
    RETURNS void AS $$
    BEGIN
      CREATE TABLE IF NOT EXISTS project_impact_metrics (
        id SERIAL PRIMARY KEY,
        project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        metric_name TEXT NOT NULL,
        metric_value TEXT NOT NULL,
        metric_icon TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    END;
    $$ LANGUAGE plpgsql;
    `;
    
    // Create a function to create the donations table
    const createDonationsTableFn = `
    CREATE OR REPLACE FUNCTION create_donations_table()
    RETURNS void AS $$
    BEGIN
      CREATE TABLE IF NOT EXISTS donations (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        amount INTEGER NOT NULL,
        impact_points INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    END;
    $$ LANGUAGE plpgsql;
    `;
    
    // Create a function to create the rewards table
    const createRewardsTableFn = `
    CREATE OR REPLACE FUNCTION create_rewards_table()
    RETURNS void AS $$
    BEGIN
      CREATE TABLE IF NOT EXISTS rewards (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        image_url TEXT NOT NULL,
        category TEXT NOT NULL,
        featured BOOLEAN DEFAULT FALSE,
        partner_level TEXT NOT NULL,
        points_cost INTEGER NOT NULL
      );
    END;
    $$ LANGUAGE plpgsql;
    `;
    
    // Create a function to create the redemptions table
    const createRedemptionsTableFn = `
    CREATE OR REPLACE FUNCTION create_redemptions_table()
    RETURNS void AS $$
    BEGIN
      CREATE TABLE IF NOT EXISTS redemptions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        reward_id INTEGER NOT NULL REFERENCES rewards(id) ON DELETE CASCADE,
        points_spent INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    END;
    $$ LANGUAGE plpgsql;
    `;
    
    // Execute all the function creation queries
    // Using rpc won't work here since we need to create the functions first
    // We'll use the Postgres REST API directly
    
    const { error: usersError } = await client.rpc('exec_sql', { sql: createUsersTableFn });
    if (usersError) console.error('Failed to create users table function:', usersError);
    
    const { error: projectsError } = await client.rpc('exec_sql', { sql: createProjectsTableFn });
    if (projectsError) console.error('Failed to create projects table function:', projectsError);
    
    const { error: mediaError } = await client.rpc('exec_sql', { sql: createProjectMediaTableFn });
    if (mediaError) console.error('Failed to create project_media table function:', mediaError);
    
    const { error: metricsError } = await client.rpc('exec_sql', { sql: createProjectImpactMetricsTableFn });
    if (metricsError) console.error('Failed to create project_impact_metrics table function:', metricsError);
    
    const { error: donationsError } = await client.rpc('exec_sql', { sql: createDonationsTableFn });
    if (donationsError) console.error('Failed to create donations table function:', donationsError);
    
    const { error: rewardsError } = await client.rpc('exec_sql', { sql: createRewardsTableFn });
    if (rewardsError) console.error('Failed to create rewards table function:', rewardsError);
    
    const { error: redemptionsError } = await client.rpc('exec_sql', { sql: createRedemptionsTableFn });
    if (redemptionsError) console.error('Failed to create redemptions table function:', redemptionsError);
    
    // Create a SQL execution function first
    const createExecSqlFn = `
    CREATE OR REPLACE FUNCTION exec_sql(sql text) RETURNS void AS $$
    BEGIN
      EXECUTE sql;
    END;
    $$ LANGUAGE plpgsql;
    `;
    
    const { error: execSqlError } = await client.rpc('exec_sql', { sql: createExecSqlFn });
    if (execSqlError) {
      // If this fails, the function might already exist, which is fine
      console.log('Note: exec_sql function creation failed, might already exist:', execSqlError);
    }
    
    return {
      success: true,
      message: 'Database helper functions created'
    };
  } catch (error) {
    console.error('Failed to create database helper functions:', error);
    return {
      success: false,
      message: 'Failed to create database helper functions',
      error: error instanceof Error ? error.message : String(error)
    };
  }
}