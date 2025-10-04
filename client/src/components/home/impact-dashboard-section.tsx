import { Button } from "@/components/ui/button";
import { BellPlus, LineChart, Medal, Star, Trophy, UserRound } from "lucide-react";
import { Link } from "wouter";

export function ImpactDashboardSection() {
  // User ranks data - Updated 6-level system
  const userRanks = [
    { name: "Supporter", pointsRequired: 100, description: "Start making ripples.", benefits: "Access basic brand perks." },
    { name: "Advocate", pointsRequired: 500, description: "Your story inspires others.", benefits: "Get early access & curated rewards." },
    { name: "Changemaker", pointsRequired: 1000, description: "You shape what comes next.", benefits: "Join founder AMAs & pilot access." },
    { name: "Impact Hero", pointsRequired: 2500, description: "You're powering real change.", benefits: "Unlock exclusive gifts & showcases." },
    { name: "Impact Legend", pointsRequired: 5000, description: "Your legacy grows stronger.", benefits: "Exclusive impact showcases & recognition." },
    { name: "Hall of Fame", pointsRequired: 10000, description: "Become part of Dopaya legacy.", benefits: "Enjoy custom brand experiences." }
  ];

  // Sample donation data for the graph (totaling ₹3,625)
  const donationHistory = [
    { month: "Jan", amount: 525 },
    { month: "Feb", amount: 675 },
    { month: "Mar", amount: 450 },
    { month: "Apr", amount: 825 },
    { month: "May", amount: 575 },
    { month: "Jun", amount: 575 },
  ];

  return (
    <section id="impact-dashboard" className="py-16 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-black">Track Your Impact Journey</h2>
          <p className="text-xl text-black max-w-3xl mx-auto">
            Turn your donations into lasting impact. Earn badges, unlock perks, and rise through our community ranks.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center mb-12">
          {/* Dashboard Preview */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-md mx-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <UserRound className="w-6 h-6 text-primary" />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm text-gray-500">Current Level</div>
                    <div className="text-xl font-bold">Impact Hero</div>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Impact Points</div>
                  <div className="text-2xl font-bold text-primary">2,750</div>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress to Impact Legend</span>
                  <span>2,750 / 5,000</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full">
                  <div className="h-2 bg-primary rounded-full" style={{ width: "55%" }}></div>
                </div>
              </div>

              {/* Donation Graph */}
              <div className="mb-4">
                <div className="flex items-center mb-3">
                  <LineChart className="w-4 h-4 text-gray-500 mr-2" />
                  <div className="text-sm text-gray-600">Donation History</div>
                </div>
                <div className="flex items-end justify-between h-16 mb-2">
                  {donationHistory.map((data, index) => {
                    const height = (data.amount / Math.max(...donationHistory.map(d => d.amount))) * 100;
                    return (
                      <div key={data.month} className="flex flex-col items-center flex-1">
                        <div 
                          className="w-5 bg-primary/20 rounded-t mb-1 transition-all duration-300 hover:bg-primary/30"
                          style={{ height: `${height}%` }}
                          title={`${data.month}: $${data.amount}`}
                        />
                        <span className="text-xs text-gray-500">{data.month}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold">$3,625</div>
                  <div className="text-xs text-gray-500">Total Donated</div>
                </div>
              </div>

              <div className="flex justify-center">
                <a 
                  href="https://tally.so/r/m6MqAe" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-primary text-white hover:bg-primary/90 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Get me on the waiting list
                </a>
              </div>
            </div>
          </div>

          {/* Impact Levels */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-black mb-4">Impact Levels & Benefits</h3>
            <p className="text-gray-600 mb-6">
              As you contribute to projects, you'll earn impact points that unlock new levels and exclusive benefits.
            </p>

            <div className="space-y-4">
              {userRanks.map((rank, idx) => (
                <div key={idx} className="flex items-start p-4 bg-white rounded-lg shadow-sm">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    idx === 0 ? "bg-blue-100" :
                    idx === 1 ? "bg-green-100" :
                    idx === 2 ? "bg-orange-100" :
                    idx === 3 ? "bg-purple-100" : "bg-amber-100"
                  }`}>
                    {idx === 0 ? <Star className="w-6 h-6 text-blue-600" /> :
                     idx === 1 ? <Star className="w-6 h-6 text-green-600" /> :
                     idx === 2 ? <Trophy className="w-6 h-6 text-orange-600" /> :
                     idx === 3 ? <Trophy className="w-6 h-6 text-purple-600" /> :
                     <BellPlus className="w-6 h-6 text-amber-600" />}
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center mb-1">
                      <div className="font-bold">{rank.name}</div>
                      <span className="text-sm text-gray-500 ml-2">– {rank.pointsRequired.toLocaleString()} pts</span>
                    </div>
                    <div className="text-sm font-medium text-gray-700 italic mb-1">
                      "{rank.description}"
                    </div>
                    <div className="text-sm text-gray-600">{rank.benefits}</div>
                  </div>
                </div>
              ))}
            </div>


          </div>
        </div>
      </div>
    </section>
  );
}