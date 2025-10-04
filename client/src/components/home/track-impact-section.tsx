import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { User, TrendingUp } from "lucide-react";

export function TrackImpactSection() {
  // Placeholder values - in real app these would come from user data
  const userLevel = "Impact Hero";
  const impactPoints = 2750;
  const totalDonated = 3625; // Total amount donated in currency
  const levelIcon = "🟧";
  
  // Sample impact data for the graph - showing upward trend
  const impactHistory = [
    { month: "Jan", impact: 12 },
    { month: "Feb", impact: 18 },
    { month: "Mar", impact: 24 },
    { month: "Apr", impact: 32 },
    { month: "May", impact: 45 },
    { month: "Jun", impact: 58 },
  ];
  
  const impactLevels = [
    {
      name: "Supporter",
      points: 100,
      icon: "🟦",
      description: "Start making ripples.",
      benefit: "Access basic brand perks."
    },
    {
      name: "Advocate", 
      points: 500,
      icon: "🟩",
      description: "Your story inspires others.",
      benefit: "Get early access & curated rewards."
    },
    {
      name: "Changemaker",
      points: 1000,
      icon: "🟪",
      description: "You shape what comes next.", 
      benefit: "Join founder AMAs & pilot access."
    },
    {
      name: "Impact Hero",
      points: 2500,
      icon: "🟧", 
      description: "You're powering real change.",
      benefit: "Unlock exclusive gifts & showcases."
    },
    {
      name: "Impact Legend",
      points: 5000,
      icon: "🟣",
      description: "Your legacy grows stronger.",
      benefit: "Exclusive impact showcases & recognition."
    },
    {
      name: "Hall of Fame",
      points: 10000,
      icon: "🟨",
      description: "Become part of Dopaya legacy.",
      benefit: "Enjoy custom brand experiences."
    }
  ];

  // Calculate progress to next level
  const currentLevelIndex = impactLevels.findIndex(level => level.name === userLevel);
  const currentLevel = impactLevels[currentLevelIndex];
  const nextLevel = impactLevels[currentLevelIndex + 1];
  const progressPercent = nextLevel 
    ? ((impactPoints - currentLevel.points) / (nextLevel.points - currentLevel.points)) * 100
    : 100;

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-heading">
            Track Your Impact Journey
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Turn your donations into lasting impact. Earn badges, unlock perks, and rise through our community ranks.
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[60vh]">
          
          {/* Left Side - Your Impact Progress */}
          <div className="flex justify-center">
            <Card className="w-full lg:max-w-lg bg-gray-50 border-gray-200 shadow-sm">
              <CardContent className="p-6">
                {/* User Icon Header */}
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Your Impact Progress
                  </h3>
                </div>
                
                {/* Current Level Display */}
                <div className="mb-6">
                  <div className="flex items-center mb-3">
                    <span className="text-2xl mr-2">{levelIcon}</span>
                    <Badge variant="secondary" className="text-sm px-3 py-1 bg-blue-50 text-blue-700 border-blue-200">
                      {userLevel}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Impact Points</p>
                      <p className="text-xl font-semibold text-gray-900">
                        {impactPoints.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Donated</p>
                      <p className="text-xl font-semibold text-gray-900">
                        ${totalDonated.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Progress Visualization */}
                <div className="mb-6">
                  <div className="flex justify-between text-xs text-gray-500 mb-2">
                    <span>{currentLevel?.name}</span>
                    {nextLevel && <span>{nextLevel.name}</span>}
                  </div>
                  <Progress 
                    value={Math.min(progressPercent, 100)} 
                    className="h-2 bg-gray-200"
                  />
                  {nextLevel && (
                    <p className="text-xs text-gray-500 mt-2">
                      {nextLevel.points - impactPoints} pts to next level
                    </p>
                  )}
                </div>

                {/* Donation Graph */}
                <div className="mb-4">
                  <div className="flex items-center mb-3">
                    <TrendingUp className="w-4 h-4 text-gray-500 mr-2" />
                    <p className="text-sm text-gray-600">Impact Created</p>
                  </div>
                  <div className="flex items-end justify-between h-20 mb-2">
                    {impactHistory.map((data, index) => {
                      const height = (data.impact / Math.max(...impactHistory.map(d => d.impact))) * 100;
                      return (
                        <div key={data.month} className="flex flex-col items-center flex-1">
                          <div 
                            className="w-6 bg-blue-200 rounded-t mb-1 transition-all duration-300 hover:bg-blue-300"
                            style={{ height: `${height}%` }}
                            title={`${data.month}: ${data.impact} impact units`}
                          />
                          <span className="text-xs text-gray-500">{data.month}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Level Progression Dots */}
                <div className="flex justify-center items-center space-x-2">
                  {impactLevels.map((level, index) => (
                    <div
                      key={level.name}
                      className={`w-2 h-2 rounded-full ${
                        index <= currentLevelIndex
                          ? 'bg-blue-500'
                          : 'bg-gray-300'
                      }`}
                      title={level.name}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Impact Levels Overview */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6 font-heading">
              Impact Levels & Benefits
            </h3>
            
            <div className="space-y-4">
              {impactLevels.map((level, index) => (
                <Card 
                  key={level.name}
                  className={`border-l-4 transition-all duration-200 hover:shadow-md ${
                    level.name === userLevel 
                      ? 'border-l-orange-500 bg-orange-50' 
                      : 'border-l-gray-300 hover:border-l-orange-300'
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{level.icon}</span>
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-bold text-gray-900">{level.name}</h4>
                            <span className="text-sm text-gray-500">
                              – {level.points.toLocaleString()} pts
                            </span>
                          </div>
                          <p className="text-sm font-medium text-gray-700 italic mb-1">
                            "{level.description}"
                          </p>
                          <p className="text-sm text-gray-600">
                            {level.benefit}
                          </p>
                        </div>
                      </div>
                      {level.name === userLevel && (
                        <Badge variant="default" className="bg-orange-600 text-white">
                          Current
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}