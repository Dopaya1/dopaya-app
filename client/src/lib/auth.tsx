import { useAuth } from "../hooks/use-auth";
import { useLocation } from "wouter";
import React, { useEffect } from "react";

interface AuthGuardProps {
  redirectTo?: string;
  children: React.ReactNode;
}

export function RequireAuth({ redirectTo = "/auth", children }: AuthGuardProps) {
  const { user, isLoading } = useAuth();
  const [_, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      console.log('RequireAuth: No user found, redirecting to', redirectTo);
      navigate(redirectTo);
    }
  }, [user, isLoading, navigate, redirectTo]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground">Checking authentication status...</p>
        </div>
      </div>
    );
  }

  return user ? <>{children}</> : null;
}

export function RedirectIfAuthenticated({ redirectTo = "/", children }: AuthGuardProps) {
  const { user, isLoading } = useAuth();
  const [_, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading && user) {
      console.log('RedirectIfAuthenticated: User found, redirecting to', redirectTo);
      navigate(redirectTo);
    }
  }, [user, isLoading, navigate, redirectTo]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground">Checking authentication status...</p>
        </div>
      </div>
    );
  }

  return !user ? <>{children}</> : null;
}

export function getUserDisplayName(user: any): string {
  if (!user) return "Guest";
  
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  
  if (user.firstName) {
    return user.firstName;
  }
  
  if (user.username) {
    return user.username;
  }
  
  // For Supabase users that might only have email
  if (user.email) {
    // Extract username from email (before the @)
    const emailParts = user.email.split('@');
    return emailParts[0];
  }
  
  return "User";
}

export function getUserLevel(impactPoints: number): string {
  if (impactPoints >= 20000) {
    return "Impact Legend";
  } else if (impactPoints >= 5000) {
    return "Changemaker";
  } else if (impactPoints >= 1000) {
    return "Supporter";
  } else {
    return "Impact Aspirer";
  }
}