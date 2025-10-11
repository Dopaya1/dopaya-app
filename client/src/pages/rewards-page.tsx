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
import { supabase } from "@/lib/supabase";

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
  const { user } = useAuth();

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

  // Define brand logos with their alt text
  const brandLogos = [
    { src: milletarianLogo, alt: "Milletarian" },
    { src: adithiMilletsLogo, alt: "Adithi Millets" },
    { src: allikaLogo, alt: "Allika" },
    { src: khadyamLogo, alt: "Khadyam" },
    { src: sankalpaArtVillageLogo, alt: "Sankalpa Art Village" },
    { src: amazonLogo, alt: "Amazon" },
    { src: flipkartLogo, alt: "Flipkart" },
    { src: bonjiLogo, alt: "Bonji" },
    { src: aaparLogo, alt: "Aapar" },
    { src: syangsLogo, alt: "Syang's" },
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