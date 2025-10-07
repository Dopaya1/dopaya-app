import { HeroSection } from "@/components/home/hero-section-optimized";
import { ChangeWorldSection } from "@/components/home/change-world-section";
import { WhySocialEnterprisesSection } from "@/components/home/why-social-enterprises-section";
import { PartnerShowcaseSection } from "@/components/home/partner-showcase-section";
import { ImpactDashboardSection } from "@/components/home/impact-dashboard-section-optimized";
import { InstitutionalProofSection } from "@/components/home/institutional-proof-section";
import { CommunityInvitationCTA } from "@/components/home/community-invitation-cta";
import { FAQSection } from "@/components/home/faq-section";
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
        title="Support Social Change. Get More Back - Dopaya"
        description="Support social enterprises creating lasting change + unlock exclusive rewards and community access. Join the founding community of impact-driven changemakers."
        keywords="social enterprises, social impact, sustainable solutions, impact rewards, founding members, social change, verified impact"
        canonicalUrl="https://dopaya.org/"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Dopaya",
          "url": "https://dopaya.org",
          "logo": "https://dopaya.org/logo.png",
          "description": "Platform connecting supporters with verified social enterprises through transparent impact tracking and exclusive community rewards.",
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
      
      {/* 1. Hero Section - Honest Value Proposition */}
      <HeroSection />
      
      {/* 2. Interactive Social Enterprise Explorer - Enhanced ChangeWorldSection */}
      <div id="explore">
        <ChangeWorldSection />
      </div>
      
      {/* 3. Why Social Enterprises? - Educational Section */}
      <WhySocialEnterprisesSection />
      
      {/* 4. Partner Showcase - Trust-Focused Single Brand Feature */}
      <PartnerShowcaseSection />
      
      {/* 5. Track Your Impact - Dashboard Preview (replaces gamification) */}
      <ImpactDashboardSection />
      
      {/* 6. Institutional Social Proof - Authentic Trust Building */}
      <InstitutionalProofSection />
      
      {/* 7. FAQ Section - Keep for transparency */}
      <FAQSection />
      
      {/* 8. Community Invitation - Authentic CTA */}
      <div id="community">
        <CommunityInvitationCTA />
      </div>
    </>
  );
}