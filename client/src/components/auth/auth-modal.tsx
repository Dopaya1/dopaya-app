import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { isOnboardingPreviewEnabled } from "@/lib/feature-flags";
import { supabase } from "@/lib/supabase";
import { useLocation } from "wouter";

const loginSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

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
  const [activeTab, setActiveTab] = useState<string>(defaultTab);
  const { loginMutation, registerMutation } = useAuth();
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

  // Reset tab when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
      setLoginError(null);
      setRegisterError(null);
    }
  }, [isOpen, defaultTab]);

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
        setLoginError(error.message || 'Login failed. Please try again.');
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
        setRegisterError(error.message || 'Registration failed. Please try again.');
      }
    });
  };

  // Preview mode auth handlers (matching donation flow)
  const handleGoogleSignIn = async () => {
    try {
      setAuthError("");
      setAuthLoading(true);
      
      // Build redirect URL with preview flag if enabled
      let redirectUrl = `${window.location.origin}/auth/callback`;
      if (previewEnabled) {
        redirectUrl += '?previewOnboarding=1';
      }
      
      console.log('Starting Google OAuth with redirect:', redirectUrl);
      
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
        },
      });
      // Supabase will redirect; no further action here
    } catch (e: any) {
      setAuthError(e?.message || "Google sign-in failed. Please try again.");
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
        // Redirect immediately after login for preview flow
        if (previewEnabled) {
          window.location.href = '/dashboard?previewOnboarding=1';
        } else {
          window.location.href = '/dashboard';
        }
      }
    } catch (e: any) {
      setAuthError(e?.message || "Email sign-in failed. Please check your credentials.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleEmailSignUp = async () => {
    try {
      setAuthError("");
      setAuthLoading(true);
      
      const username = authEmail.trim().split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
      
      const { data, error } = await supabase.auth.signUp({
        email: authEmail.trim(),
        password: authPassword,
        options: {
          data: {
            username: username,
          },
        },
      });
      
      if (error) throw error;
      
      if (data?.user) {
        // User profile is automatically created by database trigger (handle_new_user)
        console.log('User signed up successfully, profile will be created automatically by database trigger');
        
        if (!data.user.email_confirmed_at) {
          // Email confirmation required
          setAuthError("Please check your email to confirm your account. Then sign in.");
          setIsSignUp(false);
          
          if (previewEnabled) {
            sessionStorage.setItem('isNewUser', 'true');
          }
        } else {
          // Email confirmed - user is immediately logged in
          onClose();
          setAuthEmail("");
          setAuthPassword("");
          
          // Set new user flag for welcome modal
          if (previewEnabled) {
            sessionStorage.setItem('isNewUser', 'true');
            window.location.href = '/dashboard?newUser=1&previewOnboarding=1';
          } else {
            window.location.href = '/dashboard';
          }
        }
      }
    } catch (e: any) {
      setAuthError(e?.message || "Registration failed. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  };

  // If preview mode, show inline auth UI (matching payment flow)
  if (previewEnabled) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">
              {isSignUp ? "Create Your Account" : "Welcome Back"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Google Sign In (Primary) */}
            <Button
              onClick={handleGoogleSignIn}
              disabled={authLoading}
              variant="outline"
              className="w-full flex items-center justify-center hover:bg-gray-50"
            >
              {authLoading ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <GoogleIcon />
              )}
              Continue with Google
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with email</span>
              </div>
            </div>

            {/* Email/Password Form */}
            <div className="space-y-4">
              {authError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-800">
                  {authError}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  disabled={authLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  disabled={authLoading}
                />
              </div>

              <Button
                onClick={isSignUp ? handleEmailSignUp : handleEmailLogin}
                disabled={authLoading || !authEmail || !authPassword}
                className="w-full bg-[#f2662d] hover:bg-[#d9551f]"
                style={{ backgroundColor: '#f2662d' }}
              >
                {authLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isSignUp ? "Sign Up" : "Sign In"}
              </Button>
            </div>

            {/* Toggle between Sign In / Sign Up */}
            <div className="text-center text-sm text-gray-600">
              {isSignUp ? (
                <>
                  Already have an account?{" "}
                  <button
                    onClick={() => {
                      setIsSignUp(false);
                      setAuthError("");
                    }}
                    className="text-[#f2662d] hover:underline font-medium"
                  >
                    Sign In
                  </button>
                </>
              ) : (
                <>
                  Don't have an account?{" "}
                  <button
                    onClick={() => {
                      setIsSignUp(true);
                      setAuthError("");
                    }}
                    className="text-[#f2662d] hover:underline font-medium"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Original auth modal UI for non-preview mode
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Welcome to Dopaya</DialogTitle>
        </DialogHeader>
        
        <div className="w-full">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <Card>
                <CardHeader className="space-y-1">
                  <CardTitle className="text-2xl text-center">Sign in</CardTitle>
                  <CardDescription className="text-center">
                    Enter your credentials to access your account
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
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your email" {...field} />
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
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Enter your password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                        {loginMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Sign In
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter>
                  <p className="text-sm text-center w-full">
                    Don't have an account?{" "}
                    <Button variant="link" className="p-0" onClick={() => setActiveTab("register")}>
                      Sign up here
                    </Button>
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="register">
              <Card>
                <CardHeader className="space-y-1">
                  <CardTitle className="text-2xl text-center">Create account</CardTitle>
                  <CardDescription className="text-center">
                    Join Dopaya to start making an impact
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
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input placeholder="John" {...field} />
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
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Doe" {...field} />
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
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="john@example.com" {...field} />
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
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Create a password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
                        {registerMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create Account
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter>
                  <p className="text-sm text-center w-full">
                    Already have an account?{" "}
                    <Button variant="link" className="p-0" onClick={() => setActiveTab("login")}>
                      Sign in here
                    </Button>
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}