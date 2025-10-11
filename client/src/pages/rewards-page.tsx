import { useState, useMemo, useEffect, useRef } from "react";
import { SEOHead } from "@/components/seo/seo-head";
import { useQuery } from "@tanstack/react-query";
import { Reward } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Search, X, ExternalLink, ArrowUpRight } from "lucide-react";
import { RewardCard } from "@/components/rewards/reward-card";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { BRAND_COLORS } from "@/constants/colors";

// Import logo images - using relative paths
import milletarianLogo from "@assets/milletarian.png";
import adithiMilletsLogo from "@assets/adithi-millets.png";
import allikaLogo from "@assets/allika.png";
import khadyamLogo from "@assets/khadyam.png";
import sankalpaArtVillageLogo from "@assets/sankalpa-art-village.png";
import amazonLogo from "@assets/amazon.png";
import flipkartLogo from "@assets/flipkart.png";
import bonjiLogo from "@assets/Bonji - beyond just natural.png";
import aaparLogo from "@assets/Aapar logo_1750646598028.png";
import syangsLogo from "@assets/Syangs logo_1750646598029.png";

export default function RewardsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState<number | null>(null);
  const { user } = useAuth();
  const popoverRef = useRef<HTMLDivElement>(null);

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



  const filteredRewards = rewards?.filter((reward) => {
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
        canonicalUrl="https://dopaya.org/rewards"
        ogType="website"
        ogImage="https://dopaya.org/og-rewards.jpg"
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

          {/* Search and Filters */}
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

          {/* Rewards Grid */}
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