import { useState, useMemo } from "react";
import { SEOHead } from "@/components/seo/seo-head";
import { useQuery } from "@tanstack/react-query";
import { Reward } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Search, X } from "lucide-react";
import { RewardCard } from "@/components/rewards/reward-card";
import { toast } from "@/hooks/use-toast";

// Import logo images - using relative paths
import milletarianLogo from "../assets/milletarian.png";
import adithiMilletsLogo from "../assets/adithi-millets.png";
import allikaLogo from "../assets/allika.png";
import khadyamLogo from "../assets/khadyam.png";
import sankapaArtVillageLogo from "../assets/sankapa-art-village.png";
import amazonLogo from "../assets/amazon.png";
import flipkartLogo from "../assets/flipkart.png";
import bonjiLogo from "@assets/Bonji - beyond just natural.png";
import aaparLogo from "@assets/Aapar logo_1750646598028.png";
import syangsLogo from "@assets/Syangs logo_1750646598029.png";

export default function RewardsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { user } = useAuth();

  const { data: rewards, isLoading } = useQuery<Reward[]>({
    queryKey: ["/api/rewards"],
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

  // Define brand logos with their alt text
  const brandLogos = [
    { src: milletarianLogo, alt: "Milletarian" },
    { src: adithiMilletsLogo, alt: "Adithi Millets" },
    { src: allikaLogo, alt: "Allika" },
    { src: khadyamLogo, alt: "Khadyam" },
    { src: sankapaArtVillageLogo, alt: "Sankapa Art Village" },
    { src: amazonLogo, alt: "Amazon" },
    { src: flipkartLogo, alt: "Flipkart" },
    { src: bonjiLogo, alt: "Bonji" },
    { src: aaparLogo, alt: "Aapar" },
    { src: syangsLogo, alt: "Syang's" },
  ];

  return (
    <>
      <SEOHead
        title="Impact Rewards"
        description="Redeem your impact points for exclusive rewards from sustainable brands. Earn rewards by supporting social enterprises."
        keywords="impact rewards, sustainability rewards, social impact points, brand partnerships, sustainable products"
        canonicalUrl="https://dopaya.org/rewards"
      />

      <div className="container mx-auto py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Development Status Banner */}
          <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-center gap-2 text-center">
              <span className="text-sm font-medium text-blue-800">
                🚀 <strong>Preview Mode:</strong> Reward redemption launches November 2025 with our value guarantee system
              </span>
            </div>
          </div>

          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold mb-4">Impact Rewards Preview</h1>
            <p className="text-muted-foreground">
              Explore the rewards you'll unlock with Impact Points. <strong>$1 = 10 Points</strong>, guaranteed 150% value return.
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

            <Tabs defaultValue="All Rewards" className="mb-6">
              <TabsList className="grid grid-cols-3 md:grid-cols-6 h-auto">
                {categories.map(category => (
                  <TabsTrigger 
                    key={category} 
                    value={category}
                    onClick={() => setSelectedCategory(category === "All Rewards" ? "all" : category.toLowerCase())}
                    className="py-2 px-4"
                  >
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>


          </div>

          {/* Rewards Grid */}
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
            </div>
          ) : filteredRewards && filteredRewards.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRewards.map((reward) => (
                <RewardCard key={reward.id} reward={reward} onRedeem={() => handleRedeemReward(reward)} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {brandLogos.map((logo, index) => (
                <div 
                  key={index} 
                  className="bg-[#F9F9F9] rounded-md p-6 flex items-center justify-center h-32 transition-all duration-300"
                >
                  <img 
                    src={logo.src} 
                    alt={logo.alt}
                    className="h-20 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}