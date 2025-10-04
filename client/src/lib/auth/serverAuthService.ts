import { User } from "@shared/schema";
import { AuthResponse, IAuthService } from './authService';
import { apiRequest } from '../queryClient';

/**
 * Server-based AuthService implementation using Express API endpoints
 * This service manages authentication through server-side sessions and cookies
 */
export class ServerAuthService implements IAuthService {
  // Cache the current user to avoid unnecessary API calls
  private currentUser: User | null = null;
  private pollingInterval: number | null = null;
  private listeners: ((user: User | null) => void)[] = [];

  constructor() {
    console.log('Initializing ServerAuthService');
  }
  
  /**
   * Register a new user
   */
  async signUp(email: string, password: string, userData: Partial<User>): Promise<AuthResponse> {
    try {
      console.log('Registering new user with server');

      const response = await apiRequest('POST', '/api/register', {
        username: userData.username,
        password: password,
        email: email,
        firstName: userData.firstName,
        lastName: userData.lastName
      });
      
      const user = await response.json();
      console.log('Server registration successful:', user);
      
      // Update cached user and notify listeners
      this.currentUser = user;
      this.notifyListeners(user);
      
      return {
        user,
        error: null
      };
    } catch (error) {
      console.error('Server registration failed:', error);
      return {
        user: null,
        error: error instanceof Error ? error : new Error('Unknown error during signup')
      };
    }
  }
  
  /**
   * Sign in an existing user
   */
  async signIn(usernameOrEmail: string, password: string): Promise<AuthResponse> {
    try {
      console.log('Signing in user with server');
      
      const response = await apiRequest('POST', '/api/login', {
        username: usernameOrEmail,
        password
      });
      
      const user = await response.json();
      console.log('Server login successful:', user);
      
      // Update cached user and notify listeners
      this.currentUser = user;
      this.notifyListeners(user);
      
      return {
        user,
        error: null
      };
    } catch (error) {
      console.error('Server login failed:', error);
      return {
        user: null,
        error: error instanceof Error ? error : new Error('Unknown error during login')
      };
    }
  }
  
  /**
   * Sign out the current user
   */
  async signOut(): Promise<void> {
    try {
      console.log('Signing out user from server');
      await apiRequest('POST', '/api/logout');
      
      // Update cached user and notify listeners
      this.currentUser = null;
      this.notifyListeners(null);
      
      console.log('Server logout successful');
    } catch (error) {
      console.error('Server logout failed:', error);
      throw error;
    }
  }
  
  /**
   * Get the current authenticated user
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      console.log('Getting current user from server');
      
      const response = await fetch('/api/user', {
        credentials: 'include'
      });
      
      if (response.status === 401) {
        console.log('No authenticated user found on server');
        
        // Update cached user if needed
        if (this.currentUser !== null) {
          this.currentUser = null;
          this.notifyListeners(null);
        }
        
        return null;
      }
      
      if (!response.ok) {
        throw new Error(`Failed to get current user: ${response.status} ${response.statusText}`);
      }
      
      const user = await response.json();
      console.log('Retrieved current user from server:', user);
      
      // Update cached user if needed
      if (JSON.stringify(this.currentUser) !== JSON.stringify(user)) {
        this.currentUser = user;
        this.notifyListeners(user);
      }
      
      return user;
    } catch (error) {
      console.error('Error getting current user from server:', error);
      return null;
    }
  }
  
  /**
   * Listen for auth state changes
   */
  onAuthStateChange(callback: (user: User | null) => void): () => void {
    console.log('Adding auth state change listener');
    
    // Add the callback to listeners
    this.listeners.push(callback);
    
    // Start polling if this is the first listener
    if (this.listeners.length === 1 && !this.pollingInterval) {
      this.startPolling();
    }
    
    // Return unsubscribe function
    return () => {
      console.log('Removing auth state change listener');
      this.listeners = this.listeners.filter(cb => cb !== callback);
      
      // Stop polling if no listeners left
      if (this.listeners.length === 0 && this.pollingInterval !== null) {
        this.stopPolling();
      }
    };
  }
  
  /**
   * Notify all listeners of auth state change
   */
  private notifyListeners(user: User | null): void {
    this.listeners.forEach(callback => callback(user));
  }
  
  /**
   * Start polling for auth state changes
   */
  private startPolling(): void {
    console.log('Starting auth state polling');
    this.pollingInterval = window.setInterval(async () => {
      try {
        await this.getCurrentUser();
      } catch (error) {
        console.error('Error polling for auth state:', error);
      }
    }, 30000) as unknown as number; // Poll every 30 seconds
  }
  
  /**
   * Stop polling for auth state changes
   */
  private stopPolling(): void {
    console.log('Stopping auth state polling');
    if (this.pollingInterval !== null) {
      window.clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }
}