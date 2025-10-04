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
    <section id="how-it-works" className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1a1a3a] font-heading">How Dopaya Works</h2>
          <p className="mt-4 max-w-2xl mx-auto text-gray-600">
            Make an impact in three simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Column 1: Find and compare projects */}
          <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-full bg-[#f8f6ef] border border-[#e0e0e0] mb-4 flex items-center justify-center">
              <span className="text-xl font-bold text-[#1a1a3a]">1</span>
            </div>
            
            <div className="h-44 w-full flex items-center justify-center mb-5 overflow-hidden">
              {/* Project Selection Graphic */}
              <div className="relative w-full max-w-[200px]">
                <div className={`absolute transition-all duration-700 ease-in-out ${animateSearch ? 'opacity-100 scale-100' : 'opacity-70 scale-95'}`} style={{top: '0px', left: '0px'}}>
                  <div className="w-40 h-16 bg-[#f8f6ef] border border-[#e0e0e0] rounded-lg flex flex-col p-2">
                    <div className="h-2 w-12 bg-[#d3d3d3] rounded-full mb-2"></div>
                    <div className="h-2 w-20 bg-[#e0e0e0] rounded-full mb-2"></div>
                    <div className="h-2 w-16 bg-[#e0e0e0] rounded-full"></div>
                  </div>
                </div>
                
                <div className={`absolute transition-all duration-700 ease-in-out ${animateSearch ? 'opacity-70 scale-95' : 'opacity-100 scale-100'}`} style={{top: '20px', left: '15px'}}>
                  <div className="w-40 h-16 bg-white border border-[#e0e0e0] rounded-lg shadow-sm flex flex-col p-2">
                    <div className="h-2 w-12 bg-[#d3d3d3] rounded-full mb-2"></div>
                    <div className="h-2 w-20 bg-[#e0e0e0] rounded-full mb-2"></div>
                    <div className="h-2 w-16 bg-[#e0e0e0] rounded-full"></div>
                  </div>
                </div>
                
                <div className={`absolute transition-all duration-700 ease-in-out ${animateSearch ? 'opacity-70 translate-y-0' : 'opacity-100 translate-y-1'}`} style={{top: '40px', left: '30px'}}>
                  <div className="w-40 h-16 bg-white border border-[#e0e0e0] rounded-lg shadow-sm flex flex-col p-2">
                    <div className="h-2 w-12 bg-[#d3d3d3] rounded-full mb-2"></div>
                    <div className="h-2 w-20 bg-[#e0e0e0] rounded-full mb-2"></div>
                    <div className="h-2 w-16 bg-[#e0e0e0] rounded-full"></div>
                  </div>
                </div>
                
                <div className="absolute" style={{top: '20px', right: '20px'}}>
                  <div className={`w-10 h-10 rounded-full bg-[#f8f6ef] flex items-center justify-center border border-[#e0e0e0] transition-transform duration-500 ${animateSearch ? 'rotate-12' : '-rotate-12'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#1a1a3a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            
            <h3 className="text-xl font-bold mb-3 text-[#1a1a3a]">Find and Compare Projects</h3>
            <p className="text-gray-600 text-sm">
              Browse our carefully vetted collection of social enterprises and compare their impact metrics to find projects aligned with your values.
            </p>
          </div>

          {/* Column 2: Exchange impact points */}
          <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-full bg-[#f8f6ef] border border-[#e0e0e0] mb-4 flex items-center justify-center">
              <span className="text-xl font-bold text-[#1a1a3a]">2</span>
            </div>
            
            <div className="h-44 w-full flex items-center justify-center mb-5">
              {/* Reward Redemption Graphic */}
              <div className="relative w-full max-w-[200px]">
                <div className={`absolute transition-all duration-700 ease-in-out ${animateReward ? 'translate-y-1 opacity-90' : 'translate-y-0 opacity-100'}`} style={{top: '15px', left: '40px'}}>
                  <div className="w-36 h-32 bg-white rounded-lg shadow-sm border border-[#e0e0e0] p-3 flex flex-col items-center justify-center">
                    <div className="w-12 h-12 bg-[#f8f6ef] rounded-full mb-3 flex items-center justify-center">
                      <div className={`w-8 h-8 rounded-full bg-[#f0f0f0] flex items-center justify-center transition-all duration-500 ${animateReward ? 'scale-110' : 'scale-100'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#1a1a3a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-[#e0e0e0] rounded-full mb-2"></div>
                    <div className="w-3/4 h-2 bg-[#e0e0e0] rounded-full"></div>
                  </div>
                </div>
                
                <div className={`absolute transition-all duration-700 ${animateReward ? 'rotate-3 translate-x-2 opacity-100' : 'rotate-0 translate-x-0 opacity-80'}`} style={{top: '5px', right: '30px'}}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#1a1a3a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                </div>
              </div>
            </div>
            
            <h3 className="text-xl font-bold mb-3 text-[#1a1a3a]">Exchange Impact Points</h3>
            <p className="text-gray-600 text-sm">
              Redeem your impact points for exclusive rewards from sustainable brands that share our values and commitment to social change.
            </p>
          </div>

          {/* Column 3: Track your impact */}
          <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-full bg-[#f8f6ef] border border-[#e0e0e0] mb-4 flex items-center justify-center">
              <span className="text-xl font-bold text-[#1a1a3a]">3</span>
            </div>
            
            <div className="h-44 w-full flex items-center justify-center mb-5">
              {/* Dashboard Graphic - Styled like the dashboard page */}
              <div className="relative w-full max-w-[200px]">
                <div className="absolute" style={{top: '10px', left: '20px'}}>
                  <div className="w-42 h-30 bg-white border border-[#e0e0e0] rounded-lg shadow-sm p-2">
                    <div className="h-2 w-10 bg-[#e0e0e0] rounded-full mb-2"></div>
                    <div className="grid grid-cols-2 gap-1 mb-2">
                      <div className={`h-6 bg-[#f0f0f0] rounded transition-all duration-500 ${animateDashboard ? 'opacity-90 scale-95' : 'opacity-100 scale-100'}`}></div>
                      <div className={`h-8 bg-[#f8f6ef] rounded transition-all duration-500 ${animateDashboard ? 'opacity-100 scale-100' : 'opacity-90 scale-95'}`}></div>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      <div className={`h-5 bg-[#f0f0f0] rounded transition-all duration-500 ${animateDashboard ? 'opacity-90 scale-95' : 'opacity-100 scale-100'}`}></div>
                      <div className={`h-3 bg-[#e0e0e0] rounded transition-all duration-500 ${animateDashboard ? 'opacity-100 scale-100' : 'opacity-90 scale-95'}`}></div>
                      <div className={`h-6 bg-[#f8f6ef] rounded transition-all duration-500 ${animateDashboard ? 'opacity-90 scale-95' : 'opacity-100 scale-100'}`}></div>
                    </div>
                  </div>
                </div>
                
                <div className={`absolute transition-all duration-700 ease-in-out ${animateDashboard ? 'opacity-100 translate-y-0' : 'opacity-80 translate-y-1'}`} style={{bottom: '10px', right: '35px'}}>
                  <div className="bg-white shadow-sm rounded-lg p-3 border border-[#e0e0e0]">
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-[#f8f6ef] mr-2 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-[#1a1a3a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                      <div className="flex flex-col">
                        <div className="h-2 w-12 bg-[#e0e0e0] rounded-full mb-1"></div>
                        <div className="h-2 w-8 bg-[#e0e0e0] rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="absolute" style={{top: '25px', right: '30px'}}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-[#f8f6ef] shadow-sm transition-transform duration-700 ease-in-out ${animateDashboard ? 'rotate-30' : 'rotate-0'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#1a1a3a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            
            <h3 className="text-xl font-bold mb-3 text-[#1a1a3a]">Track Your Impact</h3>
            <p className="text-gray-600 text-sm">
              Monitor your contributions and see your real-world impact through a transparent dashboard with detailed metrics and progress reports.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}