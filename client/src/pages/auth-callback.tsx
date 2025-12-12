import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { isOnboardingPreviewEnabled } from "@/lib/feature-flags";
import { useQueryClient } from "@tanstack/react-query";

export default function AuthCallback() {
  const [location, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  
  // Log immediately when component renders (before useEffect)
  console.log('[auth-callback] ========== COMPONENT RENDERED ==========');
  console.log('[auth-callback] Current URL on render:', window.location.href);
  console.log('[auth-callback] SessionStorage on render:', {
    pendingSupportReturnUrl: sessionStorage.getItem('pendingSupportReturnUrl'),
    isNewUser: sessionStorage.getItem('isNewUser'),
    checkNewUser: sessionStorage.getItem('checkNewUser')
  });

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('[auth-callback] ========== AUTH CALLBACK PAGE LOADED ==========');
        console.log('[auth-callback] Current URL:', window.location.href);
        console.log('[auth-callback] Hash:', window.location.hash);
        console.log('[auth-callback] Search:', window.location.search);
        console.log('[auth-callback] Referrer:', document.referrer);
        
        // Log ALL sessionStorage immediately
        const allSessionStorageAtStart = {
          pendingSupportReturnUrl: sessionStorage.getItem('pendingSupportReturnUrl'),
          pendingSupportAmount: sessionStorage.getItem('pendingSupportAmount'),
          isNewUser: sessionStorage.getItem('isNewUser'),
          checkNewUser: sessionStorage.getItem('checkNewUser'),
          authReturnUrl: sessionStorage.getItem('authReturnUrl'),
          openPaymentDialog: sessionStorage.getItem('openPaymentDialog'),
          welcomeModalShown: sessionStorage.getItem('welcomeModalShown')
        };
        console.log('[auth-callback] 📋 SessionStorage at START:', allSessionStorageAtStart);
        
        console.log('[auth-callback] Processing auth callback...');
        
        // Get the URL parameters (both hash and search params)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const searchParams = new URLSearchParams(window.location.search);
        
        // Check for error in URL params first
        const error = hashParams.get('error') || searchParams.get('error');
        const errorDescription = hashParams.get('error_description') || searchParams.get('error_description');
        
        if (error) {
          console.error('Auth callback error:', error, errorDescription);
          setStatus('error');
          setMessage(errorDescription || error || 'Authentication failed. Please try again.');
          return;
        }

        // Check for access token in URL hash (Supabase email confirmation)
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        
        if (accessToken && refreshToken) {
          console.log('Found tokens in URL, setting session...');
          
          // Set the session using the tokens from the URL
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            console.error('Session error:', sessionError);
            setStatus('error');
            setMessage('Failed to authenticate. Please try again.');
            return;
          }

          if (data.user) {
            console.log('User authenticated successfully via email confirmation');
            
            // User profile is automatically created by database trigger
            // Invalidate queries to refresh navbar and dashboard
            await queryClient.invalidateQueries({ queryKey: ["/api/user"] });
            await queryClient.invalidateQueries({ queryKey: ["/api/user/impact"] });
            
            // Force refresh auth state by triggering a small delay to allow Supabase listener to fire
            // This ensures navbar gets updated user info
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Apply welcome bonus transaction if user is new (non-blocking, with fallback)
            try {
              // Get auth token for API calls
              const { data: { session } } = await supabase.auth.getSession();
              const token = session?.access_token;
              
              if (!token) {
                console.warn('[auth-callback] No auth token available for welcome bonus check');
              } else {
                const impactRes = await fetch('/api/user/impact', { 
                  credentials: 'include',
                  headers: {
                    'Authorization': `Bearer ${token}`
                  }
                });
                if (impactRes.ok) {
                  const impact = await impactRes.json();
                  const impactPoints = impact.impactPoints ?? 0;
                  const projectsSupported = impact.projectsSupported ?? 0;
                  
                  // Check if user qualifies for welcome bonus:
                  // 1. Has exactly 50 points (from trigger) - record transaction
                  // 2. Has 0 points and 0 donations - new user, give bonus and record transaction
                  const isNewUser = impactPoints === 0 && projectsSupported === 0;
                  const hasWelcomeBonus = impactPoints === 50;
                  
                  // Set new user flags for onboarding modals (for email confirmation flow)
                  if (isNewUser || hasWelcomeBonus) {
                    sessionStorage.setItem('isNewUser', 'true');
                    sessionStorage.setItem('checkNewUser', 'true');
                    // Call welcome bonus endpoint (idempotent - safe to call multiple times)
                    console.log('[auth-callback] 🔍 Calling welcome-bonus endpoint...', { isNewUser, hasWelcomeBonus, impactPoints, projectsSupported });
                    fetch('/api/user/welcome-bonus', { 
                      method: 'POST', 
                      credentials: 'include',
                      headers: {
                        'Authorization': `Bearer ${token}`
                      }
                    })
                    .then(async res => {
                      const responseText = await res.text();
                      let responseData;
                      try {
                        responseData = JSON.parse(responseText);
                      } catch {
                        responseData = responseText;
                      }
                      
                      if (res.ok) {
                        console.log('[auth-callback] ✅ Welcome bonus applied successfully:', responseData);
                      } else {
                        console.error('[auth-callback] ❌ Welcome bonus failed:', res.status, res.statusText, responseData);
                      }
                    })
                    .catch(err => {
                      console.error('[auth-callback] ❌ Welcome bonus call error:', err);
                    });
                  } else {
                    console.log('[auth-callback] ⚠️ User does not qualify for welcome bonus:', { impactPoints, projectsSupported, isNewUser, hasWelcomeBonus });
                  }
                } else {
                  console.warn('[auth-callback] Failed to fetch impact data:', impactRes.status, impactRes.statusText);
                }
              }
            } catch (e) {
              // Non-critical - welcome bonus is optional, user can continue
              console.warn('[auth-callback] Failed to check/apply welcome bonus:', e);
            }
            
            // Set flags BEFORE redirect to ensure they're available when dashboard loads
            // Check if isNewUser flag was already set during signup (for email confirmation flow)
            const existingIsNewUser = sessionStorage.getItem('isNewUser') === 'true';
            if (existingIsNewUser) {
              // Keep the flag and also set checkNewUser
              sessionStorage.setItem('checkNewUser', 'true');
              console.log('[auth-callback] ✅ Using existing isNewUser flag, also setting checkNewUser');
            } else {
              // Set both flags for email confirmation flow (flags were set above when welcome bonus was checked)
              // If flags weren't set above (e.g., impact check failed), set them here as fallback
              if (!sessionStorage.getItem('isNewUser')) {
                sessionStorage.setItem('isNewUser', 'true');
                sessionStorage.setItem('checkNewUser', 'true');
                console.log('[auth-callback] ✅ Setting new user flags as fallback');
              } else {
                console.log('[auth-callback] ✅ New user flags already set from welcome bonus check');
              }
            }
            
            setStatus('success');
            setMessage('Email verified successfully! Redirecting...');
            
            // Check if preview mode is enabled (for preserving preview flag in URL)
            const previewEnabled = isOnboardingPreviewEnabled();
            
            // Check if we should return to support page (from support page auth modal)
            // This is the HIGHEST PRIORITY - if user was trying to donate, send them back to support page
            let pendingSupportReturnUrl = sessionStorage.getItem('pendingSupportReturnUrl');
            
            // CRITICAL: Check URL parameter for returnTo (embedded in email confirmation link)
            // This persists even if sessionStorage is cleared or Supabase redirects to a different URL
            const urlParams = new URLSearchParams(window.location.search);
            const returnToParam = urlParams.get('returnTo');
            if (returnToParam) {
              const decodedReturnTo = decodeURIComponent(returnToParam);
              console.log('[auth-callback] ✅✅✅ Found returnTo in URL parameter (from email link):', decodedReturnTo);
              pendingSupportReturnUrl = decodedReturnTo;
              // Also store it in sessionStorage for consistency
              sessionStorage.setItem('pendingSupportReturnUrl', decodedReturnTo);
            }
            
            // Log ALL sessionStorage items for debugging
            const allSessionStorage = {
              pendingSupportReturnUrl: sessionStorage.getItem('pendingSupportReturnUrl'),
              pendingSupportAmount: sessionStorage.getItem('pendingSupportAmount'),
              isNewUser: sessionStorage.getItem('isNewUser'),
              checkNewUser: sessionStorage.getItem('checkNewUser'),
              authReturnUrl: sessionStorage.getItem('authReturnUrl'),
              openPaymentDialog: sessionStorage.getItem('openPaymentDialog'),
              welcomeModalShown: sessionStorage.getItem('welcomeModalShown'),
              returnToFromUrl: returnToParam
            };
            console.log('[auth-callback] 📋 ALL SessionStorage items:', allSessionStorage);
            console.log('[auth-callback] 📋 Document referrer:', document.referrer);
            console.log('[auth-callback] 📋 Current URL:', window.location.href);
            console.log('[auth-callback] 📋 URL search params:', window.location.search);
            
            // FALLBACK: If no pendingSupportReturnUrl but referrer suggests support page, reconstruct it
            if (!pendingSupportReturnUrl) {
              const referrer = document.referrer;
              const supportPageMatch = referrer.match(/\/support\/([^\/\?]+)/);
              if (supportPageMatch) {
                const projectSlug = supportPageMatch[1];
                pendingSupportReturnUrl = `/support/${projectSlug}${previewEnabled ? '?previewOnboarding=1' : ''}`;
                console.log('[auth-callback] ✅ Reconstructed support URL from referrer:', pendingSupportReturnUrl);
                // Store it so it's available for the redirect
                sessionStorage.setItem('pendingSupportReturnUrl', pendingSupportReturnUrl);
              } else {
                console.warn('[auth-callback] ⚠️ No pendingSupportReturnUrl and referrer does not match support page pattern');
              }
            } else {
              console.log('[auth-callback] ✅ Found pendingSupportReturnUrl:', pendingSupportReturnUrl);
            }
            
            // Check if we should return to payment dialog
            const returnUrl = sessionStorage.getItem('authReturnUrl');
            const openPaymentDialog = sessionStorage.getItem('openPaymentDialog') === 'true';
            
            // Debug logging
            console.log('[auth-callback] 🔍 Redirect decision:', {
              pendingSupportReturnUrl,
              returnUrl,
              openPaymentDialog,
              referrer: document.referrer,
              isNewUser: sessionStorage.getItem('isNewUser'),
              checkNewUser: sessionStorage.getItem('checkNewUser'),
              userEmail: data.user.email,
              authMethod: 'email_confirmation'
            });
            
            setTimeout(() => {
              // Re-check sessionStorage right before redirect (in case it was cleared)
              const finalPendingSupportUrl = sessionStorage.getItem('pendingSupportReturnUrl') || pendingSupportReturnUrl;
              
              console.log('[auth-callback] 🚀 FINAL REDIRECT DECISION (email confirmation):', {
                hasPendingSupportUrl: !!finalPendingSupportUrl,
                pendingSupportUrl: finalPendingSupportUrl,
                originalPendingSupportUrl: pendingSupportReturnUrl,
                hasReturnUrl: !!returnUrl,
                returnUrl: returnUrl,
                openPaymentDialog,
                isNewUser: sessionStorage.getItem('isNewUser'),
                checkNewUser: sessionStorage.getItem('checkNewUser'),
                authMethod: 'email_confirmation',
                allSessionStorage: {
                  pendingSupportReturnUrl: sessionStorage.getItem('pendingSupportReturnUrl'),
                  isNewUser: sessionStorage.getItem('isNewUser'),
                  checkNewUser: sessionStorage.getItem('checkNewUser')
                }
              });
              
              if (finalPendingSupportUrl) {
                // User was trying to support, redirect back to support page
                // This takes priority over dashboard redirect for new users
                console.log('[auth-callback] ✅✅✅ DECISION: Redirecting to support page:', finalPendingSupportUrl);
                sessionStorage.removeItem('pendingSupportReturnUrl');
                sessionStorage.removeItem('pendingSupportAmount');
                // Construct full URL if it's a relative path
                const fullUrl = finalPendingSupportUrl.startsWith('http') 
                  ? finalPendingSupportUrl 
                  : `${window.location.origin}${finalPendingSupportUrl}`;
                console.log('[auth-callback] ✅✅✅ Redirecting to full URL:', fullUrl);
                window.location.href = fullUrl;
              } else if (returnUrl && openPaymentDialog) {
                // Return to original page where Support button was clicked
                console.log('[auth-callback] ✅ DECISION: Redirecting to return URL:', returnUrl);
                sessionStorage.removeItem('authReturnUrl');
                window.location.href = returnUrl;
              } else {
                // Always redirect new users to previewOnboarding for full onboarding experience
                const redirectUrl = '/dashboard?newUser=1&previewOnboarding=1';
                console.log('[auth-callback] ⚠️ DECISION: No support return URL found, redirecting to dashboard:', {
                  isNewUser: sessionStorage.getItem('isNewUser'),
                  checkNewUser: sessionStorage.getItem('checkNewUser'),
                  redirectUrl,
                  reason: 'No pendingSupportReturnUrl or returnUrl found'
                });
                // Full reload to ensure session cookies are set and navbar picks up auth
                window.location.href = redirectUrl;
              }
            }, 1500);
            return;
          }
        }

        // If no tokens in URL, check current session status
        console.log('No tokens in URL, checking current session...');
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session check error:', sessionError);
          setStatus('error');
          setMessage('Authentication failed. Please try again.');
          return;
        }
        
        if (sessionData.session?.user) {
          console.log('[auth-callback] User already authenticated (likely Google OAuth or existing session)');
          console.log('[auth-callback] User info:', {
            id: sessionData.session.user.id,
            email: sessionData.session.user.email,
            created_at: sessionData.session.user.created_at
          });
          
          // User profile will be created by /api/user/impact if it doesn't exist (fallback)
          // Invalidate queries to refresh navbar and dashboard
          await queryClient.invalidateQueries({ queryKey: ["/api/user"] });
          await queryClient.invalidateQueries({ queryKey: ["/api/user/impact"] });
          
          // Apply welcome bonus transaction if user is new (non-blocking, with fallback)
          try {
            // Get auth token for API calls
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            
            if (!token) {
              console.warn('[auth-callback] No auth token available for welcome bonus check');
            } else {
              // First, fetch impact data - this will create the user if they don't exist
              const impactRes = await fetch('/api/user/impact', { 
                credentials: 'include',
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              });
              if (impactRes.ok) {
                const impact = await impactRes.json();
                const impactPoints = impact.impactPoints ?? 0;
                const projectsSupported = impact.projectsSupported ?? 0;
                const welcomeShown = impact.welcome_shown === true;
                
                console.log('[auth-callback] Impact data fetched:', {
                  impactPoints,
                  projectsSupported,
                  welcome_shown: welcomeShown
                });
                
                // Check if user qualifies for welcome bonus:
                // 1. Has exactly 50 points (from trigger or creation) - record transaction
                // 2. Has 0 points and 0 donations - new user, give bonus and record transaction
                const isNewUser = impactPoints === 0 && projectsSupported === 0;
                const hasWelcomeBonus = impactPoints === 50;
                
                // IMPORTANT: Set new user flags for Google OAuth flow (if user is new)
                // This ensures welcome modal shows for Google signups too
                if ((isNewUser || hasWelcomeBonus) && !welcomeShown) {
                  // Check if flags are already set (might be set from donation button)
                  const existingIsNewUser = sessionStorage.getItem('isNewUser') === 'true';
                  if (!existingIsNewUser) {
                    sessionStorage.setItem('isNewUser', 'true');
                    sessionStorage.setItem('checkNewUser', 'true');
                    console.log('[auth-callback] ✅ Set new user flags for Google OAuth flow');
                  } else {
                    console.log('[auth-callback] ✅ New user flags already set');
                  }
                  
                  // Call welcome bonus endpoint (idempotent - safe to call multiple times)
                  // This will create the user if they don't exist, then apply the bonus
                  fetch('/api/user/welcome-bonus', { 
                    method: 'POST', 
                    credentials: 'include',
                    headers: {
                      'Authorization': `Bearer ${token}`
                    }
                  }).catch(err => {
                    // Non-critical - log but don't block user flow
                    console.warn('[auth-callback] Welcome bonus call failed:', err);
                  });
                } else {
                  console.log('[auth-callback] User is not new or welcome already shown:', {
                    isNewUser,
                    hasWelcomeBonus,
                    welcomeShown
                  });
                }
              } else {
                console.warn('[auth-callback] Failed to fetch impact data:', impactRes.status, impactRes.statusText);
              }
            }
          } catch (e) {
            // Non-critical - welcome bonus is optional, user can continue
            console.warn('[auth-callback] Failed to check/apply welcome bonus:', e);
          }
          
            // Check if preview mode is enabled (for preserving preview flag in URL)
            const previewEnabled = isOnboardingPreviewEnabled();
            
            setStatus('success');
            setMessage('You are already logged in. Redirecting...');
            
            // Check if we should return to support page (from support page auth modal)
            const pendingSupportReturnUrl = sessionStorage.getItem('pendingSupportReturnUrl');
            // Check if we should return to payment dialog
            const returnUrl = sessionStorage.getItem('authReturnUrl');
            const openPaymentDialog = sessionStorage.getItem('openPaymentDialog') === 'true';
            
            // Check if new user flags are set (from welcome bonus check above)
            const hasNewUserFlags = sessionStorage.getItem('isNewUser') === 'true' || sessionStorage.getItem('checkNewUser') === 'true';
            
            setTimeout(() => {
              console.log('[auth-callback] 🚀 FINAL REDIRECT DECISION (Google OAuth/Existing Session):', {
                hasPendingSupportUrl: !!pendingSupportReturnUrl,
                pendingSupportUrl: pendingSupportReturnUrl,
                hasReturnUrl: !!returnUrl,
                returnUrl: returnUrl,
                openPaymentDialog,
                hasNewUserFlags,
                isNewUser: sessionStorage.getItem('isNewUser'),
                checkNewUser: sessionStorage.getItem('checkNewUser'),
                authMethod: 'google_oauth_or_existing_session'
              });
              
              if (pendingSupportReturnUrl) {
                // User was trying to support, redirect back to support page
                console.log('[auth-callback] ✅ DECISION: Redirecting to support page:', pendingSupportReturnUrl);
                sessionStorage.removeItem('pendingSupportReturnUrl');
                sessionStorage.removeItem('pendingSupportAmount');
                // Construct full URL if it's a relative path
                const fullUrl = pendingSupportReturnUrl.startsWith('http') 
                  ? pendingSupportReturnUrl 
                  : `${window.location.origin}${pendingSupportReturnUrl}`;
                window.location.href = fullUrl;
              } else if (returnUrl && openPaymentDialog) {
                // Return to original page where Support button was clicked
                console.log('[auth-callback] ✅ DECISION: Redirecting to return URL:', returnUrl);
                sessionStorage.removeItem('authReturnUrl');
                window.location.href = returnUrl;
              } else {
                // If new user flags are set, redirect with newUser=1 and previewOnboarding=1
                if (hasNewUserFlags) {
                  // Always redirect new users to previewOnboarding for full onboarding experience
                  const redirectUrl = '/dashboard?newUser=1&previewOnboarding=1';
                  console.log('[auth-callback] ✅ DECISION: Redirecting new user to dashboard:', redirectUrl);
                  navigate(redirectUrl);
                } else {
                  // Existing user - preserve preview flag if exists
                  const redirectUrl = previewEnabled 
                    ? '/dashboard?previewOnboarding=1'
                    : '/dashboard';
                  console.log('[auth-callback] ✅ DECISION: Redirecting existing user to dashboard:', redirectUrl);
                  navigate(redirectUrl);
                }
              }
            }, 1000);
        } else {
          // Check if user is authenticated via getUser as fallback
          const { data: userData, error: userError } = await supabase.auth.getUser();
          
          if (userError || !userData.user) {
            console.log('No authenticated user found');
            setStatus('error');
            setMessage('Authentication failed. Please try again.');
          } else {
            console.log('User found via getUser()');
            
            // User profile is automatically created by database trigger
            // Invalidate queries to refresh navbar and dashboard
            await queryClient.invalidateQueries({ queryKey: ["/api/user"] });
            await queryClient.invalidateQueries({ queryKey: ["/api/user/impact"] });
            
            // Apply welcome bonus transaction if user is new (non-blocking, with fallback)
            try {
              // Get auth token for API calls
              const { data: { session } } = await supabase.auth.getSession();
              const token = session?.access_token;
              
              if (!token) {
                console.warn('[auth-callback] No auth token available for welcome bonus check');
              } else {
                const impactRes = await fetch('/api/user/impact', { 
                  credentials: 'include',
                  headers: {
                    'Authorization': `Bearer ${token}`
                  }
                });
                if (impactRes.ok) {
                  const impact = await impactRes.json();
                  const impactPoints = impact.impactPoints ?? 0;
                  const projectsSupported = impact.projectsSupported ?? 0;
                  
                  // Check if user qualifies for welcome bonus:
                  // 1. Has exactly 50 points (from trigger) - record transaction
                  // 2. Has 0 points and 0 donations - new user, give bonus and record transaction
                  const isNewUser = impactPoints === 0 && projectsSupported === 0;
                  const hasWelcomeBonus = impactPoints === 50;
                  
                  // Set new user flags for onboarding modals (for email confirmation flow)
                  if (isNewUser || hasWelcomeBonus) {
                    sessionStorage.setItem('isNewUser', 'true');
                    sessionStorage.setItem('checkNewUser', 'true');
                    // Call welcome bonus endpoint (idempotent - safe to call multiple times)
                    console.log('[auth-callback] 🔍 Calling welcome-bonus endpoint...', { isNewUser, hasWelcomeBonus, impactPoints, projectsSupported });
                    fetch('/api/user/welcome-bonus', { 
                      method: 'POST', 
                      credentials: 'include',
                      headers: {
                        'Authorization': `Bearer ${token}`
                      }
                    })
                    .then(async res => {
                      const responseText = await res.text();
                      let responseData;
                      try {
                        responseData = JSON.parse(responseText);
                      } catch {
                        responseData = responseText;
                      }
                      
                      if (res.ok) {
                        console.log('[auth-callback] ✅ Welcome bonus applied successfully:', responseData);
                      } else {
                        console.error('[auth-callback] ❌ Welcome bonus failed:', res.status, res.statusText, responseData);
                      }
                    })
                    .catch(err => {
                      console.error('[auth-callback] ❌ Welcome bonus call error:', err);
                    });
                  } else {
                    console.log('[auth-callback] ⚠️ User does not qualify for welcome bonus:', { impactPoints, projectsSupported, isNewUser, hasWelcomeBonus });
                  }
                } else {
                  console.warn('[auth-callback] Failed to fetch impact data:', impactRes.status, impactRes.statusText);
                }
              }
            } catch (e) {
              // Non-critical - welcome bonus is optional, user can continue
              console.warn('[auth-callback] Failed to check/apply welcome bonus:', e);
            }
            
            // Check if preview mode is enabled (for preserving preview flag in URL)
            const previewEnabled = isOnboardingPreviewEnabled();
            
            setStatus('success');
            setMessage('Authentication successful! Redirecting...');
            
            // Check if we should return to support page (from support page auth modal)
            const pendingSupportReturnUrl = sessionStorage.getItem('pendingSupportReturnUrl');
            // Check if we should return to payment dialog
            const returnUrl = sessionStorage.getItem('authReturnUrl');
            const openPaymentDialog = sessionStorage.getItem('openPaymentDialog') === 'true';
            
            // Check if new user flags are set (from welcome bonus check above)
            const hasNewUserFlags = sessionStorage.getItem('isNewUser') === 'true' || sessionStorage.getItem('checkNewUser') === 'true';
            
            setTimeout(() => {
              if (pendingSupportReturnUrl) {
                // User was trying to support, redirect back to support page
                sessionStorage.removeItem('pendingSupportReturnUrl');
                sessionStorage.removeItem('pendingSupportAmount');
                // Construct full URL if it's a relative path
                const fullUrl = pendingSupportReturnUrl.startsWith('http') 
                  ? pendingSupportReturnUrl 
                  : `${window.location.origin}${pendingSupportReturnUrl}`;
                window.location.href = fullUrl;
              } else if (returnUrl && openPaymentDialog) {
                // Return to original page where Support button was clicked
                sessionStorage.removeItem('authReturnUrl');
                window.location.href = returnUrl;
              } else {
                // If new user flags are set, redirect with newUser=1 and previewOnboarding=1
                if (hasNewUserFlags) {
                  // Always redirect new users to previewOnboarding for full onboarding experience
                  const redirectUrl = '/dashboard?newUser=1&previewOnboarding=1';
                  console.log('[auth-callback] Redirecting new user to:', redirectUrl);
                  window.location.href = redirectUrl;
                } else {
                  // Existing user - preserve preview flag if exists
                  const redirectUrl = previewEnabled 
                    ? '/dashboard?previewOnboarding=1'
                    : '/dashboard';
                  navigate(redirectUrl);
                }
              }
            }, 1000);
          }
        }
      } catch (error: any) {
        console.error('Auth callback processing error:', error);
        setStatus('error');
        setMessage('An unexpected error occurred during authentication. Please try again.');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full mx-auto p-6">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Checking authentication...
            </h2>
            <p className="text-gray-600">
              Please wait while we verify your authentication status.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full mx-auto p-6">
          <div className="text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Email Verified!
            </h2>
            <p className="text-gray-600 mb-6">
              {message}
            </p>
            <Button 
              onClick={() => navigate('/dashboard')}
              className="w-full"
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full mx-auto p-6">
          <div className="text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Verification Failed
            </h2>
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>
                {message}
              </AlertDescription>
            </Alert>
            <div className="space-y-3">
              <Button 
                onClick={() => navigate('/')}
                variant="outline"
                className="w-full"
              >
                Return to Home
              </Button>
              <Button 
                onClick={() => window.location.reload()}
                className="w-full"
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}