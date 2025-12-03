import { useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import { SEOHead } from "@/components/seo/seo-head";
import { useQuery } from "@tanstack/react-query";
import { UserImpact } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, X, Gift, XCircle, Lock, ExternalLink, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { BRAND_COLORS } from "@/constants/colors";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { isOnboardingPreviewEnabled } from "@/lib/feature-flags";
import { useTranslation } from "@/lib/i18n/use-translation";

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
  retailValue: string | null;
  promoCode: string | null;
  redemptionInstructions: string | null;
  status: string;
  featured: boolean;
}

export default function RewardsPageV2() {
  const { t, language } = useTranslation();
  const [location, navigate] = useLocation();
  
  // Debug: Log current language
  useEffect(() => {
    console.log('🌍 Rewards Page - Current language:', language);
    console.log('🌍 Rewards Page - Current pathname:', window.location.pathname);
  }, [language]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showUnlockBanner, setShowUnlockBanner] = useState(false);
  const [maxPointsFilter, setMaxPointsFilter] = useState<number | null>(null);
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
  
  // Check if user is first-time (50 IP from welcome bonus, 0 projects supported)
  const isFirstTimeUser = previewEnabled && user && impact
    ? ((impact?.impactPoints ?? 0) === 50 && (impact?.projectsSupported ?? 0) === 0)
    : false;

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
    queryKey: ["brands-rewards"],
    queryFn: async () => {
      console.log('🔍 Fetching brands for rewards page...');
      
      // First try to get featured brands
      const { data: featuredData, error: featuredError } = await supabase
        .from('brands')
        .select('*')
        .eq('featured', true);
      
      if (featuredError) {
        console.error('❌ Error fetching featured brands:', featuredError);
      }
      
      console.log('✅ Featured brands fetched:', featuredData?.length || 0, 'brands');
      console.log('📊 Raw featured data:', featuredData);
      
      // If we have featured brands, use them
      if (featuredData && featuredData.length > 0) {
        console.log('✅ Using featured brands:', featuredData.map(b => b.name));
        return featuredData;
      }
      
      // Otherwise, get ALL brands as fallback (for testing)
      console.log('⚠️ No featured brands found, fetching all brands...');
      const { data: allData, error: allError } = await supabase
        .from('brands')
        .select('*')
        .limit(6);
      
      if (allError) {
        console.error('❌ Error fetching all brands:', allError);
        throw allError;
      }
      
      console.log('✅ All brands fetched:', allData?.length || 0, 'brands');
      console.log('📊 All brands data:', allData);
      return allData || [];
    },
  });

  // Fetch product highlights
  const { data: productHighlights = [] } = useQuery<ProductHighlight[]>({
    queryKey: ["product-highlights"],
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
    queryKey: ["rewards-v2"],
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
      return data || [];
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

  // Get sample rewards for locked state (≤100 IP)
  const sampleRewards = useMemo(() => {
    if (!rewards) return [];
    return rewards
      .filter(reward => reward.pointsCost <= 100)
      .slice(0, 3)
      .map((reward, index) => ({
        ...reward,
        available: index < 2, // First 2 are "Available now", last is "Coming soon"
      }));
  }, [rewards]);

  // Filter rewards by search and max points
  const filteredRewards = useMemo(() => {
    return rewards.filter((reward) => {
      // Filter by max points (for unlock flow)
      if (maxPointsFilter && reward.pointsCost > maxPointsFilter) {
        return false;
      }
      
      // Filter by search query
      const matchesSearch = searchQuery 
        ? reward.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          reward.description.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      
      return matchesSearch;
    });
  }, [rewards, maxPointsFilter, searchQuery]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  const handleRedeemReward = (reward: Reward) => {
    if (!user) {
      toast({
        title: t("rewardsPage.authenticationRequired"),
        description: t("rewardsPage.pleaseLogIn"),
        variant: "destructive",
      });
      return;
    }

    // Mock redemption for now
    toast({
      title: t("rewardsPage.rewardRedeemed"),
      description: t("rewardsPage.successfullyRedeemed", { title: reward.title }),
    });
  };

  const isLoading = brandsLoading || rewardsLoading;

  return (
    <>
      <SEOHead
        title={t("rewardsPage.seoTitle")}
        description={t("rewardsPage.seoDescription")}
        keywords={t("rewardsPage.seoKeywords")}
        canonicalUrl="https://dopaya.com/rewards"
        ogType="website"
        ogImage="https://dopaya.com/og-rewards.jpg"
      />

      <div className="container mx-auto py-24 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">{t("rewardsPage.title")}</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("rewardsPage.subtitle")}
            </p>
          </div>

          {/* Unlock Banner (shown when coming from payment success) */}
          {showUnlockBanner && (
            <Alert className="mb-8 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200">
              <Gift className="h-5 w-5 text-yellow-600" />
              <AlertDescription className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">{t("rewardsPage.unlockBannerTitle")}</h4>
                  <p className="text-sm text-gray-700">
                    {t("rewardsPage.unlockBannerDescription", { maxPoints: maxPointsFilter })}
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
              {/* Locked State Message */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-8 text-center space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <Lock className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {t("rewardsPage.lockedStateTitle")}
                  </h2>
                  <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                    {t("rewardsPage.lockedStateDescription")}
                  </p>
                </div>
                <Button
                  onClick={() => navigate('/projects?previewOnboarding=1')}
                  className="bg-[#f2662d] hover:bg-[#d9551f] text-white font-semibold px-8 py-6 text-lg"
                  style={{ backgroundColor: '#f2662d' }}
                >
                  {t("rewardsPage.lockedStateButton")}
                </Button>
              </div>

              {/* Sample Rewards Preview */}
              {sampleRewards.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-900 text-center">
                    {t("rewardsPage.sampleRewardsTitle")}
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
                              {reward.pointsCost} {t("rewardsPage.impactPoints")}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {reward.description}
                          </p>
                          <div className="pt-2">
                            {reward.available ? (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {t("rewardsPage.availableNow")}
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                {t("rewardsPage.comingSoon")}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-center text-gray-500 italic">
                    {t("rewardsPage.sampleRewardsNote")}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Search Bar - Only show if not locked state */}
          {!(previewEnabled && isFirstTimeUser && !showUnlockBanner) && (
            <div className="mb-12">
              <div className="relative max-w-xl mx-auto">
                <Input
                  placeholder={t("rewardsPage.searchPlaceholder")}
                  value={searchQuery}
                  onChange={handleSearch}
                  className="pl-10 pr-10 h-12 text-base"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                {searchQuery && (
                  <button 
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
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
                  {/* Featured Sustainable Brands Section */}
                  <section>
                    <div className="text-center mb-8">
                      <h2 className="text-3xl font-bold mb-3">{t("rewardsPage.featuredBrandsTitle")}</h2>
                      <p className="text-muted-foreground max-w-2xl mx-auto">
                        {t("rewardsPage.featuredBrandsSubtitle")}
                      </p>
                    </div>

                    {brands.length === 0 ? (
                      <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <p className="text-xl font-semibold mb-2">{t("rewardsPage.noBrandsFound")}</p>
                        <p className="text-muted-foreground">
                          {t("rewardsPage.noBrandsFoundSubtitle")}
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {brands.map((brand) => {
                        const brandHighlights = highlightsByBrand[brand.id] || [];
                        const brandRewards = rewardsByBrand[brand.id] || [];
                        const lowestPointReward = brandRewards.length > 0 
                          ? brandRewards.reduce((min, r) => r.pointsCost < min.pointsCost ? r : min, brandRewards[0])
                          : null;

                        return (
                          <div
                            key={brand.id}
                            className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-orange-300"
                          >
                            {/* Brand Header */}
                            <div className="p-6 border-b border-gray-100">
                              <div className="flex items-center gap-4 mb-3">
                                {(brand.logoUrl || brand.logo_url) ? (
                                  <img
                                    src={brand.logoUrl || brand.logo_url || ''}
                                    alt={brand.name}
                                    className="h-12 w-auto object-contain"
                                  />
                                ) : (
                                  <div className="h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                    <span className="text-xl font-bold text-gray-600">
                                      {brand.name.charAt(0)}
                                    </span>
                                  </div>
                                )}
                                <div className="flex-1">
                                  <h3 className="font-bold text-lg">{brand.name}</h3>
                                  {brand.category && (
                                    <p className="text-sm text-muted-foreground">{brand.category}</p>
                                  )}
                                </div>
                              </div>
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <Sparkles className="h-3 w-3" />
                                {t("rewardsPage.sustainableBrand")}
                              </span>
                            </div>

                            {/* Product Highlights Carousel */}
                            {brandHighlights.length > 0 && (
                              <div className="relative">
                                <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide">
                                  {brandHighlights.slice(0, 3).map((highlight) => (
                                    <div
                                      key={highlight.id}
                                      className="flex-shrink-0 w-full snap-center"
                                    >
                                      <div className="aspect-[4/3] bg-gray-100">
                                        <img
                                          src={highlight.imageUrl}
                                          alt={highlight.title || brand.name}
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                {brandHighlights.length > 1 && (
                                  <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1.5">
                                    {brandHighlights.slice(0, 3).map((_, idx) => (
                                      <div
                                        key={idx}
                                        className="w-1.5 h-1.5 rounded-full bg-white/60"
                                      />
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Brand Info & CTA */}
                            <div className="p-6 space-y-4">
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {brand.description || t("rewardsPage.discoverBrand")}
                              </p>
                              
                              {lowestPointReward && (
                                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                                  <p className="text-sm font-medium text-orange-900">
                                    {t("rewardsPage.getRewardsWithPoints", { value: lowestPointReward.retailValue || t("rewards.title") })}
                                  </p>
                                  <p className="text-xs text-orange-700 mt-1">
                                    {t("rewardsPage.startingFrom", { points: lowestPointReward.pointsCost })}
                                  </p>
                                </div>
                              )}

                              <Button
                                className="w-full"
                                variant="outline"
                                onClick={() => {
                                  // Scroll to brand's rewards section
                                  const element = document.getElementById(`brand-rewards-${brand.id}`);
                                  element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }}
                              >
                                {t("rewardsPage.discoverBrand")}
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                      </div>
                    )}
                  </section>

                  {/* Available Rewards Section */}
                  <section>
                    <div className="text-center mb-8">
                      <h2 className="text-3xl font-bold mb-3">{t("rewardsPage.availableRewardsTitle")}</h2>
                      <p className="text-muted-foreground max-w-2xl mx-auto">
                        {t("rewardsPage.availableRewardsSubtitle")}
                      </p>
                    </div>

                    {filteredRewards.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredRewards.map((reward) => {
                          const brand = brands.find(b => b.id === reward.brandId);
                          const brandHighlights = reward.brandId ? highlightsByBrand[reward.brandId] || [] : [];
                          const rewardImage = reward.imageUrl || brandHighlights[0]?.imageUrl;

                          return (
                            <div
                              key={reward.id}
                              id={`brand-rewards-${reward.brandId}`}
                              className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-orange-300"
                            >
                              {/* Reward Image */}
                              {rewardImage && (
                                <div className="relative aspect-[4/3] bg-gray-100">
                                  <img
                                    src={rewardImage}
                                    alt={reward.title}
                                    className="w-full h-full object-cover"
                                  />
                                  {/* Brand Logo Badge */}
                                  {(brand?.logoUrl || brand?.logo_url) && (
                                    <div className="absolute top-3 right-3 bg-white rounded-lg p-2 shadow-md">
                                      <img
                                        src={brand.logoUrl || brand.logo_url || ''}
                                        alt={brand.name}
                                        className="h-6 w-auto object-contain"
                                      />
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Reward Details */}
                              <div className="p-6 space-y-4">
                                <div>
                                  <h3 className="font-bold text-lg mb-2">{reward.title}</h3>
                                  <p className="text-sm text-gray-600 line-clamp-2">
                                    {reward.description}
                                  </p>
                                </div>

                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm text-muted-foreground">{t("rewardsPage.requires")}</p>
                                    <p className="text-2xl font-bold" style={{ color: BRAND_COLORS.primaryOrange }}>
                                      {reward.pointsCost} <span className="text-sm font-normal">{t("rewardsPage.points")}</span>
                                    </p>
                                  </div>
                                  {reward.retailValue && (
                                    <div className="text-right">
                                      <p className="text-sm text-muted-foreground">{t("rewardsPage.value")}</p>
                                      <p className="text-lg font-semibold text-green-600">
                                        {reward.retailValue}
                                      </p>
                                    </div>
                                  )}
                                </div>

                                {brand && (
                                  <p className="text-sm text-muted-foreground">
                                    {t("rewardsPage.brand")} <span className="font-medium text-gray-900">{brand.name}</span>
                                  </p>
                                )}

                                <Button
                                  className="w-full"
                                  style={{ backgroundColor: BRAND_COLORS.primaryOrange }}
                                  onClick={() => handleRedeemReward(reward)}
                                >
                                  {t("rewardsPage.unlockReward")}
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-xl font-semibold">{t("rewardsPage.noRewardsMatch")}</p>
                        <p className="text-muted-foreground mt-2">{t("rewardsPage.tryAdjustingSearch")}</p>
                        <Button className="mt-4" onClick={clearSearch}>
                          {t("rewardsPage.clearSearch")}
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
    </>
  );
}

