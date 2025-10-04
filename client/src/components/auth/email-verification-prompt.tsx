import { useState } from "react";
import { Mail, AlertCircle, RefreshCw, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";

export default function EmailVerificationPrompt() {
  const { user, logoutMutation, resendVerificationMutation } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const handleResendVerification = async () => {
    if (!user?.email) return;
    
    setIsResending(true);
    try {
      await resendVerificationMutation.mutateAsync(user.email);
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (error) {
      console.error('Failed to resend verification:', error);
    } finally {
      setIsResending(false);
    }
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
            <Mail className="h-8 w-8 text-amber-600" />
          </div>
          <CardTitle className="text-xl">Almost there, {user?.firstName || 'friend'}!</CardTitle>
          <CardDescription>
            Please finally confirm your email address to complete your registration
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Hi {user?.firstName}! We sent a confirmation email to <strong>{user?.email}</strong>. 
              Please check your inbox and click the verification link to start making an impact.
            </AlertDescription>
          </Alert>

          {resendSuccess && (
            <Alert className="border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">
                Verification email sent successfully! Please check your inbox.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <Button 
              onClick={handleResendVerification}
              disabled={isResending || resendVerificationMutation.isPending}
              variant="outline"
              className="w-full"
            >
              {(isResending || resendVerificationMutation.isPending) ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Resend Verification Email
                </>
              )}
            </Button>

            <Button 
              onClick={handleLogout}
              variant="secondary"
              className="w-full"
              disabled={logoutMutation.isPending}
            >
              <LogOut className="mr-2 h-4 w-4" />
              {logoutMutation.isPending ? 'Logging out...' : 'Sign Out'}
            </Button>
          </div>

          <div className="text-center text-sm text-gray-500">
            <p>Didn't receive the email?</p>
            <p>Check your spam folder or try resending the verification email.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}