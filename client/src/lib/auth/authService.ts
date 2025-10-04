import { User } from "@shared/schema";

// AuthResponse is what's returned from auth operations
export interface AuthResponse {
  user: User | null;
  error: Error | null;
}

// AuthService interface to allow swapping implementations
export interface IAuthService {
  // Auth operations
  signUp(email: string, password: string, userData: Partial<User>): Promise<AuthResponse>;
  signIn(email: string, password: string): Promise<AuthResponse>;
  signOut(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  
  // Session management
  onAuthStateChange(callback: (user: User | null) => void): () => void;
}