import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route, useLocation } from "wouter";
import { useEffect } from "react";
import EmailVerificationPrompt from "@/components/auth/email-verification-prompt";

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();
  
  // For debugging - log the authentication state on every render
  useEffect(() => {
    console.log('Protected route render state:', { 
      path, 
      currentLocation: location, 
      isAuthenticated: !!user, 
      isLoading, 
      userDetails: user 
    });
  }, [path, location, user, isLoading]);

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-neutral">Checking authentication...</p>
        </div>
      </Route>
    );
  }

  if (!user) {
    console.log('User not authenticated, redirecting to home');
    return (
      <Route path={path}>
        <Redirect to="/" />
      </Route>
    );
  }

  // Check if user's email is verified (only if email_verified property exists)
  if (user && 'email_verified' in user && !user.email_verified) {
    console.log('User email not verified, showing verification prompt');
    return (
      <Route path={path}>
        <EmailVerificationPrompt />
      </Route>
    );
  }

  console.log('User authenticated and verified, rendering protected component');
  return <Route path={path} component={Component} />;
}
