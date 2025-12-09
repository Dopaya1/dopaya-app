import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import HomePage from "@/pages/home-page";
import ProjectsPage from "@/pages/projects-page";
import ProjectDetailPage from "@/pages/project-detail-page";
import ProjectDetailPageV3 from "@/pages/project-detail-page-v3";
import DashboardPage from "@/pages/dashboard-page";
import DashboardV2 from "@/pages/dashboard-v2";
import ContactPage from "@/pages/contact-page";
import AboutPage from "@/pages/about-page";
import RewardsPage from "@/pages/rewards-page";
import RewardsPageV2 from "@/pages/rewards-page-v2";
import ThankYouPage from "@/pages/thank-you-page";
import BrandsPageV2 from "@/pages/brands-page-v2";
import SocialEnterprisesPage from "@/pages/social-enterprises-page";
import FAQPage from "@/pages/faq-page";
import PrivacyPolicy from "@/pages/privacy-policy";
import CookiePolicy from "@/pages/cookie-policy";
import EligibilityGuidelines from "@/pages/eligibility-guidelines";
import AuthCallback from "@/pages/auth-callback";
import PerformanceTestPage from "@/pages/performance-test";
import AnalyticsTestPage from "@/pages/analytics-test";
import SupportPage from "@/pages/support-page";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import { AuthRedirect } from "@/components/auth/auth-redirect";
import { useScrollToTop } from "@/hooks/use-scroll-to-top";
import { useState, useEffect } from "react";
import { AuthModal } from "@/components/auth/auth-modal";
import { trackPageView } from "@/lib/simple-analytics";
import { I18nProvider } from "@/lib/i18n/i18n-context";
import { removeLanguagePrefix } from "@/lib/i18n/utils";

// Global auth token detector - redirects to /auth/callback if tokens are in URL hash
function AuthTokenRedirect() {
  const [location, navigate] = useLocation();
  
  useEffect(() => {
    // Check if we're already on the auth callback page
    if (location === '/auth/callback') {
      return;
    }
    
    // Check for auth tokens in URL hash (Supabase email confirmation)
    const hash = window.location.hash.substring(1);
    if (hash) {
      const hashParams = new URLSearchParams(hash);
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      
      if (accessToken && refreshToken) {
        console.log('Auth tokens detected in URL hash, redirecting to /auth/callback');
        // Preserve the hash and any query params when redirecting
        const searchParams = new URLSearchParams(window.location.search);
        const newUrl = `/auth/callback${searchParams.toString() ? `?${searchParams.toString()}` : ''}${hash ? `#${hash}` : ''}`;
        navigate(newUrl);
      }
    }
  }, [location, navigate]);
  
  return null;
}

function Router({ onOpenAuthModal }: { onOpenAuthModal: (tab: "login" | "register") => void }) {
  return (
    <Switch>
      {/* Routes without language prefix (English) */}
      <Route path="/" component={HomePage} />
      <Route path="/projects" component={ProjectsPage} />
      <Route path="/project-v3/:slug" component={ProjectDetailPageV3} />
      <Route path="/project/:slug" component={ProjectDetailPage} />
      <ProtectedRoute path="/dashboard" component={DashboardV2} />
      <ProtectedRoute path="/dashboard-old" component={DashboardPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/rewards" component={RewardsPage} />
      <Route path="/rewards-v2" component={RewardsPageV2} />
      <Route path="/thank-you" component={ThankYouPage} />
      <Route path="/brands" component={BrandsPageV2} />
      <Route path="/brands-v2" component={BrandsPageV2} />
      <Route path="/social-enterprises" component={SocialEnterprisesPage} />
      <Route path="/faq" component={FAQPage} />
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route path="/cookies" component={CookiePolicy} />
      <Route path="/eligibility" component={EligibilityGuidelines} />
      <Route path="/auth/callback" component={AuthCallback} />
      <Route path="/performance-test" component={PerformanceTestPage} />
      <Route path="/analytics-test" component={AnalyticsTestPage} />
      <Route path="/support/:slug" component={SupportPage} />
      
      {/* Routes with German language prefix */}
      <Route path="/de" component={HomePage} />
      <Route path="/de/projects" component={ProjectsPage} />
      <Route path="/de/project-v3/:slug" component={ProjectDetailPageV3} />
      <Route path="/de/project/:slug" component={ProjectDetailPage} />
      <ProtectedRoute path="/de/dashboard" component={DashboardV2} />
      <ProtectedRoute path="/de/dashboard-old" component={DashboardPage} />
      <Route path="/de/contact" component={ContactPage} />
      <Route path="/de/about" component={AboutPage} />
      <Route path="/de/rewards" component={RewardsPage} />
      <Route path="/de/rewards-v2" component={RewardsPageV2} />
      <Route path="/de/thank-you" component={ThankYouPage} />
      <Route path="/de/brands" component={BrandsPageV2} />
      <Route path="/de/brands-v2" component={BrandsPageV2} />
      <Route path="/de/social-enterprises" component={SocialEnterprisesPage} />
      <Route path="/de/faq" component={FAQPage} />
      <Route path="/de/privacy" component={PrivacyPolicy} />
      <Route path="/de/cookies" component={CookiePolicy} />
      <Route path="/de/eligibility" component={EligibilityGuidelines} />
      <Route path="/de/support/:slug" component={SupportPage} />
      
      <Route component={() => <div className="min-h-screen flex items-center justify-center"><h1 className="text-2xl">Page not found</h1></div>} />
    </Switch>
  );
}

function App() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "register">("login");
  const [location] = useLocation();

  // Simple page view tracking
  useEffect(() => {
    trackPageView(window.location.pathname, document.title);
  }, []);

  const openAuthModal = (tab: "login" | "register") => {
    setAuthModalTab(tab);
    setShowAuthModal(true);
  };

  useScrollToTop();

  const isSupportPage = location.startsWith("/support/");

  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <AuthProvider>
          <AuthTokenRedirect />
          <div className="min-h-screen">
            {!isSupportPage && (
              <>
                {/* Small banner at the very top - above navigation */}
                <div className="sticky top-0 z-[60] bg-[#F8F6EF] border-b border-gray-200 py-2.5 px-4">
                  <div className="max-w-7xl mx-auto">
                    <p className="text-sm text-black text-center">
                      Latest brand partners: <span className="font-semibold">NIKIN</span> 🇨🇭 - <span className="font-semibold">RRREVOLVE</span> 🇨🇭
                    </p>
                  </div>
                </div>
                <Navbar />
              </>
            )}
            <Router onOpenAuthModal={openAuthModal} />
            {!isSupportPage && <Footer />}
            <AuthModal 
              isOpen={showAuthModal} 
              onClose={() => setShowAuthModal(false)} 
              defaultTab={authModalTab}
            />
          </div>
        </AuthProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
}

export default App;