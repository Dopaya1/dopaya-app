import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Heart, Info, ShieldCheck, Gift, Share2, X, Trophy } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useQuery } from "@tanstack/react-query";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { BRAND_COLORS } from "@/constants/colors";
import { ProcessingImpact } from "./processing-impact";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";
import { Project, UserImpact } from "@shared/schema";
import { trackDonation, trackWaitlistSignup } from "@/lib/simple-analytics";
import { isOnboardingPreviewEnabled } from "@/lib/feature-flags";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";

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

interface DonationButtonProps {
  project?: Project;
  variant?: "default" | "outline" | "secondary";
  size?: "sm" | "default" | "lg";
  className?: string;
  children?: React.ReactNode;
  generalDonation?: boolean;
  style?: React.CSSProperties;
}

// Temporary flag: when true (preview), the main Support button navigates
// to the new full checkout page at /support/:slug instead of opening the modal.
// Set this to false to instantly fall back to the previous, modal-based flow.
const USE_SUPPORT_PAGE_PREVIEW = true;

export function DonationButton({ 
  project, 
  variant = "default", 
  size = "default", 
  className = "",
  children,
  generalDonation = false,
  style
}: DonationButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const previewEnabled = isOnboardingPreviewEnabled();
  const [waitingForAuth, setWaitingForAuth] = useState(false);
  
  // Reset waitingForAuth when user logs out
  useEffect(() => {
    if (!user) {
      setWaitingForAuth(false);
    }
  }, [user]);
  
  // Check if we should open the dialog after returning from auth (Google OAuth)
  useEffect(() => {
    if (previewEnabled && sessionStorage.getItem('openPaymentDialog') === 'true') {
      sessionStorage.removeItem('openPaymentDialog');
      setIsDialogOpen(true);
      setWaitingForAuth(false);
    }
  }, [previewEnabled]);
  
  // Keep dialog open and switch to payment view when user logs in
  useEffect(() => {
    if (previewEnabled && waitingForAuth && user && isDialogOpen) {
      // User just logged in, keep dialog open to show payment form
      setWaitingForAuth(false);
      // Dialog will automatically show payment form because user is now truthy
    }
  }, [previewEnabled, waitingForAuth, user, isDialogOpen]);
  const [supportAmount, setSupportAmount] = useState<number | null>(null); // Start with null (no amount selected)
  const [isCustomAmount, setIsCustomAmount] = useState<boolean>(false);
  const [customAmount, setCustomAmount] = useState<number>(0); // Start with 0
  const [tipSliderValue, setTipSliderValue] = useState<number[]>([10]); // Default 10%
  const [isCustomTip, setIsCustomTip] = useState<boolean>(false);
  const [customTipValue, setCustomTipValue] = useState<number>(0);
  const [hideNamePublicly, setHideNamePublicly] = useState<boolean>(false);
  const [signUpForUpdates, setSignUpForUpdates] = useState<boolean>(false);
  const [authEmail, setAuthEmail] = useState<string>("");
  const [authPassword, setAuthPassword] = useState<string>("");
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>("");
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [showProcessingImpact, setShowProcessingImpact] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [showReferral, setShowReferral] = useState<boolean>(false);
  
  // Check if this is user's first support (has 50 IP from welcome bonus)
  const { data: impact } = useQuery<UserImpact>({
    queryKey: ["/api/user/impact"],
    enabled: !!user,
  });
  const isFirstSupport = impact?.impactPoints === 50 && (impact?.projectsSupported || 0) === 0;

  const currentSupportAmount = isCustomAmount ? customAmount : (supportAmount || 0);
  const hasSelectedAmount = supportAmount !== null || (isCustomAmount && customAmount > 0);
  const impactPoints = Math.max(0, Math.floor(currentSupportAmount * 10)); // 10 IP per $1
  
  // Calculate tip percentage from slider or custom value (tipPercent is 0-20, so divide by 100)
  const tipPercent = isCustomTip ? customTipValue : tipSliderValue[0];
  const tipAmount = currentSupportAmount > 0 ? Math.round((currentSupportAmount * (tipPercent / 100)) * 100) / 100 : 0;
  const totalAmount = Math.round((currentSupportAmount + tipAmount) * 100) / 100;
  
  const predefinedAmounts = [50, 100, 200, 500, 1000];

  const handlePaymentSubmit = () => {
    if (!hasSelectedAmount || currentSupportAmount <= 0) return;
    
    // Validate minimum amount (except for first-time users)
    const minAmount = isFirstSupport ? 5 : 10;
    if (currentSupportAmount < minAmount) {
      return; // Don't proceed if amount is too low
    }
    
    // Show processing animation
    setShowProcessingImpact(true);
    setIsDialogOpen(false); // Close payment dialog
  };

  const handleProcessingComplete = () => {
    setShowProcessingImpact(false);
    // In preview mode, just show a success message
    // In production, this would trigger actual payment processing
    setShowSuccess(true);
    
    // Check if referral has been shown before (one-time show)
    const referralShown = sessionStorage.getItem('referralPromptShown');
    if (!referralShown) {
      setShowReferral(true);
    }
    
    // Determine if this is first support (support-first user) or existing user
    // Check impact BEFORE payment: if user had 50 IP (welcome bonus) and 0 projects, this is first support
    const currentImpactPoints = impact?.impactPoints || 0;
    const currentProjectsSupported = impact?.projectsSupported || 0;
    const isFirstSupport = currentImpactPoints === 50 && currentProjectsSupported === 0;
    const isExistingUser = currentImpactPoints > 50 || currentProjectsSupported > 0;
    
    // Auto-route logic per PRD:
    // - Support-first (first-time): Auto-route to Rewards (≤100 IP) after 2-3s
    // - Existing user: Auto-route to Dashboard after 2-3s
    if (isFirstSupport) {
      // First support → Auto-route to Rewards (≤100 IP) after 2-3s
      setTimeout(() => {
        handleSuccessClose();
        navigate(`/rewards?unlock=1&maxPoints=100`);
      }, 2500); // 2.5s delay
    } else if (isExistingUser) {
      // Existing user → Auto-route to Dashboard after 2-3s
      setTimeout(() => {
        handleSuccessClose();
        navigate('/dashboard');
      }, 2500); // 2.5s delay
    }
    // If we can't determine, let user choose manually
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    setShowReferral(false);
    // Reset form when closing - start with 0 (no amount selected)
    setSupportAmount(null);
    setIsCustomAmount(false);
    setCustomAmount(0);
    setTipSliderValue([10]);
    setIsCustomTip(false);
    setCustomTipValue(0);
  };
  
  // Reset form when dialog closes
  const handleDialogClose = (open: boolean) => {
    if (!open) {
      // Reset to initial state (0, no amount selected)
      setSupportAmount(null);
      setIsCustomAmount(false);
      setCustomAmount(0);
      setTipSliderValue([10]);
      setIsCustomTip(false);
      setCustomTipValue(0);
      setAuthError("");
      setAuthEmail("");
      setAuthPassword("");
    }
    setIsDialogOpen(open);
  };
  
  const handleDismissReferral = () => {
    setShowReferral(false);
    sessionStorage.setItem('referralPromptShown', 'true');
  };
  
  const handleShareImpact = () => {
    // Prepare share text
    const shareText = `I just supported ${project?.title || 'a social enterprise'} on Dopaya and earned ${impactPoints} Impact Points! Join me in creating real impact. 🌍✨`;
    const shareUrl = `${window.location.origin}${project ? `/project/${project.slug}` : ''}`;
    
    // Try native share if available
    if (navigator.share) {
      navigator.share({
        title: 'Share Your Impact',
        text: shareText,
        url: shareUrl,
      }).catch(() => {
        // User cancelled or error - do nothing
      });
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(`${shareText}\n${shareUrl}`).then(() => {
        alert('Share link copied to clipboard!');
      });
    }
    
    handleDismissReferral();
  };

  const handleGoogleSignIn = async () => {
    try {
      setAuthError("");
      setAuthLoading(true);
      
      // Store the current page URL with preview flag to return after auth
      const currentUrl = window.location.href;
      sessionStorage.setItem('authReturnUrl', currentUrl);
      sessionStorage.setItem('openPaymentDialog', 'true'); // Fixed: use correct key
      setWaitingForAuth(true); // Mark that we're waiting for auth to complete
      // Mark as new user registration for welcome modal (preview only)
      if (previewEnabled && !user) {
        sessionStorage.setItem('isNewUser', 'true');
      }
      
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
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
      setWaitingForAuth(true); // Mark that we're waiting for auth to complete
      // useAuth loginMutation is available, but for simplicity we use supabase directly here
      const { data, error } = await supabase.auth.signInWithPassword({
        email: authEmail.trim(),
        password: authPassword,
      });
      if (error) throw error;
      if (data?.user) {
        // Don't close dialog - keep it open and let user state update trigger payment view
        // The useEffect above will handle switching to payment form
        setAuthEmail("");
        setAuthPassword("");
        // User state will update via onAuthStateChange in useAuth hook
        // Dialog stays open and automatically shows payment form when user becomes truthy
      }
    } catch (e: any) {
      setAuthError(e?.message || "Email sign-in failed. Please check your credentials.");
      setWaitingForAuth(false); // Reset on error
    } finally {
      setAuthLoading(false);
    }
  };

  const handleEmailSignUp = async () => {
    try {
      setAuthError("");
      setAuthLoading(true);
      
      // Extract username from email (e.g., "john.doe@example.com" -> "johndoe")
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
        // Check if email confirmation is required
        if (!data.user.email_confirmed_at) {
          setAuthError("Please check your email to confirm your account. Then sign in.");
          setIsSignUp(false); // Switch to login mode
          setWaitingForAuth(false); // Reset waiting state
          
          // Mark as new user for welcome modal after confirmation (preview only)
          if (previewEnabled) {
            sessionStorage.setItem('isNewUser', 'true');
          }
        } else {
          // Auto-logged in (if email confirmation is disabled)
          setWaitingForAuth(true); // Mark that we're waiting for auth to complete
          // Don't close dialog - keep it open and let user state update trigger payment view
          setAuthEmail("");
          setAuthPassword("");
          // User state will update via onAuthStateChange in useAuth hook
          // Dialog stays open and automatically shows payment form when user becomes truthy
          // Note: For new user signup, we might want to redirect to dashboard instead
          // But for support-first flow, we want to show payment form
        }
      }
    } catch (e: any) {
      setAuthError(e?.message || "Registration failed. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <>
      {/* Processing Impact Animation */}
      {previewEnabled && showProcessingImpact && (
        <ProcessingImpact
          onComplete={handleProcessingComplete}
          impactPoints={impactPoints}
          duration={2000}
          skippable={process.env.NODE_ENV === 'development'}
        />
      )}

      {/* Success Message (Preview) */}
      {previewEnabled && (
        <Dialog open={showSuccess} onOpenChange={() => {
          // Prevent any automatic closing - only close via buttons
          // Do nothing here, state is controlled by handleSuccessClose only
        }}>
          <DialogContent 
            className="sm:max-w-md text-center [&>button]:hidden" 
            onInteractOutside={(e) => {
              // Prevent closing when clicking outside
              e.preventDefault();
            }} 
            onEscapeKeyDown={(e) => {
              // Prevent closing with Escape key
              e.preventDefault();
            }}
          >
            <DialogHeader>
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Heart className="w-10 h-10 text-green-600 fill-green-600" />
              </div>
              <DialogTitle className="text-2xl font-bold text-gray-900">
                Your impact is happening!
              </DialogTitle>
              <DialogDescription className="text-lg text-gray-600 pt-2">
                You've earned {impactPoints} Impact Points
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Impaktera Trust Badge */}
              <div className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <p className="text-xs text-blue-900 leading-relaxed">
                  Your support is verified through Impaktera, our Swiss nonprofit partner.
                </p>
              </div>

              {/* Referral Prompt (shown once, dismissible) */}
              {showReferral && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-4 space-y-3 relative">
                  <button
                    onClick={handleDismissReferral}
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                    aria-label="Dismiss"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-2">
                    <Share2 className="w-5 h-5 text-purple-600" />
                    <h4 className="font-semibold text-gray-900">Share your impact</h4>
                  </div>
                  <p className="text-sm text-gray-700 pr-6">
                    Invite friends to join the movement. When they support a project, you both create more impact together!
                  </p>
                  <Button
                    onClick={handleShareImpact}
                    className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Invite a Friend
                  </Button>
                </div>
              )}

              {/* Conditional CTAs based on user type */}
              {(() => {
                // Check impact BEFORE payment to determine user type
                const currentImpactPoints = impact?.impactPoints || 0;
                const currentProjectsSupported = impact?.projectsSupported || 0;
                const isFirstSupport = currentImpactPoints === 50 && currentProjectsSupported === 0;
                const isExistingUser = currentImpactPoints > 50 || currentProjectsSupported > 0;
                
                if (isFirstSupport) {
                  // Support-first: Show Rewards CTA (will auto-route in 2-3s)
                  return (
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-lg p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <Gift className="w-5 h-5 text-yellow-600" />
                        <h4 className="font-semibold text-gray-900">Unlock your first reward!</h4>
                      </div>
                      <p className="text-sm text-gray-700">
                        You've earned {impactPoints} Impact Points. Browse rewards you can unlock right now.
                      </p>
                      <Button
                        onClick={() => {
                          handleSuccessClose();
                          navigate(`/rewards?unlock=1&maxPoints=100`);
                        }}
                        className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold"
                        style={{ backgroundColor: '#FFC107', color: '#1a1a3a' }}
                      >
                        <Gift className="w-4 h-4 mr-2" />
                        View Rewards
                      </Button>
                    </div>
                  );
                } else if (isExistingUser) {
                  // Existing user: Show Dashboard CTA (will auto-route in 2-3s)
                  return (
                    <Button
                      onClick={() => {
                        handleSuccessClose();
                        navigate('/dashboard');
                      }}
                      className="w-full bg-[#f2662d] hover:bg-[#d9551f] text-white font-semibold"
                      style={{ backgroundColor: '#f2662d' }}
                    >
                      Go to Dashboard
                    </Button>
                  );
                } else {
                  // Fallback: Show both options if we can't determine
                  return (
                    <>
                      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-lg p-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <Gift className="w-5 h-5 text-yellow-600" />
                          <h4 className="font-semibold text-gray-900">Unlock rewards!</h4>
                        </div>
                        <p className="text-sm text-gray-700">
                          You've earned {impactPoints} Impact Points. Browse rewards you can unlock right now.
                        </p>
                        <Button
                          onClick={() => {
                            handleSuccessClose();
                            navigate(`/rewards?unlock=1&maxPoints=100`);
                          }}
                          className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold"
                          style={{ backgroundColor: '#FFC107', color: '#1a1a3a' }}
                        >
                          <Gift className="w-4 h-4 mr-2" />
                          View Rewards
                        </Button>
                      </div>
                      <Button
                        onClick={() => {
                          handleSuccessClose();
                          navigate("/dashboard");
                        }}
                        variant="outline"
                        className="w-full"
                      >
                        Go to Dashboard
                      </Button>
                    </>
                  );
                }
              })()}
            </div>
          </DialogContent>
        </Dialog>
      )}

      <Button
        variant={variant}
        size={size}
        className={className}
        style={style}
        onClick={() => {
          trackDonation(project?.slug || 'general', 0);
          // In onboarding preview, use the new full support page when enabled
          if (
            previewEnabled &&
            USE_SUPPORT_PAGE_PREVIEW &&
            project?.slug &&
            !generalDonation
          ) {
            navigate(`/support/${project.slug}?previewOnboarding=1`);
          } else {
            // Fallback: existing modal behavior
          setIsDialogOpen(true);
          }
        }}
        data-testid="button-support-project"
      >
        {children || (
          <>
            <Heart className="w-4 h-4 mr-2" />
            Donate Now
          </>
        )}
      </Button>

      <Dialog 
        open={isDialogOpen} 
        onOpenChange={(open) => {
          // Prevent closing if we're waiting for auth to complete (but allow closing on logout)
          if (!open && waitingForAuth && user) {
            // Only prevent closing if we're waiting for auth AND user is still logged in
            // If user is null (logged out), allow closing
            return; // Don't close while waiting for auth
          }
          handleDialogClose(open);
          // Reset waitingForAuth when dialog is manually closed
          if (!open) {
            setWaitingForAuth(false);
          }
        }}
      >
        <DialogContent className={`${user ? 'sm:max-w-2xl max-w-[90vw]' : 'sm:max-w-md'} max-h-[90vh] overflow-y-auto`}>
          {previewEnabled ? (
            <>
              {!user && (
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-center">Support This Project</DialogTitle>
                  <DialogDescription className="text-center pt-4">
                    Sign in to continue. You'll earn Impact Points for your support.
                  </DialogDescription>
                </DialogHeader>
              )}
              
              {/* Inline Auth (Preview): unauthenticated users */}
              {!user && (
                <div className="space-y-4 pt-2">
                  {/* Google Sign-in Button */}
                  <Button 
                    variant="outline"
                    className="w-full border-gray-300 hover:bg-gray-50"
                    disabled={authLoading}
                    onClick={handleGoogleSignIn}
                  >
                    <GoogleIcon />
                    {authLoading ? "Signing in..." : "Continue with Google"}
                  </Button>

                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-gray-500">Or continue with email</span>
                    </div>
                  </div>

                  {/* Email/Password Form */}
                  <div className="space-y-4">
                    {/* Toggle between Sign In / Sign Up */}
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={!isSignUp ? "default" : "outline"}
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          setIsSignUp(false);
                          setAuthError("");
                        }}
                      >
                        Sign In
                      </Button>
                      <Button
                        type="button"
                        variant={isSignUp ? "default" : "outline"}
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          setIsSignUp(true);
                          setAuthError("");
                        }}
                      >
                        Sign Up
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="authEmail">Email</Label>
                        <Input
                          id="authEmail"
                          type="email"
                          value={authEmail}
                          onChange={(e) => setAuthEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="authPassword">Password</Label>
                        <Input
                          id="authPassword"
                          type="password"
                          value={authPassword}
                          onChange={(e) => setAuthPassword(e.target.value)}
                          placeholder="••••••••"
                          className="mt-1"
                        />
                      </div>
                      <Button 
                        className="w-full"
                        disabled={authLoading || !authEmail || !authPassword}
                        onClick={isSignUp ? handleEmailSignUp : handleEmailLogin}
                      >
                        {authLoading 
                          ? (isSignUp ? "Creating account..." : "Signing in...") 
                          : (isSignUp ? "Create Account" : "Sign In")
                        }
                      </Button>
                    </div>

                    {authError && (
                      <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                        {authError}
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-center text-gray-500 pt-2">
                    This inline auth is enabled for onboarding preview only. Public users see the current flow.
                  </div>
                </div>
              )}

              {/* Payment Sheet: GoFundMe-style Design (Step 3) */}
              {user && (
                <div className="mt-6 space-y-8">
                  {/* Header */}
                  <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold text-gray-900">
                      Support {project?.title || "This Project"}
                    </h2>
                    <p className="text-sm text-gray-600">
                      Help fuel a cycle of impact.
                    </p>
                  </div>

                  {/* Amount Selection - Redesigned based on image */}
                  <div className="space-y-6">
                    {/* Predefined Amount Buttons (Optional Quick Select) */}
                    <div className="flex flex-wrap gap-3 justify-center">
                      {predefinedAmounts.map((amount, index) => {
                        const isSuggested = amount === 200; // Mark $200 as suggested
                        return (
                          <div key={amount} className="relative">
                            <Button
                              variant="outline"
                              className={`h-12 px-6 rounded-full text-base font-medium border-2 transition-all ${
                                supportAmount === amount && !isCustomAmount
                                  ? 'bg-[#f2662d] text-white border-[#f2662d] hover:bg-[#d9551f]'
                                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                              }`}
                              style={
                                supportAmount === amount && !isCustomAmount
                                  ? { backgroundColor: '#f2662d', borderColor: '#f2662d', color: 'white' }
                                  : {}
                              }
                              onClick={() => {
                                setSupportAmount(amount);
                                setIsCustomAmount(false);
                                setCustomAmount(amount);
                              }}
                            >
                              ${amount.toLocaleString()}
                            </Button>
                            {isSuggested && supportAmount !== amount && (
                              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap">
                                <Heart className="w-3 h-3" />
                                SUGGESTED
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Custom Amount Input - Redesigned like image */}
                    <div className="flex flex-col items-center space-y-2">
                      <div className="relative w-full max-w-md">
                        {/* Left side: Currency symbol */}
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col items-start">
                          <span className="text-2xl font-bold text-gray-700">$</span>
                          <span className="text-xs text-gray-500 -mt-1">USD</span>
                        </div>
                        
                        {/* Right side: Decimal part - Always visible */}
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                          <span className="text-3xl font-bold text-gray-700">.00</span>
                        </div>
                        
                        {/* Input field - Right aligned, amount appears next to .00 */}
                        <Input
                          type="text"
                          inputMode="numeric"
                          value={currentSupportAmount > 0 ? currentSupportAmount.toLocaleString() : ''}
                          onChange={(e) => {
                            // Remove commas and non-numeric characters
                            const rawValue = e.target.value.replace(/[^0-9]/g, '');
                            const v = rawValue ? Number(rawValue) : 0;
                            if (v > 0) {
                              setCustomAmount(v);
                              setIsCustomAmount(true);
                              setSupportAmount(v);
                            } else {
                              setCustomAmount(0);
                              setIsCustomAmount(false);
                              setSupportAmount(null);
                            }
                          }}
                          className="w-full text-right text-3xl font-bold h-20 border-2 border-gray-300 rounded-lg pl-20 pr-24 focus:border-[#f2662d] focus:ring-2 focus:ring-[#f2662d]/20"
                          placeholder=""
                          autoFocus
                          style={{ fontSize: '1.875rem' }} // text-3xl equivalent
                        />
                      </div>
                      {/* Validation message */}
                      {hasSelectedAmount && currentSupportAmount > 0 && currentSupportAmount < 10 && !isFirstSupport && (
                        <p className="text-sm text-red-600 font-medium">
                          Amount must be at least $10
                        </p>
                      )}
                    </div>
                  </div>

                  {/* First support exception message */}
                  {hasSelectedAmount && currentSupportAmount > 0 && isFirstSupport && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-900 font-medium">
                        💡 First support special: Support from $5 to unlock your first reward (instead of usually $10).
                      </p>
                    </div>
                  )}

                  {/* Dynamic Yellow Impact Box - Only shows when user takes action (selects amount) */}
                  {hasSelectedAmount && currentSupportAmount > 0 && (
                    <div className="space-y-3 w-full max-w-md mx-auto">
                      {/* Congratulatory Banner - Like image reference, same width as input box */}
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-sm relative">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-sm text-gray-900">
                              Congratulations! You will get <span className="font-bold">{impactPoints.toLocaleString()}</span> Impact Points and create real impact!
                            </p>
                          </div>
                          <div className="ml-4 flex-shrink-0">
                            <div className="w-12 h-12 bg-[#8B7355] rounded-full flex items-center justify-center">
                              <Trophy className="w-6 h-6 text-white" />
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Small text below box - Consistently shown */}
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <span>100% goes to the project, minus unavoidable payment fees. Supported by our nonprofit partner Impaktera.</span>
                        <Popover>
                          <PopoverTrigger asChild>
                            <button className="text-gray-500 hover:text-gray-700 flex-shrink-0">
                              <Info className="h-3 w-3" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-80 text-sm">
                            <div className="space-y-2">
                              <p className="font-semibold mb-2">About Impaktera</p>
                              <p>
                                Impaktera is a Suisse-based non-profit Association according to Art. 60 ff. of the Swiss Civil Code, ZGB.
                              </p>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  )}

                  {/* Tip Section - GoFundMe Style Slider */}
                  {hasSelectedAmount && currentSupportAmount > 0 && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">Tip Dopaya</h3>
                        <p className="text-xs text-gray-500 mb-4">
                          We have 0% platform fee for Social Enterprises, because we believe in <span className="font-semibold text-[#f2662d]">Impact First</span>. Dopaya can keep the platform independent and ad-free thanks to people who leave an optional amount here:
                        </p>
                        
                        {!isCustomTip ? (
                          <>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700">
                                  {tipSliderValue[0]}%
                                </span>
                                <span className="text-sm font-medium text-gray-700">
                                  ${tipAmount.toFixed(2)}
                                </span>
                              </div>
                              <Slider
                                value={tipSliderValue}
                                onValueChange={setTipSliderValue}
                                min={0}
                                max={20}
                                step={0.5}
                                className="w-full"
                              />
                              {tipSliderValue[0] < 10 && (
                                <p className="text-xs text-gray-500 text-center">
                                  Most people choose around 10%.
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => {
                                setIsCustomTip(true);
                                setCustomTipValue(tipSliderValue[0]);
                              }}
                              className="text-xs text-gray-600 hover:text-gray-900 underline mt-2"
                            >
                              Enter custom tip
                            </button>
                          </>
                        ) : (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                min={0}
                                max={20}
                                step={0.5}
                                value={customTipValue}
                                onChange={(e) => {
                                  const v = Number(e.target.value || 0);
                                  setCustomTipValue(Math.min(20, Math.max(0, isNaN(v) ? 0 : v)));
                                }}
                                className="w-24"
                                placeholder="%"
                              />
                              <span className="text-sm text-gray-600">%</span>
                              <span className="text-sm font-medium text-gray-700 ml-auto">
                                ${((currentSupportAmount * customTipValue) / 100).toFixed(2)}
                              </span>
                            </div>
                            <button
                              onClick={() => {
                                setIsCustomTip(false);
                                setTipSliderValue([customTipValue]);
                              }}
                              className="text-xs text-gray-600 hover:text-gray-900 underline"
                            >
                              Use slider instead
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Payment Method Section */}
                  {hasSelectedAmount && currentSupportAmount > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold text-gray-900">Payment method</h3>
                      <div className="flex items-center space-x-3 p-4 border-2 border-gray-300 rounded-lg bg-white">
                        <div className="h-4 w-4 rounded-full border-2 border-[#f2662d] bg-[#f2662d] flex items-center justify-center">
                          <div className="h-2 w-2 rounded-full bg-white"></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">Credit or debit card (Stripe)</span>
                      </div>
                    </div>
                  )}

                  {/* Privacy & Updates Checkboxes */}
                  {hasSelectedAmount && currentSupportAmount > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id="hideName"
                          checked={hideNamePublicly}
                          onCheckedChange={(checked) => setHideNamePublicly(checked === true)}
                          className="mt-0.5"
                        />
                        <label
                          htmlFor="hideName"
                          className="text-sm text-gray-700 cursor-pointer leading-relaxed"
                        >
                          Don't display my name publicly on the project page.
                        </label>
                      </div>
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id="signUpUpdates"
                          checked={signUpForUpdates}
                          onCheckedChange={(checked) => setSignUpForUpdates(checked === true)}
                          className="mt-0.5"
                        />
                        <label
                          htmlFor="signUpUpdates"
                          className="text-sm text-gray-700 cursor-pointer leading-relaxed"
                        >
                          Yes, sign me up to hear updates about new social innovators and exciting brand rewards. You can unsubscribe anytime.
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Summary Section */}
                  {hasSelectedAmount && currentSupportAmount > 0 && (
                    <div className="space-y-3 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Your donation</span>
                        <span className="font-medium text-gray-900">${currentSupportAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Dopaya tip</span>
                        <span className="font-medium text-gray-900">${tipAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between text-lg font-bold pt-2 border-t border-gray-300">
                        <span>Total due today</span>
                        <span>${totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                  
                  {/* CTA Button */}
                  {(() => {
                    const minAmount = isFirstSupport ? 5 : 10;
                    const isValidAmount = hasSelectedAmount && currentSupportAmount > 0 && currentSupportAmount >= minAmount;
                    
                    if (hasSelectedAmount && currentSupportAmount > 0) {
                      return (
                        <div className="space-y-2 pt-2">
                          <Button
                            onClick={handlePaymentSubmit}
                            disabled={!isValidAmount}
                            className="w-full h-14 text-base font-semibold bg-yellow-400 hover:bg-yellow-500 text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ backgroundColor: '#FFC107', color: '#1a1a3a' }}
                          >
                            Continue
                          </Button>
                          <p className="text-xs text-center text-gray-500">
                            By clicking 'Continue', you agree to Dopaya's Terms of Service and Privacy Notice.
                          </p>
                        </div>
                      );
                    } else {
                      return (
                        <div className="text-center py-4">
                          <p className="text-sm text-gray-500">Select an amount to continue</p>
                        </div>
                      );
                    }
                  })()}

                  {/* Close Button */}
                  <Button
                    variant="ghost"
                    onClick={() => setIsDialogOpen(false)}
                    className="w-full text-gray-600"
                  >
                    Close
                  </Button>
                </div>
              )}

              {!user && (
                <DialogFooter className="flex flex-col sm:flex-col gap-3 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                    className="w-full"
                  >
                    Close
                  </Button>
                </DialogFooter>
              )}
            </>
          ) : (
            <>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">We're Almost There Yet...</DialogTitle>
            <DialogDescription className="text-center pt-4">
              We are launching soon! Join our waitlist....
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-col gap-3 pt-4">
            <Button 
              onClick={() => {
                trackWaitlistSignup(project?.slug || 'general');
                window.open("https://tally.so/r/m6MqAe", "_blank");
              }}
              className="w-full"
              data-testid="button-join-waitlist-dialog"
            >
              Join Our Waitlist
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
              className="w-full"
              data-testid="button-close-dialog"
            >
              Close
            </Button>
          </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}