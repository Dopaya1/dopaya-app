import { useState, useEffect } from "react";

export function HowItWorks() {
  // Animation states for each column
  const [animateSearch, setAnimateSearch] = useState(false);
  const [animateReward, setAnimateReward] = useState(false);
  const [animateDashboard, setAnimateDashboard] = useState(false);

  // Animation timing
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimateSearch(prev => !prev);
      
      setTimeout(() => {
        setAnimateReward(prev => !prev);
      }, 500);
      
      setTimeout(() => {
        setAnimateDashboard(prev => !prev);
      }, 1000);
    }, 4000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="how-it-works" className="py-16 bg-[#f8f7f2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1a1a3a] font-heading">Make an impact in three simple steps</h2>
          <p className="mt-4 max-w-2xl mx-auto text-gray-600">
            Donate to projects you care about, track your impact, and earn rewards from brands that share your values.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Column 1: Find and compare projects */}
          <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center text-center hover:shadow-md transition-all group overflow-hidden">
            <div className="mb-6 relative w-full h-32">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 opacity-30 rounded-lg"></div>
              
              {/* Modern searching UI inspired by the screenshots */}
              <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-[180px]">
                <div className={`relative transition-all duration-700 ${animateSearch ? 'translate-y-0' : 'translate-y-1'}`}>
                  {/* Main search card */}
                  <div className="relative z-20 bg-white rounded-xl shadow-sm border border-gray-100 p-3">
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 rounded-full bg-orange-500 bg-opacity-10 flex items-center justify-center mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="h-2 w-20 bg-gray-200 rounded-full mb-1"></div>
                        <div className="h-2 w-12 bg-gray-100 rounded-full"></div>
                      </div>
                    </div>
                    
                    {/* Project cards */}
                    <div className="space-y-2">
                      <div className={`w-full h-8 bg-blue-50 rounded-lg flex items-center px-2 transition-all duration-500 ${animateSearch ? 'translate-x-0 opacity-100' : 'translate-x-2 opacity-90'}`}>
                        <div className="w-4 h-4 rounded bg-blue-100 mr-2"></div>
                        <div className="h-2 w-16 bg-blue-200 bg-opacity-50 rounded-full"></div>
                      </div>
                      <div className={`w-full h-8 bg-green-50 rounded-lg flex items-center px-2 transition-all duration-500 delay-100 ${animateSearch ? 'translate-x-0 opacity-100' : 'translate-x-2 opacity-90'}`}>
                        <div className="w-4 h-4 rounded bg-green-100 mr-2"></div>
                        <div className="h-2 w-16 bg-green-200 bg-opacity-50 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                  
                </div>
              </div>
            </div>
            
            {/* Number indicator */}
            <div className="flex justify-center mb-3">
              <div className="w-10 h-10 rounded-full bg-[#f8f6ef] flex items-center justify-center shadow-sm border border-white">
                <span className="text-lg font-bold text-[#1a1a3a]">1</span>
              </div>
            </div>
            
            <h3 className="text-xl font-bold mb-3 text-[#1a1a3a]">Discover Impact Projects</h3>
            <p className="text-gray-600 text-sm">
              Browse vetted social enterprises with detailed impact metrics, sustainability goals, and transparent funding information.
            </p>
            <div className="mt-4 text-xs text-gray-400">
              <span className="font-medium text-blue-500">65+ projects</span> across 23 countries
            </div>
          </div>

          {/* Column 2: Exchange impact points */}
          <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center text-center hover:shadow-md transition-all group overflow-hidden">
            <div className="mb-6 relative w-full h-32">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-pink-50 opacity-30 rounded-lg"></div>
              
              {/* Modern points UI inspired by screenshots */}
              <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-[180px]">
                <div className={`relative transition-all duration-700 ${animateReward ? 'translate-y-0' : 'translate-y-1'}`}>
                  {/* Points card */}
                  <div className="relative z-20 bg-white rounded-xl shadow-sm border border-gray-100 p-3">
                    <div className="flex items-center mb-3">
                      <div className="w-9 h-9 rounded-full bg-orange-500 bg-opacity-10 flex items-center justify-center mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1 text-left">
                        <div className="text-xs font-bold text-gray-400">IMPACT POINTS</div>
                        <div className={`text-lg font-bold transition-all duration-500 ${animateReward ? 'text-orange-500' : 'text-gray-700'}`}>2,450</div>
                      </div>
                    </div>
                    
                    {/* Reward cards */}
                    <div className="space-y-2">
                      <div className={`w-full h-7 bg-orange-50 rounded-lg flex items-center justify-between px-2 transition-all duration-500 ${animateReward ? 'translate-x-0 opacity-100' : 'translate-x-1 opacity-90'}`}>
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded bg-orange-200 mr-1"></div>
                          <div className="h-1.5 w-10 bg-orange-100 rounded-full"></div>
                        </div>
                        <div className="text-[0.6rem] font-medium text-orange-400">1,000 pts</div>
                      </div>
                    </div>
                  </div>
                  
                </div>
              </div>
            </div>
            
            {/* Number indicator */}
            <div className="flex justify-center mb-3">
              <div className="w-10 h-10 rounded-full bg-[#f8f6ef] flex items-center justify-center shadow-sm border border-white">
                <span className="text-lg font-bold text-[#1a1a3a]">2</span>
              </div>
            </div>
            
            <h3 className="text-xl font-bold mb-3 text-[#1a1a3a]">Earn & Redeem Rewards</h3>
            <p className="text-gray-600 text-sm">
              Earn Impact Points with every donation and redeem them for exclusive perks from sustainable brands that share your values.
            </p>
            <div className="mt-4 text-xs text-gray-400">
              <span className="font-medium text-orange-500">30+ brands</span> offering ethical rewards
            </div>
          </div>

          {/* Column 3: Track your impact */}
          <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center text-center hover:shadow-md transition-all group overflow-hidden">
            <div className="mb-6 relative w-full h-32">
              <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-blue-50 opacity-30 rounded-lg"></div>
              
              {/* Modern dashboard UI inspired by the screenshots */}
              <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-[180px]">
                <div className={`relative transition-all duration-700 ${animateDashboard ? 'translate-y-0' : 'translate-y-1'}`}>
                  {/* Dashboard card */}
                  <div className="relative z-20 bg-white rounded-xl shadow-sm border border-gray-100 p-3">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-xs font-bold text-gray-400">IMPACT ANALYTICS</div>
                      <div className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                    </div>
                    
                    {/* Chart visualization */}
                    <div className="flex items-end space-x-1 h-10 mb-2">
                      <div className={`w-4 bg-green-100 rounded-t transition-all duration-500 ${animateDashboard ? 'h-4' : 'h-3'}`}></div>
                      <div className={`w-4 bg-green-200 rounded-t transition-all duration-500 delay-100 ${animateDashboard ? 'h-5' : 'h-4'}`}></div>
                      <div className={`w-4 bg-green-300 rounded-t transition-all duration-500 delay-200 ${animateDashboard ? 'h-7' : 'h-6'}`}></div>
                      <div className={`w-4 bg-green-400 rounded-t transition-all duration-500 delay-300 ${animateDashboard ? 'h-8' : 'h-7'}`}></div>
                      <div className={`w-4 bg-green-500 rounded-t transition-all duration-500 delay-400 ${animateDashboard ? 'h-10' : 'h-9'}`}></div>
                    </div>
                    
                    <div className="flex justify-between text-[0.6rem] text-gray-400">
                      <div>JAN</div>
                      <div>MAR</div>
                      <div>MAY</div>
                    </div>
                  </div>
                  
                </div>
              </div>
            </div>
            
            {/* Number indicator */}
            <div className="flex justify-center mb-3">
              <div className="w-10 h-10 rounded-full bg-[#f8f6ef] flex items-center justify-center shadow-sm border border-white">
                <span className="text-lg font-bold text-[#1a1a3a]">3</span>
              </div>
            </div>
            
            <h3 className="text-xl font-bold mb-3 text-[#1a1a3a]">Visualize Your Impact</h3>
            <p className="text-gray-600 text-sm">
              Track your contributions with detailed metrics, visualize your social impact over time, and see exactly how your donation creates change.
            </p>
            <div className="mt-4 text-xs text-gray-400">
              <span className="font-medium text-green-500">15+ metrics</span> to measure your impact
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
