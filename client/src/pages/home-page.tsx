// Removed old HeroSectionV3 import as we use the duplicated hero below
import { SEOHead } from "@/components/seo/seo-head";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useEffect, useRef, useState, useMemo, lazy, Suspense } from "react";
import { BRAND_COLORS } from "@/constants/colors";
import { getProjectImageUrl } from "@/lib/image-utils";
import { ShieldCheck, Gift, Leaf } from "lucide-react";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useI18n } from "@/lib/i18n/i18n-context";
import { LanguageLink } from "@/components/ui/language-link";
import { translations } from "@/lib/i18n/translations";
import { getRewardTitle } from "@/lib/i18n/project-content";

// Lazily loaded below-the-fold sections to improve initial load performance
const CaseStudyModernSectionV3 = lazy(() =>
  import("@/components/home/case-study-modern-section-v3").then((m) => ({
    default: m.CaseStudyModernSectionV3,
  })),
);

const PartnerShowcaseSection = lazy(() =>
  import("@/components/home/partner-showcase-section-optimized").then((m) => ({
    default: m.PartnerShowcaseSection,
  })),
);

const ImpactDashboardSection = lazy(() =>
  import("@/components/home/impact-dashboard-section-optimized").then((m) => ({
    default: m.ImpactDashboardSection,
  })),
);

const InstitutionalProofSimple = lazy(() =>
  import("@/components/home/institutional-proof-simple").then((m) => ({
    default: m.InstitutionalProofSimple,
  })),
);

const FAQSection = lazy(() =>
  import("@/components/home/faq-section").then((m) => ({
    default: m.FAQSection,
  })),
);

export default function HomePage() {
  const { t } = useTranslation();
  const { language } = useI18n();
  
  // rotating word for duplicate hero headline
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const h1IntervalRef = useRef<NodeJS.Timeout | null>(null);
  const h1Words = useMemo(() => {
    const words = translations[language].home.heroRotatingWords;
    // Safety check: ensure it's an array
    if (!Array.isArray(words) || words.length === 0) {
      console.warn('heroRotatingWords is not a valid array for language:', language);
      return language === 'de' 
        ? ['belohnend', 'transparent', 'effizient', 'bedeutsam']
        : ['rewarding', 'transparent', 'efficient', 'meaningful'];
    }
    return words;
  }, [language]);
  
  // Info bar slider state (mobile only)
  const [infoBarIndex, setInfoBarIndex] = useState(0);
  const infoBarItems = [
    t("home.infoBar1"),
    t("home.infoBar2"),
    t("home.infoBar3")
  ];
  const infoBarIcons = [ShieldCheck, Gift, Leaf];

  useEffect(() => {
    // Reset index when words change
    setCurrentWordIndex(0);
    
    // Clear existing interval
    if (h1IntervalRef.current) {
      clearInterval(h1IntervalRef.current);
    }
    
    // Safety check: ensure we have words
    if (!h1Words || h1Words.length === 0) {
      return;
    }
    
    // Set up new interval
    h1IntervalRef.current = setInterval(() => {
      setCurrentWordIndex((prev) => {
        const next = (prev + 1) % h1Words.length;
        return next;
      });
    }, 3000);
    
    return () => {
      if (h1IntervalRef.current) clearInterval(h1IntervalRef.current);
    };
  }, [h1Words]);

  // Auto-rotate info bar items on mobile (every 3 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      setInfoBarIndex((prev) => (prev + 1) % infoBarItems.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [infoBarItems.length]);
  const { data: bubbleProjects = [] } = useQuery({
    queryKey: ["home-bubble-projects-featured-only"],
    queryFn: async () => {
      const { data } = await supabase
        .from('projects')
        .select('*')
        .eq('status', 'active')
        .eq('featured', true)
        .order('createdAt', { ascending: false })
        .limit(10); // Fetch more to ensure we have enough after filtering
      
      // Client-side filter to exclude Universal Fund projects
      // Check both camelCase and snake_case variants
      const filtered = (data || []).filter((project: any) => {
        const isUniversalFund = project.is_universal_fund === true || project.isUniversalFund === true;
        return !isUniversalFund;
      });
      
      // Return only first 6 after filtering
      return filtered.slice(0, 6);
    },
    staleTime: 60_000,
  });

  const { data: bubbleRewards = [] } = useQuery({
    queryKey: ["home-bubble-rewards-featured-only"],
    queryFn: async () => {
      const { data } = await supabase
        .from('rewards')
        .select('*')
        .eq('featured', true)
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
        ogImage="https://dopaya.com/og-image.png"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Dopaya",
          "alternateName": "Dopaya Social Impact Platform",
          "description": "Platform connecting supporters with verified social enterprises, enabling donations while earning rewards from sustainable brands.",
          "url": "https://dopaya.com",
          "logo": "https://dopaya.com/assets/Dopaya%20Logo-IS_kpXiQ.png",
          "foundingDate": "2024",
          "foundingLocation": {
            "@type": "Place",
            "address": {
              "@type": "PostalAddress",
              "addressCountry": "CH"
            }
          },
          "areaServed": "Worldwide",
          "slogan": "Supporting real impact made rewarding",
          "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "customer support",
            "email": "hello@dopaya.com",
            "url": "https://dopaya.com/contact"
          },
          "sameAs": [
            "https://www.linkedin.com/company/dopaya",
            "https://www.instagram.com/dopaya"
          ],
          "knowsAbout": [
            "Social Impact",
            "Social Enterprise Funding",
            "Impact Investing",
            "Sustainable Development",
            "Community Development",
            "Social Entrepreneurship",
            "Impact Rewards",
            "Transparent Philanthropy"
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
        <section className="pt-14 md:pt-40 pb-[50px] md:pb-56 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Desktop: 3-column grid layout */}
            <div className="hidden md:grid md:grid-cols-3 gap-10 items-center relative">
              {/* Left: Social Enterprises (bubbles layout) - Desktop */}
              <div className="relative h-[460px]" style={{ zIndex: 2 }}>
                <div className="absolute left-2 top-6">
                  {bubbleProjects[0] && (
                    <div className="relative group cursor-pointer">
                      <img 
                        src={getProjectImageUrl(bubbleProjects[0]) || ''} 
                        alt={`${bubbleProjects[0].title} - ${bubbleProjects[0].category} social enterprise`} 
                        width="128" 
                        height="128"
                        fetchPriority="high"
                        className="w-32 h-32 rounded-full object-cover ring-4 ring-orange-100 transition-transform duration-300 group-hover:scale-110" 
                      />
                      <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[11px] bg-white text-gray-800 px-2 py-0.5 rounded border border-gray-200 whitespace-nowrap">
                        {t("home.impactLabel")} {bubbleProjects[0].category || 'Impact'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="absolute left-32 top-40">
                  {bubbleProjects[1] && (
                    <div className="relative group cursor-pointer">
                      <img 
                        src={getProjectImageUrl(bubbleProjects[1]) || ''} 
                        alt={`${bubbleProjects[1].title} - ${bubbleProjects[1].category} social enterprise`} 
                        width="112" 
                        height="112"
                        className="w-28 h-28 rounded-full object-cover ring-4 ring-orange-100 transition-transform duration-300 group-hover:scale-110" 
                      />
                      <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[11px] bg-white text-gray-800 px-2 py-0.5 rounded border border-gray-200 whitespace-nowrap">
                        {t("home.impactLabel")} {bubbleProjects[1].category || 'Impact'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="absolute left-0 bottom-4">
                  {bubbleProjects[2] && (
                    <div className="relative group cursor-pointer">
                      <img 
                        src={getProjectImageUrl(bubbleProjects[2]) || ''} 
                        alt={`${bubbleProjects[2].title} - ${bubbleProjects[2].category} social enterprise`} 
                        width="128" 
                        height="128"
                        className="w-32 h-32 rounded-full object-cover ring-4 ring-orange-100 transition-transform duration-300 group-hover:scale-110" 
                      />
                      <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[11px] bg-white text-gray-800 px-2 py-0.5 rounded border border-gray-200 whitespace-nowrap">
                        {t("home.impactLabel")} {bubbleProjects[2].category || 'Impact'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Center: Headline, subheadline, buttons - Desktop */}
              <div className="text-center relative" style={{ zIndex: 2 }}>
                <h1 className="text-6xl font-bold text-gray-900 leading-tight mb-4">
                  {language === 'de' ? (
                    <>
                      {t("home.heroTitlePrefix")}{' '}
                      <span className="px-3 py-1 rounded-lg inline-block" style={{ backgroundColor: BRAND_COLORS.bgBeige, color: '#F05304' }}>
                        {h1Words && h1Words.length > 0 ? h1Words[Math.min(currentWordIndex, h1Words.length - 1)] : ''}
                      </span>
                      {' '}{t("home.heroTitleSuffix")}
                    </>
                  ) : (
                    <>
                      {t("home.heroTitlePrefix")}{' '}
                      <span className="px-3 py-1 rounded-lg inline-block" style={{ backgroundColor: BRAND_COLORS.bgBeige, color: '#F05304' }}>
                        {h1Words && h1Words.length > 0 ? h1Words[Math.min(currentWordIndex, h1Words.length - 1)] : ''}
                      </span>
                    </>
                  )}
                </h1>
                <p className="text-[28px] text-gray-700 mb-6 max-w-xl mx-auto">{t("home.heroSubtitle")}</p>
                <div className="flex flex-row gap-4 justify-center">
                  <LanguageLink href="/projects" className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-[#F05304] text-white hover:bg-[#e14c03]">{t("home.supportSocialEnterprises")}</LanguageLink>
                </div>
              </div>

              {/* Right: Rewards products with category labels - Desktop */}
              <div className="relative h-[460px]" style={{ zIndex: 2 }}>
                <div className="absolute right-2 top-8">
                  {bubbleRewards[0] && (
                    <div className="relative group cursor-pointer">
                      <img 
                        src={bubbleRewards[0].imageUrl || ''} 
                        alt={`${getRewardTitle(bubbleRewards[0], language)} - ${bubbleRewards[0].category} reward`} 
                        width="128" 
                        height="128"
                        className="w-32 h-32 rounded-full object-cover ring-4 ring-orange-100 transition-transform duration-300 group-hover:scale-110" 
                      />
                      <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[11px] bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-800 whitespace-nowrap">
                        {t("home.rewardLabel")} {bubbleRewards[0].category || 'Reward'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="absolute right-32 top-40">
                  {bubbleRewards[1] && (
                    <div className="relative group cursor-pointer">
                      <img 
                        src={bubbleRewards[1].imageUrl || ''} 
                        alt={`${getRewardTitle(bubbleRewards[1], language)} - ${bubbleRewards[1].category} reward`} 
                        width="112" 
                        height="112"
                        className="w-28 h-28 rounded-full object-cover ring-4 ring-orange-100 transition-transform duration-300 group-hover:scale-110" 
                      />
                      <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[11px] bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-800 whitespace-nowrap">
                        {t("home.rewardLabel")} {bubbleRewards[1].category || 'Reward'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="absolute right-0 bottom-4">
                  {bubbleRewards[2] && (
                    <div className="relative group cursor-pointer">
                      <img 
                        src={bubbleRewards[2].imageUrl || ''} 
                        alt={`${getRewardTitle(bubbleRewards[2], language)} - ${bubbleRewards[2].category} reward`} 
                        width="128" 
                        height="128"
                        className="w-32 h-32 rounded-full object-cover ring-4 ring-orange-100 transition-transform duration-300 group-hover:scale-110" 
                      />
                      <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[11px] bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-800 whitespace-nowrap">
                        {t("home.rewardLabel")} {bubbleRewards[2].category || 'Reward'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Subtle curved dotted arrow connecting left to right - Desktop only */}
              <div className="absolute left-0 right-0" style={{ zIndex: 1, top: '100%', marginTop: '1rem' }}>
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

            {/* Mobile: Stacked layout with circles below buttons */}
            <div className="md:hidden flex flex-col items-center overflow-x-hidden w-full">
              {/* Headline, subheadline, buttons */}
              <div className="text-center w-full mb-6">
                <h1 className="text-4xl font-bold text-gray-900 leading-tight mb-3">
                  {language === 'de' ? (
                    <>
                      {t("home.heroTitlePrefix")}{' '}
                      <span className="px-2 py-1 rounded-lg inline-block" style={{ backgroundColor: BRAND_COLORS.bgBeige, color: '#F05304' }}>
                        {h1Words && h1Words.length > 0 ? h1Words[Math.min(currentWordIndex, h1Words.length - 1)] : ''}
                      </span>
                      {' '}{t("home.heroTitleSuffix")}
                    </>
                  ) : (
                    <>
                      {t("home.heroTitlePrefix")}{' '}
                      <span className="px-2 py-1 rounded-lg inline-block" style={{ backgroundColor: BRAND_COLORS.bgBeige, color: '#F05304' }}>
                        {h1Words && h1Words.length > 0 ? h1Words[Math.min(currentWordIndex, h1Words.length - 1)] : ''}
                      </span>
                    </>
                  )}
                </h1>
                <p className="text-lg text-gray-700 mb-5">{t("home.heroSubtitle")}</p>
                <div className="flex flex-col gap-3 w-full">
                  <LanguageLink href="/projects" className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-[#F05304] text-white hover:bg-[#e14c03] w-full">{t("home.supportSocialEnterprises")}</LanguageLink>
                </div>
              </div>

              {/* Circles: SEs on left, Brands on right - side by side with 3 circles each */}
              <div className="grid grid-cols-2 gap-3 w-full mt-4 relative overflow-x-hidden mb-0" style={{ minHeight: '360px' }}>
                {/* Subtle curved line connecting both sides - Mobile only, behind bubbles */}
                <div className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none" style={{ zIndex: 0 }}>
                  <svg 
                    className="w-full h-full overflow-visible" 
                    viewBox="0 0 400 100"
                    preserveAspectRatio="xMidYMid slice"
                  >
                    <defs>
                      <marker 
                        id="arrowhead-mobile-curved" 
                        markerWidth="8" 
                        markerHeight="8" 
                        refX="6" 
                        refY="4" 
                        orient="auto"
                      >
                        <polygon 
                          points="0 0, 8 4, 0 8" 
                          fill="#f2662d" 
                          opacity="0.4"
                        />
                      </marker>
                    </defs>
                    {/* Geschwungene Linie von links nach rechts (vertikal gespiegelt - Kurve nach unten) */}
                    <path
                      d="M 50 50 Q 200 100, 350 50"
                      stroke="#f2662d"
                      strokeWidth="1.2"
                      fill="none"
                      strokeDasharray="3,3"
                      opacity="0.4"
                      markerEnd="url(#arrowhead-mobile-curved)"
                    />
                  </svg>
                </div>
                
                {/* Left: Social Enterprises - 3 circles with different sizes and positions */}
                <div className="relative h-[360px]" style={{ zIndex: 2 }}>
                  {bubbleProjects[0] && (
                    <div className="absolute left-1 top-2" style={{ zIndex: 30 }}>
                      <div className="relative group cursor-pointer">
                        <img 
                          src={getProjectImageUrl(bubbleProjects[0]) || ''} 
                          alt={bubbleProjects[0].title} 
                          width="112" 
                          height="112"
                          fetchPriority="high"
                          className="w-28 h-28 rounded-full object-cover ring-2 ring-orange-100 transition-transform duration-300 group-active:scale-110" 
                        />
                        <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[11px] bg-white text-gray-800 px-2 py-0.5 rounded border border-gray-200 max-w-[140px] whitespace-nowrap overflow-hidden text-ellipsis text-center">
                          {t("home.impactLabel")} {bubbleProjects[0].category || 'Impact'}
                        </span>
                      </div>
                    </div>
                  )}
                  {bubbleProjects[1] && (
                    <div className="absolute left-16 top-28" style={{ zIndex: 20 }}>
                      <div className="relative group cursor-pointer">
                        <img 
                          src={getProjectImageUrl(bubbleProjects[1]) || ''} 
                          alt={bubbleProjects[1].title} 
                          width="96" 
                          height="96"
                          className="w-24 h-24 rounded-full object-cover ring-2 ring-orange-100 transition-transform duration-300 group-active:scale-110" 
                        />
                        <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[11px] bg-white text-gray-800 px-2 py-0.5 rounded border border-gray-200 max-w-[140px] whitespace-nowrap overflow-hidden text-ellipsis text-center">
                          {t("home.impactLabel")} {bubbleProjects[1].category || 'Impact'}
                        </span>
                      </div>
                    </div>
                  )}
                  {bubbleProjects[2] && (
                    <div className="absolute left-0 top-52" style={{ zIndex: 10 }}>
                      <div className="relative group cursor-pointer">
                        <img 
                          src={getProjectImageUrl(bubbleProjects[2]) || ''} 
                          alt={bubbleProjects[2].title} 
                          width="112" 
                          height="112"
                          className="w-28 h-28 rounded-full object-cover ring-2 ring-orange-100 transition-transform duration-300 group-active:scale-110" 
                        />
                        <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[11px] bg-white text-gray-800 px-2 py-0.5 rounded border border-gray-200 max-w-[140px] whitespace-nowrap overflow-hidden text-ellipsis text-center">
                          {t("home.impactLabel")} {bubbleProjects[2].category || 'Impact'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: Brand Rewards - 3 circles with different sizes and positions */}
                <div className="relative h-[360px]" style={{ zIndex: 2 }}>
                  {bubbleRewards[0] && (
                    <div className="absolute right-1 top-2" style={{ zIndex: 30 }}>
                      <div className="relative group cursor-pointer">
                        <img 
                          src={bubbleRewards[0].imageUrl || ''} 
                          alt={getRewardTitle(bubbleRewards[0], language)} 
                          width="112" 
                          height="112"
                          className="w-28 h-28 rounded-full object-cover ring-2 ring-orange-100 transition-transform duration-300 group-active:scale-110" 
                        />
                        <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[11px] bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-800 max-w-[140px] whitespace-nowrap overflow-hidden text-ellipsis text-center">
                          {t("home.rewardLabel")} {bubbleRewards[0].category || 'Reward'}
                        </span>
                      </div>
                    </div>
                  )}
                  {bubbleRewards[1] && (
                    <div className="absolute right-16 top-28" style={{ zIndex: 20 }}>
                      <div className="relative group cursor-pointer">
                        <img 
                          src={bubbleRewards[1].imageUrl || ''} 
                          alt={getRewardTitle(bubbleRewards[1], language)} 
                          width="96" 
                          height="96"
                          className="w-24 h-24 rounded-full object-cover ring-2 ring-orange-100 transition-transform duration-300 group-active:scale-110" 
                        />
                        <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[11px] bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-800 max-w-[140px] whitespace-nowrap overflow-hidden text-ellipsis text-center">
                          {t("home.rewardLabel")} {bubbleRewards[1].category || 'Reward'}
                        </span>
                      </div>
                    </div>
                  )}
                  {bubbleRewards[2] && (
                    <div className="absolute right-0 top-52" style={{ zIndex: 10 }}>
                      <div className="relative group cursor-pointer">
                        <img 
                          src={bubbleRewards[2].imageUrl || ''} 
                          alt={getRewardTitle(bubbleRewards[2], language)} 
                          width="112" 
                          height="112"
                          className="w-28 h-28 rounded-full object-cover ring-2 ring-orange-100 transition-transform duration-300 group-active:scale-110" 
                        />
                        <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[11px] bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-800 max-w-[140px] whitespace-nowrap overflow-hidden text-ellipsis text-center">
                          {t("home.rewardLabel")} {bubbleRewards[2].category || 'Reward'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Info bar under hero */}
        <section className="py-3 md:py-6 md:flex md:items-center" style={{ backgroundColor: '#ebe8df' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            {/* Desktop: 3 columns */}
            <div className="hidden md:grid md:grid-cols-3 gap-4 lg:gap-8 items-center">
              <div className="flex items-center justify-center gap-2">
                <ShieldCheck className="w-5 h-5 text-gray-800 opacity-70 flex-shrink-0" />
                <p className="text-base lg:text-xl text-gray-800 text-center">
                  {t("home.infoBar1")}
                </p>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Gift className="w-5 h-5 text-gray-800 opacity-70 flex-shrink-0" />
                <p className="text-base lg:text-xl text-gray-800 text-center">
                  {t("home.infoBar2")}
                </p>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Leaf className="w-5 h-5 text-gray-800 opacity-70 flex-shrink-0" />
                <p className="text-base lg:text-xl text-gray-800 text-center">
                  {t("home.infoBar3")}
                </p>
              </div>
            </div>
            
            {/* Mobile: Auto-slider (1 item at a time) */}
            <div className="md:hidden relative overflow-hidden w-full py-1">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${infoBarIndex * 100}%)` }}
              >
                {infoBarItems.map((item, index) => {
                  const IconComponent = infoBarIcons[index];
                  return (
                    <div 
                      key={index}
                      className="w-full flex-shrink-0 flex items-center justify-center gap-2 px-3 min-w-0"
                    >
                      <IconComponent className="w-5 h-5 text-gray-800 opacity-70 flex-shrink-0" />
                      <p className="text-base text-gray-800 text-center flex-1 break-words whitespace-normal leading-relaxed">
                        {item}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
        
        {/* 2. Case Study Section - New layout with ExpandableGallery */}
        <Suspense fallback={null}>
          <CaseStudyModernSectionV3 />
        </Suspense>
      
      {/* 3. Partner Showcase Section */}
      <Suspense fallback={null}>
        <PartnerShowcaseSection />
      </Suspense>
      
      {/* 4. Impact Dashboard Section */}
      <Suspense fallback={null}>
        <ImpactDashboardSection />
      </Suspense>
      
      {/* 5. Institutional Proof Section */}
      <Suspense fallback={null}>
        <InstitutionalProofSimple />
      </Suspense>
      
      {/* 6. FAQ Section */}
      <Suspense fallback={null}>
        <FAQSection />
      </Suspense>
      </div>
    </>
  );
}






















