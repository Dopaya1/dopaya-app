import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import HomePage from "@/pages/home-page";
import ProjectsPage from "@/pages/projects-page";
import ProjectDetailPage from "@/pages/project-detail-page";
import ProjectDetailPageV3 from "@/pages/project-detail-page-v3";
import DashboardPage from "@/pages/dashboard-page";
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

function Router({ onOpenAuthModal }: { onOpenAuthModal: (tab: "login" | "register") => void }) {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/projects" component={ProjectsPage} />
      <Route path="/project-v3/:slug" component={ProjectDetailPageV3} />
      <Route path="/project/:slug" component={ProjectDetailPage} />
      <ProtectedRoute path="/dashboard" component={DashboardPage} />
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
      <AuthProvider>
        <div className="min-h-screen">
          {!isSupportPage && <Navbar />}
          <Router onOpenAuthModal={openAuthModal} />
          {!isSupportPage && <Footer />}
          <AuthModal 
            isOpen={showAuthModal} 
            onClose={() => setShowAuthModal(false)} 
            defaultTab={authModalTab}
          />
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;