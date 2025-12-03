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

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('Processing auth callback...');
        
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
                  if (impact.impactPoints === 50) {
                    // User has exactly 50 IP (from trigger), likely new user
                    // Call welcome bonus endpoint (idempotent - safe to call multiple times)
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
                  }
                } else {
                  console.warn('[auth-callback] Failed to fetch impact data:', impactRes.status, impactRes.statusText);
                }
              }
            } catch (e) {
              // Non-critical - welcome bonus is optional, user can continue
              console.warn('[auth-callback] Failed to check/apply welcome bonus:', e);
            }
            
            // Check if preview mode is enabled
            const previewEnabled = isOnboardingPreviewEnabled();
            
            setStatus('success');
            setMessage('Email verified successfully! Redirecting...');
            
            // Check if we should return to support page (from support page auth modal)
            const pendingSupportReturnUrl = sessionStorage.getItem('pendingSupportReturnUrl');
            // Check if we should return to payment dialog
            const returnUrl = sessionStorage.getItem('authReturnUrl');
            const openPaymentDialog = sessionStorage.getItem('openPaymentDialog') === 'true';
            
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
              } else if (previewEnabled) {
                // In preview mode, check if new user (dashboard will determine based on impact data)
                // Set flag to let dashboard check if user has 50 points and 0 donations
                sessionStorage.setItem('checkNewUser', 'true');
                navigate('/dashboard?previewOnboarding=1');
              } else {
                navigate('/dashboard');
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
          console.log('User already authenticated');
          
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
                if (impact.impactPoints === 50) {
                  // User has exactly 50 IP (from trigger), likely new user
                  // Call welcome bonus endpoint (idempotent - safe to call multiple times)
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
                }
              } else {
                console.warn('[auth-callback] Failed to fetch impact data:', impactRes.status, impactRes.statusText);
              }
            }
          } catch (e) {
            // Non-critical - welcome bonus is optional, user can continue
            console.warn('[auth-callback] Failed to check/apply welcome bonus:', e);
          }
          
          // Check if preview mode is enabled
          const previewEnabled = isOnboardingPreviewEnabled();
          
          setStatus('success');
          setMessage('You are already logged in. Redirecting...');
          
          // Check if we should return to support page (from support page auth modal)
          const pendingSupportReturnUrl = sessionStorage.getItem('pendingSupportReturnUrl');
          // Check if we should return to payment dialog
          const returnUrl = sessionStorage.getItem('authReturnUrl');
          const openPaymentDialog = sessionStorage.getItem('openPaymentDialog') === 'true';
          
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
            } else if (previewEnabled) {
              // In preview mode, dashboard will check if new user based on impact data
              sessionStorage.setItem('checkNewUser', 'true');
              navigate('/dashboard?previewOnboarding=1');
            } else {
              navigate('/dashboard');
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
                  if (impact.impactPoints === 50) {
                    // User has exactly 50 IP (from trigger), likely new user
                    // Call welcome bonus endpoint (idempotent - safe to call multiple times)
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
                  }
                } else {
                  console.warn('[auth-callback] Failed to fetch impact data:', impactRes.status, impactRes.statusText);
                }
              }
            } catch (e) {
              // Non-critical - welcome bonus is optional, user can continue
              console.warn('[auth-callback] Failed to check/apply welcome bonus:', e);
            }
            
            // Check if preview mode is enabled
            const previewEnabled = isOnboardingPreviewEnabled();
            
            setStatus('success');
            setMessage('Authentication successful! Redirecting...');
            
            // Check if we should return to support page (from support page auth modal)
            const pendingSupportReturnUrl = sessionStorage.getItem('pendingSupportReturnUrl');
            // Check if we should return to payment dialog
            const returnUrl = sessionStorage.getItem('authReturnUrl');
            const openPaymentDialog = sessionStorage.getItem('openPaymentDialog') === 'true';
            
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
              } else if (previewEnabled) {
                // In preview mode, dashboard will check if new user based on impact data
                sessionStorage.setItem('checkNewUser', 'true');
                navigate('/dashboard?previewOnboarding=1');
              } else {
                navigate('/dashboard');
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