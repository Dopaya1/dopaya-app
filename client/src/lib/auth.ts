import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useEffect } from "react";

interface AuthGuardProps {
  redirectTo?: string;
  children: React.ReactNode;
}

export function RequireAuth({ redirectTo = "/auth", children }: AuthGuardProps) {
  const { user, isLoading } = useAuth();
  const [_, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate(redirectTo);
    }
  }, [user, isLoading, navigate, redirectTo]);

  if (isLoading) {
    return null; // Loading state
  }

  return user ? children : null;
}

export function RedirectIfAuthenticated({ redirectTo = "/", children }: AuthGuardProps) {
  const { user, isLoading } = useAuth();
  const [_, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading && user) {
      navigate(redirectTo);
    }
  }, [user, isLoading, navigate, redirectTo]);

  if (isLoading) {
    return null; // Loading state
  }

  return !user ? children : null;
}

export function getUserDisplayName(user: any): string {
  if (!user) return "Guest";
  
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  
  if (user.firstName) {
    return user.firstName;
  }
  
  return user.username;
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
