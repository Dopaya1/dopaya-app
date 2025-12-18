import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { AlertCircle, Loader2, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { isOnboardingPreviewEnabled } from "@/lib/feature-flags";
import { supabase } from "@/lib/supabase";
import { useLocation } from "wouter";
import { useTranslation } from "@/lib/i18n/use-translation";
import { resetPassword } from "@/lib/auth/supabaseAuthService";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "login" | "register";
}

// Google logo SVG component
const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

export function AuthModal({ isOpen, onClose, defaultTab = "login" }: AuthModalProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<string>(defaultTab);
  const { loginMutation, registerMutation, resendVerificationMutation } = useAuth();
  const [loginError, setLoginError] = useState<string | null>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const previewEnabled = isOnboardingPreviewEnabled();
  const [, navigate] = useLocation();
  
  // Preview mode inline auth states
  const [authEmail, setAuthEmail] = useState<string>("");
  const [authPassword, setAuthPassword] = useState<string>("");
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>("");
  const [isSignUp, setIsSignUp] = useState<boolean>(defaultTab === "register");
  const [showResendEmail, setShowResendEmail] = useState<boolean>(false);
  
  // Password reset states
  const [showPasswordResetDialog, setShowPasswordResetDialog] = useState<boolean>(false);
  const [resetEmail, setResetEmail] = useState<string>("");
  const [resetLoading, setResetLoading] = useState<boolean>(false);
  const [resetSuccess, setResetSuccess] = useState<boolean>(false);
  const [resetError, setResetError] = useState<string>("");

  // Create schemas with translated messages
  const loginSchema = z.object({
    email: z.string().email(t("auth.validation.validEmailRequired")),
    password: z.string().min(1, t("auth.validation.passwordRequired")),
  });

  const registerSchema = z.object({
    email: z.string().email(t("auth.validation.validEmailRequired")),
    password: z.string().min(6, t("auth.validation.passwordMinLength")),
    firstName: z.string().min(1, t("auth.validation.firstNameRequired")),
    lastName: z.string().min(1, t("auth.validation.lastNameRequired")),
  });

  type LoginFormValues = z.infer<typeof loginSchema>;
  type RegisterFormValues = z.infer<typeof registerSchema>;

  // Reset tab when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
      setLoginError(null);
      setRegisterError(null);
      setShowResendEmail(false);
      setAuthError("");
      // Reset password reset dialog state
      setShowPasswordResetDialog(false);
      setResetEmail("");
      setResetSuccess(false);
      setResetError("");
    }
  }, [isOpen, defaultTab]);

  // Handle password reset
  const handlePasswordReset = async () => {
    if (!resetEmail.trim()) {
      setResetError(t("auth.validation.validEmailRequired"));
      return;
    }

    try {
      setResetLoading(true);
      setResetError("");
      setResetSuccess(false);
      
      // Use the existing resetPassword function from supabaseAuthService
      await resetPassword(resetEmail.trim());
      
      setResetSuccess(true);
      setResetError("");
      
      // Auto-close dialog after 3 seconds
      setTimeout(() => {
        setShowPasswordResetDialog(false);
        setResetEmail("");
        setResetSuccess(false);
      }, 3000);
    } catch (error: any) {
      console.error('Password reset error:', error);
      setResetError(error?.message || t("auth.errors.resetPasswordFailed"));
      setResetSuccess(false);
    } finally {
      setResetLoading(false);
    }
  };

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      password: "",
      email: "",
      firstName: "",
      lastName: "",
    },
  });

  const onLoginSubmit = (data: LoginFormValues) => {
    setLoginError(null);
    
    loginMutation.mutate(data, {
      onSuccess: () => {
        onClose();
        loginForm.reset();
      },
      onError: (error) => {
        console.error('Login error:', error);
        setLoginError(error.message || t("auth.errors.loginFailed"));
      }
    });
  };

  const onRegisterSubmit = (data: RegisterFormValues) => {
    setRegisterError(null);
    
    registerMutation.mutate(data, {
      onSuccess: () => {
        onClose();
        registerForm.reset();
      },
      onError: (error) => {
        console.error('Registration error:', error);
        setRegisterError(error.message || t("auth.errors.registrationFailed"));
      }
    });
  };

  // Preview mode auth handlers (matching donation flow)
  const handleGoogleSignIn = async () => {
    try {
      setAuthError("");
      setAuthLoading(true);
      
      // LAUNCH: Always use base callback URL (Supabase whitelist requirement)
      const redirectUrl = `${window.location.origin}/auth/callback`;
      // Note: Query parameters removed - preview is now enabled for all users via feature flag
      
      console.log('Starting Google OAuth with redirect:', redirectUrl);
      
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
        },
      });
      // Supabase will redirect; no further action here
    } catch (e: any) {
      setAuthError(e?.message || t("auth.errors.googleSignInFailed"));
    } finally {
      setAuthLoading(false);
    }
  };

  const handleEmailLogin = async () => {
    try {
      setAuthError("");
      setAuthLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: authEmail.trim(),
        password: authPassword,
      });
      if (error) throw error;
      if (data?.user) {
        onClose();
        setAuthEmail("");
        setAuthPassword("");
        // LAUNCH: Always redirect to dashboard (preview enabled for all users)
        window.location.href = '/dashboard';
      }
    } catch (e: any) {
      setAuthError(e?.message || t("auth.errors.emailSignInFailed"));
    } finally {
      setAuthLoading(false);
    }
  };

  const handleEmailSignUp = async () => {
    try {
      setAuthError("");
      setAuthLoading(true);
      
      const username = authEmail.trim().split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
      
      // IMPORTANT: Include pendingSupportReturnUrl in the email confirmation redirect URL
      // This ensures it persists even if sessionStorage is cleared during redirect
      const pendingSupportReturnUrl = sessionStorage.getItem('pendingSupportReturnUrl');
      let emailRedirectUrl = `${window.location.origin}/auth/callback`;
      if (pendingSupportReturnUrl) {
        // Encode the support URL as a query parameter so it persists
        const encodedSupportUrl = encodeURIComponent(pendingSupportReturnUrl);
        emailRedirectUrl = `${window.location.origin}/auth/callback?returnTo=${encodedSupportUrl}`;
        console.log('[Auth Modal] ✅ Including pendingSupportReturnUrl in email redirect:', {
          original: pendingSupportReturnUrl,
          encoded: encodedSupportUrl,
          finalRedirectUrl: emailRedirectUrl
        });
      }
      
      const { data, error } = await supabase.auth.signUp({
        email: authEmail.trim(),
        password: authPassword,
        options: {
          data: {
            username: username,
          },
          emailRedirectTo: emailRedirectUrl,
        },
      });
      
      if (error) {
        console.error('Supabase signUp error:', error);
        throw error;
      }
      
      if (data?.user) {
        // User profile is automatically created by database trigger (handle_new_user)
        console.log('User signed up successfully, profile will be created automatically by database trigger');
        console.log('User data:', {
          id: data.user.id,
          email: data.user.email,
          email_confirmed_at: data.user.email_confirmed_at,
          confirmed_at: data.user.confirmed_at,
        });
        
        // Check if email confirmation is required
        // In development, if emails aren't working, we can check the session
        const session = data.session;
        console.log('Session after signup:', session ? 'Session exists (email might be auto-confirmed)' : 'No session (email confirmation required)');
        
        if (!data.user.email_confirmed_at && !session) {
          // Email confirmation required
          console.warn('[Auth Modal] Email confirmation required. Check Supabase dashboard for email logs.');
          setAuthError(t("auth.errors.checkEmailToConfirm"));
          setIsSignUp(false);
          setShowResendEmail(true);
          
          // Always set new user flag (for email confirmation flow)
          sessionStorage.setItem('isNewUser', 'true');
          console.log('[Auth Modal] ✅ Set isNewUser flag for email confirmation flow');
          
          // IMPORTANT: Preserve pendingSupportReturnUrl if it exists (user was trying to donate)
          // This ensures they get redirected back to support page after email confirmation
          const existingPendingSupportUrl = sessionStorage.getItem('pendingSupportReturnUrl');
          const allSessionStorage = {
            pendingSupportReturnUrl: existingPendingSupportUrl,
            isNewUser: sessionStorage.getItem('isNewUser'),
            checkNewUser: sessionStorage.getItem('checkNewUser'),
            authReturnUrl: sessionStorage.getItem('authReturnUrl'),
            openPaymentDialog: sessionStorage.getItem('openPaymentDialog')
          };
          console.log('[Auth Modal] 📋 SessionStorage state after email signup:', allSessionStorage);
          if (existingPendingSupportUrl) {
            console.log('[Auth Modal] ✅ Preserving pendingSupportReturnUrl for email confirmation:', existingPendingSupportUrl);
            // Flag is already set, just log it - don't overwrite it
          } else {
            console.warn('[Auth Modal] ⚠️ No pendingSupportReturnUrl found - user might be redirected to dashboard instead of support page!');
          }
        } else {
          // Email confirmed - user is immediately logged in
          onClose();
          setAuthEmail("");
          setAuthPassword("");
          
          // Always set new user flag and redirect with newUser=1 and previewOnboarding=1
          // This ensures welcome modals show and user gets full onboarding experience
          sessionStorage.setItem('isNewUser', 'true');
          const redirectUrl = '/dashboard?newUser=1&previewOnboarding=1';
          window.location.href = redirectUrl;
        }
      }
    } catch (e: any) {
      setAuthError(e?.message || t("auth.errors.registrationFailed"));
    } finally {
      setAuthLoading(false);
    }
  };

  // Password Reset Dialog (used in both preview and normal mode)
  // IMPORTANT: Defined BEFORE use to avoid "Cannot access before initialization" error
  const PasswordResetDialog = (
    <Dialog open={showPasswordResetDialog} onOpenChange={setShowPasswordResetDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("auth.errors.resetPasswordTitle")}</DialogTitle>
          <DialogDescription>
            {t("auth.errors.resetPasswordDescription")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {resetSuccess ? (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {t("auth.errors.resetPasswordSent")}
              </AlertDescription>
            </Alert>
          ) : (
            <>
              {resetError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{resetError}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="reset-email">{t("auth.email")}</Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder={t("auth.placeholders.email")}
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  disabled={resetLoading}
                  className="bg-white"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !resetLoading) {
                      handlePasswordReset();
                    }
                  }}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handlePasswordReset}
                  disabled={resetLoading || !resetEmail.trim()}
                  className="flex-1 bg-[#f2662d] hover:bg-[#d9551f]"
                  style={{ backgroundColor: '#f2662d' }}
                >
                  {resetLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t("auth.errors.resettingPassword")}
                    </>
                  ) : (
                    t("auth.errors.resetPasswordTitle")
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowPasswordResetDialog(false);
                    setResetEmail("");
                    setResetError("");
                    setResetSuccess(false);
                  }}
                  disabled={resetLoading}
                  className="bg-white"
                >
                  {t("common.cancel")}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );

  // If preview mode, show inline auth UI (matching payment flow)
  if (previewEnabled) {
    return (
      <>
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center">
                {isSignUp ? t("auth.createYourAccount") : t("auth.welcomeBack")}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-4">
            {/* Google Sign In (Primary) */}
            <Button
              onClick={handleGoogleSignIn}
              disabled={authLoading}
              variant="outline"
              className="w-full flex items-center justify-center bg-white hover:bg-gray-50"
            >
              {authLoading ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <GoogleIcon />
              )}
              {t("auth.continueWithGoogle")}
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">{t("auth.orContinueWithEmail")}</span>
              </div>
            </div>

            {/* Email/Password Form */}
            <div className="space-y-4">
              {authError && (
                <div className="space-y-2">
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-800 space-y-2">
                    <div>{authError}</div>
                  </div>
                  {showResendEmail && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={async () => {
                        try {
                          await resendVerificationMutation.mutateAsync(authEmail.trim());
                          setAuthError(t("auth.errors.emailResent"));
                        } catch (error: any) {
                          setAuthError(error.message || t("auth.errors.resendFailed"));
                        }
                      }}
                      disabled={resendVerificationMutation.isPending || !authEmail.trim()}
                      className="w-full bg-white"
                    >
                      {resendVerificationMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {t("auth.errors.resendingEmail")}
                        </>
                      ) : (
                        t("auth.errors.resendConfirmationEmail")
                      )}
                    </Button>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">{t("auth.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t("auth.placeholders.email")}
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  disabled={authLoading}
                  className="bg-white"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">{t("auth.password")}</Label>
                  {!isSignUp && (
                    <button
                      type="button"
                      onClick={() => {
                        setResetEmail(authEmail.trim());
                        setShowPasswordResetDialog(true);
                      }}
                      className="text-sm text-[#f2662d] hover:text-[#d9551f] underline"
                    >
                      {t("auth.errors.forgotPassword")}
                    </button>
                  )}
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder={t("auth.placeholders.password")}
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  disabled={authLoading}
                  className="bg-white"
                />
              </div>

              {/* Buttons: Primary Sign In, Secondary Create account */}
              <div className="flex flex-col md:flex-row gap-2">
                <Button
                  onClick={isSignUp ? handleEmailSignUp : handleEmailLogin}
                  disabled={authLoading || !authEmail || !authPassword}
                  className={`${isSignUp ? 'w-full' : 'flex-1'} bg-[#f2662d] hover:bg-[#d9551f]`}
                  style={{ backgroundColor: '#f2662d' }}
                >
                  {authLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {isSignUp ? t("auth.signUp") : t("auth.signIn")}
                </Button>
                {!isSignUp && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsSignUp(true);
                      setAuthError("");
                    }}
                    className="flex-1 bg-white"
                  >
                    {t("auth.createAccount")}
                  </Button>
                )}
                {isSignUp && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsSignUp(false);
                      setAuthError("");
                    }}
                    className="flex-1 bg-white"
                  >
                    {t("auth.signIn")}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {PasswordResetDialog}
    </>
    );
  }

  // Original auth modal UI for non-preview mode
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("auth.welcomeToDopaya")}</DialogTitle>
        </DialogHeader>
        
        <div className="w-full">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">{t("auth.login")}</TabsTrigger>
              <TabsTrigger value="register">{t("auth.register")}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <Card>
                <CardHeader className="space-y-1">
                  <CardTitle className="text-2xl text-center">{t("auth.signIn")}</CardTitle>
                  <CardDescription className="text-center">
                    {t("auth.enterCredentials")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loginError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{loginError}</AlertDescription>
                    </Alert>
                  )}
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("auth.email")}</FormLabel>
                            <FormControl>
                              <Input placeholder={t("auth.enterYourEmail")} className="bg-white" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center justify-between">
                              <FormLabel>{t("auth.password")}</FormLabel>
                              <button
                                type="button"
                                onClick={() => {
                                  setResetEmail(loginForm.getValues("email") || "");
                                  setShowPasswordResetDialog(true);
                                }}
                                className="text-sm text-[#f2662d] hover:text-[#d9551f] underline"
                              >
                                {t("auth.errors.forgotPassword")}
                              </button>
                            </div>
                            <FormControl>
                              <Input type="password" placeholder={t("auth.enterYourPassword")} className="bg-white" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {/* Buttons: Primary Sign In, Secondary Create account */}
                      <div className="flex flex-col md:flex-row gap-2">
                        <Button type="submit" className="flex-1 bg-[#f2662d] hover:bg-[#d9551f]" disabled={loginMutation.isPending}>
                          {loginMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          {t("auth.signIn")}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1 bg-white"
                          onClick={() => setActiveTab("register")}
                        >
                          {t("auth.createAccount")}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="register">
              <Card>
                <CardHeader className="space-y-1">
                  <CardTitle className="text-2xl text-center">{t("auth.createAccount")}</CardTitle>
                  <CardDescription className="text-center">
                    {t("auth.joinDopayaToStart")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {registerError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{registerError}</AlertDescription>
                    </Alert>
                  )}
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={registerForm.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("auth.firstName")}</FormLabel>
                              <FormControl>
                                <Input placeholder={t("auth.placeholders.firstName")} className="bg-white" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t("auth.lastName")}</FormLabel>
                              <FormControl>
                                <Input placeholder={t("auth.placeholders.lastName")} className="bg-white" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("auth.email")}</FormLabel>
                            <FormControl>
                              <Input placeholder={t("auth.placeholders.email")} className="bg-white" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("auth.password")}</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder={t("auth.placeholders.password")} className="bg-white" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
                        {registerMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t("auth.createAccount")}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    className="w-full bg-white"
                    onClick={() => setActiveTab("login")}
                  >
                    {t("auth.signIn")}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
      {PasswordResetDialog}
    </Dialog>
  );
}