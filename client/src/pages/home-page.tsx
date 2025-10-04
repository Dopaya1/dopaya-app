import { HeroSection } from "@/components/home/hero-section";
import { FeaturedProjects } from "@/components/home/featured-projects";
import { HowItWorks } from "@/components/home/how-it-works";
import { ChangeWorldSection } from "@/components/home/change-world-section";
import { RewardsSection } from "@/components/home/rewards-section";

import { ImpactPointsSection } from "@/components/home/impact-points-section";
import { ImpactDashboardSection } from "@/components/home/impact-dashboard-section";
import { FAQSection } from "@/components/home/faq-section";
import { SignupCTA } from "@/components/home/signup-cta";
import { SEOHead } from "@/components/seo/seo-head";
import { DbStatusAlert } from "@/components/system/db-status-alert";
import { useDbStatus } from "@/hooks/use-db-status";
import { SuccessBanner } from "@/components/donation/success-banner";

export default function HomePage() {
  // Initialize database status check
  const { isConnected } = useDbStatus();
  
  return (
    <>
      <SEOHead
        title="Dopaya - Make an Impact"
        description="Support high-impact social enterprises, track your impact in real-time, and earn rewards for making a difference. Join thousands of changemakers creating positive social impact."
        keywords="social impact, donations, social enterprises, impact tracking, rewards, charitable giving, sustainability, SDGs"
        canonicalUrl="https://dopaya.org/"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Dopaya",
          "url": "https://dopaya.org",
          "logo": "https://dopaya.org/logo.png",
          "description": "Platform connecting donors with high-impact social enterprises through transparent, gamified giving experiences.",
          "foundingDate": "2023",
          "sameAs": [
            "https://twitter.com/dopaya",
            "https://linkedin.com/company/dopaya"
          ],
          "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "customer service",
            "url": "https://dopaya.org/contact"
          }
        }}
      />
      
      <SuccessBanner />
      
      {/* Database connectivity alert will only show if there's a connection error */}
      <div className="container mx-auto px-4 mt-4">
        <DbStatusAlert />
      </div>
      
      {/* 1. Hero Section */}
      <HeroSection />
      
      {/* 2. How do you want to change the world today? */}
      <ChangeWorldSection />
      
      {/* 3. Three Simple Steps */}
      <HowItWorks />
      
      {/* 4. Latest Projects */}
      <FeaturedProjects />
      
      {/* 5. Get Rewarded for Your Generosity */}
      <RewardsSection />
      

      
      {/* 7. Impact Dashboard & Gamification */}
      <ImpactDashboardSection />
      <ImpactPointsSection />
      
      {/* 8. Frequently Asked Questions */}
      <FAQSection />
      
      {/* 9. Call to Action */}
      <SignupCTA />
    </>
  );
}
