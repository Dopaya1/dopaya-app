import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink, Shield, CheckCircle, Leaf, Heart, ArrowLeft, ArrowRight, ArrowUpRight, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Reward } from "@shared/schema";
import { TYPOGRAPHY } from "@/constants/typography";
import { BRAND_COLORS } from "@/constants/colors";
import { MOBILE } from "@/constants/mobile";
import { MobileSlider } from "@/components/ui/mobile-slider";
import bonjiLogo from '@assets/Brand_backers/Bonji sustainable brand - logo.png';
import aaparLogo from '@assets/Brand_backers/Aapar sustainable brand - logo.png';
import syangsLogo from '@assets/Syangs logo_1750646598029.png';
import sankalpaArtVillageLogo from '@assets/Brand_backers/sankalpa-art-village sustainable brand - logo.png';
import milletarianLogo from '@assets/Brand_backers/milletarian sustainable brand - logo.png';

// Real brand data with available logos
const impactBrands = [
  {
    id: 1,
    name: "Bonji",
    fullName: "Bonji - Beyond Just Natural",
    logo: bonjiLogo,
    hoverDescription: "Anti-pollution skin & hair care products made with natural ingredients. Beyond just trends, basics, and looks - real science-backed solutions for city life damage.",
    category: "Beauty & Wellness",
    website: "https://bonji.in",
    featured: true
  },
  {
    id: 2,
    name: "Sankalpa Art Village",
    fullName: "Sankalpa Art Village",
    logo: sankalpaArtVillageLogo,
    hoverDescription: "Sustainable living through natural dyed clothing, conscious baby clothing, handmade cutlery, wooden toys, and organics. Creating local livelihood with craft and reviving indigenous traditions.",
    category: "Sustainable Lifestyle",
    website: "https://www.sankalpaartvillage.com",
    featured: true
  },
  {
    id: 3,
    name: "Milletarian",
    fullName: "Milletarian - Magic Malt",
    logo: milletarianLogo,
    hoverDescription: "100% natural, no preservatives Ragi Malt that's nutrition simplified. Just add hot water for instant goodness of Finger Millet with added fiber - perfect for health enthusiasts and busy professionals.",
    category: "Health & Nutrition",
    website: "https://milletarian.netlify.app",
    featured: true
  },
  {
    id: 4,
    name: "Aapar",
    fullName: "Aapar",
    logo: aaparLogo,
    hoverDescription: "Sustainable lifestyle brand focused on traditional crafts and eco-friendly products supporting rural artisans and promoting conscious consumption.",
    category: "Lifestyle",
    website: "https://www.aapar.in",
    featured: true
  },
  {
    id: 5,
    name: "Syangs",
    fullName: "Syangs",
    logo: syangsLogo,
    hoverDescription: "Organic food products and sustainable agriculture solutions supporting farmers and promoting healthy living through natural, chemical-free products.",
    category: "Food & Agriculture",
    website: "https://www.syangs.com",
    featured: true
  }
];

export function PartnerShowcaseSection() {
  const [selectedBrand, setSelectedBrand] = useState<number | null>(null);
  // Page-based slider (4 items per page on lg, 3 on md, 2 on sm)
  const [page, setPage] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const brands = impactBrands.filter(b => b.featured);
  const getVisible = (count: number) => {
    const out: typeof brands = [] as any;
    for (let i = 0; i < count; i++) {
      const idx = (page * count + i) % brands.length;
      out.push(brands[idx]);
    }
    return out;
  };

  // Auto-advance pages (infinite) and pause on hover or user interaction
  useEffect(() => {
    if (isPaused || brands.length === 0) return;
    const id = setInterval(() => {
      setPage((p) => (p + 1) % brands.length);
    }, 3000);
    return () => clearInterval(id);
  }, [isPaused, brands.length]);

  // Fetch real rewards from Supabase database
  const { data: rewards = [], isLoading } = useQuery<Reward[]>({
    queryKey: ["rewards-showcase"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .eq('featured', true)
        .order('pointsCost', { ascending: true })
        .limit(8);
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  return (
    <section className="py-24" style={{ backgroundColor: BRAND_COLORS.bgBeige }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className={`${TYPOGRAPHY.section} mb-4`} style={{ 
            color: BRAND_COLORS.textPrimary, 
            fontFamily: "'Satoshi', 'Inter', system-ui, sans-serif" 
          }}>
            <em>Thank you</em> rewards from impact brands you'll love
          </h2>
          <p className={`${TYPOGRAPHY.bodyLarge} max-w-3xl mx-auto`} style={{ color: BRAND_COLORS.textSecondary }}>
            We believe in "Doing good deserves more". Unlock exclusive thank you rewards for your support - from brands creating positive change in the world
          </p>
        </div>

        {/* Brand Showcase - Slider that preserves 4-grid layout */}
        <div className="mb-16" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
          {/* Desktop/LG: 4 at a time */}
          <div className="hidden lg:grid lg:grid-cols-4 gap-8">
            {getVisible(4).map((brand, idx) => (
              <div key={`${brand.id}-lg-${idx}`} className="px-0">
                <div className="cursor-pointer" onClick={() => { setSelectedBrand(selectedBrand === brand.id ? null : brand.id); setIsPaused(true); }}>
                    <div className="flex items-center justify-center p-6 h-24 rounded-lg" style={{ backgroundColor: BRAND_COLORS.bgWhite }}>
                      <img src={brand.logo} alt={brand.name} className="max-h-12 max-w-full object-contain" />
                    </div>
                  </div>
                  {/* Always-visible info box */}
                  <div className="mt-3 w-full p-4 rounded-lg shadow-sm" style={{ backgroundColor: BRAND_COLORS.bgWhite, border: `1px solid ${BRAND_COLORS.borderSubtle}` }}>
                    <div className="flex items-start gap-3 mb-2">
                      <img src={brand.logo} alt={brand.name} className="w-6 h-6 object-contain" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm" style={{ color: BRAND_COLORS.textPrimary }}>{brand.fullName}</h4>
                        <span className="text-xs" style={{ color: BRAND_COLORS.textMuted }}>{brand.category}</span>
                      </div>
                      <a href={brand.website} target="_blank" rel="noopener noreferrer" className="text-xs" style={{ color: BRAND_COLORS.textMuted }}>
                        <ArrowUpRight className="h-4 w-4" />
                      </a>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: BRAND_COLORS.textSecondary }}>
                      {brand.hoverDescription}
                    </p>
                  </div>
                </div>
            ))}
          </div>
          {/* MD: 3 at a time */}
          <div className="hidden md:grid lg:hidden md:grid-cols-3 gap-8">
            {getVisible(3).map((brand, idx) => (
              <div key={`${brand.id}-md-${idx}`}>{/* same card */}
                <div className="cursor-pointer" onClick={() => { setSelectedBrand(selectedBrand === brand.id ? null : brand.id); setIsPaused(true); }}>
                  <div className="flex items-center justify-center p-6 h-24 rounded-lg" style={{ backgroundColor: BRAND_COLORS.bgWhite }}>
                    <img src={brand.logo} alt={brand.name} className="max-h-12 max-w-full object-contain" />
                  </div>
                </div>
                <div className="mt-3 w-full p-4 rounded-lg shadow-sm" style={{ backgroundColor: BRAND_COLORS.bgWhite, border: `1px solid ${BRAND_COLORS.borderSubtle}` }}>
                  <div className="flex items-start gap-3 mb-2">
                    <img src={brand.logo} alt={brand.name} className="w-6 h-6 object-contain" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm" style={{ color: BRAND_COLORS.textPrimary }}>{brand.fullName}</h4>
                      <span className="text-xs" style={{ color: BRAND_COLORS.textMuted }}>{brand.category}</span>
                    </div>
                    <a href={brand.website} target="_blank" rel="noopener noreferrer" className="text-xs" style={{ color: BRAND_COLORS.textMuted }}>
                      <ArrowUpRight className="h-4 w-4" />
                    </a>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: BRAND_COLORS.textSecondary }}>
                    {brand.hoverDescription}
                  </p>
                </div>
              </div>
            ))}
          </div>
          {/* SM: 2 at a time */}
          <div className="grid md:hidden grid-cols-2 gap-6">
            {getVisible(2).map((brand, idx) => (
              <div key={`${brand.id}-sm-${idx}`}>
                <div className="cursor-pointer" onClick={() => { setSelectedBrand(selectedBrand === brand.id ? null : brand.id); setIsPaused(true); }}>
                  <div className="flex items-center justify-center p-6 h-24 rounded-lg" style={{ backgroundColor: BRAND_COLORS.bgWhite }}>
                    <img src={brand.logo} alt={brand.name} className="max-h-12 max-w-full object-contain" />
                  </div>
                </div>
                <div className="mt-3 w-full p-4 rounded-lg shadow-sm" style={{ backgroundColor: BRAND_COLORS.bgWhite, border: `1px solid ${BRAND_COLORS.borderSubtle}` }}>
                  <div className="flex items-start gap-3 mb-2">
                    <img src={brand.logo} alt={brand.name} className="w-6 h-6 object-contain" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm" style={{ color: BRAND_COLORS.textPrimary }}>{brand.fullName}</h4>
                      <span className="text-xs" style={{ color: BRAND_COLORS.textMuted }}>{brand.category}</span>
                    </div>
                    <a href={brand.website} target="_blank" rel="noopener noreferrer" className="text-xs" style={{ color: BRAND_COLORS.textMuted }}>
                      <ArrowUpRight className="h-4 w-4" />
                    </a>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: BRAND_COLORS.textSecondary }}>
                    {brand.hoverDescription}
                  </p>
                </div>
              </div>
            ))}
          </div>
          {/* Pagination controls removed for autoplay */}
        </div>

        {/* Rewards Section */}
        <div>
          <div className="text-center mb-8">
            <h3 className={`${TYPOGRAPHY.section} mb-4`} style={{ 
              color: BRAND_COLORS.textPrimary,
              fontFamily: "'Satoshi', 'Inter', system-ui, sans-serif"
            }}>
              Popular Rewards
            </h3>
            <p className="text-xl max-w-2xl mx-auto" style={{ color: BRAND_COLORS.textSecondary }}>
              Redeem your impact points for exclusive products and experiences
            </p>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div 
                  key={i}
                  className="rounded-xl overflow-hidden shadow-sm animate-pulse"
                  style={{ backgroundColor: BRAND_COLORS.bgWhite, border: `1px solid ${BRAND_COLORS.borderSubtle}` }}
                >
                  <div className="aspect-square bg-gray-200" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-5 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-8 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Desktop: 4-column grid */}
              <div className="hidden lg:grid lg:grid-cols-4 gap-6">
                {rewards.map((reward) => (
                  <div
                    key={reward.id}
                    className="rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group cursor-pointer"
                    style={{ backgroundColor: BRAND_COLORS.bgWhite, border: `1px solid ${BRAND_COLORS.borderSubtle}` }}
                  >
                    {/* Reward Image - Smaller Height */}
                    <div className="aspect-[16/9] bg-gray-100 overflow-hidden">
                      <img
                        src={reward.imageUrl}
                        alt={reward.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Reward Info */}
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium px-2 py-1 rounded" 
                              style={{ backgroundColor: BRAND_COLORS.bgCool, color: BRAND_COLORS.textMuted }}>
                          {reward.category}
                        </span>
                        {reward.discount && (
                          <span className="text-xs font-medium" style={{ color: BRAND_COLORS.primaryOrange }}>
                            {reward.discount}
                          </span>
                        )}
                      </div>
                      
                      <h4 className="font-semibold line-clamp-2" style={{ color: BRAND_COLORS.textPrimary }}>
                        {reward.title}
                      </h4>
                    </div>
                  </div>
                ))}
              </div>

              {/* Mobile: Slider */}
              <div className="lg:hidden">
                <MobileSlider
                  items={rewards}
                  renderItem={(reward) => (
                    <div
                      key={reward.id}
                      className="rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group cursor-pointer"
                      style={{ backgroundColor: BRAND_COLORS.bgWhite, border: `1px solid ${BRAND_COLORS.borderSubtle}` }}
                    >
                      {/* Reward Image - Smaller Height */}
                      <div className="aspect-[16/9] bg-gray-100 overflow-hidden">
                        <img
                          src={reward.imageUrl}
                          alt={reward.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      {/* Reward Info */}
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium px-2 py-1 rounded" 
                                style={{ backgroundColor: BRAND_COLORS.bgCool, color: BRAND_COLORS.textMuted }}>
                            {reward.category}
                          </span>
                          {reward.discount && (
                            <span className="text-xs font-medium" style={{ color: BRAND_COLORS.primaryOrange }}>
                              {reward.discount}
                            </span>
                          )}
                        </div>
                        
                        <h4 className="font-semibold line-clamp-2" style={{ color: BRAND_COLORS.textPrimary }}>
                          {reward.title}
                        </h4>
                      </div>
                    </div>
                  )}
                  gap="gap-6"
                />
              </div>
            </>
          )}

          {/* View All Rewards CTA - Hidden */}
          {/* <div className="text-center mt-8">
            <Button
              variant="outline"
              className="px-8 py-3"
              style={{ borderColor: BRAND_COLORS.borderSubtle, color: BRAND_COLORS.textPrimary }}
            >
              View All Rewards
              <ArrowUpRight className="h-4 w-4 ml-2" />
            </Button>
          </div> */}
        </div>
      </div>
    </section>
  );
}