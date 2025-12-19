import { useAuth } from "@/hooks/use-auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { UserImpact, Project, UserImpactHistory } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { ImpactStats } from "@/components/dashboard/impact-stats";
import { ImpactChart } from "@/components/dashboard/impact-chart";
import { Helmet } from "react-helmet";
import { useLocation, Link } from "wouter";
import { LanguageLink } from "@/components/ui/language-link";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Sparkles, Heart, Search, BarChart3, ChevronDown, Target, GraduationCap, Droplets, Leaf, Wind, Users, ArrowRight, Gift, Mail, Loader2, Share2, Info, Globe } from "lucide-react";
import { triggerConfetti } from "@/lib/confetti";
import ExpandableGallery from "@/components/ui/gallery-animation";
import { getProjectImageUrl, getLogoUrl } from "@/lib/image-utils";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useI18n } from "@/lib/i18n/i18n-context";
import { formatCurrency, formatNumber } from "@/lib/i18n/formatters";
import { getProjectImpactUnit, getProjectImpactNoun, getProjectImpactVerb, getRewardTitle } from "@/lib/i18n/project-content";
import { calculateImpactUnified, generateCtaText } from "@/lib/impact-calculator";
import { ImpactSummaryModal } from "@/components/dashboard/impact-summary-modal";
import { ImpactShareCard } from "@/components/dashboard/impact-share-card";


export default function DashboardV2() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const { t } = useTranslation();
  const { language } = useI18n();
  
  // Refresh user data when component mounts (especially after auth redirect)
  useEffect(() => {
    // Invalidate user queries to ensure navbar gets updated user info
    queryClient.invalidateQueries({ queryKey: ["/api/user"] });
  }, []); // Empty deps - only run once on mount
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
  const [showWaitlistDialog, setShowWaitlistDialog] = useState(false);
  const initializedRef = useRef<number | null>(null);

  // Newsletter signup state
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [isNewsletterSubscribed, setIsNewsletterSubscribed] = useState(false);
  const [isNewsletterLoading, setIsNewsletterLoading] = useState(false);
  
  // Impact Summary Modal state
  const [showImpactSummaryModal, setShowImpactSummaryModal] = useState(false);
  const [showShareCard, setShowShareCard] = useState(false);
  const [selectedStat, setSelectedStat] = useState<any>(null);
  
  // Tooltip state management - COMMENTED OUT (not needed)
  // const [currentTooltip, setCurrentTooltip] = useState<number | null>(null);
  // const tooltip1Shown = useRef(false);
  // const tooltip2Shown = useRef(false);
  // const tooltip3Shown = useRef(false);

  // Check for success parameters in URL and new user flags
  useEffect(() => {
    // SAFEGUARD: If user has pendingSupportReturnUrl, redirect them to support page
    // This handles cases where auth-callback might not have run or flag wasn't checked
    // Check IMMEDIATELY, even before user is available (user might load after)
    const pendingSupportReturnUrl = sessionStorage.getItem('pendingSupportReturnUrl');
    
    console.log('[Dashboard V2] 🔍 SAFEGUARD CHECK:', {
      pendingSupportReturnUrl,
      hasUser: !!user,
      userId: user?.id,
      currentUrl: window.location.href,
      allSessionStorage: {
        pendingSupportReturnUrl: sessionStorage.getItem('pendingSupportReturnUrl'),
        pendingSupportAmount: sessionStorage.getItem('pendingSupportAmount'),
        isNewUser: sessionStorage.getItem('isNewUser'),
        checkNewUser: sessionStorage.getItem('checkNewUser')
      }
    });
    
    if (pendingSupportReturnUrl) {
      // Check if we're already on the support page to prevent infinite redirect loop
      const currentPath = window.location.pathname;
      const supportPath = pendingSupportReturnUrl.startsWith('http') 
        ? new URL(pendingSupportReturnUrl).pathname 
        : pendingSupportReturnUrl.split('?')[0]; // Remove query params for comparison
      
      if (currentPath === supportPath || currentPath.startsWith('/support/')) {
        // Already on support page, just clear the flag to prevent loop
        console.log('[Dashboard V2] ⚠️ Already on support page, clearing pendingSupportReturnUrl to prevent loop');
        sessionStorage.removeItem('pendingSupportReturnUrl');
        sessionStorage.removeItem('pendingSupportAmount');
        return; // Don't redirect, we're already here
      }
      
      // Don't wait for user - redirect immediately if flag exists
      console.log('[Dashboard V2] ✅✅✅ SAFEGUARD TRIGGERED: Found pendingSupportReturnUrl, redirecting to support page:', pendingSupportReturnUrl);
      sessionStorage.removeItem('pendingSupportReturnUrl');
      sessionStorage.removeItem('pendingSupportAmount');
      const fullUrl = pendingSupportReturnUrl.startsWith('http') 
        ? pendingSupportReturnUrl 
        : `${window.location.origin}${pendingSupportReturnUrl}`;
      console.log('[Dashboard V2] ✅✅✅ Redirecting to:', fullUrl);
      window.location.href = fullUrl;
      return; // Exit early to prevent other logic from running
    }
    
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
    
    // DEBUG: Log sessionStorage flags for troubleshooting
    console.log('[Dashboard V2] SessionStorage flags:', {
      checkNewUser: sessionStorage.getItem('checkNewUser'),
      isNewUser: sessionStorage.getItem('isNewUser'),
      newUserParam: newUser,
      previewEnabled
    });
    
    if (status === 'success' && amount) {
      setDonationAmount(parseFloat(amount));
      setShowSuccessModal(true);
      
      // Clean up URL parameters
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
    
    // Check for new user welcome (triggered by URL param or checkNewUser flag from auth callback)
    const checkNewUser = sessionStorage.getItem('checkNewUser') === 'true';
    if (newUser === '1' || checkNewUser) {
      // DO NOT remove the flag here - it's needed for the modal check below
      // The flag will be removed in the modal useEffect after the modal is shown
      
      console.log('[Dashboard V2] Detected new user in preview mode → checking impact data');
      sessionStorage.setItem('signupFirstFlow', 'true');
      setSignupFirstFlow(true);
      // Welcome modal will be shown after impact data loads (see useEffect below)
    }
  }, [previewEnabled, user?.id]); // Only depend on user?.id, not the whole user object
  
  const { data: impact, error: impactError } = useQuery<UserImpact>({
    queryKey: ["/api/user/impact"],
    retry: 1, // Retry once in case of temporary errors
    retryDelay: 1000,
  });
  
  // Safety check: if query failed, impact could be an error object
  // If API returns 404, treat as new user with default values (user not in database yet, trigger will create it)
  // IMPORTANT: Memoize safeImpact to prevent infinite loops in useEffect dependencies
  // The fallback object creates a new reference on every render, so we need useMemo
  const safeImpact = useMemo(() => {
    return impactError 
      ? (impactError?.message?.includes('404') || impactError?.message?.includes('User not found')
          ? { impactPoints: 50, projectsSupported: 0, amountDonated: 0, impactPointsChange: 0, amountDonatedChange: 0, projectsSupportedChange: 0, userLevel: 'aspirer', welcome_shown: false, welcome_bonus_applied: false } as UserImpact & { welcome_shown?: boolean; welcome_bonus_applied?: boolean; userStatus?: string }
          : undefined)
      : impact;
  }, [impact, impactError]);

  // Check and apply welcome bonus transaction if needed (one-time check)
  useEffect(() => {
    if (!user || !safeImpact) return;
    
    const impactPoints = safeImpact.impactPoints ?? 0;
    const projectsSupported = safeImpact.projectsSupported ?? 0;
    
    // Check if user qualifies for welcome bonus:
    // 1. Has exactly 50 points (from trigger) - record transaction
    // 2. Has 0 points and 0 donations - new user, give bonus and record transaction
    const isNewUser = impactPoints === 0 && projectsSupported === 0;
    const hasWelcomeBonus = impactPoints === 50;
    
    if (isNewUser || hasWelcomeBonus) {
      const welcomeBonusChecked = sessionStorage.getItem('welcomeBonusChecked');
      
      if (!welcomeBonusChecked) {
        // Mark as checked immediately to prevent duplicate calls
        sessionStorage.setItem('welcomeBonusChecked', 'true');
        
        // Get auth token and call welcome bonus endpoint
        supabase.auth.getSession().then(({ data: { session } }) => {
          const token = session?.access_token;
          
          if (token) {
            console.log('[Dashboard V2] User qualifies for welcome bonus (points:', impactPoints, ', donations:', projectsSupported, '), checking welcome bonus transaction...');
            
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
                // Invalidate queries to refresh impact data after bonus is applied
                // DON'T reload - let the modal stay open and user can close it manually
                // The impact query will refresh automatically via React Query
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
  }, [user?.id, safeImpact]); // Use memoized safeImpact to preserve 404 fallback logic

  const displayName = user?.firstName || user?.username || (user?.email ? user.email.split('@')[0] : "Supporter");
  // Use actual impact points from API
  const impactPoints = safeImpact?.impactPoints ?? 0;
  // Determine user status: 100+ Impact Points = Changemaker, otherwise Aspirer
  // PRIORITY: Calculate based on impactPoints first, then fall back to API value
  // This ensures correct status even if API returns stale data
  const userStatus = impactPoints >= 100 ? "changemaker" : ((safeImpact as any)?.userStatus || safeImpact?.userLevel || "aspirer");
  const statusDisplayName = userStatus === "changemaker" ? "Changemaker" : "Impact Aspirer";
  
  // DEBUG: Log status calculation for troubleshooting
  if (safeImpact && impactPoints >= 100) {
    console.log('[Dashboard V2] Status calculation:', {
      impactPoints,
      apiUserStatus: (safeImpact as any)?.userStatus,
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

  // Check if user is new and show welcome modal (using backend welcome_shown flag)
  useEffect(() => {
    console.log('[Dashboard V2] Welcome hook EFFECT RUNNING', { 
      hasUser: !!user, 
      userId: user?.id, 
      hasSafeImpact: !!safeImpact,
      url: window.location.href
    });
    
    if (!user || !user.id) {
      console.log('[Dashboard V2] Welcome hook: No user, skipping');
      return;
    }
    
    // Get backend welcome_shown flag (source of truth - works across devices/browsers)
    const backendWelcomeShown = (safeImpact as any)?.welcome_shown === true;
    
    // Fallback to localStorage/sessionStorage if backend flag not available yet
    const emailKey = user.email ? user.email.toLowerCase() : null;
        const welcomeModalKey = `welcomeModalShown_${user.id}`;
    const welcomeModalEmailKey = emailKey ? `welcomeModalShown_${emailKey}` : null;
    const welcomeShownPersistent =
      localStorage.getItem(welcomeModalKey) === 'true' ||
      (welcomeModalEmailKey ? localStorage.getItem(welcomeModalEmailKey) === 'true' : false);
        const welcomeShownSession = sessionStorage.getItem('welcomeModalShown') === 'true';
    const localWelcomeShown = welcomeShownPersistent || welcomeShownSession;
        
    // Use backend flag as source of truth, fallback to local storage
    const welcomeShown = backendWelcomeShown || localWelcomeShown;
    
    // Check for registration flags (indicates this is a new user registration, not just login)
    const checkNewUser = sessionStorage.getItem('checkNewUser') === 'true';
    const isNewUserFlag = sessionStorage.getItem('isNewUser') === 'true';
    const urlParams = new URLSearchParams(window.location.search);
    const newUserParam = urlParams.get('newUser');
    const hasRegistrationFlag = checkNewUser || isNewUserFlag || newUserParam === '1';
    
    // Don't show welcome modal if user has already made a donation
    // (they've already engaged with the platform)
    // Also check URL for donation success parameter (indicates donation was just made)
    const donationSuccess = urlParams.get('status') === 'success';
    const hasDonated = safeImpact && (
      (safeImpact.projectsSupported ?? 0) > 0 || 
      (safeImpact.amountDonated ?? 0) > 0
    ) || donationSuccess; // If donation success param exists, don't show modal
    
    // DEBUG: Log all conditions for troubleshooting
    const allSessionStorage = {
      isNewUser: sessionStorage.getItem('isNewUser'),
      checkNewUser: sessionStorage.getItem('checkNewUser'),
      welcomeModalShown: sessionStorage.getItem('welcomeModalShown'),
      welcomeModalClosed: sessionStorage.getItem('welcomeModalClosed'),
      signupFirstFlow: sessionStorage.getItem('signupFirstFlow')
    };
    console.log('[Dashboard V2] 📋 SessionStorage state:', allSessionStorage);
    console.log('[Dashboard V2] Welcome modal check:', {
      userId: user.id,
      userEmail: user.email,
      backendWelcomeShown,
      localWelcomeShown,
      welcomeShown,
      hasRegistrationFlag,
      hasDonated,
      donationSuccess,
      projectsSupported: safeImpact?.projectsSupported ?? 0,
      amountDonated: safeImpact?.amountDonated ?? 0,
      checkNewUser,
      isNewUserFlag,
      newUserParam,
      safeImpactAvailable: !!safeImpact,
      currentUrl: window.location.href
    });
    
    // Helper: if backend flags might be stale in safeImpact, re-check directly before showing
    const ensureBackendFlags = async (): Promise<boolean> => {
      if (!hasRegistrationFlag || welcomeShown) return welcomeShown;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (!token) return welcomeShown;

        const res = await fetch('/api/user/impact', {
          method: 'GET',
          credentials: 'include',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) return welcomeShown;
        const data = await res.json();
        const backendFlag = data?.welcome_shown === true;
        
        // Also check if user has made donations (prevents modal after donation)
        const hasDonations = (data?.projectsSupported ?? 0) > 0 || (data?.amountDonated ?? 0) > 0;
        
        if (backendFlag) {
          console.log('[Dashboard V2] ensureBackendFlags: Backend flag shows welcome already displayed');
          // Sync local caches so this browser won't show again
          try {
            localStorage.setItem(welcomeModalKey, 'true');
            if (welcomeModalEmailKey) localStorage.setItem(welcomeModalEmailKey, 'true');
          } catch {
            sessionStorage.setItem('welcomeModalShown', 'true');
          }
          return true;
        }
        
        if (hasDonations) {
          console.log('[Dashboard V2] ensureBackendFlags: User has donations, preventing welcome modal', {
            projectsSupported: data?.projectsSupported ?? 0,
            amountDonated: data?.amountDonated ?? 0
          });
          // Sync local caches so this browser won't show again
          try {
            localStorage.setItem(welcomeModalKey, 'true');
            if (welcomeModalEmailKey) localStorage.setItem(welcomeModalEmailKey, 'true');
          } catch {
            sessionStorage.setItem('welcomeModalShown', 'true');
          }
          return true;
        }
      } catch (err) {
        console.warn('[Dashboard V2] ensureBackendFlags error:', err);
      }
      return welcomeShown;
    };

    const shouldShowModal = !welcomeShown && hasRegistrationFlag && !hasDonated;
    
    if (shouldShowModal) {
      // Before showing, double-check backend flags to handle cross-browser/provider cases
      ensureBackendFlags().then((backendSaysShown) => {
        if (backendSaysShown) {
          console.log('[Dashboard V2] ❌ Modal not shown: Backend flags show welcome already displayed (post-check)');
          return;
        }
        // Proceed to show modal
      console.log('[Dashboard V2] ✅ New user detected → showing modal', {
          reason: 'registration flag present and welcome not shown',
          backendWelcomeShown,
          localWelcomeShown,
          hasRegistrationFlag
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
      
        // Show welcome modal IMMEDIATELY
      setSignupWelcomeStep(1);
      setShowWelcomeModal(true);
      
        // Mark welcome as shown in backend (cross-device persistence)
        supabase.auth.getSession().then(({ data: { session } }) => {
          const token = session?.access_token;
          if (token) {
            fetch('/api/user/mark-welcome-shown', {
              method: 'POST',
              credentials: 'include',
              headers: {
                'Authorization': `Bearer ${token}`
              }
            }).then(async res => {
              if (res.ok) {
                console.log('[Dashboard V2] ✅ Welcome modal marked as shown in backend');
              } else {
                console.warn('[Dashboard V2] ⚠️ Failed to mark welcome as shown in backend:', res.status);
              }
            }).catch(err => {
              console.warn('[Dashboard V2] ⚠️ Error marking welcome as shown:', err);
            });
          }
        }).catch(err => {
          console.warn('[Dashboard V2] Failed to get session for mark-welcome-shown:', err);
        });

        // Also set localStorage fallback (for performance - avoids API call on next load)
      try {
        localStorage.setItem(welcomeModalKey, 'true');
          if (welcomeModalEmailKey) localStorage.setItem(welcomeModalEmailKey, 'true');
          console.log('[Dashboard V2] Saved welcome modal flag to localStorage (fallback):', welcomeModalKey, welcomeModalEmailKey);
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
        announcement.textContent = t("dashboard.welcomeTitle");
        document.body.appendChild(announcement);
        
          // Trigger confetti in background
        triggerConfetti(() => {
          setTimeout(() => announcement.remove(), 1000);
        });
      }
      });
    } else {
      // DEBUG: Log why modal is NOT showing
        if (welcomeShown) {
        console.log('[Dashboard V2] ❌ Modal not shown: Welcome modal was already shown', {
          backendWelcomeShown,
          localWelcomeShown
          });
      } else if (hasDonated) {
        console.log('[Dashboard V2] ❌ Modal not shown: User has already made a donation', {
          projectsSupported: safeImpact?.projectsSupported ?? 0,
          amountDonated: safeImpact?.amountDonated ?? 0,
          donationSuccess
        });
      } else if (!hasRegistrationFlag) {
        console.log('[Dashboard V2] ❌ Modal not shown: No registration flags (existing user logging in, not new registration)');
      }
    }
  }, [user?.id, safeImpact]); // Use memoized safeImpact to preserve 404 fallback logic

  // Track dashboard view
  useEffect(() => {
    if (user?.id && safeImpact) {
      const points = safeImpact.impactPoints ?? 0;
      const supports = safeImpact.projectsSupported ?? 0;
      const isNew = points === 50 && supports === 0;
      trackEvent('dashboard_view', 'engagement', 'dashboard-v2', points);
      // Also push to dataLayer for GA4
      if (typeof window !== 'undefined' && window.dataLayer) {
        window.dataLayer.push({
          event: 'dashboard_view',
          user_id: user.id,
          impact_points: points,
          supports_count: supports,
          user_is_new: isNew
        });
      }
    }
  }, [user?.id, safeImpact]); // Use memoized safeImpact for consistency

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
  // Exclude Universal Fund projects (is_universal_fund = true)
  const { data: featuredProjects, isLoading: isLoadingFeatured } = useQuery<Project[]>({
    queryKey: ["dashboard-v2-featured-projects"],
    queryFn: async () => {
      // Try with created_at first (snake_case)
      let { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('status', 'active')
        .eq('featured', true)
        .or('is_universal_fund.is.null,is_universal_fund.eq.false')
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
          .or('is_universal_fund.is.null,is_universal_fund.eq.false')
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
  const [visibleCount, setVisibleCount] = useState(3);
  const INITIAL_COUNT = 3;
  const LOAD_MORE_COUNT = 3;

  // Load More state for Rewards
  const [visibleRewardsCount, setVisibleRewardsCount] = useState(3);
  const INITIAL_REWARDS_COUNT = 3;
  const LOAD_MORE_REWARDS_COUNT = 3;

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
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: false,
  });

  // Check if user has redemptions (similar to hasSupported for projects)
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

  // Debug: Log redemptions state
  useEffect(() => {
    console.log('[Dashboard] Redemptions State:', {
      isLoading: isLoadingRedemptions,
      hasRedemptions,
      redemptionsCount: redemptionsWithRewards?.length || 0,
      redemptionsData: redemptionsWithRewards
    });
  }, [redemptionsWithRewards, isLoadingRedemptions, hasRedemptions]);

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
    if (!project) return [] as { donation: number; unit: string; points: number }[];
    const tiers: { donation: number; unit: string; points: number }[] = [];
    for (let i = 1; i <= 7; i++) {
      const donation = project[`donation_${i}` as keyof Project] as unknown as number;
      const impactUnit = project.impactUnit as string;
      if (donation) {
        tiers.push({ donation, unit: impactUnit || 'impact created', points: donation * 10 });
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

  // Normalize project (snake_case -> camelCase) for impact data
  const normalizeProjectLocal = (project: Project | null) => {
    if (!project) return null;
    return {
      ...project,
      impactFactor: (project as any).impact_factor ?? project.impactFactor,
      impactUnitSingularEn: (project as any).impact_unit_singular_en ?? project.impactUnitSingularEn,
      impactUnitPluralEn: (project as any).impact_unit_plural_en ?? project.impactUnitPluralEn,
      impactUnitSingularDe: (project as any).impact_unit_singular_de ?? project.impactUnitSingularDe,
      impactUnitPluralDe: (project as any).impact_unit_plural_de ?? project.impactUnitPluralDe,
      ctaTemplateEn: (project as any).cta_template_en ?? project.ctaTemplateEn,
      ctaTemplateDe: (project as any).cta_template_de ?? project.ctaTemplateDe,
      pastTemplateEn: (project as any).past_template_en ?? project.pastTemplateEn,
      pastTemplateDe: (project as any).past_template_de ?? project.pastTemplateDe,
      impactTiers: (project as any).impact_tiers ?? project.impactTiers,
      impactPointsMultiplier: (project as any).impact_points_multiplier ?? project.impactPointsMultiplier,
    } as Project;
  };

  const hasImpactDataLocal = (project: Project | null) => {
    if (!project) return false;
    const tiers = (project.impactTiers as any[]) || [];
    const hasTiers = Array.isArray(tiers) && tiers.length > 0;
    if (hasTiers) {
      return !!(
        project.impactUnitSingularEn &&
        project.impactUnitPluralEn &&
        project.impactUnitSingularDe &&
        project.impactUnitPluralDe &&
        tiers.some((t: any) => t && t.impact_factor != null && t.cta_template_en && t.cta_template_de && t.past_template_en && t.past_template_de)
      );
    }
    return !!(
      project.impactFactor != null &&
      project.impactUnitSingularEn &&
      project.impactUnitPluralEn &&
      project.impactUnitSingularDe &&
      project.impactUnitPluralDe &&
      project.ctaTemplateEn &&
      project.ctaTemplateDe &&
      project.pastTemplateEn &&
      project.pastTemplateDe
    );
  };

  // Donation tiers for selected project
  const availableTiers = getAvailableTiers(selectedProject);
  const fallbackDonations = [10, 25, 50, 100];
  const donationOptions = availableTiers.length > 0 ? availableTiers.map(t => t.donation) : fallbackDonations;
  
  // Initialize donation amount when project is selected
  useEffect(() => {
    if (selectedProject && initializedRef.current !== selectedProject.id) {
      if (availableTiers.length > 0) {
        setGalleryDonationAmount(availableTiers[0].donation);
      } else {
        setGalleryDonationAmount(fallbackDonations[2]); // default to 50 if no tiers
      }
      initializedRef.current = selectedProject.id;
    }
  }, [selectedProject, availableTiers]);
  
  const currentTier = availableTiers.find(t => t.donation === galleryDonationAmount) || availableTiers[0];
  const normalizedProject = normalizeProjectLocal(selectedProject);
  const hasImpactForPopup = hasImpactDataLocal(normalizedProject);
  
  // Impact calculation (new unified logic, no fallback to old verb/noun)
  const impactResult = normalizedProject && hasImpactForPopup
    ? calculateImpactUnified(normalizedProject, galleryDonationAmount || 0, language === 'de' ? 'de' : 'en')
    : null;
  
  // Try to generate CTA text from templates (new system)
  const generatedCtaText = normalizedProject && impactResult
    ? generateCtaText(normalizedProject, galleryDonationAmount || 0, impactResult, language === 'de' ? 'de' : 'en')
    : null;
  
  // Parse generated text to extract impact+unit and freitext separately
  const parseCtaText = (text: string, lang: 'en' | 'de') => {
    if (lang === 'de') {
      const match = text.match(/und hilf (.+?) — verdiene/);
      if (match) {
        const impactAndFreitext = match[1];
        const impactMatch = impactAndFreitext.match(/^(\d+(?:\.\d+)?)\s+([^\s]+)\s+(.+)$/);
        if (impactMatch) {
          return {
            impact: impactMatch[1],
            unit: impactMatch[2],
            freitext: impactMatch[3]
          };
        }
      }
    } else {
      const match = text.match(/and help (.+?) — earn/);
      if (match) {
        const impactAndFreitext = match[1];
        const impactMatch = impactAndFreitext.match(/^(\d+(?:\.\d+)?)\s+([^\s]+)\s+(.+)$/);
        if (impactMatch) {
          return {
            impact: impactMatch[1],
            unit: impactMatch[2],
            freitext: impactMatch[3]
          };
        }
      }
    }
    return null;
  };
  
  // Display values (only if impact data available)
  const impactAmount = impactResult
    ? (impactResult.impact % 1 === 0 ? impactResult.impact.toString() : impactResult.impact.toFixed(2))
    : '0';
  const impactUnit = impactResult?.unit || 'impact units';
  const galleryImpactPoints = selectedProject
    ? Math.floor((selectedProject.impactPointsMultiplier ?? (selectedProject as any)?.impact_points_multiplier ?? 10) * (galleryDonationAmount || 0))
    : 0;
  const parsedCta = generatedCtaText ? parseCtaText(generatedCtaText, language === 'de' ? 'de' : 'en') : null;
  const unitDisplayed = parsedCta?.unit || impactResult?.unit || impactUnit;
  const impactDisplayed = parsedCta?.impact || impactAmount;

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
              {t("dashboard.welcomeBack")}
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
                  {t("dashboard.receivedImpactPoints", { points: formatNumber(impactPoints), value: formatCurrency(pointsValue, language) })}
                </p>
                <p className="text-xs text-gray-500">
                  {t("dashboard.supportToUnlock")}
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
                    {t("dashboard.progressToReward", { 
                      current: formatNumber(impactPoints), 
                      total: formatNumber(pointsToFirstReward), 
                      percent: Math.round(progressToReward) 
                    })}
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
                  {t("dashboard.supportAProject")}
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
                  {t("dashboard.supportAProject")}
                </Button>
              </div>

              {/* Secondary CTA - Get rewards */}
              <Button
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
                onClick={handleRedeemClick}
              >
                {t("dashboard.getRewards")}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Stat boxes - directly under overview bar */}
      <div className="mb-6" style={{ marginTop: '24px' }}>
        <ImpactStats />
      </div>

      {/* Section 1: Social Enterprises - Two Column Layout */}
      <div className="mb-6" style={{ marginTop: '24px' }}>
        {/* Main Headline - Outside the box */}
        <h2 className="text-2xl font-bold text-dark font-heading mb-6 uppercase">{t("dashboard.socialEnterprises")}</h2>
        
        {/* White background box */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          {/* Two Column Grid: Left (50%) - Personal Content, Right (50%) - Highlighted */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT COLUMN (50%) - User-centric / Primary Content */}
          <div>
            <h3 className="text-lg font-semibold text-dark font-heading mb-6">{t("dashboard.yourSupport")}</h3>
            {!hasSupported ? (
              // NEW USERS: Empty state (matching Rewards section style exactly)
              <div className="p-8 text-center bg-gray-50 rounded-lg border border-gray-200">
                <div className="max-w-sm mx-auto">
                  <Globe className="w-10 h-10 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {t("dashboard.noStartupsSupported")}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {t("dashboard.supportToUnlock")}
                  </p>
                  <Button
                    className="bg-[#f2662d] hover:bg-[#d9551f] text-white font-semibold"
                    style={{ backgroundColor: '#f2662d' }}
                    onClick={() => handleSupportClick('empty-state')}
                  >
                    {t("dashboard.supportAProject")}
                  </Button>
                    </div>
              </div>
            ) : (
              // RETURNING USERS: Personal activity list
            <div>
            {isLoadingSupported ? (
              <div className="space-y-3">
                    {Array(3).fill(0).map((_, i) => (
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
                {supportedProjectsWithDonations.slice(0, visibleCount).map((item) => {
                      const { project, totalAmount, totalImpactPoints, donationCount, lastDonationDate, donations } = item;
                  
                  const impactUnit = getProjectImpactUnit(project, language) || 'impact';
                  const impactVerb = getProjectImpactVerb(project, language) || 'created';
                  const impactNoun = getProjectImpactNoun(project, language) || impactUnit;
                  
                      // Calculate real impact by summing impact from each donation
                      // Priority: Use snapshot first, then calculateImpactUnified (migration pattern)
                      let totalRealImpact = 0;
                      if (donations && donations.length > 0) {
                        // Sum impact from each individual donation
                        totalRealImpact = donations.reduce((sum, donation) => {
                          const donationAmount = donation.amount || 0;
                          if (donationAmount > 0) {
                            let calculatedImpact: number;
                            
                            // Priority 1: Use calculated_impact from snapshot (new donations)
                            if (donation.calculated_impact != null) {
                              calculatedImpact = Number(donation.calculated_impact);
                            } 
                            // Priority 2: Fallback to calculateImpactUnified (old donations or new without snapshot)
                            else {
                              const impactResult = calculateImpactUnified(project, donationAmount, language === 'de' ? 'de' : 'en');
                              calculatedImpact = impactResult.impact;
                            }
                            
                            return sum + calculatedImpact;
                          }
                          return sum;
                        }, 0);
                      } else {
                        // Fallback: use totalAmount to calculate impact (if donations array not available)
                        const impactResult = calculateImpactUnified(project, totalAmount, language === 'de' ? 'de' : 'en');
                        totalRealImpact = impactResult.impact || 0;
                      }
                      
                      const impactAmount = Math.round(totalRealImpact);
                  
                  const projectImageUrl = getProjectImageUrl(project) || project.imageUrl || '/placeholder-project.png';
                  const formattedDate = lastDonationDate 
                    ? new Date(lastDonationDate).toLocaleDateString(language === 'de' ? 'de-CH' : 'en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })
                    : t("dashboard.notAvailable");
                  
                  return (
                    <div 
                      key={project.id}
                      className="flex items-stretch rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all bg-white group overflow-hidden"
                    >
                          {/* Left side: Main image (no space on top, bottom, left) */}
                      <div className="flex-shrink-0">
                        <img 
                          src={projectImageUrl}
                          alt={project.title}
                              className="w-36 h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder-project.png';
                          }}
                        />
                      </div>
                      
                          {/* Right side: Name + 3 columns */}
                          <div className="flex-1 min-w-0 flex flex-col gap-2.5 p-3">
                            {/* Top: Name with link (spans whole width) */}
                            <LanguageLink href={`/project/${project.slug || project.id}`}>
                              <h4 className="text-base font-semibold text-gray-900 hover:text-[#f2662d] transition-colors group-hover:text-[#f2662d] w-full">
                            {project.title}
                          </h4>
                        </LanguageLink>
                        
                            {/* Bottom: 2 columns with small headlines and numbers */}
                            <div className="grid grid-cols-2 gap-6">
                              {/* Column 1: Support Amount */}
                              <div>
                                <div className="text-xs text-gray-500 mb-1.5">
                                  {t("dashboard.supportAmount")}
                                </div>
                                <div className="text-lg font-bold text-gray-900">
                                  ${formatNumber(totalAmount)}
                        </div>
                      </div>
                      
                              {/* Column 2: Impact Points */}
                              <div>
                                <div className="text-xs text-gray-500 mb-1.5">
                                  {t("dashboard.impactPoints")}
                          </div>
                                <div className="text-lg font-bold text-[#f2662d]">
                                  {formatNumber(totalImpactPoints)}
                                </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {visibleCount < supportedProjectsWithDonations.length && (
                  <Button
                    variant="outline"
                    onClick={() => setVisibleCount(prev => prev + LOAD_MORE_COUNT)}
                    className="w-full mt-4"
                  >
                    {t("dashboard.loadMore", { remaining: supportedProjectsWithDonations.length - visibleCount })}
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-6 bg-white rounded-lg shadow-sm">
                <p className="text-neutral">{t("dashboard.noStartupsSupported")}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN (50%) - Highlighted Social Enterprises */}
          <div>
            <h3 className="text-lg font-semibold text-dark font-heading mb-6">{t("dashboard.highlightedSocialEnterprises")}</h3>
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
                <p className="text-neutral">{t("dashboard.noFeaturedAvailable")}</p>
              </div>
            )}
          </div>
        </div>
        </div>
      </div>

      {/* Section 2: Rewards - Two Column Layout */}
      <div className="mb-6" style={{ marginTop: '24px' }}>
        {/* Main Headline - Outside the box */}
        <h2 className="text-2xl font-bold text-dark font-heading mb-6 uppercase">{t("dashboard.rewards")}</h2>
        
        {/* White background box */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          {/* Two Column Grid: Left (50%) - Empty/Placeholder, Right (50%) - Featured Rewards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT COLUMN (50%) - User's redeemed rewards */}
            <div>
            <h3 className="text-lg font-semibold text-dark font-heading mb-6">{t("dashboard.unlockedSurprises")}</h3>
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
            ) : hasRedemptions && redemptionsWithRewards && redemptionsWithRewards.length > 0 ? (
                <div className="space-y-3">
                  {redemptionsWithRewards.slice(0, visibleRewardsCount).map((item, index) => {
                    const { reward, pointsSpent, redemptionDate, status } = item;
                    
                  if (!reward) return null;
                    
                    const rewardImageUrl = reward.imageUrl || reward.image_url || '/placeholder-reward.png';
                    const formattedDate = redemptionDate 
                      ? new Date(redemptionDate).toLocaleDateString(language === 'de' ? 'de-CH' : 'en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })
                      : t("dashboard.notAvailable");
                    
                  // Calculate days since redemption (14 days expiry)
                  const daysSinceRedemption = redemptionDate 
                    ? Math.floor((new Date().getTime() - new Date(redemptionDate).getTime()) / (1000 * 60 * 60 * 24))
                    : null;
                  const isCodeExpired = daysSinceRedemption !== null && daysSinceRedemption >= 14;
                  const daysRemaining = daysSinceRedemption !== null ? Math.max(0, 14 - daysSinceRedemption) : null;
                  
                    return (
                      <div 
                        key={`${item.redemption.id || index}`}
                      className="flex flex-col md:flex-row items-stretch rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all bg-white group overflow-hidden"
                      >
                      <div className="flex-shrink-0 md:w-28 w-full h-32 md:h-auto">
                          <img 
                            src={rewardImageUrl}
                          alt={getRewardTitle(reward, language)}
                          className="w-full h-full md:w-28 md:h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder-reward.png';
                            }}
                          />
                        </div>
                        
                      <div className="flex-1 min-w-0 p-3 flex flex-col justify-center">
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
                          
                        <h4 className="text-base font-semibold text-gray-900 mb-2">
                              {getRewardTitle(reward, language)}
                            </h4>
                          
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3 md:mb-0">
                            <span>{pointsSpent} points</span>
                            <span>•</span>
                            <span>{formattedDate}</span>
                          </div>
                        </div>
                        
                      <div className="flex-shrink-0 p-3 md:p-4 flex flex-row md:flex-col justify-between md:justify-center items-center md:items-end border-t md:border-t-0 md:border-l border-gray-200 md:min-w-[180px] w-full md:w-auto">
                        <div className="text-left md:text-right">
                          {/* Only show code if less than 14 days old */}
                          {!isCodeExpired ? (
                            <>
                            <div className="mb-2">
                                <span className="text-lg md:text-xl font-bold text-gray-900 font-mono">
                                  {(reward as any).promo_code || (reward as any).promoCode || 'N/A'}
                              </span>
                            </div>
                              <div className="text-sm text-gray-600 font-medium mb-1">
                                {t("dashboard.code")}
                            </div>
                              {/* Show days remaining - always show if code is not expired */}
                              {daysRemaining !== null && daysRemaining > 0 && daysRemaining <= 14 && (
                                <div className="text-xs text-gray-500 mb-1">
                                  {t("dashboard.codeExpiresIn", { days: daysRemaining })}
                                </div>
                              )}
                              {/* Company Link - only show if code is not expired */}
                              {((reward as any).rewardLink || (reward as any).reward_link) && (
                                <a
                                  href={(reward as any).rewardLink || (reward as any).reward_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-[#f2662d] hover:text-[#d9551f] hover:underline inline-block"
                                >
                                  {t("dashboard.redeem")}
                                </a>
                              )}
                            </>
                          ) : (
                            /* Code expired - show notice with info icon */
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-start gap-2">
                              <Info className="h-4 w-4 text-gray-600 flex-shrink-0 mt-0.5" />
                              <div className="flex-1">
                                <p className="text-xs font-medium text-gray-900 mb-1">
                                  {t("dashboard.codeNotAvailable")}
                                </p>
                                <p className="text-xs text-gray-600">
                                  {t("dashboard.codeNotAvailableExplanation")}
                                </p>
                              </div>
                            </div>
                          )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
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
            ) : !hasRedemptions && impactPoints > 0 ? (
              // User has points but hasn't unlocked any rewards yet
              <div className="p-8 text-center bg-gray-50 rounded-lg border border-gray-200">
                <div className="max-w-sm mx-auto">
                  <Gift className="w-10 h-10 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {t("dashboard.noRewardsUnlocked")}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {t("dashboard.useImpactPointsToUnlock")}
                  </p>
                  <Button
                    className="bg-[#f2662d] hover:bg-[#d9551f] text-white font-semibold"
                    style={{ backgroundColor: '#f2662d' }}
                    onClick={handleRedeemClick}
                  >
                    {t("dashboard.getRewards")}
                  </Button>
                </div>
              </div>
            ) : (
              // New user with no points
              <div className="p-8 text-center bg-gray-50 rounded-lg border border-gray-200">
                <div className="max-w-sm mx-auto">
                  <Gift className="w-10 h-10 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 text-sm">
                    {t("dashboard.noRewardsRedeemed")}
                  </p>
                  <p className="text-gray-500 text-xs mt-2">
                    {t("dashboard.supportToUnlock")}
                  </p>
                </div>
                </div>
              )}
            </div>

          {/* RIGHT COLUMN (50%) - Featured Rewards */}
            <div>
            <h3 className="text-lg font-semibold text-dark font-heading mb-6">{t("dashboard.featuredRewards")}</h3>
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
                  <p className="text-neutral">{t("dashboard.noFeaturedRewards")}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Extra spacing before footer */}
      <div className="mb-16 md:mb-24"></div>
      
      <DonationSuccessModal 
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        amount={donationAmount}
      />
      
      {/* Project Detail Modal (like homepage) */}
      {selectedProject && hasImpactForPopup && (
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
                {t("homeSections.caseStudy.seeImpact")}
              </h3>
              <p className="text-base lg:text-lg text-gray-600">
                {t("homeSections.caseStudy.withProject")} {selectedProject.title}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 p-6 lg:p-12">
              <div className="space-y-8 order-2 lg:order-1">
                <div>
                  <div className="text-center lg:text-left">
                    {language === 'de' ? (
                      <p className="text-2xl lg:text-4xl font-semibold leading-[1.4] text-gray-900">
                        Unterstütze <span className="font-bold text-gray-900">{selectedProject.title}</span> mit{' '}
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
                              {donationOptions.map((amount) => (
                                <button key={amount} onClick={() => { setGalleryDonationAmount(amount); setShowDonationDropdown(false); }} className="w-full p-2 text-left hover:bg-gray-50 transition-colors min-h-[36px]">
                                  <span className="text-lg font-bold text-[#f2662d]">
                                    ${amount}
                                  </span>
                                </button>
                              ))}
                            </div>
                          )}
                        </span>{' '}und hilf{' '}
                        {generatedCtaText && parsedCta ? (
                          <>
                            <span className="font-bold text-[#f2662d]">{impactDisplayed} {unitDisplayed}</span>{' '}
                            <span className="font-bold text-gray-900">{parsedCta.freitext}</span>{' '}
                          </>
                        ) : (
                          <>
                            <span className="font-bold text-[#f2662d]">{impactDisplayed}</span>{' '}
                            <span className="font-bold text-[#f2662d]">{unitDisplayed}</span>{' '}
                          </>
                        )}
                        <span className="text-gray-600">—</span>{' '}
                        <span className="text-gray-600">{t("homeSections.caseStudy.earn").replace('— ', '')}</span>{' '}
                        <span className="font-bold text-gray-900">{galleryImpactPoints}</span>{' '}
                        <span className="text-gray-600">{t("homeSections.caseStudy.impactPoints")}</span>.
                      </p>
                    ) : (
                      <p className="text-2xl lg:text-4xl font-semibold leading-[1.4] text-gray-900">
                        Support <span className="font-bold text-gray-900">{selectedProject.title}</span> with{' '}
                        <span className="relative inline-block">
                          <button
                            onClick={() => setShowDonationDropdown(!showDonationDropdown)}
                            className="inline-flex items-center gap-1 border-b-2 border-dashed border-gray-300 hover-border-gray-400 transition-colors min-h-[48px] px-2 font-bold text-[#f2662d]"
                          >
                            ${galleryDonationAmount}
                            <ChevronDown className="h-5 w-5" />
                          </button>
                          {showDonationDropdown && (
                            <div className="absolute top-full left-0 mt-2 bg-white border rounded-lg shadow-lg z-10 min-w-[140px] border-gray-200">
                              {donationOptions.map((amount) => (
                                <button key={amount} onClick={() => { setGalleryDonationAmount(amount); setShowDonationDropdown(false); }} className="w-full p-2 text-left hover:bg-gray-50 transition-colors min-h-[36px]">
                                  <span className="text-lg font-bold text-[#f2662d]">
                                    ${amount}
                                  </span>
                                </button>
                              ))}
                            </div>
                          )}
                        </span>{' '}and help{' '}
                        {generatedCtaText && parsedCta ? (
                          <>
                            <span className="font-bold text-[#f2662d]">{impactDisplayed} {unitDisplayed}</span>{' '}
                            <span className="font-bold text-gray-900">{parsedCta.freitext}</span>{' '}
                          </>
                        ) : (
                          <>
                            <span className="font-bold text-[#f2662d]">{impactDisplayed}</span>{' '}
                            <span className="font-bold text-[#f2662d]">{unitDisplayed}</span>{' '}
                          </>
                        )}
                        <span className="text-gray-600">—</span>{' '}
                        <span className="text-gray-600">{t("homeSections.caseStudy.earn").replace('— ', '')}</span>{' '}
                        <span className="font-bold text-gray-900">{galleryImpactPoints}</span>{' '}
                        <span className="text-gray-600">{t("homeSections.caseStudy.impactPoints")}</span>.
                      </p>
                    )}
                  </div>

                  <div className="mt-8 lg:mt-10 text-center lg:text-left flex flex-col sm:flex-row gap-4">
                    <Button 
                      size="lg" 
                      variant="outline"
                      className="px-6 lg:px-8 py-3 lg:py-4 text-base lg:text-lg font-medium w-full sm:w-auto bg-white hover:bg-gray-50 border-gray-300"
                      style={{ color: '#1a1a3a' }}
                      asChild
                    >
                      <LanguageLink href={`/project/${selectedProject.slug || selectedProject.id}`}>
                        {t("homeSections.caseStudy.readMore")}
                      </LanguageLink>
                    </Button>
                    <Button 
                      size="lg" 
                      className="text-white px-6 lg:px-8 py-3 lg:py-4 text-base lg:text-lg font-medium w-full sm:w-auto" 
                      style={{ backgroundColor: '#f2662d' }}
                      onClick={() => {
                        if (previewEnabled && selectedProject?.slug) {
                          navigate(`/support/${selectedProject.slug}?previewOnboarding=1`);
                        } else {
                          setShowWaitlistDialog(true);
                        }
                      }}
                    >
                      {t("homeSections.caseStudy.supportThisProject")}
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

      {/* Waiting List Dialog */}
      <Dialog open={showWaitlistDialog} onOpenChange={setShowWaitlistDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">{t("projectDetail.waitlistTitle")}</DialogTitle>
            <DialogDescription className="text-center pt-4">
              {t("projectDetail.waitlistDescription")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-col gap-3 pt-4">
            <Button 
              onClick={() => {
                window.open("https://tally.so/r/m6MqAe", "_blank");
              }}
              className="w-full"
              style={{ backgroundColor: '#f2662d' }}
            >
              {t("projectDetail.joinWaitlist")}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowWaitlistDialog(false)}
              className="w-full"
            >
              {t("projectDetail.close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Signup-only Mini Gamification (new user registration) */}
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
            
            // Redirect to previewOnboarding page after welcome modal closes
            // This ensures user sees the full onboarding experience
            setTimeout(() => {
              navigate('/dashboard?previewOnboarding=1');
            }, 300);
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
                    <span className="text-5xl">🎉</span>
                  </div>
                </div>
                <DialogTitle className="text-2xl font-bold text-gray-900">
                  {t("dashboard.welcomeModalHeadline")}
                </DialogTitle>
                <DialogDescription className="text-base text-gray-600 pt-2 pb-4">
                  <p className="text-base font-medium text-gray-800 mb-4">
                    {t("dashboard.welcomeModalSubheadline")}
                  </p>
                  <p className="text-base text-gray-700 leading-relaxed">
                    {(() => {
                      const text = t("dashboard.welcomeModalText");
                      // Split text by "50 Impact Points" and "$5" to make them bold
                      const parts = text.split(/(50 Impact Points|\$5)/);
                      return parts.map((part, i) => {
                        if (part === "50 Impact Points" || part === "$5") {
                          return <strong key={i}>{part}</strong>;
                        }
                        return <span key={i}>{part}</span>;
                      });
                    })()}
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
                    {t("dashboard.welcomeModalStep2Headline")}
                  </DialogTitle>
                  <DialogDescription className="text-sm text-gray-700 pt-1 mb-6">
                    {t("dashboard.welcomeModalStep2Subheadline")}
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
                        {t("dashboard.welcomeModalStep2Option1")}
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
                        {t("dashboard.welcomeModalStep2Option2")}
                      </p>
                      <p className="text-xs text-gray-700 mt-1">
                        {t("dashboard.exploreVerifiedInnovators")}
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
                        {t("dashboard.welcomeModalStep2Option3")}
                      </p>
                      <p className="text-xs text-gray-700 mt-1">
                        Track your points, rank, and progress.
                      </p>
                    </div>
                  </button>
                </div>

                <p className="mt-3 text-[11px] text-gray-500 text-center">
                  {t("dashboard.welcomeModalStep2Recommended")}
                </p>
              </>
            )}
          </DialogContent>
        </Dialog>

      {/* Sticky Impact Share Button - Circular, orange, bottom-right */}
      {/* Only show if user has supported projects with actual impact data AND not in checkout/donation flow */}
      {hasSupported && safeImpact && supportedProjectsWithDonations && supportedProjectsWithDonations.length > 0 && 
       supportedProjectsWithDonations.some(item => item.donations && item.donations.length > 0 && item.donations.some((d: any) => (d.amount || 0) > 0)) &&
       !selectedProject && !showDonationDropdown && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={() => setShowImpactSummaryModal(true)}
            className="bg-[#f2662d] hover:bg-[#d9551f] text-white rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.15)] flex items-center gap-2 transition-all hover:scale-110 group px-4 py-3 md:px-5 md:py-3"
            aria-label={t("impactSummary.openSummary")}
          >
            <Sparkles className="w-5 h-5 flex-shrink-0" />
            <span className="hidden md:inline-block text-sm font-medium whitespace-nowrap">
              {t("impactSummary.yourImpact")}
            </span>
          </button>
        </div>
      )}

      {/* Impact Summary Modal */}
      {hasSupported && (
        <>
          <ImpactSummaryModal
            isOpen={showImpactSummaryModal}
            onClose={() => setShowImpactSummaryModal(false)}
            impact={safeImpact}
            onShareStat={(stat) => {
              setSelectedStat(stat);
              setShowShareCard(true);
            }}
          />
          <ImpactShareCard
            isOpen={showShareCard}
            onClose={() => {
              setShowShareCard(false);
              setSelectedStat(null);
            }}
            stat={selectedStat}
          />
        </>
      )}
    </div>
  );
}
