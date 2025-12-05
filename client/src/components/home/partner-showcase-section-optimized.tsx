import { useEffect, useState, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink, Shield, CheckCircle, Leaf, Heart, ArrowLeft, ArrowRight, ArrowUpRight, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Reward, Brand } from "@shared/schema";
import { TYPOGRAPHY } from "@/constants/typography";
import { BRAND_COLORS } from "@/constants/colors";
import { MOBILE } from "@/constants/mobile";
import { getLogoUrl } from "@/lib/image-utils";
import bonjiLogo from '@assets/Brand_backers/Bonji sustainable brand - logo.png';
import aaparLogo from '@assets/Brand_backers/Aapar sustainable brand - logo.png';
import syangsLogo from '@assets/Syangs logo_1750646598029.png';
import sankalpaArtVillageLogo from '@assets/Brand_backers/sankalpa-art-village sustainable brand - logo.png';
import milletarianLogo from '@assets/Brand_backers/milletarian sustainable brand - logo.png';
import { useTranslation } from "@/lib/i18n/use-translation";
import { useI18n } from "@/lib/i18n/i18n-context";
import { getBrandDescription, getRewardTitle } from "@/lib/i18n/project-content";

// Fallback brand data (used if no brands in database)
const fallbackBrands = [
  {
    id: 1,
    name: "Bonji",
    fullName: "Bonji - Beyond Just Natural",
    logo: bonjiLogo,
    hoverDescription: "Anti-pollution skin & hair care products made with natural ingredients. Beyond just trends, basics, and looks - real science-backed solutions for city life damage.",
    category: "Beauty & Wellness",
    website: "https://bonji.in",
    featured: true,
    country: undefined as string | undefined
  },
  {
    id: 2,
    name: "Sankalpa Art Village",
    fullName: "Sankalpa Art Village",
    logo: sankalpaArtVillageLogo,
    hoverDescription: "Sustainable living through natural dyed clothing, conscious baby clothing, handmade cutlery, wooden toys, and organics. Creating local livelihood with craft and reviving indigenous traditions.",
    category: "Sustainable Lifestyle",
    website: "https://www.sankalpaartvillage.com",
    featured: true,
    country: undefined as string | undefined
  },
  {
    id: 3,
    name: "Milletarian",
    fullName: "Milletarian - Magic Malt",
    logo: milletarianLogo,
    hoverDescription: "100% natural, no preservatives Ragi Malt that's nutrition simplified. Just add hot water for instant goodness of Finger Millet with added fiber - perfect for health enthusiasts and busy professionals.",
    category: "Health & Nutrition",
    website: "https://milletarian.netlify.app",
    featured: true,
    country: undefined as string | undefined
  },
  {
    id: 4,
    name: "Aapar",
    fullName: "Aapar",
    logo: aaparLogo,
    hoverDescription: "Sustainable lifestyle brand focused on traditional crafts and eco-friendly products supporting rural artisans and promoting conscious consumption.",
    category: "Lifestyle",
    website: "https://www.aapar.in",
    featured: true,
    country: undefined as string | undefined
  },
  {
    id: 5,
    name: "Syangs",
    fullName: "Syangs",
    logo: syangsLogo,
    hoverDescription: "Organic food products and sustainable agriculture solutions supporting farmers and promoting healthy living through natural, chemical-free products.",
    category: "Food & Agriculture",
    website: "https://www.syangs.com",
    featured: true,
    country: undefined as string | undefined
  }
];

// Fallback logo mapping for brands without logo_path
const fallbackLogos: Record<string, string> = {
  "Bonji": bonjiLogo,
  "Bonji - Beyond just natural": bonjiLogo,
  "Sankalpa Art Village": sankalpaArtVillageLogo,
  "Sankalpa": sankalpaArtVillageLogo,
  "Milletarian": milletarianLogo,
  "Aapar": aaparLogo,
  "Syangs": syangsLogo,
};

export function PartnerShowcaseSection() {
  const { t } = useTranslation();
  const { language } = useI18n();
  const [selectedBrand, setSelectedBrand] = useState<number | null>(null);
  // Page-based slider (4 items per page on lg, 3 on md, 2 on sm)
  const [page, setPage] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  // Rewards slider page state
  const [rewardsPage, setRewardsPage] = useState(0);
  // Touch handling for mobile brand selection - use ref to avoid state issues
  const touchDataRef = useRef<{ x: number; y: number; time: number } | null>(null);

  // Fetch ALL brands (not just featured) to ensure we have logos for all rewards
  const { data: allBrandsData = [] } = useQuery<Brand[]>({
    queryKey: ["brands-all-for-rewards"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('brands')
          .select('*');
        
        if (error) {
          console.error('[PartnerShowcase] Error fetching all brands:', error);
          return [];
        }
        
        return (data || []) as Brand[];
      } catch (err) {
        console.error('[PartnerShowcase] Exception fetching all brands:', err);
        return [];
      }
    },
    staleTime: 60_000, // Cache for 1 minute
  });

  // Create brand lookup map by ID for reward logos
  const brandMap = useMemo(() => {
    const map = new Map<number, { logoUrl: string | null; name: string }>();
    allBrandsData.forEach((brand) => {
      const raw = brand as any;
      const logoPath = raw.logo_path || raw.logoPath || raw.logo_url || raw.logoUrl || '';
      const fallbackLogo = fallbackLogos[brand.name] || fallbackLogos[brand.name.trim()];
      const logoUrl = logoPath ? getLogoUrl(logoPath, fallbackLogo) : (fallbackLogo || null);
      
      map.set(brand.id, {
        logoUrl: logoUrl || fallbackLogo || null,
        name: brand.name,
      });
    });
    return map;
  }, [allBrandsData]);

  // Fetch brands from Supabase (only featured brands)
  const { data: brandsData = [], isLoading: brandsLoading } = useQuery<Brand[]>({
    queryKey: ["brands-showcase"],
    queryFn: async () => {
      try {
        // Use select('*') to get all columns - Supabase will return them in the actual DB format
        const { data, error } = await supabase
          .from('brands')
          .select('*')
          .eq('featured', true)
          .order('display_order', { ascending: true })
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('[PartnerShowcase] Error fetching brands:', error);
          return [];
        }
        
        // Filter out brands that are NOT featured = true (double-check)
        if (data && data.length > 0) {
          const featuredOnly = data.filter(b => {
            const raw = b as any;
            const isFeatured = raw.featured === true || raw.featured === 'true' || raw.featured === 1;
            if (!isFeatured) {
              console.warn(`[PartnerShowcase] ⚠️ Brand "${b.name}" (ID: ${b.id}) filtered out - featured=${raw.featured}`);
            }
            return isFeatured;
          });
          
          // Check for duplicates by name
          const nameCounts = featuredOnly.reduce((acc, b) => {
            const name = b.name.toLowerCase().trim();
            acc[name] = (acc[name] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          
          const duplicates = Object.entries(nameCounts).filter(([_, count]) => count > 1);
          if (duplicates.length > 0) {
            console.warn(`[PartnerShowcase] ⚠️ Found duplicate brand names in database:`, duplicates);
          }
          
          return (featuredOnly || []) as Brand[];
        } else {
          return [];
        }
      } catch (err) {
        console.error('[PartnerShowcase] Exception fetching brands:', err);
        return [];
      }
    },
    staleTime: 0, // Always fetch fresh data from database
    cacheTime: 0, // Don't cache - always get latest data
  });

  // Map database brands to component format, with fallback
  const brands = brandsData.length > 0
    ? brandsData
        // STEP 1: Deduplicate FIRST (before mapping) to avoid processing duplicates
        .filter((brand, index, self) => {
          const firstIndex = self.findIndex(b => 
            b.name.toLowerCase().trim() === brand.name.toLowerCase().trim()
          );
          const isDuplicate = index !== firstIndex;
          if (isDuplicate) {
            console.warn(`[PartnerShowcase] ⚠️ Duplicate brand "${brand.name}" (ID: ${brand.id}) filtered out at source`);
          }
          return !isDuplicate;
        })
        .map((brand) => {
          // Supabase returns snake_case, try all possible field names
          const raw = brand as any;
          const logoPath = raw.logo_path || raw.logoPath || raw.logo_url || raw.logoUrl || '';
          const websiteUrl = raw.website_url || raw.websiteUrl || '';
          const description = getBrandDescription(brand, language) || brand.description || '';
          const category = brand.category || '';
          // Check both Country (capital C) and country (lowercase c) - Supabase may preserve case
          const country = raw.Country || raw.country || '';
          
          // Debug: Log country value for troubleshooting
          if (country) {
            console.log(`[PartnerShowcase] Brand "${brand.name}" (ID: ${brand.id}): country="${country}" (from Country=${raw.Country}, country=${raw.country})`);
          }
        
          // Get logo URL with fallback - check fallbackLogos first, then try getLogoUrl
          const fallbackLogo = fallbackLogos[brand.name] || fallbackLogos[brand.name.trim()];
          const logoUrl = logoPath ? getLogoUrl(logoPath, fallbackLogo) : null;
          const finalLogo = logoUrl || fallbackLogo || '';
          
          // Warn if no logo found (will be filtered out)
          if (!finalLogo) {
            console.warn(`[PartnerShowcase] ⚠️ Brand "${brand.name}" (ID: ${brand.id}) filtered out - no logo available`);
          }
          
          // Properly handle featured boolean - ensure it's a true boolean
          const isFeatured = Boolean((brand as any).featured) === true;
        
        return {
          id: brand.id,
          name: brand.name,
          fullName: brand.name, // Use name as fullName, or you can add a separate fullName field later
          logo: finalLogo,
          hoverDescription: description,
          category: category,
          website: websiteUrl || '#',
            featured: isFeatured,
            country: country, // Add country field
        };
        })
        .filter(b => {
          // Filter brands with logos and log which ones are removed
          if (!b.logo) {
            console.warn(`[PartnerShowcase] ⚠️ Brand "${b.name}" (ID: ${b.id}) filtered out - no logo available (no logo_path and not in fallbackLogos)`);
            return false;
          }
          return true;
        })
        // Note: No need to filter by featured here since query already filters for featured=true
    : fallbackBrands.filter(b => b.featured);

  // Helper function to render brand name with country flag if applicable
  const renderBrandName = (brand: typeof brands[0]) => {
    const countryValue = brand.country;
    const countryLower = countryValue?.toLowerCase()?.trim();
    // Check for various Switzerland spellings
    const isSwitzerland = countryLower === 'switzerland' || 
                          countryLower === 'schweiz' || 
                          countryLower === 'ch' ||
                          countryLower === 'suisse' ||
                          countryLower === 'svizzera';
    
    // Debug logging - always log to see what we're getting
    console.log(`[PartnerShowcase] renderBrandName for "${brand.name}": country="${countryValue}", lower="${countryLower}", isSwitzerland=${isSwitzerland}`);
    
    return (
      <span className="flex items-center gap-1.5">
        <span>{brand.fullName}</span>
        {isSwitzerland && (
          <span className="text-base" title="Switzerland" aria-label="Switzerland">🇨🇭</span>
        )}
      </span>
    );
  };

  const getVisible = (count: number) => {
    if (brands.length === 0) return [];
    
    const out: typeof brands = [] as any;
    // Use modulo to create infinite scroll effect
    for (let i = 0; i < count; i++) {
      const idx = (page * count + i) % brands.length;
      out.push(brands[idx]);
    }
    return out;
  };

  // Auto-advance pages (infinite) and pause on hover or user interaction
  // Calculate max pages based on screen size: 4 on desktop, 3 on tablet, all on mobile
  useEffect(() => {
    if (isPaused || brands.length === 0) return;
    
    // Calculate how many pages we need based on brands count and items per page
    const getMaxPages = () => {
      if (typeof window === 'undefined') return brands.length;
      if (window.innerWidth >= 1024) {
        // Desktop: 4 per page
        return Math.ceil(brands.length / 4);
      } else if (window.innerWidth >= 768) {
        // Tablet: 3 per page
        return Math.ceil(brands.length / 3);
      } else {
        // Mobile: 1 per page
        return brands.length;
      }
    };
    
    const maxPages = getMaxPages();
    const id = setInterval(() => {
      setPage((p) => (p + 1) % maxPages);
    }, 3000);
    return () => clearInterval(id);
  }, [isPaused, brands.length]);

  // Fetch real rewards from Supabase database
  const { data: rewards = [], isLoading } = useQuery<Reward[]>({
    queryKey: ["rewards-showcase"],
    queryFn: async () => {
      // Try points_cost first (snake_case - database column name)
      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .eq('featured', true)
        .order('points_cost', { ascending: false }) // Show highest pointsCost first
        .limit(8);
      
      if (error) {
        console.error('[PartnerShowcase] Error fetching rewards:', error);
        // Fallback: try pointsCost (camelCase)
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('rewards')
          .select('*')
          .eq('featured', true)
          .order('pointsCost', { ascending: false })
          .limit(8);
        
        if (fallbackError) {
          console.error('[PartnerShowcase] Fallback error:', fallbackError);
          throw fallbackError;
        }
        
        // Sort manually if needed
        const sorted = (fallbackData || []).sort((a: any, b: any) => {
          const aCost = a.points_cost || a.pointsCost || 0;
          const bCost = b.points_cost || b.pointsCost || 0;
          return bCost - aCost; // Descending order
        });
        
        console.log('[PartnerShowcase] Rewards fetched (fallback, manually sorted):', sorted.map((r: any) => ({ title: r.title, pointsCost: r.points_cost || r.pointsCost })));
        return sorted;
      }
      
      // Debug: Log the rewards with their pointsCost to verify sorting
      console.log('[PartnerShowcase] Rewards fetched (ordered by points_cost):', data?.map(r => ({ 
        title: r.title, 
        pointsCost: (r as any).points_cost || (r as any).pointsCost 
      })));
      
      return data || [];
    },
    staleTime: 0, // Always fetch fresh data from database
    cacheTime: 0, // Don't cache - always get latest data
  });

  return (
    <section className="py-24" style={{ backgroundColor: BRAND_COLORS.bgBeige }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className={`${TYPOGRAPHY.section} mb-4`} style={{ 
            color: BRAND_COLORS.textPrimary, 
            fontFamily: "'Satoshi', 'Inter', system-ui, sans-serif" 
          }}
          dangerouslySetInnerHTML={{ __html: t("homeSections.partnerShowcase.title") }}
          />
          <p className={`${TYPOGRAPHY.bodyLarge} max-w-3xl mx-auto`} style={{ color: BRAND_COLORS.textSecondary }}>
            {t("homeSections.partnerShowcase.subtitle")}
          </p>
        </div>

        {/* Brand Showcase - Slider that preserves 4-grid layout */}
        {brandsLoading ? (
          <div className="mb-16">
            <div className="hidden lg:grid lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center justify-center p-6 h-24 rounded-lg bg-gray-200" />
                  <div className="mt-3 w-full p-4 rounded-lg shadow-sm bg-gray-100">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
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
                        <h4 className="font-semibold text-sm" style={{ color: BRAND_COLORS.textPrimary }}>{renderBrandName(brand)}</h4>
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
                      <h4 className="font-semibold text-sm" style={{ color: BRAND_COLORS.textPrimary }}>{renderBrandName(brand)}</h4>
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
          {/* Mobile: 1 at a time with slider */}
          <div className="md:hidden relative overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${page * 100}%)` }}
            >
              {brands.map((brand, idx) => (
                <div key={`${brand.id}-mobile-${idx}`} className="w-full flex-shrink-0 px-3">
                  <div 
                    className="cursor-pointer"
                    onTouchStart={(e) => {
                      const touch = e.touches[0];
                      touchDataRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
                    }}
                    onTouchEnd={(e) => {
                      if (!touchDataRef.current) return;
                      
                      const touch = e.changedTouches[0];
                      const start = touchDataRef.current;
                      const deltaX = Math.abs(touch.clientX - start.x);
                      const deltaY = Math.abs(touch.clientY - start.y);
                      const deltaTime = Date.now() - start.time;
                      
                      // Only trigger if it's a tap (not a swipe) - small movement and short duration
                      const isTap = deltaX < 10 && deltaY < 10 && deltaTime < 300;
                      
                      if (isTap) {
                        setSelectedBrand(selectedBrand === brand.id ? null : brand.id);
                        setIsPaused(true);
                      }
                      
                      touchDataRef.current = null;
                    }}
                    onClick={(e) => {
                      // Only handle click if it's not from a touch event (desktop)
                      if (!touchDataRef.current) {
                        setSelectedBrand(selectedBrand === brand.id ? null : brand.id);
                        setIsPaused(true);
                      }
                    }}
                  >
                    <div className="flex items-center justify-center p-6 h-24 rounded-lg" style={{ backgroundColor: BRAND_COLORS.bgWhite }}>
                      <img src={brand.logo} alt={brand.name} className="max-h-12 max-w-full object-contain" />
                    </div>
                  </div>
                  <div className="mt-3 w-full p-4 rounded-lg shadow-sm" style={{ backgroundColor: BRAND_COLORS.bgWhite, border: `1px solid ${BRAND_COLORS.borderSubtle}` }}>
                    <div className="flex items-start gap-3 mb-2">
                      <img src={brand.logo} alt={brand.name} className="w-6 h-6 object-contain" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-base" style={{ color: BRAND_COLORS.textPrimary }}>{renderBrandName(brand)}</h4>
                        <span className="text-xs" style={{ color: BRAND_COLORS.textMuted }}>{brand.category}</span>
                      </div>
                      <a href={brand.website} target="_blank" rel="noopener noreferrer" className="text-xs" style={{ color: BRAND_COLORS.textMuted }}>
                        <ArrowUpRight className="h-4 w-4" />
                      </a>
                    </div>
                    <p className="text-lg leading-relaxed" style={{ color: BRAND_COLORS.textSecondary }}>
                      {brand.hoverDescription}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Mobile Navigation - Subtle arrows below (only if more than 1 brand) */}
            {brands.length > 1 && (
              <div className="flex justify-center items-center gap-1 mt-4">
                <button
                  onClick={() => {
                    setPage((p) => (p - 1 + brands.length) % brands.length);
                    setIsPaused(true);
                  }}
                  className="p-1.5 rounded-md hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
                  aria-label="Previous brand"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    setPage((p) => (p + 1) % brands.length);
                    setIsPaused(true);
                  }}
                  className="p-1.5 rounded-md hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
                  aria-label="Next brand"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
        )}

        {/* Rewards Section */}
        <div>
          <div className="text-center mb-8">
            <h3 className={`${TYPOGRAPHY.section} mb-4`} style={{ 
              color: BRAND_COLORS.textPrimary,
              fontFamily: "'Satoshi', 'Inter', system-ui, sans-serif"
            }}>
              {t("homeSections.partnerShowcase.popularRewards")}
            </h3>
            <p className="text-xl max-w-2xl mx-auto" style={{ color: BRAND_COLORS.textSecondary }}>
              {t("homeSections.partnerShowcase.popularRewardsSubtitle")}
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
                {rewards.map((reward) => {
                  const brandId = (reward as any).brandId || (reward as any).brand_id;
                  const brandInfo = brandId ? brandMap.get(Number(brandId)) : null;
                  
                  return (
                  <div
                    key={reward.id}
                    className="rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group cursor-pointer"
                    style={{ backgroundColor: BRAND_COLORS.bgWhite, border: `1px solid ${BRAND_COLORS.borderSubtle}` }}
                  >
                    {/* Reward Image - Smaller Height */}
                      <div className="aspect-[16/9] bg-gray-100 overflow-hidden relative">
                      <img
                        src={reward.imageUrl}
                        alt={getRewardTitle(reward, language)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                        {/* Brand Logo - Small badge in top-right corner */}
                        {brandInfo?.logoUrl && (
                          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-md p-1.5 shadow-sm">
                            <img
                              src={brandInfo.logoUrl}
                              alt={brandInfo.name}
                              className="h-6 w-auto object-contain"
                            />
                          </div>
                        )}
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
                      
                        <h4 className="font-semibold line-clamp-3 mb-5" style={{ color: BRAND_COLORS.textPrimary }}>
                        {getRewardTitle(reward, language)}
                      </h4>
                    </div>
                  </div>
                  );
                })}
              </div>

              {/* Mobile: Slider - Same approach as Brands slider */}
              <div className="lg:hidden relative overflow-hidden">
                <div 
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${rewardsPage * 100}%)` }}
                >
                  {rewards.map((reward, idx) => {
                    const brandId = (reward as any).brandId || (reward as any).brand_id;
                    const brandInfo = brandId ? brandMap.get(Number(brandId)) : null;
                    
                    return (
                      <div key={`${reward.id}-mobile-${idx}`} className="w-full flex-shrink-0 px-3">
                        <div
                          className="rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group cursor-pointer"
                          style={{ backgroundColor: BRAND_COLORS.bgWhite, border: `1px solid ${BRAND_COLORS.borderSubtle}` }}
                        >
                          {/* Reward Image - Smaller Height */}
                          <div className="aspect-[16/9] bg-gray-100 overflow-hidden relative">
                            <img
                              src={reward.imageUrl}
                              alt={getRewardTitle(reward, language)}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            {/* Brand Logo - Small badge in top-right corner */}
                            {brandInfo?.logoUrl && (
                              <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-md p-1.5 shadow-sm">
                                <img
                                  src={brandInfo.logoUrl}
                                  alt={brandInfo.name}
                                  className="h-6 w-auto object-contain"
                                />
                              </div>
                            )}
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
                            
                            <h4 className="font-semibold line-clamp-2 mb-5" style={{ color: BRAND_COLORS.textPrimary }}>
                              {getRewardTitle(reward, language)}
                            </h4>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Mobile Navigation - Subtle arrows below (only if more than 1 reward) */}
                {rewards.length > 1 && (
                  <div className="flex justify-center items-center gap-1 mt-4">
                    <button
                      onClick={() => {
                        setRewardsPage((p) => (p - 1 + rewards.length) % rewards.length);
                      }}
                      className="p-1.5 rounded-md hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
                      aria-label="Previous reward"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <div className="flex gap-1 mx-2">
                      {rewards.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setRewardsPage(index)}
                          className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                            index === rewardsPage 
                              ? 'bg-orange-500' 
                              : 'bg-gray-300'
                          }`}
                          aria-label={`Go to reward ${index + 1}`}
                        />
                      ))}
                    </div>
                    <button
                      onClick={() => {
                        setRewardsPage((p) => (p + 1) % rewards.length);
                      }}
                      className="p-1.5 rounded-md hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
                      aria-label="Next reward"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
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