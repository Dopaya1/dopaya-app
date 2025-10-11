import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink, Shield, CheckCircle, Leaf, Heart, ArrowLeft, ArrowRight, ArrowUpRight, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Reward } from "@shared/schema";
import { TYPOGRAPHY } from "@/constants/typography";
import { BRAND_COLORS } from "@/constants/colors";
import { MOBILE } from "@/constants/mobile";
import { MobileSlider } from "@/components/ui/mobile-slider";
import bonjiLogo from '@assets/Bonji - beyond just natural.png';
import aaparLogo from '@assets/Aapar logo_1750646598028.png';
import syangsLogo from '@assets/Syangs logo_1750646598029.png';
import sankalpaArtVillageLogo from '@assets/sankalpa-art-village.png';
import milletarianLogo from '@assets/milletarian.png';

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
    name: "Sankalp Village",
    fullName: "Sankalp Art Village",
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
    featured: false
  },
  {
    id: 5,
    name: "Syangs",
    fullName: "Syangs",
    logo: syangsLogo,
    hoverDescription: "Organic food products and sustainable agriculture solutions supporting farmers and promoting healthy living through natural, chemical-free products.",
    category: "Food & Agriculture",
    website: "https://www.syangs.com",
    featured: false
  }
];

export function PartnerShowcaseSection() {
  const [hoveredBrand, setHoveredBrand] = useState<number | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<number | null>(null);

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

        {/* Interactive Brand Showcase - Clay.com Style */}
        <div className="mb-16">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-8">
            {impactBrands.filter(brand => brand.featured).map((brand) => (
              <div
                key={brand.id}
                className="relative group cursor-pointer"
                onMouseEnter={() => setHoveredBrand(brand.id)}
                onMouseLeave={() => setHoveredBrand(null)}
              >
                {/* Brand Logo */}
                <div 
                  className="block cursor-pointer"
                  onClick={() => setSelectedBrand(selectedBrand === brand.id ? null : brand.id)}
                >
                  <div className="flex items-center justify-center p-6 h-24 rounded-lg transition-all duration-300 hover:scale-105" 
                       style={{ backgroundColor: BRAND_COLORS.bgWhite }}>
                    <img
                      src={brand.logo}
                      alt={brand.name}
                      className="max-h-12 max-w-full object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Clay.com Style Hover Card - with gap bridge for easier mouse movement */}
                {hoveredBrand === brand.id && (
                  <>
                    {/* Invisible bridge to make moving mouse to card easier */}
                    <div 
                      className="absolute top-full left-0 right-0 h-4 z-10"
                      onMouseEnter={() => setHoveredBrand(brand.id)}
                    />
                    <div 
                      className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 w-72 p-4 rounded-lg shadow-xl z-20 animate-in fade-in-0 zoom-in-95"
                      style={{ backgroundColor: BRAND_COLORS.bgWhite, border: `1px solid ${BRAND_COLORS.borderSubtle}` }}
                      onMouseEnter={() => setHoveredBrand(brand.id)}
                      onMouseLeave={() => setHoveredBrand(null)}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <img src={brand.logo} alt={brand.name} className="w-8 h-8 object-contain" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm" style={{ color: BRAND_COLORS.textPrimary }}>
                            {brand.fullName}
                          </h4>
                          <span className="text-xs" style={{ color: BRAND_COLORS.textMuted }}>
                            {brand.category}
                          </span>
                        </div>
                        <ArrowUpRight className="h-4 w-4" style={{ color: BRAND_COLORS.textMuted }} />
                      </div>
                      <p className="text-sm leading-relaxed mb-3" style={{ color: BRAND_COLORS.textSecondary }}>
                        {brand.hoverDescription}
                      </p>
                      <a 
                        href={brand.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium hover:underline"
                        style={{ color: BRAND_COLORS.primaryOrange }}
                      >
                        Visit Website
                        <ArrowUpRight className="h-3 w-3" />
                      </a>
                    </div>
                  </>
                )}

                {/* Mobile popover */}
                {selectedBrand === brand.id && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 md:hidden">
                    <div 
                      className="w-full max-w-sm bg-white rounded-lg p-6 shadow-xl"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-start gap-3 mb-4">
                        <img src={brand.logo} alt={brand.name} className="w-8 h-8 object-contain" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm text-gray-900">
                            {brand.fullName}
                          </h4>
                          <span className="text-xs text-gray-500">
                            {brand.category}
                          </span>
                        </div>
                        <button 
                          onClick={() => setSelectedBrand(null)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                      <p className="text-sm leading-relaxed mb-4 text-gray-700">
                        {brand.hoverDescription}
                      </p>
                      <a 
                        href={brand.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-medium text-orange-600 hover:text-orange-700"
                      >
                        Visit {brand.name}
                        <ArrowUpRight className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
        </div>

        {/* Rewards Section */}
        <div>
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-2" style={{ 
              color: BRAND_COLORS.textPrimary,
              fontFamily: "'Satoshi', 'Inter', system-ui, sans-serif"
            }}>
              Popular Rewards
            </h3>
            <p className="text-base" style={{ color: BRAND_COLORS.textSecondary }}>
              Redeem your impact points for exclusive products and experiences
            </p>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
              {[1, 2, 3, 4, 5].map((i) => (
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
              {/* Desktop: 5-column grid */}
              <div className="hidden lg:grid lg:grid-cols-5 gap-6">
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