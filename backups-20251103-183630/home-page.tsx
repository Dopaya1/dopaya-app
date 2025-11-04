// Removed old HeroSectionV3 import as we use the duplicated hero below
import { CaseStudyModernSectionV3 } from "@/components/home/case-study-modern-section-v3";
import { PartnerShowcaseSection } from "@/components/home/partner-showcase-section-optimized";
import { ImpactDashboardSection } from "@/components/home/impact-dashboard-section-optimized";
import { InstitutionalProofSimple } from "@/components/home/institutional-proof-simple";
import { FoundingMemberCTA } from "@/components/home/founding-member-cta";
import { FAQSection } from "@/components/home/faq-section";
import { SEOHead } from "@/components/seo/seo-head";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useEffect, useRef, useState } from "react";
import { BRAND_COLORS } from "@/constants/colors";

export default function HomePage() {
  // rotating word for duplicate hero headline
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const h1IntervalRef = useRef<NodeJS.Timeout | null>(null);
  const h1Words = ['rewarding', 'transparent', 'efficient', 'meaningful'];

  useEffect(() => {
    h1IntervalRef.current = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % h1Words.length);
    }, 3000);
    return () => {
      if (h1IntervalRef.current) clearInterval(h1IntervalRef.current);
    };
  }, []);
  const { data: bubbleProjects = [] } = useQuery({
    queryKey: ["home-bubble-projects-featured-only"],
    queryFn: async () => {
      const { data } = await supabase
        .from('projects')
        .select('*')
        .eq('status', 'active')
        .eq('featured', true)
        .order('createdAt', { ascending: false })
        .limit(6);
      return data || [];
    },
    staleTime: 60_000,
  });

  const { data: bubbleRewards = [] } = useQuery({
    queryKey: ["home-bubble-rewards"],
    queryFn: async () => {
      const { data } = await supabase
        .from('rewards')
        .select('*')
        .order('pointsCost', { ascending: true })
        .limit(6);
      return data || [];
    },
    staleTime: 60_000,
  });
  return (
    <>
      <SEOHead
        title="Dopaya - Social Impact Platform | Support Social Enterprises & Earn Rewards"
        description="Join Dopaya to support high-impact social enterprises, earn impact points, and drive meaningful change. 100% of donations go to verified social causes. Get exclusive rewards for your impact."
        keywords="social impact platform, impact investing, social enterprise funding, donate social causes, impact rewards, social impact points, sustainable development, social enterprise support"
        canonicalUrl="https://dopaya.com/"
        ogType="website"
        ogImage="https://dopaya.com/og-homepage.jpg"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Dopaya",
          "description": "Social impact platform connecting supporters with verified social enterprises",
          "url": "https://dopaya.com",
          "logo": "https://dopaya.com/logo.png",
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
          "url": "https://dopaya.com",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://dopaya.com/projects?search={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        })}
      </script>
      
      <div className="min-h-screen bg-white">
        {/* 1. Hero Section with Connection Arrow */}
        <section className="pt-32 md:pt-40 pb-48 md:pb-56 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-center relative">
              {/* Left: Social Enterprises (bubbles layout) */}
              <div className="relative h-[380px] md:h-[460px]" style={{ zIndex: 2 }}>
                <div className="absolute left-2 top-6">
                  {bubbleProjects[0] && (
                    <div className="relative">
                      <img src={bubbleProjects[0].imageUrl || ''} alt={bubbleProjects[0].title} className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover ring-4 ring-orange-100" />
                      <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[11px] bg-white text-gray-800 px-2 py-0.5 rounded border border-gray-200 whitespace-nowrap">
                        {bubbleProjects[0].category || 'Impact'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="absolute left-24 md:left-32 top-40">
                  {bubbleProjects[1] && (
                    <div className="relative">
                      <img src={bubbleProjects[1].imageUrl || ''} alt={bubbleProjects[1].title} className="w-24 h-24 md:w-28 md:h-28 rounded-full object-cover ring-4 ring-orange-100" />
                      <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[11px] bg-white text-gray-800 px-2 py-0.5 rounded border border-gray-200 whitespace-nowrap">
                        {bubbleProjects[1].category || 'Impact'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="absolute left-0 bottom-4">
                  {bubbleProjects[2] && (
                    <div className="relative">
                      <img src={bubbleProjects[2].imageUrl || ''} alt={bubbleProjects[2].title} className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover ring-4 ring-orange-100" />
                      <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[11px] bg-white text-gray-800 px-2 py-0.5 rounded border border-gray-200 whitespace-nowrap">
                        {bubbleProjects[2].category || 'Impact'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Center: Headline, subheadline, buttons */}
              <div className="text-center relative" style={{ zIndex: 2 }}>
                <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-4">
                  Supporting real impact made{' '}
                  <span className="px-2 md:px-3 py-1 rounded-lg inline-block" style={{ backgroundColor: BRAND_COLORS.bgBeige, color: '#F05304' }}>
                    {h1Words[currentWordIndex]}
                  </span>
                </h1>
                <p className="text-xl md:text-2xl text-gray-700 mb-6 max-w-xl mx-auto">Back verified changemakers - and earn rewards from brands driving sustainability forward.</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a href="https://tally.so/r/m6MqAe" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-[#F05304] text-white hover:bg-[#e14c03]">Join Waitlist</a>
                  <a href="/projects" className="inline-flex items-center justify-center px-6 py-3 rounded-md border border-gray-300 text-gray-800 hover:bg-gray-50">See Social Enterprises</a>
                </div>
              </div>

              {/* Right: Rewards products with category labels */}
              <div className="relative h-[380px] md:h-[460px]" style={{ zIndex: 2 }}>
                <div className="absolute right-2 top-8">
                  {bubbleRewards[0] && (
                    <div className="relative">
                      <img src={bubbleRewards[0].imageUrl || ''} alt={bubbleRewards[0].title} className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover ring-4 ring-orange-100" />
                      <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[11px] bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-800 whitespace-nowrap">
                        {bubbleRewards[0].category || 'Reward'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="absolute right-24 md:right-32 top-40">
                  {bubbleRewards[1] && (
                    <div className="relative">
                      <img src={bubbleRewards[1].imageUrl || ''} alt={bubbleRewards[1].title} className="w-24 h-24 md:w-28 md:h-28 rounded-full object-cover ring-4 ring-orange-100" />
                      <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[11px] bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-800 whitespace-nowrap">
                        {bubbleRewards[1].category || 'Reward'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="absolute right-0 bottom-4">
                  {bubbleRewards[2] && (
                    <div className="relative">
                      <img src={bubbleRewards[2].imageUrl || ''} alt={bubbleRewards[2].title} className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover ring-4 ring-orange-100" />
                      <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[11px] bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-800 whitespace-nowrap">
                        {bubbleRewards[2].category || 'Reward'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Subtle curved dotted arrow connecting left to right - below buttons */}
              <div className="absolute left-0 right-0 hidden md:block" style={{ zIndex: 1, top: '100%', marginTop: '1rem' }}>
                <svg 
                  className="w-full h-48 pointer-events-none overflow-visible" 
                  viewBox="0 0 1200 200"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <marker 
                      id="arrowhead-hero-2" 
                      markerWidth="14" 
                      markerHeight="14" 
                      refX="12" 
                      refY="7" 
                      orient="auto"
                    >
                      <polygon 
                        points="0 0, 14 7, 0 14" 
                        fill="#f2662d" 
                        opacity="0.6"
                      />
                    </marker>
                  </defs>
                  <path
                    d="M 150 40 Q 600 170, 1050 40"
                    stroke="#f2662d"
                    strokeWidth="2.5"
                    fill="none"
                    strokeDasharray="4,4"
                    opacity="0.25"
                    markerEnd="url(#arrowhead-hero-2)"
                  />
                </svg>
              </div>
            </div>
          </div>
        </section>

        {/* Info bar under hero */}
        <section className="py-6" style={{ backgroundColor: '#ebe8df' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-base md:text-lg lg:text-xl text-gray-700 text-center">
              Support selected social enterprises ··· Get tangible rewards ··· 100% sustainable products & transparent impact
            </p>
          </div>
        </section>
        
        {/* 2. Case Study Section - New layout with ExpandableGallery */}
        <CaseStudyModernSectionV3 />
        
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