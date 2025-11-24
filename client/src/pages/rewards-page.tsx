import { useState, useMemo, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { SEOHead } from "@/components/seo/seo-head";
import { useQuery } from "@tanstack/react-query";
import { UserImpact } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, X, Gift, XCircle, Lock, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { BRAND_COLORS } from "@/constants/colors";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { isOnboardingPreviewEnabled } from "@/lib/feature-flags";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Types for our data structure
interface Brand {
  id: number;
  slug: string | null;
  name: string;
  logo_url?: string | null;
  logoUrl?: string | null;
  hero_image_url?: string | null;
  heroImageUrl?: string | null;
  website_url?: string | null;
  websiteUrl?: string | null;
  description: string | null;
  long_description?: string | null;
  longDescription?: string | null;
  category: string | null;
  featured: boolean | null;
  display_order?: number | null;
  displayOrder?: number | null;
}

interface ProductHighlight {
  id: number;
  brandId: number;
  title: string | null;
  imageUrl: string;
  productLink: string | null;
  ordering: number;
}

interface Reward {
  id: number;
  brandId: number | null;
  title: string;
  description: string;
  imageUrl: string;
  pointsCost: number;
  category: string | null;
  retailValue: string | null;
  promoCode: string | null;
  redemptionInstructions: string | null;
  rewardLink: string | null;
  status: string;
  featured: boolean;
}

export default function RewardsPage() {
  const [location, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [showUnlockBanner, setShowUnlockBanner] = useState(false);
  const [maxPointsFilter, setMaxPointsFilter] = useState<number | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [brandFilter, setBrandFilter] = useState<string>("all");
  const [pointsFilter, setPointsFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [selectedBrandId, setSelectedBrandId] = useState<number | null>(null);
  const [confirmReward, setConfirmReward] = useState<Reward | null>(null);
  const [unlockedReward, setUnlockedReward] = useState<Reward | null>(null);
  const brandSliderRef = useRef<HTMLDivElement>(null);
  const brandSliderRefV2 = useRef<HTMLDivElement>(null);
  const rewardsSectionRef = useRef<HTMLElement>(null);
  const { user } = useAuth();
  const previewEnabled = isOnboardingPreviewEnabled();
  
  // Guard: only allow this page in onboarding preview mode
  // TODO: Remove this guard if preview mode should be disabled for rewards page
  useEffect(() => {
    if (!previewEnabled) {
      navigate('/');
    }
  }, [previewEnabled, navigate]);
  
  // Fetch user impact to check if first-time user
  const { data: impact } = useQuery<UserImpact>({
    queryKey: ["/api/user/impact"],
    enabled: !!user && previewEnabled,
  });
  
  // Check if user is first-time (50 Impact Points from welcome bonus, 0 projects supported)
  const isFirstTimeUser = previewEnabled && user && impact
    ? ((impact?.impactPoints ?? 0) === 50 && (impact?.projectsSupported ?? 0) === 0)
    : false;

  // Debug: Log when confirmReward changes
  useEffect(() => {
    console.log('confirmReward state changed:', confirmReward);
  }, [confirmReward]);

  // Debug: Log when unlockedReward changes
  useEffect(() => {
    console.log('unlockedReward state changed:', unlockedReward);
  }, [unlockedReward]);

  // Check for unlock query parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const unlock = urlParams.get('unlock');
    const maxPoints = urlParams.get('maxPoints');
    
    if (unlock === '1' && maxPoints) {
      setShowUnlockBanner(true);
      setMaxPointsFilter(parseInt(maxPoints, 10));
      // Clean up URL after showing banner (but keep filter state)
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [location]);

  // Fetch brands
  const { data: brands = [], isLoading: brandsLoading } = useQuery<Brand[]>({
    queryKey: ["brands-rewards-hybrid"],
    queryFn: async () => {
      console.log('🔍 Fetching brands for rewards hybrid page...');
      
      // First try to get featured brands
      const { data: featuredData, error: featuredError } = await supabase
        .from('brands')
        .select('*')
        .eq('featured', true);
      
      if (featuredError) {
        console.error('❌ Error fetching featured brands:', featuredError);
      }
      
      console.log('✅ Featured brands fetched:', featuredData?.length || 0, 'brands');
      
      // Only return featured brands (no fallback)
      if (featuredData && featuredData.length > 0) {
        console.log('✅ Using featured brands:', featuredData.map(b => b.name));
        return featuredData;
      }
      
      // Return empty array if no featured brands found
      console.log('⚠️ No featured brands found');
      return [];
    },
  });

  // Fetch product highlights
  const { data: productHighlights = [] } = useQuery<ProductHighlight[]>({
    queryKey: ["product-highlights-hybrid"],
    queryFn: async () => {
      console.log('🔍 Fetching product highlights...');
      const { data, error } = await supabase
        .from('product_highlights')
        .select('*')
        .order('ordering', { ascending: true });
      
      if (error) {
        console.error('❌ Error fetching product highlights:', error);
        throw error;
      }
      console.log('✅ Product highlights fetched:', data?.length || 0, 'highlights');
      return data || [];
    },
  });

  // Fetch rewards
  const { data: rewards = [], isLoading: rewardsLoading } = useQuery<Reward[]>({
    queryKey: ["rewards"],
    queryFn: async () => {
      console.log('🔍 Fetching rewards...');
      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .eq('status', 'active')
        .order('pointsCost', { ascending: true });
      
      if (error) {
        console.error('❌ Error fetching rewards:', error);
        throw error;
      }
      console.log('✅ Rewards fetched:', data?.length || 0, 'rewards');
      
      // Map snake_case to camelCase if needed
      const mappedRewards = (data || []).map((reward: any) => {
        const brandId = reward.brandId || reward.brand_id || null;
        return {
          ...reward,
          brandId: brandId !== null && brandId !== undefined ? Number(brandId) : null, // Ensure numeric
          pointsCost: reward.pointsCost || reward.points_cost,
          imageUrl: reward.imageUrl || reward.image_url,
          title: reward.title || reward.name || 'Untitled Reward', // Ensure title is always present
          category: reward.category || null,
          description: reward.description || null, // Ensure description is included
          retailValue: reward.retailValue || reward.retail_value,
          promoCode: reward.promoCode || reward.promo_code,
          redemptionInstructions: reward.redemptionInstructions || reward.redemption_instructions,
          rewardLink: reward.rewardLink || reward.reward_link || null,
          featured: reward.featured !== undefined ? Boolean(reward.featured) : false, // Ensure boolean
        };
      });
      
      // Debug: Log description availability
      console.log('📝 Sample reward descriptions:', mappedRewards.slice(0, 3).map(r => ({
        id: r.id,
        title: r.title,
        hasDescription: !!r.description,
        descriptionLength: r.description?.length || 0
      })));
      
      console.log('📊 Sample reward data:', mappedRewards[0] ? {
        id: mappedRewards[0].id,
        title: mappedRewards[0].title,
        brandId: mappedRewards[0].brandId,
        brand_id: mappedRewards[0].brand_id,
        description: mappedRewards[0].description
      } : 'No rewards');
      
      return mappedRewards;
    },
  });

  // Group product highlights by brand
  const highlightsByBrand = useMemo(() => {
    const grouped: Record<number, ProductHighlight[]> = {};
    productHighlights.forEach(highlight => {
      if (!grouped[highlight.brandId]) {
        grouped[highlight.brandId] = [];
      }
      grouped[highlight.brandId].push(highlight);
    });
    return grouped;
  }, [productHighlights]);

  // Group rewards by brand
  const rewardsByBrand = useMemo(() => {
    const grouped: Record<number, Reward[]> = {};
    rewards.forEach(reward => {
      if (reward.brandId) {
        if (!grouped[reward.brandId]) {
          grouped[reward.brandId] = [];
        }
        grouped[reward.brandId].push(reward);
      }
    });
    return grouped;
  }, [rewards]);

  // Get unique brands from rewards (for brand filter) - sorted alphabetically
  const availableBrands = useMemo(() => {
    const brandIds = new Set<number>();
    rewards.forEach(reward => {
      const brandId = reward.brandId || (reward as any).brand_id;
      if (brandId) brandIds.add(brandId);
    });
    return brands
      .filter(b => brandIds.has(b.id))
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [rewards, brands]);

  // Get unique categories from rewards (for category filter)
  const availableCategories = useMemo(() => {
    const categories = new Set<string>();
    rewards.forEach(reward => {
      if (reward.category && reward.category.trim()) {
        categories.add(reward.category);
      }
    });
    return Array.from(categories).sort();
  }, [rewards]);

  // Get sample rewards for locked state (featured rewards only)
  const sampleRewards = useMemo(() => {
    if (!rewards) return [];
    return rewards
      .filter(reward => reward.featured === true)
      .slice(0, 6)
      .map((reward) => ({
        ...reward,
        available: true, // All featured rewards are available now
      }));
  }, [rewards]);

  // Get exactly 4 featured rewards for highlighted section
  const highlightedRewards = useMemo(() => {
    if (!rewards) return [];
    return rewards
      .filter(reward => reward.featured === true)
      .slice(0, 4); // Take only first 4
  }, [rewards]);

  // Filter and sort rewards
  const filteredRewards = useMemo(() => {
    // Get IDs of highlighted rewards to exclude them from main grid
    const highlightedIds = highlightedRewards.map(r => r.id);
    
    let filtered = rewards.filter((reward) => {
      // Exclude highlighted rewards from main grid
      if (highlightedIds.includes(reward.id)) {
        return false;
      }
      
      // Filter by max points (for unlock flow)
      if (maxPointsFilter && reward.pointsCost > maxPointsFilter) {
        return false;
      }
      
      // Filter by search query (brand name or reward text)
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const brand = brands.find(b => b.id === reward.brandId);
        const matchesReward = (reward.title?.toLowerCase().includes(query) || false) ||
          (reward.description?.toLowerCase().includes(query) || false);
        const matchesBrand = (brand?.name?.toLowerCase().includes(query) || false) ||
          (brand?.category?.toLowerCase().includes(query) || false);
        
        if (!matchesReward && !matchesBrand) {
          return false;
        }
      }
      
      // Filter by category (from rewards table)
      if (categoryFilter !== "all") {
        if (!reward.category || reward.category.toLowerCase() !== categoryFilter.toLowerCase()) {
          return false;
        }
      }
      
      // Filter by brand
      if (brandFilter !== "all") {
        const rewardBrandId = reward.brandId || (reward as any).brand_id;
        if (rewardBrandId?.toString() !== brandFilter) {
          return false;
        }
      }
      
      // Filter by impact points
      if (pointsFilter !== "all") {
        if (pointsFilter === "100-249") {
          if (reward.pointsCost < 100 || reward.pointsCost > 249) return false;
        } else if (pointsFilter === "250-499") {
          if (reward.pointsCost < 250 || reward.pointsCost > 499) return false;
        } else if (pointsFilter === "500-999") {
          if (reward.pointsCost < 500 || reward.pointsCost > 999) return false;
        } else if (pointsFilter === "1000+") {
          if (reward.pointsCost < 1000) return false;
        }
      }
      
      return true;
    });

    // Sort rewards - prioritize rewards with descriptions
    const sortWithDescriptionsFirst = (a: Reward, b: Reward) => {
      const aHasDesc = a.description && a.description.trim().length > 0;
      const bHasDesc = b.description && b.description.trim().length > 0;
      
      // If one has description and other doesn't, prioritize the one with description
      if (aHasDesc && !bHasDesc) return -1;
      if (!aHasDesc && bHasDesc) return 1;
      
      // Both have or both don't have descriptions - use original sort
      return 0;
    };

    if (sortBy === "lowest-points") {
      filtered = filtered.sort((a, b) => {
        const descSort = sortWithDescriptionsFirst(a, b);
        if (descSort !== 0) return descSort;
        return a.pointsCost - b.pointsCost;
      });
    } else if (sortBy === "popular") {
      // Sort by featured first, then by description, then by points cost
      filtered = filtered.sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        const descSort = sortWithDescriptionsFirst(a, b);
        if (descSort !== 0) return descSort;
        return a.pointsCost - b.pointsCost;
      });
    } else {
      // Newest (default) - sort by description first, then by ID descending
      filtered = filtered.sort((a, b) => {
        const descSort = sortWithDescriptionsFirst(a, b);
        if (descSort !== 0) return descSort;
        return b.id - a.id;
      });
    }

    return filtered;
  }, [rewards, highlightedRewards, maxPointsFilter, searchQuery, categoryFilter, brandFilter, pointsFilter, sortBy, brands]);

  // Get selected brand and its rewards
  const selectedBrand = useMemo(() => {
    if (!selectedBrandId) return null;
    return brands.find(b => b.id === selectedBrandId) || null;
  }, [brands, selectedBrandId]);

  const selectedBrandRewards = useMemo(() => {
    if (!selectedBrandId) return [];
    return rewardsByBrand[selectedBrandId] || [];
  }, [selectedBrandId, rewardsByBrand]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  const handleRedeemReward = (reward: Reward) => {
    console.log('handleRedeemReward called with reward:', reward);
    
    // Show confirmation dialog first (we'll check auth in the confirmation)
    console.log('Setting confirmReward state to:', reward);
    setConfirmReward(reward);
    console.log('confirmReward state should now be set to:', reward);
  };

  const handleConfirmUnlock = () => {
    console.log('handleConfirmUnlock called, confirmReward:', confirmReward);
    
    if (!confirmReward) {
      console.log('handleConfirmUnlock: no confirmReward, returning');
      return;
    }

    // Capture the reward before clearing state (important for closure)
    const rewardToUnlock = confirmReward;
    console.log('handleConfirmUnlock: unlocking reward:', rewardToUnlock);

    // Close confirmation dialog first
    setConfirmReward(null);
    console.log('handleConfirmUnlock: closed confirmation dialog, opening success dialog in 150ms');
    
    // Open success dialog after a short delay to ensure first dialog closes
    // Note: Auth check will happen when actually processing redemption (TODO)
    setTimeout(() => {
      console.log('Opening success dialog with reward:', rewardToUnlock);
      setUnlockedReward(rewardToUnlock);
      console.log('setUnlockedReward called with:', rewardToUnlock);
    }, 150);
  };

  const handleCancelUnlock = () => {
    setConfirmReward(null);
  };

  const handleViewBrand = (brandId: number) => {
    setSelectedBrandId(brandId);
  };

  const handleViewBrandRewards = (brandId: number) => {
    try {
      // Set the brand filter to show only this brand's rewards
      setBrandFilter(brandId.toString());
      
      // Clear other filters to ensure the brand filter works properly
      // (Optional - you can remove these if you want to keep other filters)
      // setCategoryFilter("all");
      // setPointsFilter("all");
      // setSearchQuery("");
      
      // Scroll to the rewards section smoothly
      setTimeout(() => {
        if (rewardsSectionRef.current) {
          rewardsSectionRef.current.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
      }, 100); // Small delay to ensure state update and DOM render
    } catch (error) {
      console.error('Error in handleViewBrandRewards:', error);
      // Fallback: just set the filter without scrolling
      setBrandFilter(brandId.toString());
    }
  };

  const scrollBrandSlider = (direction: 'left' | 'right') => {
    if (brandSliderRef.current) {
      const scrollAmount = 320; // Width of card (w-80 = 320px) + gap (24px) = ~344px, using 320 for smooth scroll
      const currentScroll = brandSliderRef.current.scrollLeft;
      const newScroll = direction === 'left' 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount;
      
      brandSliderRef.current.scrollTo({
        left: newScroll,
        behavior: 'smooth'
      });
    }
  };

  const scrollBrandSliderV2 = (direction: 'left' | 'right') => {
    if (brandSliderRefV2.current) {
      const scrollAmount = 320; // Width of card (w-80 = 320px) + gap (24px) = ~344px, using 320 for smooth scroll
      const currentScroll = brandSliderRefV2.current.scrollLeft;
      const newScroll = direction === 'left' 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount;
      
      brandSliderRefV2.current.scrollTo({
        left: newScroll,
        behavior: 'smooth'
      });
    }
  };

  const isLoading = brandsLoading || rewardsLoading;

  return (
    <>
      <SEOHead
        title="Impact Rewards | Redeem Points for Exclusive Sustainable Products | Dopaya"
        description="Redeem your impact points for exclusive rewards from sustainable brands. Earn rewards by supporting social enterprises and making a real difference in the world."
        keywords="impact rewards, sustainability rewards, social impact points, brand partnerships, sustainable products, eco-friendly rewards, social enterprise rewards, impact points redemption"
        canonicalUrl="https://dopaya.com/rewards"
        ogType="website"
        ogImage="https://dopaya.com/og-rewards.jpg"
      />

      <div className="container mx-auto py-24 px-4">
        <div className="max-w-7xl mx-auto">

          {/* Unlock Banner (shown when coming from payment success) */}
          {showUnlockBanner && (
            <Alert className="mb-8 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200">
              <Gift className="h-5 w-5 text-yellow-600" />
              <AlertDescription className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">Unlock your first reward!</h4>
                  <p className="text-sm text-gray-700">
                    Showing rewards you can unlock with your current Impact Points (≤{maxPointsFilter} Impact Points).
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowUnlockBanner(false)}
                  className="ml-4"
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Locked State (preview only, first-time users) */}
          {previewEnabled && isFirstTimeUser && !showUnlockBanner && (
            <div className="mb-12 space-y-8">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-8 text-center space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <Lock className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Unlock Your First Reward
                  </h2>
                  <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                    Our Rewards start from 100 Impact Points
                  </p>
                </div>
                <Button
                  onClick={() => navigate('/projects?previewOnboarding=1')}
                  className="bg-[#f2662d] hover:bg-[#d9551f] text-white font-semibold px-8 py-6 text-lg"
                  style={{ backgroundColor: '#f2662d' }}
                >
                  Support any social enterprise to unlock first reward
                </Button>
              </div>

              {/* Sample Rewards Preview */}
              {sampleRewards.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-900 text-center">
                    Sample Rewards You Can Unlock
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {sampleRewards.map((reward) => (
                      <div
                        key={reward.id}
                        className="bg-white border-2 border-gray-200 rounded-lg p-6 space-y-3 relative"
                      >
                        {reward.imageUrl && (
                          <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-3">
                            <img
                              src={reward.imageUrl}
                              alt={reward.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-gray-900">{reward.title}</h4>
                            <span className="text-sm font-medium text-[#f2662d]">
                              {reward.pointsCost} Impact Points
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {reward.description}
                          </p>
                          <div className="pt-2">
                            {reward.available ? (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Available now
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                Coming soon
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Main Content - Only show if not locked state */}
          {!(previewEnabled && isFirstTimeUser && !showUnlockBanner) && (
            <>
              {isLoading ? (
                <div className="flex justify-center items-center py-24">
                  <Loader2 className="h-10 w-10 text-primary animate-spin" />
                </div>
              ) : (
                <div className="space-y-16">
                  {/* TOP HERO: Featured Brand Slider */}
                  <section>
                    <div className="text-center mb-8">
                      <h2 className="text-3xl font-bold mb-3">Featured Sustainable Brands</h2>
                      <p className="text-muted-foreground max-w-2xl mx-auto">
                        Discover amazing brands making a positive impact on the world
                      </p>
                    </div>

                    {brands.length === 0 ? (
                      <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <p className="text-xl font-semibold mb-2">No featured brands found</p>
                      </div>
                    ) : (
                      <div className="relative">
                        {/* Left Arrow */}
                        {brands.length > 1 && (
                          <button
                            onClick={() => scrollBrandSliderV2('left')}
                            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors"
                            aria-label="Scroll left"
                          >
                            <ChevronLeft className="h-6 w-6 text-gray-700" />
                          </button>
                        )}
                        
                        {/* Right Arrow */}
                        {brands.length > 1 && (
                          <button
                            onClick={() => scrollBrandSliderV2('right')}
                            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors"
                            aria-label="Scroll right"
                          >
                            <ChevronRight className="h-6 w-6 text-gray-700" />
                          </button>
                        )}
                        
                        <div 
                          ref={brandSliderRefV2}
                          className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-4 scrollbar-hide"
                        >
                          {brands.map((brand) => {
                          const brandRewards = rewardsByBrand[brand.id] || [];
                          const brandHighlights = highlightsByBrand[brand.id] || [];
                          const brandImage = brand.heroImageUrl || brand.hero_image_url || brandHighlights[0]?.imageUrl;

                          return (
                            <div
                              key={`v2-${brand.id}`}
                              className="flex-shrink-0 w-80 snap-center bg-white border-2 border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow flex flex-col"
                              role="article"
                              aria-label={`Brand: ${brand.name}`}
                            >
                              {/* Large Emotional Product/Lifestyle Image */}
                              {brandImage && (
                                <div className="relative w-full bg-gray-100 overflow-hidden" style={{ height: '220px', minHeight: '220px' }}>
                                  <img
                                    src={brandImage}
                                    alt={`Representative product for ${brand.name}`}
                                    className="w-full h-full object-cover object-center"
                                    style={{ objectFit: 'cover', objectPosition: 'center', width: '100%', height: '100%' }}
                                  />
                                </div>
                              )}
                              {!brandImage && (
                                <div className="relative w-full bg-gray-100" style={{ height: '220px', minHeight: '220px' }}></div>
                              )}
                              
                              <div className="px-6 pt-4 pb-3 flex flex-col h-full">
                                {/* Brand Logo - Below image */}
                                <div className="flex justify-center mb-2">
                                  {(brand.logoUrl || brand.logo_url) ? (
                                    <img
                                      src={brand.logoUrl || brand.logo_url || ''}
                                      alt={`${brand.name} logo`}
                                      className="h-16 md:h-20 w-auto object-contain"
                                    />
                                  ) : (
                                    <div className="h-16 md:h-20 w-16 md:w-20 bg-gray-200 rounded-lg flex items-center justify-center">
                                      <span className="text-2xl md:text-3xl font-bold text-gray-600">
                                        {brand.name.charAt(0).toUpperCase()}
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {/* Brand Name */}
                                <div className="text-center mb-2">
                                  <h3 className="font-bold text-lg">{brand.name}</h3>
                                </div>

                                {/* Category Tag */}
                                {brand.category && (
                                  <div className="text-center mb-2">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                      {brand.category}
                                    </span>
                                  </div>
                                )}

                                {/* 2-line Brand Story Snippet with View More */}
                                {(brand.description || brand.longDescription) && (
                                  <div className="my-3 text-center">
                                    <p className="text-sm text-gray-600 leading-relaxed inline">
                                      {(brand.description || brand.longDescription || '').substring(0, 100)}
                                      {' '}
                                      <button
                                        onClick={() => handleViewBrand(brand.id)}
                                        className="text-sm text-orange-600 hover:text-orange-700 font-medium inline"
                                        aria-label={`View more about ${brand.name}`}
                                      >
                                        View more...
                                      </button>
                                    </p>
                                  </div>
                                )}

                                {/* View Brand Rewards Button - Sticks to bottom */}
                                <Button
                                  variant="outline"
                                  className="w-full mt-auto"
                                  onClick={() => handleViewBrandRewards(brand.id)}
                                  aria-label={`View rewards from ${brand.name}`}
                                >
                                  View brand rewards
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                        </div>
                      </div>
                    )}
                  </section>

                  {/* Available Rewards Header */}
                  <section ref={rewardsSectionRef}>
                    <div className="text-center mb-8">
                      <h2 className="text-3xl font-bold mb-3">Available Rewards</h2>
                      <p className="text-muted-foreground max-w-2xl mx-auto">
                        Unlock exclusive rewards with your Impact Points
                      </p>
                    </div>
                  </section>

                  {/* Search & Filters Row */}
                  <section>
                    <div className="mb-12 max-w-7xl mx-auto">
                      {/* Filters Row - All in one row on desktop */}
                      <div className="bg-white border-2 border-gray-200 rounded-xl p-4 md:p-6">
                        <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
                          {/* Search Bar */}
                          <div className="relative flex-1 max-w-md w-full">
                            <Input
                              placeholder="Search for sustainable brands or products"
                              value={searchQuery}
                              onChange={handleSearch}
                              className="pl-10 pr-10 h-12 text-base bg-white"
                              aria-label="Search for sustainable brands or products"
                            />
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                            {searchQuery && (
                              <button
                                onClick={clearSearch}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                aria-label="Clear search"
                              >
                                <X className="h-5 w-5" />
                              </button>
                            )}
                          </div>

                        {/* Brand Filter */}
                        <Select value={brandFilter} onValueChange={setBrandFilter}>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Brand" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Brands</SelectItem>
                            {availableBrands.map((brand) => (
                              <SelectItem key={brand.id} value={brand.id.toString()}>
                                {brand.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {/* Category Filter */}
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {availableCategories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {/* Impact Points Filter */}
                        <Select value={pointsFilter} onValueChange={setPointsFilter}>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Impact Points" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Points</SelectItem>
                            <SelectItem value="100-249">100 - 249 Points</SelectItem>
                            <SelectItem value="250-499">250 - 499 Points</SelectItem>
                            <SelectItem value="500-999">500 - 999 Points</SelectItem>
                            <SelectItem value="1000+">1.000+ Points</SelectItem>
                          </SelectContent>
                        </Select>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Highlighted Rewards Section */}
                  {highlightedRewards.length > 0 && (
                    <section>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                        {highlightedRewards.map((reward, index) => {
                          const rewardBrandId = reward.brandId || (reward as any).brand_id;
                          
                          // More robust brand lookup - try multiple approaches
                          const brand = brands.find(b => {
                            const bId = b.id;
                            const rId = rewardBrandId;
                            
                            // Try exact match
                            if (bId === rId) return true;
                            
                            // Try string comparison
                            if (String(bId) === String(rId)) return true;
                            
                            // Try numeric comparison
                            if (Number(bId) === Number(rId)) return true;
                            
                            // Try with snake_case brand_id
                            const bIdSnake = (b as any).brand_id;
                            if (bIdSnake === rId || String(bIdSnake) === String(rId)) return true;
                            
                            return false;
                          });
                          
                          const brandLogo = brand?.logoUrl || brand?.logo_url || (brand as any)?.logo_url;
                          const productImage = reward.imageUrl || (reward as any).image_url;

                          // Debug logging for 4th card
                          if (index === 3) {
                            console.log('🔍 4th card debug:', {
                              rewardId: reward.id,
                              rewardTitle: reward.title,
                              rewardBrandId,
                              rewardBrandIdType: typeof rewardBrandId,
                              brandFound: !!brand,
                              brandId: brand?.id,
                              brandIdType: typeof brand?.id,
                              brandLogo,
                              brandName: brand?.name,
                              allBrands: brands.map(b => ({ id: b.id, idType: typeof b.id, name: b.name })),
                              allRewardBrandIds: highlightedRewards.map(r => ({ 
                                id: r.id, 
                                brandId: r.brandId || (r as any).brand_id,
                                title: r.title 
                              }))
                            });
                          }

                          return (
                            <div
                              key={reward.id}
                              className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-orange-300 flex flex-col"
                              role="article"
                              aria-label={`Highlighted reward: ${reward.title || 'Reward'}`}
                            >
                              {/* Product Image */}
                              {productImage ? (
                                <div className="relative aspect-[3/2] bg-gray-100 overflow-hidden">
                                  <img
                                    src={productImage}
                                    alt={`Product for ${reward.title || 'Reward'}`}
                                    className="w-full h-full object-cover object-center"
                                  />
                                  {/* Highlighted Badge - Top Right */}
                                  <div className="absolute top-3 right-3 bg-orange-600 text-white rounded-full px-3 py-1 text-xs font-medium shadow-lg">
                                    Highlighted
                                  </div>
                                </div>
                              ) : (
                                <div className="relative aspect-[3/2] bg-gray-100">
                                  {/* Highlighted Badge - Top Right */}
                                  <div className="absolute top-3 right-3 bg-orange-600 text-white rounded-full px-3 py-1 text-xs font-medium shadow-lg">
                                    Highlighted
                                  </div>
                                </div>
                              )}

                              <div className="p-4 flex flex-col flex-grow">
                                {/* Brand Logo - At the top */}
                                {brandLogo ? (
                                  <div className="flex justify-center mb-3">
                                    <img
                                      src={brandLogo}
                                      alt={`${brand?.name || 'Brand'} logo`}
                                      className="h-12 w-auto object-contain"
                                      onError={(e) => {
                                        console.error('❌ Brand logo failed to load:', brandLogo, 'for brand:', brand?.name);
                                        (e.target as HTMLImageElement).style.display = 'none';
                                      }}
                                    />
                                  </div>
                                ) : brand ? (
                                  // Fallback: show brand initial if logo is missing
                                  <div className="flex justify-center mb-3">
                                    <div className="h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                      <span className="text-xl font-bold text-gray-600">
                                        {brand.name?.charAt(0).toUpperCase() || 'B'}
                                      </span>
                                    </div>
                                  </div>
                                ) : null}

                                {/* Reward Name */}
                                <h3 className="font-bold text-lg mb-2 text-center">
                                  {reward.title || 'Reward'}
                                </h3>

                                {/* Description - Below title */}
                                {reward.description && reward.description.trim() && (
                                  <p className="text-sm text-gray-600 mb-3 text-center">
                                    {reward.description}
                                  </p>
                                )}

                                {/* Impact Points Badge */}
                                <div className="flex justify-center mb-3">
                                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-amber-50 text-black border border-amber-200">
                                    {reward.pointsCost} Impact Points
                                  </span>
                                </div>

                                {/* CTA Button */}
                                <Button
                                  className="w-full mt-auto"
                                  style={{ backgroundColor: BRAND_COLORS.primaryOrange }}
                                  onClick={() => handleRedeemReward(reward)}
                                  aria-label={`Unlock reward: ${reward.title}`}
                                >
                                  Unlock Reward
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  )}

                  {/* Main Grid: Emotional Product + Clear Reward Info */}
                  <section>
                    {filteredRewards.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {filteredRewards.map((reward) => {
                          // Support both brandId (camelCase) and brand_id (snake_case)
                          const rewardBrandId = reward.brandId || (reward as any).brand_id;
                          const brand = brands.find(b => b.id === rewardBrandId);
                          const brandLogo = brand?.logoUrl || brand?.logo_url;
                          
                          // Debug logging for brand lookup
                          if (!brand && rewardBrandId) {
                            console.warn(`[Rewards] Brand not found for reward ${reward.id}, brandId: ${rewardBrandId}, available brands:`, brands.map(b => b.id));
                          }

                          return (
                            <div
                              key={reward.id}
                              className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-orange-300"
                              role="article"
                              aria-label={`Reward: ${reward.title}`}
                            >
                              {/* Brand Logo */}
                              <div className="relative bg-gray-50 flex items-center justify-center">
                                {brandLogo ? (
                                  <img
                                    src={brandLogo}
                                    alt={`${brand?.name || 'Brand'} logo`}
                                    className="w-full h-auto object-contain"
                                  />
                                ) : brand ? (
                                  <div className="text-4xl font-bold text-gray-400 py-8">
                                    {brand.name.charAt(0).toUpperCase()}
                                  </div>
                                ) : (
                                  <div className="text-4xl font-bold text-gray-400 py-8">
                                    ?
                                  </div>
                                )}
                              </div>

                              {/* Reward Details */}
                              <div className="p-6 space-y-4">
                                <div>
                                  <h3 className="font-bold text-lg mb-2">
                                    {reward.title}
                                  </h3>
                                  {reward.description && reward.description.trim() ? (
                                    <p className="text-sm text-gray-600 mb-2">
                                      {reward.description}
                                    </p>
                                  ) : null}
                                </div>

                                <div className="flex items-center justify-between">
                                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-amber-50 text-black border border-amber-200">
                                    {reward.pointsCost} Impact Points
                                  </span>
                                  {reward.retailValue && (
                                    <div className="text-right">
                                      <p className="text-sm text-muted-foreground">Value</p>
                                      <p className="text-lg font-semibold text-green-600">
                                        {reward.retailValue}
                                      </p>
                                    </div>
                                  )}
                                </div>

                                <div className="space-y-2">
                                  <Button
                                    className="w-full"
                                    style={{ backgroundColor: BRAND_COLORS.primaryOrange }}
                                    onClick={() => handleRedeemReward(reward)}
                                    aria-label={`Unlock reward: ${reward.title}`}
                                  >
                                    Unlock Reward
                                  </Button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-xl font-semibold">No rewards match your search</p>
                        <p className="text-muted-foreground mt-2">Try adjusting your search</p>
                        <Button className="mt-4" onClick={clearSearch}>
                          Clear Search
                        </Button>
                      </div>
                    )}
                  </section>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Brand Detail Modal */}
      {selectedBrand && (
        <Dialog open={!!selectedBrand} onOpenChange={() => setSelectedBrandId(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {(selectedBrand.logoUrl || selectedBrand.logo_url) && (
                    <img
                      src={selectedBrand.logoUrl || selectedBrand.logo_url || ''}
                      alt={`${selectedBrand.name} logo`}
                      className="h-12 w-auto object-contain"
                    />
                  )}
                  <span>{selectedBrand.name}</span>
                </div>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Brand Mission */}
              <div>
                <h3 className="font-semibold mb-2">About {selectedBrand.name}</h3>
                <p className="text-base text-gray-600">
                  {selectedBrand.longDescription || selectedBrand.description || "Sustainable brand making a positive impact."}
                </p>
                {/* Website Link */}
                {(selectedBrand.websiteUrl || selectedBrand.website_url) && (
                  <div className="mt-3">
                    <a
                      href={selectedBrand.websiteUrl || selectedBrand.website_url || ''}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-orange-600 hover:text-orange-700 underline"
                    >
                      Visit {selectedBrand.name}'s website →
                    </a>
                  </div>
                )}
              </div>

              {/* Sustainability Badges */}
              {selectedBrand.category && (
                <div className="flex gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Sustainable Brand
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {selectedBrand.category}
                  </span>
                </div>
              )}

            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Unlock Confirmation Dialog */}
      <Dialog 
        open={confirmReward !== null} 
        onOpenChange={(open) => {
          console.log('Dialog onOpenChange called with open:', open, 'confirmReward:', confirmReward);
          if (!open) {
            console.log('Closing dialog, setting confirmReward to null');
            setConfirmReward(null);
          }
        }}
      >
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Confirm Unlock Reward</DialogTitle>
            <DialogDescription>
              Please confirm that you want to unlock this reward.
            </DialogDescription>
          </DialogHeader>
          {confirmReward ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Are you sure you want to unlock this reward? It will cost you{" "}
                <span className="font-bold text-orange-600">{confirmReward.pointsCost}</span> Impact Points.
              </p>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    console.log('Cancel button clicked');
                    handleCancelUnlock();
                  }}
                >
                  No
                </Button>
                <Button
                  onClick={() => {
                    console.log('Yes button clicked');
                    handleConfirmUnlock();
                  }}
                  style={{ backgroundColor: BRAND_COLORS.primaryOrange }}
                >
                  Yes
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Loading...</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Success Dialog - Show Promo Code */}
      <Dialog 
        open={unlockedReward !== null}
        onOpenChange={(open) => {
          console.log('Success Dialog onOpenChange called with open:', open, 'unlockedReward:', unlockedReward);
          if (!open) {
            console.log('Closing success dialog');
            setUnlockedReward(null);
          }
        }}
      >
        <DialogContent className="max-w-md bg-white" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="text-center">Reward Unlocked! 🎉</DialogTitle>
            <DialogDescription className="text-center">
              Your promo code is ready to use
            </DialogDescription>
          </DialogHeader>
          {unlockedReward ? (() => {
            const rewardBrandId = unlockedReward.brandId || (unlockedReward as any).brand_id;
            const brand = brands.find(b => {
              const bId = b.id;
              const rId = rewardBrandId;
              return bId === rId || String(bId) === String(rId) || Number(bId) === Number(rId);
            });
            const brandLogo = brand?.logoUrl || brand?.logo_url;
            
            return (
              <div className="space-y-6 py-4">
                {/* Company Logo */}
                {brandLogo && (
                  <div className="flex justify-center">
                    <img
                      src={brandLogo}
                      alt={`${brand?.name || 'Company'} logo`}
                      className="h-20 w-auto object-contain"
                    />
                  </div>
                )}

                {/* Promo Code - Big and Prominent */}
                {unlockedReward.promoCode && (
                  <div className="text-center space-y-2">
                    <p className="text-sm text-gray-600 font-medium">Your Promo Code:</p>
                    <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-6">
                      <p className="text-4xl font-bold text-orange-600 tracking-wider">
                        {unlockedReward.promoCode}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-black mt-3">
                      ⚠️ IMPORTANT: Please note your reward code down before leaving this page
                    </p>
                  </div>
                )}

                {/* Product Link */}
                {unlockedReward.rewardLink && (
                  <div className="text-center">
                    <Button
                      asChild
                      className="w-full"
                      style={{ backgroundColor: BRAND_COLORS.primaryOrange }}
                    >
                      <a
                        href={unlockedReward.rewardLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2"
                      >
                        Shop Now
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </a>
                    </Button>
                  </div>
                )}

                {/* Close Button */}
                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    onClick={() => setUnlockedReward(null)}
                    className="w-full"
                  >
                    Close
                  </Button>
                </div>
              </div>
            );
          })() : (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Loading reward details...</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

