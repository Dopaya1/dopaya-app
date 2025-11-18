import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { UserImpact, Project, UserImpactHistory } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { ImpactStats } from "@/components/dashboard/impact-stats";
import { ImpactChart } from "@/components/dashboard/impact-chart";
import { Helmet } from "react-helmet";
import { Link, useLocation } from "wouter";
import { DonationSuccessModal } from "@/components/donation/donation-success-modal";
import { useState, useEffect, useRef } from "react";
import { getDailyQuoteForUser, ImpactQuote } from "@/constants/impact-quotes";
import { ProjectCard } from "@/components/projects/project-card";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trackEvent } from "@/lib/simple-analytics";
import { isOnboardingPreviewEnabled } from "@/lib/feature-flags";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sparkles, Heart, Search, BarChart3 } from "lucide-react";
import { triggerConfetti } from "@/lib/confetti";


export default function DashboardV2() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [donationAmount, setDonationAmount] = useState(0);
  const [dailyQuote, setDailyQuote] = useState<ImpactQuote | null>(null);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [signupWelcomeStep, setSignupWelcomeStep] = useState<1 | 2>(1);
  const [signupFirstFlow, setSignupFirstFlow] = useState(false);
  const previewEnabled = isOnboardingPreviewEnabled();
  
  // Tooltip state management - COMMENTED OUT (not needed)
  // const [currentTooltip, setCurrentTooltip] = useState<number | null>(null);
  // const tooltip1Shown = useRef(false);
  // const tooltip2Shown = useRef(false);
  // const tooltip3Shown = useRef(false);

  // Check for success parameters in URL and new user flags
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    const amount = urlParams.get('amount');
    const newUser = urlParams.get('newUser');
    const clearWelcomeModal = urlParams.get('clearWelcomeModal'); // Fallback: clear welcome modal flag
    
    // FALLBACK: Clear welcome modal flag if requested via URL parameter
    if (clearWelcomeModal === '1' && user?.id) {
      console.log('[Dashboard V2] Fallback: Clearing welcome modal flag via URL parameter');
      localStorage.removeItem(`welcomeModalShown_${user.id}`);
      sessionStorage.removeItem('welcomeModalShown');
      sessionStorage.removeItem('checkNewUser');
      sessionStorage.removeItem('isNewUser');
      // Clean up URL
      const newUrl = window.location.pathname + (previewEnabled ? '?previewOnboarding=1' : '');
      window.history.replaceState({}, '', newUrl);
    }
    
    if (status === 'success' && amount) {
      setDonationAmount(parseFloat(amount));
      setShowSuccessModal(true);
      
      // Clean up URL parameters
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
    
    // Check for new user welcome (preview only)
    // Can be triggered by URL param or checkNewUser flag from auth callback
    const checkNewUser = sessionStorage.getItem('checkNewUser') === 'true';
    if (previewEnabled && (newUser === '1' || checkNewUser)) {
      // DO NOT remove the flag here - it's needed for the modal check below
      // The flag will be removed in the modal useEffect after the modal is shown
      
      console.log('[Dashboard V2] Detected new user in preview mode → checking impact data');
      sessionStorage.setItem('signupFirstFlow', 'true');
      setSignupFirstFlow(true);
      // Welcome modal will be shown after impact data loads (see useEffect below)
    }
  }, [previewEnabled, user?.id]);
  
  const { data: impact, error: impactError } = useQuery<UserImpact>({
    queryKey: ["/api/user/impact"],
    retry: 1, // Retry once in case of temporary errors
    retryDelay: 1000,
  });
  
  // Safety check: if query failed, impact could be an error object
  // If API returns 404, treat as new user with default values (user not in database yet, trigger will create it)
  const safeImpact = impactError 
    ? (impactError?.message?.includes('404') || impactError?.message?.includes('User not found')
        ? { impactPoints: 50, projectsSupported: 0, amountDonated: 0, userLevel: 'aspirer', userStatus: 'aspirer' } as UserImpact 
        : undefined)
    : impact;

  const displayName = user?.firstName || user?.username || (user?.email ? user.email.split('@')[0] : "Supporter");
  // Use actual impact points from API
  const impactPoints = safeImpact?.impactPoints ?? 0;
  // Determine user status: 100+ Impact Points = Supporter, otherwise Aspirer
  // PRIORITY: Calculate based on impactPoints first, then fall back to API value
  // This ensures correct status even if API returns stale data
  const userStatus = impactPoints >= 100 ? "supporter" : (safeImpact?.userStatus || safeImpact?.userLevel || "aspirer");
  const statusDisplayName = userStatus === "supporter" ? "Impact Supporter" : "Impact Aspirer";
  
  // DEBUG: Log status calculation for troubleshooting
  if (safeImpact && impactPoints >= 100) {
    console.log('[Dashboard V2] Status calculation:', {
      impactPoints,
      apiUserStatus: safeImpact?.userStatus,
      apiUserLevel: safeImpact?.userLevel,
      calculatedStatus: userStatus,
      finalDisplayName: statusDisplayName
    });
  }
  const totalDonations = safeImpact?.amountDonated ?? 0;
  const projectsSupported = safeImpact?.projectsSupported ?? 0;
  const supportCount = projectsSupported;
  
  // Calculate points value (~$0.10 per point)
  const pointsValue = Math.round(impactPoints * 0.1);
  
  // Check if user is first-time (50 IP from welcome bonus, 0 projects supported)
  const isFirstTimeUser = safeImpact 
    ? (impactPoints === 50 && (safeImpact?.projectsSupported || 0) === 0)
    : false;
  
  // Check if user has supported projects
  const hasSupported = supportCount > 0;

  // Check if user is new (50 Impact Points and 0 donations) and show welcome modal
  useEffect(() => {
    if (!previewEnabled || !user || !user.id) {
      return;
    }
    
    // Wait for impact data, but don't block if it's taking too long
    // If impact data is missing, we'll check registration flags and show modal anyway
    if (!safeImpact) {
      // Check if we have registration flags - if so, user is definitely new
      const checkNewUser = sessionStorage.getItem('checkNewUser') === 'true';
      const isNewUserFlag = sessionStorage.getItem('isNewUser') === 'true';
      const hasRegistrationFlag = checkNewUser || isNewUserFlag;
      
      if (hasRegistrationFlag) {
        const welcomeModalKey = `welcomeModalShown_${user.id}`;
        const welcomeShownPersistent = localStorage.getItem(welcomeModalKey) === 'true';
        const welcomeShownSession = sessionStorage.getItem('welcomeModalShown') === 'true';
        const welcomeShown = welcomeShownPersistent || welcomeShownSession;
        
        if (!welcomeShown) {
          console.log('[Dashboard V2] Registration flags detected, showing modal (impact data still loading)...');
          setSignupWelcomeStep(1);
          setShowWelcomeModal(true);
          try {
            localStorage.setItem(welcomeModalKey, 'true');
          } catch (e) {
            sessionStorage.setItem('welcomeModalShown', 'true');
          }
          sessionStorage.removeItem('welcomeModalClosed');
          // Clear flags
          if (checkNewUser) sessionStorage.removeItem('checkNewUser');
          if (isNewUserFlag) sessionStorage.removeItem('isNewUser');
        }
      }
      return;
    }
    
    const impactPoints = safeImpact?.impactPoints ?? 0;
    const projectsSupported = safeImpact?.projectsSupported ?? 0;
    const isNewUserByImpact = impactPoints === 50 && projectsSupported === 0;
    
    // Check for new user flag from auth callback or auth modal (temporary flags, only valid during current session)
    const checkNewUser = sessionStorage.getItem('checkNewUser') === 'true';
    const isNewUserFlag = sessionStorage.getItem('isNewUser') === 'true';
    
    // PERSISTENT CHECK: Use localStorage with user ID to track if welcome modal was shown
    // This persists across sessions, logouts, and cache clears
    const welcomeModalKey = `welcomeModalShown_${user.id}`;
    const welcomeShownPersistent = localStorage.getItem(welcomeModalKey) === 'true';
    
    // FALLBACK: Also check sessionStorage (graceful degradation if localStorage fails)
    const welcomeShownSession = sessionStorage.getItem('welcomeModalShown') === 'true';
    const welcomeShown = welcomeShownPersistent || welcomeShownSession;
    
    // DEBUG: Log all conditions for troubleshooting
    console.log('[Dashboard V2] Welcome modal check:', {
      userId: user.id,
      impactPoints,
      projectsSupported,
      isNewUserByImpact,
      checkNewUser,
      isNewUserFlag,
      welcomeShownPersistent,
      welcomeShownSession,
      welcomeShown,
      welcomeModalKey
    });
    
    // Show welcome modal ONLY if:
    // 1. User has 50 IP and 0 donations (indicates new user), AND
    // 2. Welcome modal hasn't been shown before (persistent check), AND
    // 3. Registration flags are present (checkNewUser OR isNewUserFlag) - CRITICAL: Only show during actual registration
    //
    // IMPORTANT: We require registration flags to prevent showing modal to existing users who clear cache
    // The flags are only set during the registration/auth flow, not during regular logins
    const hasRegistrationFlag = checkNewUser || isNewUserFlag;
    
    // Show modal ONLY if user looks new AND hasn't seen modal before AND has registration flags
    // This ensures we only show during actual registration, not when existing users log in
    const shouldShowModal = isNewUserByImpact && !welcomeShown && hasRegistrationFlag;
    
    if (shouldShowModal) {
      console.log('[Dashboard V2] ✅ New user detected → showing modal', {
        reason: 'registration flag present',
        impactPoints,
        projectsSupported,
        checkNewUser,
        isNewUserFlag
      });
      
      // Clear temporary flags after checking
      if (checkNewUser) {
        sessionStorage.removeItem('checkNewUser');
      }
      if (isNewUserFlag) {
        sessionStorage.removeItem('isNewUser');
      }
      
      // Set signupFirstFlow for consistency
      setSignupFirstFlow(true);
      sessionStorage.setItem('signupFirstFlow', 'true');
      
      // Show welcome modal IMMEDIATELY (while confetti plays in background)
      setSignupWelcomeStep(1);
      setShowWelcomeModal(true);
      
      // PERSISTENT: Store in localStorage with user ID (survives logout/cache clear)
      try {
        localStorage.setItem(welcomeModalKey, 'true');
        console.log('[Dashboard V2] Saved welcome modal flag to localStorage:', welcomeModalKey);
      } catch (e) {
        // FALLBACK: If localStorage fails (e.g., private browsing), use sessionStorage
        console.warn('[Dashboard V2] localStorage failed, falling back to sessionStorage:', e);
        sessionStorage.setItem('welcomeModalShown', 'true');
      }
      sessionStorage.removeItem('welcomeModalClosed');
      
      // CONFETTI: Trigger confetti in background
      const confettiShown = sessionStorage.getItem('confettiShown') === 'true';
      if (!confettiShown) {
        sessionStorage.setItem('confettiShown', 'true');
        sessionStorage.setItem('confettiTime', Date.now().toString());
        
        // Announce for screen readers
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = 'Welcome — 50 Impact Points added to your account.';
        document.body.appendChild(announcement);
        
        // Trigger confetti in background (modal is already showing)
        triggerConfetti(() => {
          // Remove announcement after a delay
          setTimeout(() => announcement.remove(), 1000);
        });
      }
    } else {
      // DEBUG: Log why modal is NOT showing
      if (isNewUserByImpact) {
        if (welcomeShown) {
          console.log('[Dashboard V2] ❌ Modal not shown: User has new profile but welcome modal was already shown', {
            welcomeShownPersistent,
            welcomeShownSession,
            welcomeModalKey
          });
        } else if (!hasRegistrationFlag) {
          console.log('[Dashboard V2] ❌ Modal not shown: User has new profile but no registration flags (existing user logging in, not new registration)', {
            checkNewUser,
            isNewUserFlag,
            note: 'Registration flags are only set during signup/auth flow, not during regular logins'
          });
        }
      } else {
        console.log('[Dashboard V2] ❌ Modal not shown: User does not have new user profile', {
          impactPoints,
          projectsSupported,
          expected: '50 IP and 0 donations'
        });
      }
    }
  }, [previewEnabled, safeImpact, user, user?.id]);

  // Track dashboard view
  useEffect(() => {
    if (user && safeImpact) {
      trackEvent('dashboard_view', 'engagement', 'dashboard-v2', impactPoints);
      // Also push to dataLayer for GA4
      if (typeof window !== 'undefined' && window.dataLayer) {
        window.dataLayer.push({
          event: 'dashboard_view',
          user_id: user.id,
          impact_points: impactPoints,
          supports_count: supportCount,
          user_is_new: isFirstTimeUser
        });
      }
    }
  }, [user, safeImpact, impactPoints, supportCount, isFirstTimeUser]);

  // Sequential tooltip logic - COMMENTED OUT (not needed)
  // useEffect(() => {
  //   if (isFirstTimeUser && !tooltip1Shown.current && currentTooltip === null) {
  //     // Check sessionStorage for dismissed tooltips
  //     const tooltip1Dismissed = sessionStorage.getItem('dashboard_v2_tooltip_1_dismissed') === 'true';
  //     const tooltip2Dismissed = sessionStorage.getItem('dashboard_v2_tooltip_2_dismissed') === 'true';
  //     const tooltip3Dismissed = sessionStorage.getItem('dashboard_v2_tooltip_3_dismissed') === 'true';

  //     if (!tooltip1Dismissed) {
  //       setCurrentTooltip(1);
  //       tooltip1Shown.current = true;
  //       trackEvent('tooltip_shown', 'onboarding', 'dashboard_v2_tooltip_1');
  //       if (typeof window !== 'undefined' && window.dataLayer) {
  //         window.dataLayer.push({
  //           event: 'tooltip_shown',
  //           tooltip_id: 'dashboard_v2_tooltip_1',
  //           user_is_new: true
  //         });
  //       }
  //     } else if (!tooltip2Dismissed) {
  //       setCurrentTooltip(2);
  //       tooltip2Shown.current = true;
  //       trackEvent('tooltip_shown', 'onboarding', 'dashboard_v2_tooltip_2');
  //       if (typeof window !== 'undefined' && window.dataLayer) {
  //         window.dataLayer.push({
  //           event: 'tooltip_shown',
  //           tooltip_id: 'dashboard_v2_tooltip_2',
  //           user_is_new: true
  //         });
  //       }
  //     } else if (!tooltip3Dismissed) {
  //       setCurrentTooltip(3);
  //       tooltip3Shown.current = true;
  //       trackEvent('tooltip_shown', 'onboarding', 'dashboard_v2_tooltip_3');
  //       if (typeof window !== 'undefined' && window.dataLayer) {
  //         window.dataLayer.push({
  //           event: 'tooltip_shown',
  //           tooltip_id: 'dashboard_v2_tooltip_3',
  //           user_is_new: true
  //         });
  //       }
  //     }
  //   }
  // }, [isFirstTimeUser, currentTooltip]);

  // Tooltip handlers - COMMENTED OUT (not needed)
  // const handleTooltipDismiss = (tooltipNumber: number) => {
  //   sessionStorage.setItem(`dashboard_v2_tooltip_${tooltipNumber}_dismissed`, 'true');
  //   setCurrentTooltip(null);
  //   trackEvent('tooltip_dismissed', 'onboarding', `dashboard_v2_tooltip_${tooltipNumber}`);
  //   if (typeof window !== 'undefined' && window.dataLayer) {
  //     window.dataLayer.push({
  //       event: 'tooltip_dismissed',
  //       tooltip_id: `dashboard_v2_tooltip_${tooltipNumber}`,
  //       user_is_new: isFirstTimeUser
  //     });
  //   }
    
  //   // Show next tooltip if available
  //   if (tooltipNumber === 1 && isFirstTimeUser) {
  //     setTimeout(() => {
  //       const tooltip2Dismissed = sessionStorage.getItem('dashboard_v2_tooltip_2_dismissed') === 'true';
  //       if (!tooltip2Dismissed) {
  //         setCurrentTooltip(2);
  //         tooltip2Shown.current = true;
  //         trackEvent('tooltip_shown', 'onboarding', 'dashboard_v2_tooltip_2');
  //       } else {
  //         const tooltip3Dismissed = sessionStorage.getItem('dashboard_v2_tooltip_3_dismissed') === 'true';
  //         if (!tooltip3Dismissed) {
  //           setCurrentTooltip(3);
  //           tooltip3Shown.current = true;
  //           trackEvent('tooltip_shown', 'onboarding', 'dashboard_v2_tooltip_3');
  //         }
  //       }
  //     }, 300);
  //   } else if (tooltipNumber === 2 && isFirstTimeUser) {
  //     setTimeout(() => {
  //       const tooltip3Dismissed = sessionStorage.getItem('dashboard_v2_tooltip_3_dismissed') === 'true';
  //       if (!tooltip3Dismissed) {
  //         setCurrentTooltip(3);
  //         tooltip3Shown.current = true;
  //         trackEvent('tooltip_shown', 'onboarding', 'dashboard_v2_tooltip_3');
  //       }
  //     }, 300);
  //   }
  // };

  // const handleTooltipSkip = (tooltipNumber: number) => {
  //   // Mark all remaining tooltips as dismissed
  //   for (let i = tooltipNumber; i <= 3; i++) {
  //     sessionStorage.setItem(`dashboard_v2_tooltip_${i}_dismissed`, 'true');
  //   }
  //   setCurrentTooltip(null);
  //   trackEvent('tooltip_dismissed', 'onboarding', `dashboard_v2_tooltip_${tooltipNumber}_skipped`);
  // };

  // Pick a daily quote per user (stable for the day, per login)
  useEffect(() => {
    const quote = getDailyQuoteForUser(user?.id);
    setDailyQuote(quote);
  }, [user?.id]);

  // Fetch featured projects from Supabase (featured = true)
  const { data: featuredProjects, isLoading: isLoadingFeatured } = useQuery<Project[]>({
    queryKey: ["dashboard-v2-featured-projects"],
    queryFn: async () => {
      // Try with created_at first (snake_case)
      let { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('status', 'active')
        .eq('featured', true)
        .order('created_at', { ascending: false })
        .limit(6);
      
      // If that fails, try with createdAt (camelCase)
      if (error) {
        console.warn('Error with created_at, trying createdAt:', error);
        const result = await supabase
          .from('projects')
          .select('*')
          .eq('status', 'active')
          .eq('featured', true)
          .order('createdAt', { ascending: false })
          .limit(6);
        data = result.data;
        error = result.error;
      }
      
      if (error) {
        console.error('Error fetching featured projects:', error);
        return [];
      }
      
      return (data || []) as Project[];
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: false,
  });

  // Fetch supported projects (for returning users)
  const { data: supportedProjects, isLoading: isLoadingSupported } = useQuery<Project[]>({
    queryKey: ["/api/user/supported-projects"],
    enabled: hasSupported,
  });

  // Fetch impact history to check if chart should be shown
  const { data: impactHistory } = useQuery<UserImpactHistory[]>({
    queryKey: ["/api/user/impact-history"],
  });

  const hasImpactHistory = impactHistory && impactHistory.length > 0;

  const handleSupportClick = (source: string) => {
    trackEvent('support_cta_click', 'conversion', source);
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: 'support_cta_click',
        source: source,
        user_is_new: isFirstTimeUser
      });
    }
    navigate('/projects');
  };

  const handleRedeemClick = () => {
    trackEvent('redeem_click', 'engagement', 'dashboard-v2');
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: 'redeem_click',
        user_is_new: isFirstTimeUser
      });
    }
    navigate('/rewards');
  };

  const handleFeaturedClick = (projectSlug: string) => {
    trackEvent('featured_click', 'engagement', projectSlug);
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: 'featured_click',
        project_slug: projectSlug,
        user_is_new: isFirstTimeUser
      });
    }
  };

  const handleSignupBack = () => {
    if (signupWelcomeStep === 1) {
      // On first step, back simply closes the mini gamification
      setShowWelcomeModal(false);
      sessionStorage.setItem('welcomeModalClosed', 'true');
    } else {
      setSignupWelcomeStep(1);
    }
  };

  // Calculate progress to first reward (50 points needed, user has 50, so 50/100 = 50%)
  const pointsToFirstReward = 100;
  const progressToReward = Math.min((impactPoints / pointsToFirstReward) * 100, 100);
  const pointsNeeded = Math.max(pointsToFirstReward - impactPoints, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Helmet>
        <title>Dashboard | Dopaya</title>
        <meta name="description" content="Track your impact and manage your support on Dopaya." />
      </Helmet>
      
      {/* Daily Inspirational Quote - At the very top */}
      {dailyQuote && dailyQuote.text && (
        <div className="mb-10 text-center">
          <p className="text-lg italic text-gray-500 font-serif max-w-3xl mx-auto leading-relaxed">
            "{dailyQuote.text}"
          </p>
          <p className="text-sm text-gray-400 mt-3 font-serif">— {dailyQuote.author}</p>
        </div>
      )}

      {/* Header Block - Reorganized Layout */}
      <div className="mb-6 py-4 px-4 sm:px-6 flex flex-col md:flex-row" style={{ alignItems: 'flex-start', gap: '24px' }}>
        {/* Left Column - Stacked Vertically, Left-Aligned */}
        <div className="flex flex-col items-start">
          {/* Welcome back and Badge - Side by side on desktop, stacked on mobile */}
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 mb-3">
            <h2 className="text-3xl font-bold text-dark font-heading">
              Welcome back!
            </h2>
            
            {/* Badge - Beside Welcome back on desktop, below on mobile */}
            <div className="relative inline-block">
              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 text-sm">
                {statusDisplayName}
              </Badge>
              {/* Tooltip 2 - COMMENTED OUT (not needed) */}
              {/* {currentTooltip === 2 && (
                <div className="absolute z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-xs mt-2 left-0 top-full">
                  <p className="text-sm text-gray-700 mb-3">
                    You're an Impact Aspirer — support a project to earn points and unlock your first reward.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTooltipSkip(2)}
                      className="flex-1 text-xs"
                    >
                      Skip
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleTooltipDismiss(2)}
                      className="flex-1 text-xs bg-[#f2662d] hover:bg-[#d9551f] text-white"
                      style={{ backgroundColor: '#f2662d' }}
                    >
                      Got it
                    </Button>
                  </div>
                </div>
              )} */}
            </div>
          </div>

          {/* Impact Aspirer Content */}
          {userStatus === "aspirer" && (
            <>
              {/* Updated microcopy for Impact Aspirers */}
              <div className="relative inline-block mb-3">
                <p className="text-sm font-semibold text-gray-700 mb-1">
                  You've received {impactPoints} Impact Points ≈ ${pointsValue} value.
                </p>
                <p className="text-xs text-gray-500">
                  Support any project to unlock your first reward.
                </p>
                {/* Tooltip 1 - COMMENTED OUT (not needed) */}
                {/* {currentTooltip === 1 && (
                  <div className="absolute z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-xs mt-2 left-0 top-full">
                    <p className="text-sm text-gray-700 mb-3">
                      Welcome! You've just received 50 Impact Points — a small thank you for joining. Use them later to unlock rewards.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTooltipSkip(1)}
                        className="flex-1 text-xs"
                      >
                        Skip
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleTooltipDismiss(1)}
                        className="flex-1 text-xs bg-[#f2662d] hover:bg-[#d9551f] text-white"
                        style={{ backgroundColor: '#f2662d' }}
                      >
                        Got it
                      </Button>
                    </div>
                  </div>
                )} */}
              </div>

              {/* Progress Bar with explicit value */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden" style={{ width: '200px' }}>
                    <div
                      className="h-full bg-[#f2662d] transition-all"
                      style={{ width: `${progressToReward}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600 font-medium">
                    {impactPoints} / {pointsToFirstReward} ({Math.round(progressToReward)}%)
                  </span>
                </div>
              </div>

              {/* Support a Project Button */}
              <div className="relative inline-block">
                <Button
                  className="bg-[#f2662d] hover:bg-[#d9551f] text-white font-semibold"
                  style={{ backgroundColor: '#f2662d' }}
                  onClick={() => handleSupportClick('header')}
                  aria-label="Support a project — opens support modal"
                >
                  Support a project
                </Button>
                {/* Tooltip 3 - COMMENTED OUT (not needed) */}
                {/* {currentTooltip === 3 && (
                  <div className="absolute z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-xs mt-2 left-0 top-full">
                    <p className="text-sm text-gray-700 mb-3">
                      Start now — supporting takes 2 minutes and creates real impact.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTooltipSkip(3)}
                        className="flex-1 text-xs"
                      >
                        Skip
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleTooltipDismiss(3)}
                        className="flex-1 text-xs bg-[#f2662d] hover:bg-[#d9551f] text-white"
                        style={{ backgroundColor: '#f2662d' }}
                      >
                        Got it
                      </Button>
                    </div>
                  </div>
                )} */}
              </div>
            </>
          )}

          {/* Impact Supporter Content */}
          {userStatus === "supporter" && (
            <div className="flex flex-row gap-3 items-center">
              {/* Primary CTA - Support a Project */}
              <div className="relative inline-block">
                <Button
                  className="bg-[#f2662d] hover:bg-[#d9551f] text-white font-semibold"
                  style={{ backgroundColor: '#f2662d' }}
                  onClick={() => handleSupportClick('header')}
                  aria-label="Support a project — opens support modal"
                >
                  Support a project
                </Button>
              </div>

              {/* Secondary CTA - Get rewards */}
              <Button
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
                onClick={handleRedeemClick}
              >
                Get rewards
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Stat boxes - directly under overview bar */}
      <div className="mb-6" style={{ marginTop: '24px' }}>
        <ImpactStats />
      </div>

      {/* Featured / Highlighted Social Enterprises - above graph */}
      {!hasSupported ? (
        // NEW USERS: Show only Highlighted Social Enterprises (full width)
        <div className="mb-6" style={{ marginTop: '24px' }}>
          <h2 className="text-xl font-bold text-dark font-heading mb-6">Highlighted Social Enterprises</h2>
          {isLoadingFeatured ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(3).fill(0).map((_, i) => (
                <Card key={i} className="impact-card overflow-hidden">
                  <Skeleton className="w-full h-48" />
                  <div className="p-4">
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-6 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-4" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </Card>
              ))}
            </div>
          ) : featuredProjects && featuredProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProjects.map((project) => (
                <div key={project.id} onClick={() => handleFeaturedClick(project.slug || '')}>
                  <ProjectCard project={project} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 bg-white rounded-lg shadow-sm">
              <p className="text-neutral">No featured social enterprises available at the moment.</p>
            </div>
          )}
        </div>
      ) : (
        // RETURNING USERS: Show two side-by-side sections
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6" style={{ marginTop: '24px' }}>
          {/* Left: Startups You've Supported */}
          <div>
            <h2 className="text-xl font-bold text-dark font-heading mb-6">Startups You've Supported</h2>
            {isLoadingSupported ? (
              <div className="grid grid-cols-1 gap-6">
                {Array(2).fill(0).map((_, i) => (
                  <Card key={i} className="impact-card overflow-hidden">
                    <Skeleton className="w-full h-48" />
                    <div className="p-4">
                      <Skeleton className="h-4 w-20 mb-2" />
                      <Skeleton className="h-6 w-full mb-2" />
                      <Skeleton className="h-4 w-full mb-4" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : supportedProjects && supportedProjects.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {supportedProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-white rounded-lg shadow-sm">
                <p className="text-neutral">You haven't supported any startups yet.</p>
              </div>
            )}
          </div>

          {/* Right: Highlighted Social Enterprises */}
          <div>
            <h2 className="text-xl font-bold text-dark font-heading mb-6">Highlighted Social Enterprises</h2>
            {isLoadingFeatured ? (
              <div className="grid grid-cols-1 gap-6">
                {Array(2).fill(0).map((_, i) => (
                  <Card key={i} className="impact-card overflow-hidden">
                    <Skeleton className="w-full h-48" />
                    <div className="p-4">
                      <Skeleton className="h-4 w-20 mb-2" />
                      <Skeleton className="h-6 w-full mb-2" />
                      <Skeleton className="h-4 w-full mb-4" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : featuredProjects && featuredProjects.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {featuredProjects.map((project) => (
                  <div key={project.id} onClick={() => handleFeaturedClick(project.slug || '')}>
                    <ProjectCard project={project} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-white rounded-lg shadow-sm">
                <p className="text-neutral">No featured social enterprises available at the moment.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Impact Over Time - hidden when empty, replaced with placeholder */}
      {!hasImpactHistory || supportCount === 0 ? (
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Your impact over time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">
                Coming soon
              </h3>
              <p className="text-base text-gray-500 mb-4 max-w-md">
                Your impact over time will appear here after you support your first social enterprise.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSupportClick('chart_placeholder')}
                className="mt-2"
              >
                Support a project
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="mb-12">
          <ImpactChart />
        </div>
      )}
      
      <DonationSuccessModal 
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        amount={donationAmount}
      />
      
      {/* Signup-only Mini Gamification (new user registration) */}
      {previewEnabled && (
        <Dialog 
          open={showWelcomeModal} 
          onOpenChange={(open) => {
            setShowWelcomeModal(open);
            if (!open) {
              // When modal is closed, mark it as closed (persistent)
              console.log('[Dashboard V2] Welcome modal closed');
              sessionStorage.setItem('welcomeModalClosed', 'true');
              
              // PERSISTENT: Ensure flag is saved to localStorage (in case it wasn't set earlier)
              if (user?.id) {
                try {
                  localStorage.setItem(`welcomeModalShown_${user.id}`, 'true');
                } catch (e) {
                  // FALLBACK: If localStorage fails, use sessionStorage
                  console.warn('[Dashboard V2] localStorage failed on modal close, using sessionStorage:', e);
                  sessionStorage.setItem('welcomeModalShown', 'true');
                }
              }
            }
          }}
        >
          {/* Simple, stable modal content (no outer confetti wrappers) */}
          {/* z-[10000] ensures modal appears above confetti (z-9999) */}
          <DialogContent className="sm:max-w-md text-center bg-white z-[10000]" style={{ backgroundColor: 'white' }}>
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
                  🎉 Welcome to Dopaya!
                </DialogTitle>
                <DialogDescription className="text-base text-gray-600 pt-4 pb-8">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    To celebrate that you are part of our community, we've added <span className="font-semibold">50 Impact Points</span> to your account - worth about $5 to use toward future rewards :)
                  </p>
                </DialogDescription>
                <div className="mt-0">
                  <Button
                    className="w-full bg-[#f2662d] hover:bg-[#d9551f] text-white font-semibold"
                    style={{ backgroundColor: "#f2662d" }}
                    onClick={() => setSignupWelcomeStep(2)}
                  >
                    Let's get started →
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
                  <DialogDescription className="text-sm text-gray-700 pt-1 mb-6">
                    Choose how you'd like to start:
                  </DialogDescription>
                </DialogHeader>

                <div className="mt-6 space-y-3 text-left">
                  {/* Tile 1: Support a project (recommended) */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowWelcomeModal(false);
                      sessionStorage.setItem('welcomeModalClosed', 'true');
                      window.location.href = "/projects?previewOnboarding=1";
                    }}
                    className="w-full text-left p-4 rounded-xl border border-gray-200 bg-white hover:bg-orange-50 transition-colors active:scale-[0.99] flex items-start gap-3"
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                        <Heart className="w-5 h-5 text-[#f2662d]" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">
                        Support a project
                      </p>
                      <p className="text-xs text-gray-700 mt-1">
                        Start with a small amount and unlock your first reward.
                      </p>
                    </div>
                  </button>

                  {/* Tile 2: Discover enterprises */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowWelcomeModal(false);
                      sessionStorage.setItem('welcomeModalClosed', 'true');
                      window.location.href = "/projects?previewOnboarding=1";
                    }}
                    className="w-full text-left p-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors active:scale-[0.99] flex items-start gap-3"
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Search className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">
                        Discover inspiring social enterprises
                      </p>
                      <p className="text-xs text-gray-700 mt-1">
                        Explore verified innovators solving real problems.
                      </p>
                    </div>
                  </button>

                  {/* Tile 3: View dashboard */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowWelcomeModal(false);
                      sessionStorage.setItem('welcomeModalClosed', 'true');
                    }}
                    className="w-full text-left p-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors active:scale-[0.99] flex items-start gap-3"
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                        <BarChart3 className="w-5 h-5 text-purple-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">
                        View your dashboard
                      </p>
                      <p className="text-xs text-gray-700 mt-1">
                        Track your points, rank, and progress.
                      </p>
                    </div>
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
    </div>
  );
}
