import { HeroSectionV3 } from "@/components/home/hero-section-v3";
import { CaseStudyModernSectionV2 } from "@/components/home/case-study-modern-section-v2";
import { PartnerShowcaseSection } from "@/components/home/partner-showcase-section-optimized";
import { ImpactDashboardSection } from "@/components/home/impact-dashboard-section-optimized";
import { InstitutionalProofSimple } from "@/components/home/institutional-proof-simple";
import { FAQSection } from "@/components/home/faq-section";
import { FoundingMemberCTA } from "@/components/home/founding-member-cta";
import { SEOHead } from "@/components/seo/seo-head";

export default function HomePage() {
  return (
    <>
      <SEOHead
        title="Dopaya - Social Impact Platform | Support Social Enterprises & Earn Rewards"
        description="Join Dopaya to support high-impact social enterprises, earn impact points, and drive meaningful change. 100% of donations go to verified social causes. Get exclusive rewards for your impact."
        keywords="social impact platform, impact investing, social enterprise funding, donate social causes, impact rewards, social impact points, sustainable development, social enterprise support"
        canonicalUrl="https://dopaya.org/"
        ogType="website"
        ogImage="https://dopaya.org/og-homepage.jpg"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Dopaya",
          "description": "Social impact platform connecting supporters with verified social enterprises",
          "url": "https://dopaya.org",
          "logo": "https://dopaya.org/logo.png",
          "foundingDate": "2024",
          "industry": "Social Impact Technology",
          "sameAs": [
            "https://twitter.com/dopaya",
            "https://linkedin.com/company/dopaya"
          ],
          "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "customer service",
            "email": "hello@dopaya.org"
          },
          "offers": {
            "@type": "Offer",
            "description": "Support social enterprises and earn impact points",
            "price": "0",
            "priceCurrency": "USD"
          },
          "knowsAbout": [
            "Social Impact",
            "Social Enterprise Funding",
            "Impact Investing",
            "Sustainable Development",
            "Community Development"
          ],
          "areaServed": "Global",
          "serviceType": "Social Impact Platform"
        }}
      />
      
      {/* Additional WebSite Schema for Search Functionality */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Dopaya",
          "description": "Social impact platform connecting supporters with verified social enterprises",
          "url": "https://dopaya.org",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://dopaya.org/projects?search={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        })}
      </script>
      
      <div className="min-h-screen bg-white">
        {/* 1. Hero Section */}
        <HeroSectionV3 />
        
        {/* 2. Case Study Section */}
        <CaseStudyModernSectionV2 />
        
        {/* 3. Partner Showcase Section */}
        <PartnerShowcaseSection />
        
        {/* 4. Impact Dashboard Section */}
        <ImpactDashboardSection />
        
        {/* 5. Institutional Proof Section */}
        <InstitutionalProofSimple />
        
        {/* 6. FAQ Section */}
        <FAQSection />
        
        {/* 7. Founding Member CTA */}
        <FoundingMemberCTA />
      </div>
    </>
  );
}