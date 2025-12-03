import { useState, useMemo, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { SEOHead } from "@/components/seo/seo-head";
import { useQuery } from "@tanstack/react-query";
import { Reward, UserImpact } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Search, X, ExternalLink, ArrowUpRight, Gift, XCircle, Lock } from "lucide-react";
import { RewardCard } from "@/components/rewards/reward-card";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { BRAND_COLORS } from "@/constants/colors";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { isOnboardingPreviewEnabled } from "@/lib/feature-flags";

// Import logo images - using relative paths
import milletarianLogo from "@assets/Brand_backers/milletarian sustainable brand - logo.png";
import adithiMilletsLogo from "@assets/Brand_backers/adithi-millets sustainable brand - logo.png";
import allikaLogo from "@assets/Brand_backers/allika sustainable brand - logo.png";
import khadyamLogo from "@assets/Brand_backers/khadyam sustainable brand - logo.png";
import sankalpaArtVillageLogo from "@assets/Brand_backers/sankalpa-art-village sustainable brand - logo.png";
import amazonLogo from "@assets/Brand_backers/amazon.png";
import flipkartLogo from "@assets/Brand_backers/flipkart.png";
import bonjiLogo from "@assets/Brand_backers/Bonji sustainable brand - logo.png";
import aaparLogo from "@assets/Brand_backers/Aapar sustainable brand - logo.png";
import syangsLogo from "@assets/Syangs logo_1750646598029.png";

export default function RewardsPage() {
  const [location, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState<number | null>(null);
  const [showUnlockBanner, setShowUnlockBanner] = useState(false);
  const [maxPointsFilter, setMaxPointsFilter] = useState<number | null>(null);
  const { user } = useAuth();
  const previewEnabled = isOnboardingPreviewEnabled();
  const popoverRef = useRef<HTMLDivElement>(null);
  
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

  // Handle click outside to close popover
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setSelectedBrand(null);
      }
    };

    if (selectedBrand !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [selectedBrand]);

  const { data: rewards, isLoading } = useQuery<Reward[]>({
    queryKey: ["rewards"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .order('pointsCost', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
  });

  // Extract unique categories from actual rewards data
  const categories = useMemo(() => {
    if (!rewards || rewards.length === 0) return ["All Rewards"];
    
    const uniqueCategories = Array.from(new Set(rewards.map(reward => reward.category)))
      .filter(category => category && category.trim() !== "")
      .sort();
    
    return ["All Rewards", ...uniqueCategories];
  }, [rewards]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  const handleRedeemReward = (reward: Reward) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to redeem rewards",
        variant: "destructive",
      });
      return;
    }

    // Logic to check if user has enough points would go here
    // Mock user points for now - in a real implementation this would come from the user profile
    const userPoints = 0; // Replace with actual user impact points when available
    if (userPoints < reward.pointsCost) {
      toast({
        title: "Insufficient Impact Points",
        description: `You need ${reward.pointsCost} more points to redeem this reward.`,
        variant: "destructive",
      });
      return;
    }

    // Mock redemption for now
    toast({
      title: "Reward Redeemed!",
      description: `You've successfully redeemed ${reward.title}`,
    });
  };



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

  const filteredRewards = rewards?.filter((reward) => {
    // Filter by max points (for unlock flow)
    if (maxPointsFilter && reward.pointsCost > maxPointsFilter) {
      return false;
    }
    
    // Filter by search query
    const matchesSearch = searchQuery 
      ? reward.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reward.description.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    
    // Filter by category
    const matchesCategory = selectedCategory === "all" || 
      reward.category.toLowerCase() === selectedCategory.toLowerCase();
    
    return matchesSearch && matchesCategory;
  });

  // Define brand data with popover content - only 5 brands as specified
  const brandData = [
    {
      id: 1,
      name: "Bonji",
      fullName: "Bonji - Beyond Just Natural",
      logo: bonjiLogo,
      description: "Anti-pollution skin & hair care products made with natural ingredients. Beyond just trends, basics, and looks - real science-backed solutions for city life damage.",
      category: "Beauty & Wellness",
      website: "https://bonji.in"
    },
    {
      id: 2,
      name: "Syangs",
      fullName: "Syangs",
      logo: syangsLogo,
      description: "Organic food products and sustainable agriculture solutions supporting farmers and promoting healthy living through natural, chemical-free products.",
      category: "Food & Agriculture",
      website: "https://www.syangs.com"
    },
    {
      id: 3,
      name: "Sankalpa Art Village",
      fullName: "Sankalpa Art Village",
      logo: sankalpaArtVillageLogo,
      description: "Sustainable living through natural dyed clothing, conscious baby clothing, handmade cutlery, wooden toys, and organics. Creating local livelihood with craft and reviving indigenous traditions.",
      category: "Sustainable Lifestyle",
      website: "https://www.sankalpaartvillage.com"
    },
    {
      id: 4,
      name: "Milletarian",
      fullName: "Milletarian - Magic Malt",
      logo: milletarianLogo,
      description: "100% natural, no preservatives Ragi Malt that's nutrition simplified. Just add hot water for instant goodness of Finger Millet with added fiber - perfect for health enthusiasts and busy professionals.",
      category: "Health & Nutrition",
      website: "https://milletarian.netlify.app"
    },
    {
      id: 5,
      name: "Aapar",
      fullName: "Aapar",
      logo: aaparLogo,
      description: "Sustainable lifestyle brand focused on traditional crafts and eco-friendly products supporting rural artisans and promoting conscious consumption.",
      category: "Lifestyle",
      website: "https://www.aapar.in"
    }
  ];

  return (
    <>
      <SEOHead
        title="Impact Rewards | Redeem Points for Exclusive Sustainable Products | Dopaya"
        description="Redeem your impact points for exclusive rewards from sustainable brands. Earn rewards by supporting social enterprises and making a real difference in the world."
        keywords="impact rewards, sustainability rewards, social impact points, brand partnerships, sustainable products, eco-friendly rewards, social enterprise rewards, impact points redemption"
        canonicalUrl="https://dopaya.com/rewards"
        ogType="website"
        ogImage="https://dopaya.com/og-rewards.jpg"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Product",
          "name": "Impact Rewards Program",
          "description": "Redeem impact points for exclusive rewards from sustainable brands",
          "brand": {
            "@type": "Brand",
            "name": "Dopaya"
          },
          "offers": {
            "@type": "Offer",
            "description": "Earn rewards by supporting social enterprises",
            "price": "0",
            "priceCurrency": "USD"
          }
        }}
      />

      <div className={`container mx-auto py-24 px-4`}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold mb-4">Impact Rewards</h1>
            <p className="text-muted-foreground">
              Redeem your impact points for exclusive rewards
            </p>
          </div>

          {/* Unlock Banner (shown when coming from payment success) */}
          {showUnlockBanner && (
            <Alert className="mb-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200">
              <Gift className="h-5 w-5 text-yellow-600" />
              <AlertDescription className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">Unlock your first reward!</h4>
                  <p className="text-sm text-gray-700">
                    Showing rewards you can unlock with your current Impact Points (≤100 IP).
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
                    Unlock Your First Reward
                  </h2>
                  <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                    You have already received 50 Impact Points. Support from $5 to unlock your first reward (instead of usually $10).
                  </p>
                </div>
                <Button
                  onClick={() => navigate('/projects?previewOnboarding=1')}
                  className="bg-[#f2662d] hover:bg-[#d9551f] text-white font-semibold px-8 py-6 text-lg"
                  style={{ backgroundColor: '#f2662d' }}
                >
                  Support any project with $5 to unlock rewards
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
                              {reward.pointsCost} IP
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
                  <p className="text-sm text-center text-gray-500 italic">
                    If a reward becomes unavailable, we'll replace it with equal or higher value.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Search and Filters - Only show if not locked state */}
          {!(previewEnabled && isFirstTimeUser && !showUnlockBanner) && (
            <div className="mb-8">
              <div className="relative mb-6">
                <Input
                  placeholder="Search rewards..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="pl-10 pr-10"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                {searchQuery && (
                  <button 
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Rewards Grid - Only show if not locked state */}
          {!(previewEnabled && isFirstTimeUser && !showUnlockBanner) && (
            <>
              {isLoading ? (
                <div className="flex justify-center items-center py-24">
                  <Loader2 className="h-10 w-10 text-primary animate-spin" />
                </div>
              ) : filteredRewards && filteredRewards.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredRewards.map((reward) => (
                    <RewardCard key={reward.id} reward={reward} onRedeem={() => handleRedeemReward(reward)} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-24">
                  <p className="text-xl font-semibold">No rewards match your filters</p>
                  <p className="text-muted-foreground mt-2">Try adjusting your search or filters</p>
                  <Button className="mt-4" onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                  }}>
                    Clear All Filters
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Brand Section */}
        <div className="mt-20 py-16 bg-white">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-center mb-6">
              From Brands You'll Love
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Redeem your Impact Points for exclusive rewards from these brands that you'll love
            </p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
              {brandData.map((brand) => (
                <div key={brand.id} className="relative">
                  <div 
                    className="bg-[#F9F9F9] rounded-md p-6 flex items-center justify-center h-32 transition-all duration-300 cursor-pointer hover:bg-gray-100"
                    onClick={() => setSelectedBrand(selectedBrand === brand.id ? null : brand.id)}
                  >
                    <img 
                      src={brand.logo} 
                      alt={brand.name}
                      className="h-20 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300"
                    />
                  </div>
                  
                  {/* Mobile-friendly full-width popover */}
                  {selectedBrand === brand.id && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 md:hidden">
                      <div 
                        ref={popoverRef}
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
                          {brand.description}
                        </p>
                        <a 
                          href={brand.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm font-medium text-orange-600 hover:text-orange-700"
                        >
                          Visit {brand.name}
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {/* Desktop hover popover */}
                  <div className="hidden md:block">
                    {selectedBrand === brand.id && (
                      <div 
                        ref={popoverRef}
                        className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 w-72 p-4 rounded-lg shadow-xl z-20 animate-in fade-in-0 zoom-in-95 bg-white border border-gray-200"
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <img src={brand.logo} alt={brand.name} className="w-8 h-8 object-contain" />
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm text-gray-900">
                              {brand.fullName}
                            </h4>
                            <span className="text-xs text-gray-500">
                              {brand.category}
                            </span>
                          </div>
                          <ArrowUpRight className="h-4 w-4 text-gray-400" />
                        </div>
                        <p className="text-sm leading-relaxed mb-3 text-gray-700">
                          {brand.description}
                        </p>
                        <a 
                          href={brand.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm font-medium text-orange-600 hover:text-orange-700"
                        >
                          Visit {brand.name}
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}