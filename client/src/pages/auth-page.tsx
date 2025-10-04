import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RedirectIfAuthenticated } from "../lib/auth";

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

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<string>("login");
  const { loginMutation, registerMutation } = useAuth();
  const [location, navigate] = useLocation();
  const [loginError, setLoginError] = useState<string | null>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);
  
  // Check URL parameters for signup redirect
  useEffect(() => {
    try {
      // Check if URL contains action=signup (more robust than URLSearchParams)
      if (window.location.href.includes('action=signup')) {
        setActiveTab('register');
      }
    } catch (error) {
      console.error('Error parsing URL parameters:', error);
    }
  }, [location]);

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
    console.log('Login form submitted with data:', data);
    setLoginError(null);
    
    loginMutation.mutate({
      email: data.email,
      password: data.password
    }, {
      onSuccess: (user) => {
        console.log('Login successful, user:', user);
        console.log('Redirecting to home page');
        navigate("/");
      },
      onError: (error) => {
        console.error('Login error:', error);
        setLoginError(error.message);
      },
    });
  };

  const onRegisterSubmit = (data: RegisterFormValues) => {
    console.log('Registration form submitted with data:', data);
    setRegisterError(null);
    
    registerMutation.mutate({
      email: data.email,
      password: data.password,
      username: data.email.split('@')[0], // Generate username from email
      firstName: data.firstName,
      lastName: data.lastName
    }, {
      onSuccess: (user) => {
        console.log('Registration successful, user:', user);
        console.log('Redirecting to home page');
        navigate("/");
      },
      onError: (error) => {
        console.error('Registration error:', error);
        setRegisterError(error.message);
      },
    });
  };

  return (
    <RedirectIfAuthenticated>
      <Helmet>
        <title>Sign In or Register | Dopaya</title>
        <meta name="description" content="Join Dopaya to support social enterprises and earn Impact Points." />
      </Helmet>
      
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8">
            {/* Left Side - Auth Forms */}
            <div className="flex flex-col justify-center">
              <div className="mx-auto w-full max-w-md">
                <div className="text-center mb-6">
                  <h1 className="text-3xl font-bold text-dark font-heading">Welcome to Dopaya</h1>
                  <p className="mt-2 text-neutral">Sign in or create an account to get started</p>
                </div>
                
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="login">Sign In</TabsTrigger>
                    <TabsTrigger value="register">Create Account</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="login">
                    <Card>
                      <CardHeader>
                        <CardTitle>Sign In</CardTitle>
                        <CardDescription>
                          Enter your email and password to access your account
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {loginError && (
                          <Alert variant="destructive" className="mb-4">
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
                                    <Input type="email" placeholder="Enter your email" {...field} />
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
                            
                            <Button 
                              type="submit" 
                              className="w-full" 
                              disabled={loginMutation.isPending}
                            >
                              {loginMutation.isPending ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Signing In...
                                </>
                              ) : (
                                "Sign In"
                              )}
                            </Button>
                          </form>
                        </Form>
                      </CardContent>
                      <CardFooter className="flex justify-center">
                        <Button 
                          variant="link" 
                          onClick={() => setActiveTab("register")}
                        >
                          Don't have an account? Register
                        </Button>
                      </CardFooter>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="register">
                    <Card>
                      <CardHeader>
                        <CardTitle>Create Account</CardTitle>
                        <CardDescription>
                          Join Dopaya to support social enterprises and track your impact
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {registerError && (
                          <Alert variant="destructive" className="mb-4">
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
                                      <Input placeholder="First name" {...field} />
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
                                      <Input placeholder="Last name" {...field} />
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
                                    <Input type="email" placeholder="Your email address" {...field} />
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
                            
                            <Button 
                              type="submit" 
                              className="w-full" 
                              disabled={registerMutation.isPending}
                            >
                              {registerMutation.isPending ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Creating Account...
                                </>
                              ) : (
                                "Create Account"
                              )}
                            </Button>
                          </form>
                        </Form>
                      </CardContent>
                      <CardFooter className="flex justify-center">
                        <Button 
                          variant="link" 
                          onClick={() => setActiveTab("login")}
                        >
                          Already have an account? Sign in
                        </Button>
                      </CardFooter>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            {/* Right Side - Hero Image & Benefits - Using sticky positioning */}
            <div className="hidden lg:block">
              <div className="sticky top-24 lg:flex flex-col justify-center">
                <div className="bg-white p-8 rounded-xl shadow-md">
                  <div className="mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                    </svg>
                    <h2 className="text-2xl font-bold text-dark font-heading mt-4">Make a real-world impact</h2>
                    <p className="mt-2 text-neutral">
                      Join Dopaya to support high-impact social enterprises working on critical issues around the world.
                    </p>
                  </div>
                  
                  <ul className="space-y-4">
                    <li className="flex">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Support vetted social enterprises solving critical problems</span>
                    </li>
                    <li className="flex">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Track your donations' impact in real-time</span>
                    </li>
                    <li className="flex">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Earn Impact Points for each donation you make</span>
                    </li>
                    <li className="flex">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Redeem rewards from sustainable brands</span>
                    </li>
                  </ul>
                  
                  <div className="mt-8 p-4 bg-background rounded-lg">
                    <p className="text-sm italic">
                      "Dopaya makes it easy to support projects I care about and see the real impact of my donations. Plus, I love the rewards I get from sustainable brands!"
                    </p>
                    <div className="flex items-center mt-3">
                      <div className="h-8 w-8 bg-primary/20 rounded-full flex items-center justify-center text-primary font-medium">ML</div>
                      <div className="ml-2">
                        <p className="text-sm font-medium">Maria L.</p>
                        <p className="text-xs text-neutral">Dopaya Impact Legend</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RedirectIfAuthenticated>
  );
}