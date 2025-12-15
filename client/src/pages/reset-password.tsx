import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { Loader2, CheckCircle, XCircle, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTranslation } from "@/lib/i18n/use-translation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isOnboardingPreviewEnabled } from "@/lib/feature-flags";

export default function ResetPasswordPage() {
  const [location, navigate] = useLocation();
  const { t } = useTranslation();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [status, setStatus] = useState<'loading' | 'idle' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [isValidToken, setIsValidToken] = useState(false);

  useEffect(() => {
    const handlePasswordReset = async () => {
      try {
        console.log('[reset-password] ========== PASSWORD RESET PAGE LOADED ==========');
        console.log('[reset-password] Current URL:', window.location.href);
        console.log('[reset-password] Hash:', window.location.hash);
        
        // Get the URL parameters (both hash and search params)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const searchParams = new URLSearchParams(window.location.search);
        
        // Check for error in URL params first
        const error = hashParams.get('error') || searchParams.get('error');
        const errorDescription = hashParams.get('error_description') || searchParams.get('error_description');
        
        if (error) {
          console.error('Password reset error:', error, errorDescription);
          setStatus('error');
          setMessage(errorDescription || error || t("auth.errors.resetPasswordFailed"));
          setIsValidToken(false);
          return;
        }

        // Check for access token in URL hash (Supabase password reset)
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');
        
        console.log('[reset-password] Token check:', {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          type: type
        });
        
        // If no tokens in URL but session exists, user is already authenticated
        // This handles the case after hard redirect (when tokens are cleared from URL)
        if (!accessToken && !refreshToken && !type) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            console.log('[reset-password] Session already exists, user authenticated');
            setIsValidToken(true);
            setStatus('idle');
            return;
          } else {
            console.error('[reset-password] No tokens and no session found');
            setStatus('error');
            setMessage(t("auth.errors.resetPasswordFailed"));
            setIsValidToken(false);
            return;
          }
        }
        
        if (accessToken && refreshToken && type === 'recovery') {
          console.log('[reset-password] Found password reset tokens, setting session...');
          
          // Set the session using the tokens from the URL
          // This authenticates the user temporarily so they can update their password
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            console.error('Session error:', sessionError);
            setStatus('error');
            setMessage(t("auth.errors.resetPasswordFailed"));
            setIsValidToken(false);
            return;
          }

          if (data.user) {
            // Double-check session usability to avoid rare hash-loss edge cases
            const { data: sessionData } = await supabase.auth.getSession();
            if (!sessionData.session?.user) {
              console.error('[reset-password] Session check failed after setSession');
              setStatus('error');
              setMessage(t("auth.errors.resetPasswordFailed"));
              setIsValidToken(false);
              return;
            }

            console.log('[reset-password] User authenticated for password reset');
            setIsValidToken(true);
            setStatus('idle');
            // Clear the URL hash to remove tokens from the URL
            window.history.replaceState(null, '', window.location.pathname);
          } else {
            setStatus('error');
            setMessage(t("auth.errors.resetPasswordFailed"));
            setIsValidToken(false);
          }
        } else {
          console.error('[reset-password] Invalid or missing tokens');
          setStatus('error');
          setMessage(t("auth.errors.resetPasswordFailed"));
          setIsValidToken(false);
        }
      } catch (error: any) {
        console.error('[reset-password] Error:', error);
        setStatus('error');
        setMessage(error?.message || t("auth.errors.resetPasswordFailed"));
        setIsValidToken(false);
      }
    };

    handlePasswordReset();
  }, [t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      setMessage(t("auth.validation.passwordRequired"));
      setStatus('error');
      return;
    }

    if (password.length < 6) {
      setMessage(t("auth.validation.passwordMinLength"));
      setStatus('error');
      return;
    }

    if (password !== confirmPassword) {
      setMessage(t("auth.errors.passwordsDoNotMatch") || "Passwords do not match");
      setStatus('error');
      return;
    }

    try {
      setStatus('loading');
      setMessage('');
      
      // Ensure an active session still exists before attempting update (covers rare reload/hash-loss cases)
      const { data: preSession } = await supabase.auth.getSession();
      if (!preSession.session?.user) {
        setStatus('error');
        setMessage(t("auth.errors.resetPasswordFailed"));
        return;
      }

      // Update the user's password
      const { data, error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        throw error;
      }

      console.log('[reset-password] Password updated successfully');
      
      // Preserve previewOnboarding flag if it exists in sessionStorage and send to dashboard
      const previewEnabled = isOnboardingPreviewEnabled();
      const redirectUrl = previewEnabled ? '/dashboard?previewOnboarding=1' : '/dashboard';
      
      setStatus('success');
      setMessage(t("auth.errors.passwordResetSuccess") || "Password reset successfully! Redirecting...");
      
      // Hard redirect - AuthProvider will re-initialize and read session from localStorage
      // This ensures navbar gets fresh auth state after redirect
      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 2000);
    } catch (error: any) {
      console.error('[reset-password] Error updating password:', error);
      setStatus('error');
      setMessage(error?.message || t("auth.errors.resetPasswordFailed"));
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-[#f2662d]" />
              <p className="text-sm text-gray-600">{t("auth.errors.resettingPassword") || "Loading..."}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'error' && !isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">{t("auth.errors.resetPasswordTitle")}</CardTitle>
            <CardDescription className="text-center">
              {t("auth.errors.resetPasswordDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{message}</AlertDescription>
            </Alert>
            <Button
              onClick={() => navigate('/')}
              className="w-full mt-4 bg-[#f2662d] hover:bg-[#d9551f]"
              style={{ backgroundColor: '#f2662d' }}
            >
              {t("common.goHome") || "Go Home"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
              <p className="text-center text-gray-800">{message}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">{t("auth.errors.resetPasswordTitle")}</CardTitle>
          <CardDescription className="text-center">
            {t("auth.errors.enterNewPassword") || "Enter your new password below"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {message && status === 'error' && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="password">{t("auth.password")}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t("auth.placeholders.password")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={status !== 'idle'}
                  className="bg-white pr-10"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t("auth.confirmPassword") || "Confirm Password"}</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder={t("auth.placeholders.confirmPassword") || "Confirm your password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={status !== 'idle'}
                  className="bg-white pr-10"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={status !== 'idle' || !password || !confirmPassword}
              className="w-full bg-[#f2662d] hover:bg-[#d9551f]"
              style={{ backgroundColor: '#f2662d' }}
            >
              {status !== 'idle' ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t("auth.errors.resettingPassword") || "Resetting..."}
                </>
              ) : (
                t("auth.errors.resetPasswordButton") || "Reset Password"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

