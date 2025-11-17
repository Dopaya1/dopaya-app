import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { UserImpact } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { ImpactStats } from "@/components/dashboard/impact-stats";
import { ImpactChart } from "@/components/dashboard/impact-chart";
import { SupportedProjects } from "@/components/dashboard/supported-projects";
import { ImpactRankDisplay } from "@/components/dashboard/impact-rank-display";
// getUserLevel removed - using simple two-status system instead
import { Helmet } from "react-helmet";
import { Link, useLocation } from "wouter";
import { SuccessBanner } from "@/components/donation/success-banner";
import { DonationSuccessModal } from "@/components/donation/donation-success-modal";
import { useState, useEffect } from "react";
import Joyride, { CallBackProps, STATUS, Step } from "react-joyride";
import { isOnboardingPreviewEnabled } from "@/lib/feature-flags";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sparkles, Gift, HelpCircle, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getDailyQuoteForUser, ImpactQuote } from "@/constants/impact-quotes";

export default function DashboardPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [donationAmount, setDonationAmount] = useState(0);
  const [runTour, setRunTour] = useState(false);
  const [tourStepIndex, setTourStepIndex] = useState(0);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [signupWelcomeStep, setSignupWelcomeStep] = useState<1 | 2>(1);
  const [showTourBanner, setShowTourBanner] = useState(false);
  const [signupFirstFlow, setSignupFirstFlow] = useState(false);
  const [dailyQuote, setDailyQuote] = useState<ImpactQuote | null>(null);
  const previewEnabled = isOnboardingPreviewEnabled();

  // Check for success parameters in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    const amount = urlParams.get('amount');
    const newUser = urlParams.get('newUser');
    console.log('[Dashboard] URL params on mount/change:', {
      search: window.location.search,
      status,
      amount,
      newUser,
      previewEnabled,
    });
    if (status === 'success' && amount) {
      setDonationAmount(parseFloat(amount));
      setShowSuccessModal(true);
      
      // Clean up URL parameters
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
    
    // Check for new user welcome (preview only)
    if (previewEnabled && newUser === '1') {
      console.log('[Dashboard] Detected newUser=1 in preview mode → showing signup mini-journey');
      sessionStorage.setItem('signupFirstFlow', 'true');
      setSignupFirstFlow(true);
      // Check if welcome was already shown
      const welcomeShown = sessionStorage.getItem('welcomeModalShown');
      if (!welcomeShown) {
        console.log('[Dashboard] welcomeModalShown not found, opening welcome modal');
        setSignupWelcomeStep(1);
        setShowWelcomeModal(true);
        sessionStorage.setItem('welcomeModalShown', 'true');
      }
      // Clean up URL
      const newUrl = window.location.pathname + (previewEnabled ? '?previewOnboarding=1' : '');
      window.history.replaceState({}, '', newUrl);
    }
  }, [previewEnabled]);
  
  const { data: impact, error: impactError } = useQuery<UserImpact>({
    queryKey: ["/api/user/impact"],
  });
  
  // Safety check: if query failed, impact could be an error object
  const safeImpact = impactError ? undefined : impact;

  // DEBUG: Log what we're getting from the API
  if (safeImpact) {
    console.log('[Dashboard] API Response:', safeImpact);
    console.log('[Dashboard] impactPoints value:', safeImpact.impactPoints);
    console.log('[Dashboard] All keys:', Object.keys(safeImpact));
  }

  const displayName = user?.firstName || user?.username || (user?.email ? user.email.split('@')[0] : "Impact Legend");
  const userStatus = safeImpact?.userStatus || "aspirer";
  const statusDisplayName = userStatus === "supporter" ? "Impact Supporter" : "Impact Aspirer";
  // Use actual impact points from API
  const impactPoints = safeImpact?.impactPoints ?? 0;
  const totalDonations = safeImpact?.amountDonated ?? 0;
  
  // Check if user is first-time (50 IP from welcome bonus, 0 projects supported)
  // For testing: also allow if impact data is not loaded yet (assume first-time)
  const isFirstTimeUser = safeImpact 
    ? (impactPoints === 50 && (safeImpact?.projectsSupported || 0) === 0)
    : false; // Wait for impact data to load
  
  // Check if user is support-first (has more than 50 IP, meaning they made a payment)
  const isSupportFirstUser = safeImpact && impactPoints > 50;
  
  // Check if tour banner should show (for support-first users)
  useEffect(() => {
    if (!previewEnabled || !user || !safeImpact) return;
    
    // Show banner for support-first users (has made a payment, more than 50 IP)
    if (isSupportFirstUser) {
      const tourDismissed = sessionStorage.getItem('onboardingTourDismissed') === 'true';
      const tourCompleted = sessionStorage.getItem('onboardingTourCompleted') === 'true';
      const bannerDismissed = sessionStorage.getItem('tourBannerDismissed') === 'true';
      
      // Only show banner if tour hasn't been completed/dismissed and banner hasn't been dismissed
      if (!tourCompleted && !tourDismissed && !bannerDismissed) {
        // Check if banner was dismissed recently (within 7 days)
        const bannerDismissTime = sessionStorage.getItem('tourBannerDismissTime');
        if (bannerDismissTime) {
          const dismissedTime = parseInt(bannerDismissTime, 10);
          const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
          if (dismissedTime > sevenDaysAgo) {
            return; // Banner was dismissed within last 7 days, don't show
          }
        }
        
        setShowTourBanner(true);
      }
    }
  }, [previewEnabled, user, safeImpact, isSupportFirstUser]);
  
  // Check if tour should run (for first-time users or manual trigger)
  useEffect(() => {
    if (!previewEnabled || !user) return;
    
    // For testing: Check for manual trigger first (works even without impact data)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('startTour') === '1') {
      console.log('Manual tour trigger detected');
      sessionStorage.removeItem('onboardingTourCompleted');
      sessionStorage.removeItem('onboardingTourDismissed');
      sessionStorage.removeItem('onboardingTourStepIndex');
      setTourStepIndex(0);
      // Wait a bit for elements to render, then start tour
      setTimeout(() => {
        console.log('Starting tour manually...');
        setRunTour(true);
      }, 500);
      return;
    }
    
    const tourCompleted = sessionStorage.getItem('onboardingTourCompleted') === 'true';
    const tourDismissed = sessionStorage.getItem('onboardingTourDismissed') === 'true';
    const savedStepIndex = sessionStorage.getItem('onboardingTourStepIndex');
    
    // Normal tour logic (requires impact data)
    if (!safeImpact) return;
    
    // Debug logging
    console.log('Tour check:', {
      previewEnabled,
      isFirstTimeUser,
      impactPoints,
      projectsSupported: safeImpact?.projectsSupported || 0,
      tourCompleted,
      tourDismissed,
      savedStepIndex
    });
    
    if (isFirstTimeUser && !tourCompleted && !tourDismissed) {
      // Resume from saved step or start from beginning
      if (savedStepIndex) {
        setTourStepIndex(parseInt(savedStepIndex, 10));
      }
      setTimeout(() => {
        setRunTour(true);
      }, 500);
    }
  }, [previewEnabled, isFirstTimeUser, user, safeImpact, impactPoints]);
  
  // Tooltip steps (2 steps on dashboard, step 3 is on projects page)
  const steps: Step[] = [
    {
      target: '[data-tour="impact-points"]',
      content: "You’re halfway to your first reward. Support any project with $5 to unlock it.",
      placement: "bottom",
      disableBeacon: true,
    },
    {
      target: '[data-tour="support-button"]',
      content: "Click here to choose a project and earn Impact Points with your first support.",
      placement: "bottom",
      disableBeacon: true,
    },
  ];
  
  // Handle tour callbacks
  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, index, type, action } = data;
    
    console.log('Tour callback:', { status, index, type, action, currentStepIndex: tourStepIndex, totalSteps: steps.length });
    
    // Handle skip
    if (status === STATUS.SKIPPED) {
      console.log('Tour skipped');
      setRunTour(false);
      sessionStorage.setItem('onboardingTourDismissed', 'true');
      sessionStorage.removeItem('onboardingTourStepIndex');
      return;
    }
    
    // Handle tour completion (only on last step)
    if (status === STATUS.FINISHED) {
      console.log('Tour finished');
      setRunTour(false);
      sessionStorage.setItem('onboardingTourCompleted', 'true');
      sessionStorage.removeItem('onboardingTourStepIndex');
      return;
    }
    
    // Handle step navigation - this is the key part
    if (type === 'step:after' && action === 'next') {
      console.log('Next button clicked, current index:', index);
      
      // If we're on step 1 (index 0), go to step 2 (index 1)
      if (index === 0) {
        console.log('Moving from step 1 to step 2');
        setTourStepIndex(1);
        sessionStorage.setItem('onboardingTourStepIndex', '1');
      }
    } else if (type === 'step:after' && action === 'prev') {
      // Handle back button
      console.log('Back button clicked, current index:', index);
      if (index > 0) {
        setTourStepIndex(index - 1);
        sessionStorage.setItem('onboardingTourStepIndex', String(index - 1));
      }
    }
  };
  
  // Determine number of trophies based on status (simplified)
  const getTrophyCount = (status: string): number => {
    return status === "supporter" ? 2 : 1;
  };
  
  const trophyCount = getTrophyCount(userStatus);
  
  const handleStartTour = () => {
    setShowTourBanner(false);
    setRunTour(true);
  };
  
  const handleDismissBanner = () => {
    setShowTourBanner(false);
    sessionStorage.setItem('tourBannerDismissed', 'true');
    sessionStorage.setItem('tourBannerDismissTime', Date.now().toString());
  };

  const handleSignupBack = () => {
    if (signupWelcomeStep === 1) {
      // On first step, back simply closes the mini gamification
      setShowWelcomeModal(false);
    } else {
      setSignupWelcomeStep(1);
    }
  };

  // Pick a daily quote per user (stable for the day, per login)
  useEffect(() => {
    // We can show this quote for all users (not only preview)
    const quote = getDailyQuoteForUser(user?.id);
    setDailyQuote(quote);
  }, [user?.id]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Helmet>
        <title>Dashboard | Dopaya</title>
        <meta name="description" content="Track your impact and manage your donations on Dopaya." />
      </Helmet>
      
      {/* Optional Tour Banner (support-first users) */}
      {previewEnabled && showTourBanner && (
        <Alert className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
          <HelpCircle className="h-5 w-5 text-blue-600" />
          <AlertDescription className="flex items-center justify-between">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-1">Want a quick tour of your dashboard?</h4>
              <p className="text-sm text-gray-700">
                We'll show you around in just 3 steps. Takes less than a minute!
              </p>
            </div>
            <div className="ml-4 flex items-center gap-2">
              <Button
                onClick={handleStartTour}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Yes, show me
              </Button>
              <Button
                onClick={handleDismissBanner}
                variant="ghost"
                className="text-gray-600 hover:text-gray-800"
              >
                No, I'll explore
              </Button>
              <button
                onClick={handleDismissBanner}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-dark font-heading">
          Your Personal Impact Journey
        </h1>
      </div>

      {/* Daily quote box */}
      {dailyQuote && dailyQuote.text && (
        <div className="mb-8 max-w-xl">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 px-4 py-3">
            <div className="flex items-start gap-2">
              <span className="mt-0.5 text-green-600">🌱</span>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Today's Thought
                </p>
                <p className="text-sm italic text-gray-800">
                  “{dailyQuote.text}”
                </p>
                <p className="text-xs text-gray-500">— {dailyQuote.author}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <ImpactStats />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-12">
        {/* Left sidebar - User profile */}
        <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col items-center">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div className="text-center mb-4 relative" data-tour="impact-points">
            {/* Tiny confetti / sparkles for first-time 50 IP users */}
            {previewEnabled && isFirstTimeUser && (
              <div className="pointer-events-none absolute inset-0">
                <span
                  className="absolute -top-1 left-3 text-lg animate-bounce"
                  style={{ animationDelay: "0ms" }}
                >
                  ✨
                </span>
                <span
                  className="absolute top-0 right-4 text-base animate-bounce"
                  style={{ animationDelay: "120ms" }}
                >
                  🎉
                </span>
                <span
                  className="absolute -bottom-1 left-6 text-base animate-bounce"
                  style={{ animationDelay: "220ms" }}
                >
                  ⭐
                </span>
              </div>
            )}
            <h2
              className={`text-2xl font-bold text-dark ${
                previewEnabled && isFirstTimeUser ? "animate-pulse" : ""
              }`}
            >
              {impactPoints.toLocaleString()}
            </h2>
            <p className="text-sm text-neutral">Impact Points</p>
          </div>
          
          {/* Impact Rank Display */}
          <div className="mb-6 w-full">
            <ImpactRankDisplay 
              impactPoints={impactPoints} 
              totalDonations={totalDonations}
            />
            {previewEnabled && isFirstTimeUser && (
              <div className="mt-3 w-full relative">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>Progress to first reward</span>
                  <span>50 / 100 Impact Points</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#f2662d] transition-all"
                    style={{ width: `${Math.min(impactPoints, 100)}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Complete your first support action to unlock your first reward!
                </p>
              </div>
            )}
          </div>

          <div className="w-full space-y-3">
            <Button 
              className="w-full" 
              onClick={() => window.location.href = '/projects'}
              data-tour="support-button"
            >
              SUPPORT
            </Button>
            <Button variant="outline" className="w-full" onClick={() => window.location.href = '/rewards'}>
              REDEEM POINTS
            </Button>
          </div>
        </div>

        {/* Impact Performance graph */}
        <div className="lg:col-span-3">
          <ImpactChart />
        </div>
      </div>

      <SupportedProjects />
      
      <DonationSuccessModal 
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        amount={donationAmount}
      />
      
      {/* Signup-only Mini Gamification (new user registration) */}
      {previewEnabled && (
        <Dialog open={showWelcomeModal} onOpenChange={setShowWelcomeModal}>
          {/* Simple, stable modal content (no outer confetti wrappers) */}
          <DialogContent className="sm:max-w-md text-center">
            {/* Step label + optional back (no back on first card) */}
            <div className="flex items-center justify-between mb-3 text-xs text-gray-500">
              {signupWelcomeStep === 1 ? (
                <span className="w-10" />
              ) : (
                <button
                  type="button"
                  onClick={handleSignupBack}
                  className="text-[11px] text-gray-400 hover:text-gray-700"
                >
                  ← Back
                </button>
              )}
              <span className="flex-1 text-center">
                {signupWelcomeStep === 1 ? "Step 1 of 2" : "Step 2 of 2"}
              </span>
              <span className="w-10" />
            </div>

            {signupWelcomeStep === 1 ? (
              <DialogHeader>
                {/* Step 1 — Your Journey Begins */}
                <div className="mx-auto w-20 h-20 mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full flex items-center justify-center animate-pulse">
                    <Sparkles className="w-10 h-10 text-[#f2662d]" />
                  </div>
                </div>
                <DialogTitle className="text-2xl font-bold text-gray-900">
                  Welcome to Dopaya!
                </DialogTitle>
                <DialogDescription className="text-base text-gray-600 pt-4 space-y-3">
                  <p className="text-sm text-gray-700">
                    You’ve just earned your <span className="font-semibold">50 Impact Points</span> starter bonus.
                  </p>
                  <p className="text-sm text-gray-700">
                    You’re already halfway to unlocking your first reward.
                  </p>
                  <div className="mt-4">
                    <div className="text-xs text-gray-500 mb-1">Progress to first reward</div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#f2662d]" style={{ width: "50%" }} />
                    </div>
                    <p className="mt-2 text-sm font-semibold text-gray-900">50 / 100 Impact Points</p>
                  </div>
                </DialogDescription>
                <div className="mt-6">
                  <Button
                    className="w-full bg-[#f2662d] hover:bg-[#d9551f] text-white font-semibold"
                    style={{ backgroundColor: "#f2662d" }}
                    onClick={() => setSignupWelcomeStep(2)}
                  >
                    Next →
                  </Button>
                </div>
              </DialogHeader>
            ) : (
              <>
                <DialogHeader>
                  {/* Step 2 — Choose Your Path */}
                  <DialogTitle className="text-2xl font-bold text-gray-900 mb-2">
                    Ready to make your first impact?
                  </DialogTitle>
                  <DialogDescription className="text-sm text-gray-700 pt-1">
                    Choose how you’d like to start:
                  </DialogDescription>
                </DialogHeader>

                <div className="mt-4 space-y-3 text-left">
                  {/* Tile 1: Support a project (recommended – but not pre-selected) */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowWelcomeModal(false);
                      window.location.href = "/projects?previewOnboarding=1";
                    }}
                    className="w-full text-left p-4 rounded-xl border border-gray-200 bg-white hover:bg-orange-50 transition-colors active:scale-[0.99]"
                  >
                    <p className="text-sm font-semibold text-gray-900">
                      Support a project
                    </p>
                    <p className="text-xs text-gray-700 mt-1">
                      Start with a small amount and unlock your first reward.
                    </p>
                  </button>

                  {/* Tile 2: Discover enterprises */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowWelcomeModal(false);
                      window.location.href = "/projects?previewOnboarding=1";
                    }}
                    className="w-full text-left p-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors active:scale-[0.99]"
                  >
                    <p className="text-sm font-semibold text-gray-900">
                      Discover inspiring social enterprises
                    </p>
                    <p className="text-xs text-gray-700 mt-1">
                      Explore verified innovators solving real problems.
                    </p>
                  </button>

                  {/* Tile 3: View dashboard */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowWelcomeModal(false);
                      setTourStepIndex(0);
                      sessionStorage.setItem("onboardingTourStepIndex", "0");
                      setRunTour(true);
                    }}
                    className="w-full text-left p-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors active:scale-[0.99]"
                  >
                    <p className="text-sm font-semibold text-gray-900">
                      View your dashboard
                    </p>
                    <p className="text-xs text-gray-700 mt-1">
                      Track your points, rank, and progress.
                    </p>
                  </button>
                </div>

                <p className="mt-3 text-[11px] text-gray-500 text-center">
                  Recommended: <span className="font-semibold">Support a project</span> →
                </p>
              </>
            )}
          </DialogContent>
        </Dialog>
      )}
      
      {/* Onboarding Tour */}
      {previewEnabled && runTour && steps.length > 0 && (
        <Joyride
          steps={steps}
          run={runTour}
          stepIndex={tourStepIndex}
          continuous={true}
          showProgress={true}
          showSkipButton={true}
          callback={handleJoyrideCallback}
          disableOverlayClose={true}
          disableScrolling={true}
          scrollOffset={0}
          scrollToFirstStep={false}
          spotlightClicks={false}
          hideCloseButton={true}
          floaterProps={{
            disableAnimation: false,
          }}
          styles={{
            options: {
              primaryColor: '#f2662d',
              zIndex: 10000,
            },
            buttonNext: {
              backgroundColor: '#f2662d',
              color: 'white',
              fontSize: '14px',
              padding: '8px 16px',
              cursor: 'pointer',
            },
            buttonBack: {
              color: '#f2662d',
              marginRight: '10px',
              cursor: 'pointer',
            },
            buttonSkip: {
              color: '#666',
              cursor: 'pointer',
            },
          }}
          locale={{
            back: 'Back',
            close: 'Close',
            last: 'Got it',
            next: 'Next',
            open: 'Open',
            skip: 'Skip tour',
          }}
        />
      )}
    </div>
  );
}
