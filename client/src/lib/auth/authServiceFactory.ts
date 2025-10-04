import { IAuthService } from './authService';
import { SupabaseAuthService } from './supabaseAuthService';
import { ServerAuthService } from './serverAuthService';

/**
 * Factory for creating auth service instances
 * This allows us to switch between different auth implementations
 */
export function createAuthService(): IAuthService {
  // Set to true to use server-based authentication
  // Set to false to use Supabase authentication
  const useServerAuth = false;
  
  if (useServerAuth) {
    console.log('Using server-based authentication service');
    return new ServerAuthService();
  } else {
    console.log('Using Supabase authentication service');
    return new SupabaseAuthService();
  }
}

// Create a singleton instance for the application
export const authService = createAuthService();