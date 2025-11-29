import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { UserImpact, Project, UserImpactHistory } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { ImpactStats } from "@/components/dashboard/impact-stats";
import { ImpactChart } from "@/components/dashboard/impact-chart";
import { Helmet } from "react-helmet";
import { Link, useLocation } from "wouter";
import { DonationSuccessModal } from "@/components/donation/donation-success-modal";
import { useState, useEffect, useRef, useMemo } from "react";
import { getDailyQuoteForUser, ImpactQuote } from "@/constants/impact-quotes";
import { ProjectCard } from "@/components/projects/project-card";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trackEvent } from "@/lib/simple-analytics";
import { isOnboardingPreviewEnabled } from "@/lib/feature-flags";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sparkles, Heart, Search, BarChart3, ChevronDown, Target, GraduationCap, Droplets, Leaf, Wind, Users, ArrowRight, Gift, Mail, Loader2 } from "lucide-react";
import { triggerConfetti } from "@/lib/confetti";
import ExpandableGallery from "@/components/ui/gallery-animation";
import { getProjectImageUrl, getLogoUrl } from "@/lib/image-utils";
import { toast } from "@/hooks/use-toast";


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
  
  // State for ExpandableGallery modal (like homepage)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [galleryDonationAmount, setGalleryDonationAmount] = useState(0);
  const [showDonationDropdown, setShowDonationDropdown] = useState(false);
  const initializedRef = useRef<number | null>(null);

  // Newsletter signup state
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [isNewsletterSubscribed, setIsNewsletterSubscribed] = useState(false);
  const [isNewsletterLoading, setIsNewsletterLoading] = useState(false);
  
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

  // Check and apply welcome bonus transaction if needed (one-time check)
  useEffect(() => {
    if (!user || !safeImpact) return;
    
    const impactPoints = safeImpact.impactPoints ?? 0;
    
    // Only check if user has exactly 50 points (from trigger) and hasn't checked before
    if (impactPoints === 50) {
      const welcomeBonusChecked = sessionStorage.getItem('welcomeBonusChecked');
      
      if (!welcomeBonusChecked) {
        // Mark as checked immediately to prevent duplicate calls
        sessionStorage.setItem('welcomeBonusChecked', 'true');
        
        // Get auth token and call welcome bonus endpoint
        supabase.auth.getSession().then(({ data: { session } }) => {
          const token = session?.access_token;
          
          if (token) {
            console.log('[Dashboard V2] User has 50 IP, checking welcome bonus transaction...');
            
            fetch('/api/user/welcome-bonus', {
              method: 'POST',
              credentials: 'include',
              headers: {
                'Authorization': `Bearer ${token}`
              }
            }).then(async res => {
              const responseText = await res.text();
              let responseData;
              try {
                responseData = JSON.parse(responseText);
              } catch {
                responseData = responseText;
              }
              
              if (res.ok) {
                console.log('[Dashboard V2] Welcome bonus response:', responseData);
                // NOTE: Do NOT invalidate queries here - it causes infinite loop
                // The query will refresh automatically on next mount or when user navigates
              } else {
                console.warn('[Dashboard V2] Welcome bonus check failed:', res.status, res.statusText, responseData);
              }
            }).catch(err => {
              console.warn('[Dashboard V2] Welcome bonus check error:', err);
            });
          }
        }).catch(err => {
          console.warn('[Dashboard V2] Failed to get session for welcome bonus:', err);
        });
      }
    }
  }, [user, safeImpact]);

  const displayName = user?.firstName || user?.username || (user?.email ? user.email.split('@')[0] : "Supporter");
  // Use actual impact points from API
  const impactPoints = safeImpact?.impactPoints ?? 0;
  // Determine user status: 100+ Impact Points = Changemaker, otherwise Aspirer
  // PRIORITY: Calculate based on impactPoints first, then fall back to API value
  // This ensures correct status even if API returns stale data
  const userStatus = impactPoints >= 100 ? "changemaker" : (safeImpact?.userStatus || safeImpact?.userLevel || "aspirer");
  const statusDisplayName = userStatus === "changemaker" ? "Changemaker" : "Impact Aspirer";
  
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

  // Fetch supported projects with aggregated donations (for returning users)
  type SupportedProjectWithDonations = {
    project: Project;
    totalAmount: number;
    totalImpactPoints: number;
    donationCount: number;
    lastDonationDate: Date | null;
    donations: any[];
  };
  
  const { data: supportedProjectsWithDonations, isLoading: isLoadingSupported } = useQuery<SupportedProjectWithDonations[]>({
    queryKey: ["/api/user/supported-projects-with-donations"],
    enabled: hasSupported,
  });

  // Load More state for Projects
  const [visibleCount, setVisibleCount] = useState(4);
  const INITIAL_COUNT = 4;
  const LOAD_MORE_COUNT = 4;

  // Load More state for Rewards
  const [visibleRewardsCount, setVisibleRewardsCount] = useState(4);
  const INITIAL_REWARDS_COUNT = 4;
  const LOAD_MORE_REWARDS_COUNT = 4;

  // Fetch impact history to check if chart should be shown
  const { data: impactHistory } = useQuery<UserImpactHistory[]>({
    queryKey: ["/api/user/impact-history"],
  });

  // Fetch user redemptions with rewards (for returning users with redemptions)
  type RedemptionWithReward = {
    redemption: any;
    reward: any;
    pointsSpent: number;
    redemptionDate: Date | null;
    status: string;
  };
  
  const { data: redemptionsWithRewards, isLoading: isLoadingRedemptions } = useQuery<RedemptionWithReward[]>({
    queryKey: ["/api/user/redemptions-with-rewards"],
    enabled: !!user, // Only fetch if user is logged in
  });

  // Check if user has redemptions
  const hasRedemptions = redemptionsWithRewards && redemptionsWithRewards.length > 0;

  // Fetch all brands (for reward logos)
  const { data: allBrands = [] } = useQuery<any[]>({
    queryKey: ["brands-dashboard-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brands')
        .select('*');
      
      if (error) {
        console.error('[Dashboard] Error fetching brands:', error);
        return [];
      }
      
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: false,
  });

  // Create brand lookup map by ID for reward logos
  const brandMap = useMemo(() => {
    const map = new Map<number, { logoUrl: string | null; name: string }>();
    allBrands.forEach((brand) => {
      const raw = brand as any;
      const logoPath = raw.logo_path || raw.logoPath || raw.logo_url || raw.logoUrl || '';
      const logoUrl = logoPath ? getLogoUrl(logoPath) : null;
      
      map.set(brand.id, {
        logoUrl: logoUrl,
        name: brand.name,
      });
    });
    return map;
  }, [allBrands]);

  // Fetch featured rewards (for gallery)
  const { data: featuredRewards, isLoading: isLoadingFeaturedRewards } = useQuery<any[]>({
    queryKey: ["dashboard-v2-featured-rewards"],
    queryFn: async () => {
      console.log('[Dashboard] Fetching featured rewards...');
      
      // Try with points_cost first (snake_case - database column name)
      const { data: featuredData, error: featuredError } = await supabase
        .from('rewards')
        .select('*')
        .eq('featured', true)
        .order('points_cost', { ascending: false })
        .limit(6);
      
      if (featuredError) {
        console.warn('[Dashboard] Error ordering by points_cost, trying without order:', featuredError);
        // Fallback: fetch without order
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('rewards')
          .select('*')
          .eq('featured', true)
          .limit(6);
        
        if (fallbackError) {
          console.error('[Dashboard] Error fetching featured rewards:', fallbackError);
          // Last fallback: try to get any rewards (not just featured)
          const { data: allData, error: allError } = await supabase
            .from('rewards')
            .select('*')
            .limit(6);
          
          if (allError) {
            console.error('[Dashboard] Error fetching all rewards:', allError);
            return [];
          }
          
          console.log('[Dashboard] Using all rewards as fallback:', allData?.length || 0);
          return allData || [];
        }
        
        // Sort manually by points_cost or pointsCost
        const sorted = (fallbackData || []).sort((a: any, b: any) => {
          const aCost = a.points_cost || a.pointsCost || 0;
          const bCost = b.points_cost || b.pointsCost || 0;
          return bCost - aCost; // Descending order
        });
        
        console.log('[Dashboard] Found featured rewards (manually sorted):', sorted.length);
        return sorted;
      }
      
      console.log('[Dashboard] Found featured rewards:', featuredData?.length || 0);
      return featuredData || [];
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: false,
  });

  // Reset visibleCount when supported projects change
  useEffect(() => {
    if (supportedProjectsWithDonations) {
      setVisibleCount(INITIAL_COUNT);
    }
  }, [supportedProjectsWithDonations?.length]);

  // Reset visibleRewardsCount when redemptions change
  useEffect(() => {
    if (redemptionsWithRewards) {
      setVisibleRewardsCount(INITIAL_REWARDS_COUNT);
    }
  }, [redemptionsWithRewards?.length]);

  // Debug: Log featured rewards state
  useEffect(() => {
    console.log('[Dashboard] Featured Rewards State:', {
      isLoading: isLoadingFeaturedRewards,
      count: featuredRewards?.length || 0,
      hasRedemptions,
      data: featuredRewards
    });
  }, [featuredRewards, isLoadingFeaturedRewards, hasRedemptions]);

  // Prepare gallery data for Featured Rewards (like Projects) - MAX 3 for 3 columns
  const topRewards = useMemo(() => {
    if (!featuredRewards || featuredRewards.length === 0) return [];
    return featuredRewards.slice(0, 3); // Only 3 for 3 columns
  }, [featuredRewards]);

  const rewardGalleryImages = useMemo(() => {
    return topRewards.map((reward: any) => {
      return reward.imageUrl || reward.image_url || '/placeholder-reward.png';
    });
  }, [topRewards]);

  const rewardGalleryTaglines = useMemo(() => {
    return topRewards.map((reward: any) => reward.title || 'Reward');
  }, [topRewards]);

  // Prepare brand logos for Featured Rewards
  const rewardGalleryLogos = useMemo(() => {
    return topRewards.map((reward: any) => {
      // Get brand from reward (could be brandId or nested brand object)
      const brandId = reward.brandId || reward.brand_id;
      if (!brandId) return null;
      
      // Look up brand logo from brandMap
      const brand = brandMap.get(brandId);
      return brand?.logoUrl || null;
    });
  }, [topRewards, brandMap]);

  // Icons for rewards based on category (optional)
  const rewardGalleryIcons = useMemo(() => {
    return topRewards.map((reward: any) => {
      const category = (reward.category || '').toLowerCase();
      const iconProps = { className: 'w-4 h-4 text-white' } as const;
      // Simple category-based icons (can be expanded)
      if (category.includes('food') || category.includes('restaurant')) return <Heart {...iconProps} />;
      if (category.includes('travel')) return <Wind {...iconProps} />;
      if (category.includes('fashion') || category.includes('clothing')) return <Users {...iconProps} />;
      return <Gift {...iconProps} />; // Default gift icon
    });
  }, [topRewards]);

  // State for selected reward (for modal)
  const [selectedReward, setSelectedReward] = useState<any | null>(null);

  const hasImpactHistory = impactHistory && impactHistory.length > 0;

  // Helper function for sector icons (stable, no dependencies) - MUST be declared before use
  const sectorToIcon = (sector: string) => {
    const s = (sector || '').toLowerCase();
    const iconProps = { className: 'w-4 h-4 text-white' } as const;
    if (s.includes('education')) return <GraduationCap {...iconProps} />;
    if (s.includes('water')) return <Droplets {...iconProps} />;
    if (s.includes('energy') || s.includes('wind') || s.includes('solar')) return <Wind {...iconProps} />;
    if (s.includes('health')) return <Heart {...iconProps} />;
    if (s.includes('environment') || s.includes('agri') || s.includes('eco')) return <Leaf {...iconProps} />;
    return <Users {...iconProps} />;
  };

  // Helper function for donation tiers (like homepage) - MUST be declared before use
  const getAvailableTiers = (project: Project | null) => {
    if (!project) return [] as { donation: number; impact: string; unit: string; points: number }[];
    const tiers: { donation: number; impact: string; unit: string; points: number }[] = [];
    for (let i = 1; i <= 7; i++) {
      const donation = project[`donation_${i}` as keyof Project] as unknown as number;
      const impact = project[`impact_${i}` as keyof Project] as unknown as string;
      const impactUnit = project.impactUnit as string;
      if (donation && impact) {
        tiers.push({ donation, impact, unit: impactUnit || 'impact created', points: donation * 10 });
      }
    }
    return tiers.sort((a, b) => a.donation - b.donation);
  };

  // Prepare gallery data for ExpandableGallery (only when featuredProjects available)
  const topProjects = featuredProjects?.slice(0, 3) || [];
  const galleryImages = topProjects.length > 0 ? [
    ...topProjects.map(p => getProjectImageUrl(p) || p.imageUrl || 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?q=80&w=1200&auto=format&fit=crop'),
  ] : [];
  const galleryTaglines = topProjects.map(p => {
    const sector = p.category || 'Impact';
    return `${sector} →:`;
  });
  const galleryIcons = topProjects.map(p => sectorToIcon(p.category || ''));

  // Donation tiers for selected project
  const availableTiers = getAvailableTiers(selectedProject);
  
  // Initialize donation amount when project is selected
  useEffect(() => {
    if (selectedProject && availableTiers.length > 0 && initializedRef.current !== selectedProject.id) {
      setGalleryDonationAmount(availableTiers[0].donation);
      initializedRef.current = selectedProject.id;
    }
  }, [selectedProject, availableTiers]);
  
  const currentTier = availableTiers.find(t => t.donation === galleryDonationAmount) || availableTiers[0];
  const impactAmount = currentTier?.impact || '0';
  const impactUnit = currentTier?.unit || 'impact created';
  const galleryImpactPoints = currentTier?.points || 0;
  const impactVerb = selectedProject?.impact_verb || 'help';
  const impactNoun = selectedProject?.impact_noun || 'people';

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

          {/* Changemaker Content */}
          {userStatus === "changemaker" && (
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

      {/* Social Enterprises Section */}
      <div className="mb-6" style={{ marginTop: '24px' }}>
        {/* Main Headline */}
        <h2 className="text-xl font-bold text-dark font-heading mb-6">Social Enterprises</h2>
        
        {!hasSupported ? (
          // NEW USERS: Show only Highlighted Social Enterprises (full width)
          <div>
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
              <div className="flex justify-center">
                <ExpandableGallery
                  images={galleryImages}
                  taglines={galleryTaglines}
                  className="w-full max-w-4xl"
                  icons={galleryIcons}
                  onImageClick={(index) => {
                    if (index < topProjects.length) {
                      setSelectedProject(topProjects[index]);
                      handleFeaturedClick(topProjects[index].slug || '');
                    }
                  }}
                />
              </div>
            ) : (
              <div className="text-center py-6 bg-white rounded-lg shadow-sm">
                <p className="text-neutral">No featured social enterprises available at the moment.</p>
              </div>
            )}
          </div>
        ) : (
          // RETURNING USERS: Show two side-by-side sections
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Social Enterprises you have supported */}
            <div>
              <h3 className="text-lg font-semibold text-dark font-heading mb-6">Social Enterprises you have supported</h3>
            {isLoadingSupported ? (
              <div className="space-y-3">
                {Array(2).fill(0).map((_, i) => (
                  <div key={i} className="flex items-stretch rounded-lg border border-gray-200 bg-white overflow-hidden">
                    <Skeleton className="w-24 h-full flex-shrink-0" />
                    <div className="flex-1 min-w-0 p-4 flex flex-col justify-center">
                      <Skeleton className="h-5 w-32 mb-2" />
                      <Skeleton className="h-4 w-40" />
                    </div>
                    <div className="flex-shrink-0 p-6 flex flex-col justify-center items-end border-l border-gray-200 min-w-[180px]">
                      <Skeleton className="h-9 w-24 mb-2" />
                      <Skeleton className="h-5 w-32" />
                    </div>
                  </div>
                ))}
              </div>
            ) : supportedProjectsWithDonations && supportedProjectsWithDonations.length > 0 ? (
              <div className="space-y-3">
                {/* Show only visibleCount projects */}
                {supportedProjectsWithDonations.slice(0, visibleCount).map((item) => {
                  const { project, totalAmount, totalImpactPoints, donationCount, lastDonationDate } = item;
                  
                  // Calculate impact description from project
                  // Use impactUnit, impact_verb, impact_noun from project (snake_case from DB)
                  const projectAny = project as any;
                  const impactUnit = project.impactUnit || 'impact';
                  const impactVerb = projectAny.impact_verb || projectAny.impactVerb || 'created';
                  const impactNoun = projectAny.impact_noun || projectAny.impactNoun || impactUnit;
                  
                  // Calculate impact amount based on totalImpactPoints
                  // For now, we'll use a simple calculation: totalImpactPoints / 10 as a rough estimate
                  // This could be improved by using the project's donation tiers
                  const impactAmount = Math.round(totalImpactPoints / 10); // Rough estimate
                  
                  const projectImageUrl = getProjectImageUrl(project) || project.imageUrl || '/placeholder-project.png';
                  const formattedDate = lastDonationDate 
                    ? new Date(lastDonationDate).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })
                    : 'N/A';
                  
                  return (
                    <div 
                      key={project.id}
                      className="flex items-stretch rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all bg-white group overflow-hidden"
                    >
                      {/* Image - Left Side (wider, no padding, flush to edges) */}
                      <div className="flex-shrink-0">
                        <img 
                          src={projectImageUrl}
                          alt={project.title}
                          className="w-24 h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder-project.png';
                          }}
                        />
                      </div>
                      
                      {/* Middle Section - Name, Amount & Date */}
                      <div className="flex-1 min-w-0 p-4 flex flex-col justify-center">
                        {/* Project Name - Clickable Link */}
                        <Link href={`/project/${project.slug || project.id}`} className="mb-2">
                          <h4 className="text-base font-semibold text-gray-900 hover:text-[#f2662d] transition-colors group-hover:text-[#f2662d]">
                            {project.title}
                          </h4>
                        </Link>
                        
                        {/* Amount & Date - Small */}
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>${totalAmount}</span>
                          {donationCount > 1 && (
                            <>
                              <span>•</span>
                              <span>{donationCount} donations</span>
                            </>
                          )}
                          <span>•</span>
                          <span>{formattedDate}</span>
                        </div>
                      </div>
                      
                      {/* Right Section - Impact Information (Wider & Prominent) */}
                      <div className="flex-shrink-0 p-6 flex flex-col justify-center items-end border-l border-gray-200 min-w-[180px]">
                        <div className="text-right">
                          <div className="mb-2">
                            <span className="text-3xl font-bold text-[#f2662d]">
                              {impactAmount}
                            </span>
                          </div>
                          <div className="text-base text-gray-600 font-medium">
                            {impactNoun} {impactVerb}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {/* Load More Button */}
                {visibleCount < supportedProjectsWithDonations.length && (
                  <Button
                    variant="outline"
                    onClick={() => setVisibleCount(prev => prev + LOAD_MORE_COUNT)}
                    className="w-full mt-4"
                  >
                    Load More ({supportedProjectsWithDonations.length - visibleCount} remaining)
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-6 bg-white rounded-lg shadow-sm">
                <p className="text-neutral">You haven't supported any startups yet.</p>
              </div>
            )}
          </div>

          {/* Right: Highlighted Social Enterprises */}
          <div>
            <h3 className="text-lg font-semibold text-dark font-heading mb-6">Highlighted Social Enterprises</h3>
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
              <div className="flex justify-center">
                <ExpandableGallery
                  images={galleryImages}
                  taglines={galleryTaglines}
                  className="w-full"
                  icons={galleryIcons}
                  onImageClick={(index) => {
                    if (index < topProjects.length) {
                      setSelectedProject(topProjects[index]);
                      handleFeaturedClick(topProjects[index].slug || '');
                    }
                  }}
                />
              </div>
            ) : (
              <div className="text-center py-6 bg-white rounded-lg shadow-sm">
                <p className="text-neutral">No featured social enterprises available at the moment.</p>
              </div>
            )}
          </div>
        </div>
        )}
      </div>

      {/* Rewards Section */}
      <div className="mb-6" style={{ marginTop: '24px' }}>
        {/* Main Headline */}
        <h2 className="text-xl font-bold text-dark font-heading mb-6">Rewards</h2>
        
        {!hasRedemptions ? (
          // NEW USERS (no redemptions): Show only Featured Rewards (full width) with ExpandableGallery
          <div>
            {isLoadingFeaturedRewards ? (
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
            ) : featuredRewards && featuredRewards.length > 0 ? (
              <div className="flex justify-center">
                <ExpandableGallery
                  images={rewardGalleryImages}
                  taglines={rewardGalleryTaglines}
                  className="w-full max-w-4xl"
                  icons={rewardGalleryIcons}
                  logos={rewardGalleryLogos}
                  onImageClick={() => {
                    // Always navigate to rewards page
                    navigate('/rewards');
                  }}
                />
              </div>
            ) : (
              <div className="text-center py-6 bg-white rounded-lg shadow-sm">
                <p className="text-neutral">No featured rewards available at the moment.</p>
              </div>
            )}
          </div>
        ) : (
          // RETURNING USERS (with redemptions): Show two side-by-side sections
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Sustainable rewards you have unlocked */}
            <div>
              <h3 className="text-lg font-semibold text-dark font-heading mb-6">Sustainable rewards you have unlocked</h3>
              {isLoadingRedemptions ? (
                <div className="space-y-3">
                  {Array(2).fill(0).map((_, i) => (
                    <div key={i} className="flex items-stretch rounded-lg border border-gray-200 bg-white overflow-hidden">
                      <Skeleton className="w-24 h-full flex-shrink-0" />
                      <div className="flex-1 min-w-0 p-4 flex flex-col justify-center">
                        <Skeleton className="h-5 w-32 mb-2" />
                        <Skeleton className="h-4 w-40" />
                      </div>
                      <div className="flex-shrink-0 p-6 flex flex-col justify-center items-end border-l border-gray-200 min-w-[180px]">
                        <Skeleton className="h-9 w-24 mb-2" />
                        <Skeleton className="h-5 w-32" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : redemptionsWithRewards && redemptionsWithRewards.length > 0 ? (
                <div className="space-y-3">
                  {/* Show only visibleRewardsCount redemptions */}
                  {redemptionsWithRewards.slice(0, visibleRewardsCount).map((item, index) => {
                    const { reward, pointsSpent, redemptionDate, status } = item;
                    
                    if (!reward) return null; // Skip if reward data is missing
                    
                    const rewardImageUrl = reward.imageUrl || reward.image_url || '/placeholder-reward.png';
                    const formattedDate = redemptionDate 
                      ? new Date(redemptionDate).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })
                      : 'N/A';
                    
                    return (
                      <div 
                        key={`${item.redemption.id || index}`}
                        className="flex items-stretch rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all bg-white group overflow-hidden"
                      >
                        {/* Image - Left Side (wider, no padding, flush to edges) */}
                        <div className="flex-shrink-0">
                          <img 
                            src={rewardImageUrl}
                            alt={reward.title}
                            className="w-24 h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder-reward.png';
                            }}
                          />
                        </div>
                        
                        {/* Middle Section - Name, Points & Date */}
                        <div className="flex-1 min-w-0 p-4 flex flex-col justify-center">
                          {/* Brand Logo - Above Title */}
                          {(() => {
                            const rewardAny = reward as any;
                            const brand = rewardAny.brands || rewardAny.brand;
                            if (brand) {
                              const rawBrand = brand as any;
                              const logoPath = rawBrand.logo_path || rawBrand.logoPath || rawBrand.logo_url || rawBrand.logoUrl;
                              const logoUrl = logoPath ? getLogoUrl(logoPath) : null;
                              
                              if (logoUrl) {
                                return (
                                  <div className="mb-2">
                                    <img 
                                      src={logoUrl}
                                      alt={brand.name || 'Brand logo'}
                                      className="h-6 w-auto object-contain"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                      }}
                                    />
                                  </div>
                                );
                              }
                            }
                            return null;
                          })()}
                          
                          {/* Reward Name - Clickable Link */}
                          <Link href="/rewards" className="mb-2">
                            <h4 className="text-base font-semibold text-gray-900 hover:text-[#f2662d] transition-colors group-hover:text-[#f2662d]">
                              {reward.title}
                            </h4>
                          </Link>
                          
                          {/* Points & Date - Small */}
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{pointsSpent} points</span>
                            <span>•</span>
                            <span>{formattedDate}</span>
                            {status && status !== 'fulfilled' && (
                              <>
                                <span>•</span>
                                <span className="text-orange-600">{status}</span>
                              </>
                            )}
                          </div>
                        </div>
                        
                        {/* Right Section - Points Information (Wider & Prominent) */}
                        <div className="flex-shrink-0 p-6 flex flex-col justify-center items-end border-l border-gray-200 min-w-[180px]">
                          <div className="text-right">
                            <div className="mb-2">
                              <span className="text-3xl font-bold text-[#f2662d]">
                                {pointsSpent}
                              </span>
                            </div>
                            <div className="text-base text-gray-600 font-medium">
                              points spent
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Load More Button */}
                  {visibleRewardsCount < redemptionsWithRewards.length && (
                    <Button
                      variant="outline"
                      onClick={() => setVisibleRewardsCount(prev => prev + LOAD_MORE_REWARDS_COUNT)}
                      className="w-full mt-4"
                    >
                      Load More ({redemptionsWithRewards.length - visibleRewardsCount} remaining)
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 bg-white rounded-lg shadow-sm">
                  <p className="text-neutral">You haven't redeemed any rewards yet.</p>
                </div>
              )}
            </div>

            {/* Right: Highlighted sustainable rewards */}
            <div>
              <h3 className="text-lg font-semibold text-dark font-heading mb-6">Highlighted sustainable rewards</h3>
              {isLoadingFeaturedRewards ? (
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
              ) : featuredRewards && featuredRewards.length > 0 ? (
                <div className="flex justify-center">
                  <ExpandableGallery
                    images={rewardGalleryImages}
                    taglines={rewardGalleryTaglines}
                    className="w-full"
                    icons={rewardGalleryIcons}
                    logos={rewardGalleryLogos}
                    onImageClick={() => {
                      // Always navigate to rewards page
                      navigate('/rewards');
                    }}
                  />
                </div>
              ) : (
                <div className="text-center py-6 bg-white rounded-lg shadow-sm">
                  <p className="text-neutral">No featured rewards available at the moment.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Impact Over Time - Graph with overlay placeholder for all users */}
      <Card className="mb-12 relative">
        <CardHeader className="relative z-10 bg-white">
          <CardTitle>Your Impact Over Time</CardTitle>
          <div className="flex items-center space-x-6 text-sm mt-2">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-0.5 bg-primary"></div>
              <span className="text-gray-600">Impact Points</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-0.5 bg-green-500" style={{ borderStyle: 'dashed', borderWidth: '1px 0', background: 'none', borderColor: '#10B981' }}></div>
              <span className="text-gray-600">Impact Created</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-0.5 bg-purple-500" style={{ borderStyle: 'dashed', borderWidth: '1px 0', background: 'none', borderColor: '#8B5CF6' }}></div>
              <span className="text-gray-600">Support amount</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative">
          <div className="relative z-0">
            <ImpactChart />
          </div>
          
          {/* Overlay placeholder - 75% opacity */}
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/75 backdrop-blur-sm rounded-lg" style={{ top: 0, left: 0, right: 0, bottom: 0 }}>
            <div className="flex flex-col items-center justify-center py-12 text-center max-w-md px-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">
              Coming soon
            </h3>
            <p className="text-base text-gray-500 mb-6">
              We are working on your Personal Impact Dashboard - fully transparent impact tracking with real data over time.
            </p>
            
            {/* Newsletter Signup Section - Replaces "Keep me updated" button */}
            <div className="w-full">
              <p className="text-sm text-gray-500 mb-4">
                Get notified when your Personal Impact Dashboard is ready
              </p>
              
              {isNewsletterSubscribed ? (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700 font-medium">
                    ✓ Thank you for subscribing! We'll keep you updated.
                  </p>
                </div>
              ) : (
                <form 
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!newsletterEmail || !newsletterEmail.includes('@')) {
                      return;
                    }
                    
                    setIsNewsletterLoading(true);
                    try {
                      const response = await fetch('/api/newsletter/subscribe', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          email: newsletterEmail,
                          source: 'dashboard_impact_placeholder'
                        }),
                      });
                      
                      const data = await response.json();
                      
                      if (response.ok) {
                        setIsNewsletterSubscribed(true);
                        setNewsletterEmail("");
                        toast({
                          title: "Subscribed!",
                          description: "We'll notify you when your Personal Impact Dashboard is ready.",
                        });
                      } else {
                        toast({
                          title: "Error",
                          description: data.error || "Failed to subscribe. Please try again.",
                          variant: "destructive",
                        });
                      }
                    } catch (error) {
                      console.error('Newsletter subscription error:', error);
                      toast({
                        title: "Error",
                        description: "Failed to subscribe. Please try again.",
                        variant: "destructive",
                      });
                    } finally {
                      setIsNewsletterLoading(false);
                    }
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#f2662d] focus:border-transparent"
                    required
                    disabled={isNewsletterLoading}
                  />
                  <Button
                    type="submit"
                    disabled={isNewsletterLoading}
                    className="px-6 py-2 bg-[#f2662d] hover:bg-[#d9551f] text-white text-sm font-medium"
                  >
                    {isNewsletterLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Keep me updated"
                    )}
                  </Button>
                </form>
              )}
            </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <DonationSuccessModal 
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        amount={donationAmount}
      />
      
      {/* Project Detail Modal (like homepage) */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">
            <button
              onClick={() => { setSelectedProject(null); setShowDonationDropdown(false); initializedRef.current = null; }}
              className="absolute top-6 right-6 z-10 p-2 rounded-full bg-white/90 hover:bg-white shadow-sm transition-colors"
            >
              ✕
            </button>

            <div className="p-6 lg:p-8 border-b border-gray-200">
              <h3 className="text-xl lg:text-2xl font-bold mb-1 text-gray-900">
                See the impact you can create
              </h3>
              <p className="text-base lg:text-lg text-gray-600">
                with {selectedProject.title}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 p-6 lg:p-12">
              <div className="space-y-8 order-2 lg:order-1">
                <div>
                  <div className="text-center lg:text-left">
                    <p className="text-2xl lg:text-4xl font-semibold leading-[1.4] text-gray-900">
                      Support <span className="font-bold text-gray-900">{selectedProject.title}</span> with{' '}
                      <span className="relative inline-block">
                        <button
                          onClick={() => setShowDonationDropdown(!showDonationDropdown)}
                          className="inline-flex items-center gap-1 border-b-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors min-h-[48px] px-2 font-bold text-[#f2662d]"
                        >
                          ${galleryDonationAmount}
                          <ChevronDown className="h-5 w-5" />
                        </button>
                        {showDonationDropdown && (
                          <div className="absolute top-full left-0 mt-2 bg-white border rounded-lg shadow-lg z-10 min-w-[140px] border-gray-200">
                            {availableTiers.map((tier) => (
                              <button key={tier.donation} onClick={() => { setGalleryDonationAmount(tier.donation); setShowDonationDropdown(false); }} className="w-full p-2 text-left hover:bg-gray-50 transition-colors min-h-[36px]">
                                <span className="text-lg font-bold text-[#f2662d]">
                                  ${tier.donation}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </span> and help{' '}
                      <span className="font-bold text-gray-900">{impactVerb}</span>{' '}
                      <span className="font-bold text-[#f2662d]">{impactAmount}</span>{' '}
                      <span className="font-bold text-[#f2662d]">{impactNoun}</span>{' '}
                      <span className="text-gray-600">— earn</span>{' '}
                      <span className="font-bold text-gray-900">{galleryImpactPoints}</span>{' '}
                      <span className="text-gray-600">Impact Points</span>.
                    </p>
                  </div>

                  <div className="mt-8 lg:mt-10 text-center lg:text-left">
                    <Button size="lg" className="text-white font-semibold px-6 lg:px-8 py-3 lg:py-4 text-base lg:text-lg min-h-[44px] lg:min-h-[48px] w-full sm:w-auto bg-[#f2662d] hover:bg-[#d9551f]" asChild>
                      <Link href={`/project/${selectedProject.slug || selectedProject.id}`}>
                        Support This Project
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-6 order-1 lg:order-2">
                <div className="rounded-lg overflow-hidden relative border border-gray-200">
                  {getProjectImageUrl(selectedProject) ? (
                    <img src={getProjectImageUrl(selectedProject) || ''} alt={selectedProject.title} className="w-full h-72 lg:h-80 object-cover" />
                  ) : (
                    <div className="w-full h-72 lg:h-80 flex items-center justify-center bg-gray-100">
                      <Target className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0">
                    <div className="bg-white/50 backdrop-blur-sm p-3">
                      <p className="text-sm lg:text-base leading-relaxed font-medium whitespace-pre-line text-gray-900">
                        {selectedProject.missionStatement || selectedProject.description || "Supporting sustainable livelihoods and community development."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
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
