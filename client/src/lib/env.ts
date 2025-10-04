// Environment variables wrapper
const env = {
  // Supabase
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL as string || '',
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY as string || '',
  
  // Development mode
  IS_DEV: import.meta.env.DEV as boolean,
  
  // Display environment variables in development mode only
  logEnvironment: () => {
    if (import.meta.env.DEV) {
      console.log('Environment variables:');
      console.log('SUPABASE_URL:', env.SUPABASE_URL ? '✓ Set' : '✗ Missing');
      console.log('SUPABASE_ANON_KEY:', env.SUPABASE_ANON_KEY ? '✓ Set' : '✗ Missing');
    }
  }
};

export default env;