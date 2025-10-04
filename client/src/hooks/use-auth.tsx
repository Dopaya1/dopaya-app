import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import {
  useMutation,
  UseMutationResult,
  useQueryClient,
} from "@tanstack/react-query";
import { InsertUser } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import {
  AuthUser,
  getCurrentUser,
  signIn,
  signOut,
  signUp,
} from "@/lib/auth/supabaseAuthService";
import { supabase } from "@/lib/supabase";

type AuthContextType = {
  user: AuthUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<AuthUser, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<AuthUser, Error, RegisterData>;
  resendVerificationMutation: UseMutationResult<void, Error, string>;
};

type LoginData = {
  email: string;
  password: string;
};

type RegisterData = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Initialize auth state on component mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        setIsLoading(true);
        console.log('Initializing auth state with Supabase...');
        
        // Get current user from Supabase
        const currentUser = await getCurrentUser();
        
        if (currentUser) {
          console.log('Auth initialization completed. User found:', currentUser);
          setUser(currentUser);
          
          // Update the cache for compatibility
          queryClient.setQueryData(["/api/user"], currentUser);
        } else {
          console.log('Auth initialization completed. No user found');
          setUser(null);
          queryClient.setQueryData(["/api/user"], null);
        }
        
        setError(null);
      } catch (e) {
        console.error('Failed to initialize auth:', e);
        setError(e instanceof Error ? e : new Error('Failed to initialize auth'));
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    // Initialize auth
    initAuth();
    
    // Listen for auth state changes from Supabase
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Supabase auth event:", event);
        if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
          const user = session?.user;
          if (user) {
            const authUser: AuthUser = {
              id: user.id,
              email: user.email || '',
              ...user.user_metadata as any,
            };
            setUser(authUser);
            queryClient.setQueryData(["/api/user"], authUser);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          queryClient.setQueryData(["/api/user"], null);
        }
      }
    );
    
    return () => {
      // Cleanup subscription
      authListener.subscription.unsubscribe();
    };
  }, [queryClient]);

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      console.log('Login mutation executing with Supabase...');
      const user = await signIn(credentials.email, credentials.password);
      return user;
    },
    onSuccess: (user: AuthUser) => {
      setUser(user);
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Logged in successfully",
        description: `Welcome back!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterData) => {
      console.log('Register mutation executing with Supabase...');
      const { email, password, firstName, lastName } = userData;
      
      // Generate username from email
      const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
      
      const userMetadata = {
        firstName,
        lastName,
        username
      };
      
      const user = await signUp(email, password, userMetadata);
      return user;
    },
    onSuccess: (user: AuthUser) => {
      setUser(user);
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Registration successful",
        description: `Welcome to Dopaya, ${user.firstName || user.username || 'friend'}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      console.log('Logout mutation executing with Supabase...');
      await signOut();
    },
    onSuccess: () => {
      setUser(null);
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "Logged out successfully",
        description: "You have been logged out.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resendVerificationMutation = useMutation({
    mutationFn: async (email: string) => {
      console.log('Resending verification email for:', email);
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Verification email sent",
        description: "Please check your inbox for the verification link.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send verification email",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
        resendVerificationMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
