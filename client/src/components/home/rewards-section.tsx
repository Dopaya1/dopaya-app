import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Reward } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { RewardCard } from "@/components/rewards/reward-card";
import { toast } from "@/hooks/use-toast";
import { DataError, EmptyState } from "@/components/ui/data-error";
import { useDbStatus } from "@/hooks/use-db-status";
import { supabase } from "@/lib/supabase";

// Import logo images - using relative paths instead of aliases
import milletarianLogo from "../../assets/milletarian.png";
import adithiMilletsLogo from "../../assets/adithi-millets.png";
import allikaLogo from "../../assets/allika.png";
import khadyamLogo from "../../assets/khadyam.png";
import sankapaArtVillageLogo from "../../assets/sankapa-art-village.png";
import amazonLogo from "../../assets/amazon.png";
import flipkartLogo from "../../assets/flipkart.png";
import bonjiLogo from "@assets/Bonji - beyond just natural.png";

// Homepage-specific reward card without redeem button
function HomepageRewardCard({ reward }: { reward: Reward }) {
  const companyName = reward.companyName || reward.category || 'Partner';
  const discountDisplay = reward.discount && reward.discountName 
    ? `${reward.discount} ${reward.discountName}`
    : reward.discount || reward.discountName || '';
  
  return (
    <Card className="overflow-hidden border shadow-sm flex flex-col h-full">
      {reward.imageUrl && (
        <div className="w-full h-40 overflow-hidden bg-gray-100">
          <img 
            src={reward.imageUrl}
            alt={reward.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <CardContent className="p-5 flex flex-col flex-grow">
        <div className="flex items-center justify-between mb-2">
          <span className="bg-[#e94e35] bg-opacity-10 text-[#e94e35] font-medium text-[0.7rem] px-3 py-0 rounded-full">
            {companyName}
          </span>
          {discountDisplay && (
            <span className="text-gray-700 text-sm font-medium">{discountDisplay}</span>
          )}
        </div>
        
        <h3 className="text-lg font-bold mb-2">{reward.title}</h3>
        {reward.companyName && (
          <p className="text-sm text-gray-600 font-medium mb-3">{reward.companyName}</p>
        )}
        <p className="text-sm text-neutral flex-grow">{reward.description}</p>
      </CardContent>
    </Card>
  );
}

export function RewardsSection() {
  const { data: rewards, isLoading, error, isError } = useQuery<Reward[]>({
    queryKey: ["rewards-featured"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .eq('featured', true)
        .order('pointsCost', { ascending: true })
        .limit(6);
      
      if (error) throw error;
      return data || [];
    },
  });
  
  const { isConnected } = useDbStatus();

  const handleRedeemReward = (reward: Reward) => {
    toast({
      title: "Login Required",
      description: "Please log in to redeem rewards",
      variant: "destructive",
    });
  };

  // Define brand logos and their alt text
  const brandLogos = [
    { src: milletarianLogo, alt: "Milletarian" },
    { src: adithiMilletsLogo, alt: "Adithi Millets" },
    { src: allikaLogo, alt: "Allika" },
    { src: khadyamLogo, alt: "Khadyam" },
    { src: sankapaArtVillageLogo, alt: "Sankapa Art Village" },
    { src: amazonLogo, alt: "Amazon" },
    { src: flipkartLogo, alt: "Flipkart" },
    { src: bonjiLogo, alt: "Bonji" },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-[#1a1a3a] mb-4">Get rewarded for your generosity</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-3">
            Earn Impact Points with every donation and redeem them for exclusive rewards from our brand partners. The more you give, the more rewards you unlock.
          </p>
          <p className="text-sm text-gray-500 mb-8">From well-known brands that you'll love</p>
          
          {/* Brands slider */}
          <div className="mb-14">
            <div className="relative overflow-hidden px-10 md:px-32 lg:px-48">
              <div 
                className="flex justify-center mx-auto space-x-10 md:space-x-14 py-4 scrollbar-hide animate-scroll"
              >
                {[...brandLogos, ...brandLogos].map((logo, index) => (
                  <div 
                    key={index} 
                    className="flex-shrink-0 flex items-center justify-center h-11 grayscale hover:grayscale-0 transition-all duration-300 cursor-pointer"
                  >
                    <img 
                      src={logo.src}
                      alt={logo.alt}
                      className="h-full w-auto object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Rewards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            // Loading state with skeletons
            Array(4).fill(0).map((_, i) => (
              <Card key={i} className="impact-card overflow-hidden">
                <Skeleton className="w-full h-48" />
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-6 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-4" />
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : !isConnected ? (
            // Database connection error
            <div className="col-span-full">
              <DataError 
                title="Reward Data Unavailable" 
                message="We're unable to retrieve reward data at this time."
                itemType="reward"
              />
            </div>
          ) : isError ? (
            // Other error
            <div className="col-span-full">
              <DataError 
                title="Failed to Load Rewards" 
                message={error instanceof Error ? error.message : "An unexpected error occurred."}
                itemType="reward" 
              />
            </div>
          ) : rewards && rewards.length === 0 ? (
            // No rewards found
            <div className="col-span-full">
              <EmptyState 
                title="No Rewards Found" 
                message="There are no featured rewards available at this time. Please check back later." 
                itemType="reward"
              />
            </div>
          ) : (
            // Display rewards without redeem buttons
            (rewards || []).map((reward) => (
              <HomepageRewardCard key={reward.id} reward={reward} />
            ))
          )}
        </div>

        <div className="mt-10 text-center">
          <Link href="/rewards">
            <Button variant="outline" className="px-6 py-2">Browse All Rewards</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
