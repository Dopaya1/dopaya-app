import { supabase } from '../supabase';
import { User } from '@shared/schema';

export interface AuthUser {
  id: string;
  email: string;
  email_verified?: boolean;
  username?: string;
  firstName?: string;
  lastName?: string;
  createdAt?: string;
}

// Sign up with email and password
export const signUp = async (
  email: string,
  password: string,
  userData: Omit<AuthUser, 'id' | 'email'> = {}
): Promise<AuthUser> => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          ...userData,
        },
      },
    });

    if (error) throw error;
    
    if (!data.user) {
      throw new Error('No user returned after signup');
    }

    // Map Supabase user to our AuthUser format
    return {
      id: data.user.id,
      email: data.user.email || '',
      email_verified: data.user.email_confirmed_at ? true : false,
      ...data.user.user_metadata as any,
    };
  } catch (error: any) {
    console.error('Error signing up:', error.message);
    throw error;
  }
};

// Sign in with email and password
export const signIn = async (
  email: string,
  password: string
): Promise<AuthUser> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    if (!data.user) {
      throw new Error('No user returned after login');
    }

    // Map Supabase user to our AuthUser format
    return {
      id: data.user.id,
      email: data.user.email || '',
      email_verified: data.user.email_confirmed_at ? true : false,
      ...data.user.user_metadata as any,
    };
  } catch (error: any) {
    console.error('Error signing in:', error.message);
    throw error;
  }
};

// Sign out
export const signOut = async (): Promise<void> => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error: any) {
    console.error('Error signing out:', error.message);
    throw error;
  }
};

// Get current user
export const getCurrentUser = async (): Promise<AuthUser | null> => {
  try {
    const { data } = await supabase.auth.getSession();
    
    if (!data.session || !data.session.user) {
      return null;
    }
    
    // Map Supabase user to our AuthUser format
    return {
      id: data.session.user.id,
      email: data.session.user.email || '',
      email_verified: data.session.user.email_confirmed_at ? true : false,
      ...data.session.user.user_metadata as any,
    };
  } catch (error: any) {
    console.error('Error getting current user:', error.message);
    return null;
  }
};

// Update user data
export const updateUserData = async (
  userData: Partial<Omit<AuthUser, 'id' | 'email'>>
): Promise<void> => {
  try {
    const { error } = await supabase.auth.updateUser({
      data: userData,
    });
    
    if (error) throw error;
  } catch (error: any) {
    console.error('Error updating user data:', error.message);
    throw error;
  }
};

// Reset password
export const resetPassword = async (email: string): Promise<void> => {
  try {
    // Include redirectTo so Supabase knows where to send the user after clicking the reset link
    // The reset-password page will handle the password reset token and allow user to set new password
    const redirectTo = `${window.location.origin}/reset-password`;
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectTo,
    });
    
    if (error) throw error;
  } catch (error: any) {
    console.error('Error resetting password:', error.message);
    throw error;
  }
};