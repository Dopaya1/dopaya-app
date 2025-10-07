import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page-optimized";
import ProjectsPage from "@/pages/projects-page";
import ProjectDetailPage from "@/pages/project-detail-page";
import DashboardPage from "@/pages/dashboard-page";
import ContactPage from "@/pages/contact-page";
import AboutPageV2 from "@/pages/about-page-v2";
import RewardsPage from "@/pages/rewards-page";
import ThankYouPage from "@/pages/thank-you-page";
import BrandsPage from "@/pages/brands-page";
import SocialEnterprisesPage from "@/pages/social-enterprises-page";
import FAQPage from "@/pages/faq-page";
import PrivacyPolicy from "@/pages/privacy-policy";
import CookiePolicy from "@/pages/cookie-policy";
import EligibilityGuidelines from "@/pages/eligibility-guidelines";
import AuthCallback from "@/pages/auth-callback";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import { AuthRedirect } from "@/components/auth/auth-redirect";
import { useScrollToTop } from "@/hooks/use-scroll-to-top";
import { useState } from "react";
import { AuthModal } from "@/components/auth/auth-modal";

function Router({ onOpenAuthModal }: { onOpenAuthModal: (tab: "login" | "register") => void }) {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/projects" component={ProjectsPage} />
      <Route path="/projects/:slug" component={ProjectDetailPage} />
      <Route path="/auth">
        <AuthRedirect onOpenModal={onOpenAuthModal} />
      </Route>
      <Route path="/auth/callback" component={AuthCallback} />
      <ProtectedRoute path="/dashboard" component={DashboardPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/about" component={AboutPageV2} />
      <Route path="/rewards" component={RewardsPage} />
      <Route path="/thank-you" component={ThankYouPage} />
      <Route path="/brands" component={BrandsPage} />
      <Route path="/social-enterprises" component={SocialEnterprisesPage} />
      <Route path="/faq" component={FAQPage} />
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route path="/cookies" component={CookiePolicy} />
      <Route path="/eligibility" component={EligibilityGuidelines} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Enable scroll-to-top on route changes
  useScrollToTop();
  
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "register">("login");

  const openAuthModal = (tab: "login" | "register") => {
    setAuthModalTab(tab);
    setShowAuthModal(true);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              <Router onOpenAuthModal={openAuthModal} />
            </main>
            <Footer />
          </div>
          <AuthModal 
            isOpen={showAuthModal} 
            onClose={() => setShowAuthModal(false)}
            defaultTab={authModalTab}
          />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
