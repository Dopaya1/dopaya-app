import { Card, CardContent } from "@/components/ui/card";

export function ImpactPointsSection() {
  const sampleRewards = [
    { points: 500, description: "Store Vouchers" },
    { points: 1000, description: "Eco-friendly Products" },
    { points: 2000, description: "Premium Experiences" }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#fff9e6] rounded-xl p-10 lg:p-12">
          <div className="flex flex-col lg:flex-row gap-10">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                <h3 className="text-lg font-medium">Impact Points System</h3>
              </div>
              
              <h2 className="text-3xl font-bold text-dark font-heading mb-4">
                The more you donate, the more rewards you earn
              </h2>
              
              <p className="text-neutral mb-6">
                Our Impact Points system rewards your generosity. Each donation earns you 
                points based on the amount and the project's multiplier. Some projects offer 
                bonus point multipliers for even greater rewards.
              </p>
            </div>
            
            <div className="w-full lg:w-80">
              <Card className="border shadow-sm bg-white">
                <CardContent className="p-6">
                  <h3 className="text-center font-semibold mb-6">SAMPLE REWARDS</h3>
                  
                  <div className="space-y-4">
                    {sampleRewards.map((reward, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="font-medium">{reward.points} points</span>
                        <span className="text-neutral">{reward.description}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
