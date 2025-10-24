import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Project } from "@shared/schema";
import { TYPOGRAPHY } from "@/constants/typography";
import { BRAND_COLORS } from "@/constants/colors";
import { InteractiveValueCalculator } from "@/components/ui/interactive-value-calculator";

export function HeroSectionV3() {
  // State for rotating startup examples with locking behavior (subheadline)
  const [currentStartupIndex, setCurrentStartupIndex] = useState(0);
  const startupIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimeout, setLockTimeout] = useState<NodeJS.Timeout | null>(null);
  const initializedRef = useRef<string | null>(null);
  
  // Separate state for H1 dynamic word rotation (independent)
  const [currentH1Index, setCurrentH1Index] = useState(0);
  const h1IntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // State for interactive donation amount
  const [donationAmount, setDonationAmount] = useState(50);
  const [showDropdown, setShowDropdown] = useState(false);

  // Fetch ALL projects from database (like original)
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["projects-hero-v3"],
    queryFn: async () => {
      console.log('Fetching projects for HeroSectionV3...');
      
      // First try to get featured projects
      const { data: featuredData, error: featuredError } = await supabase
        .from('projects')
        .select('*')
        .eq('featured', true)
        .eq('status', 'active')
        .order('createdAt', { ascending: false })
        .limit(8);
      
      if (featuredError) {
        console.error('Error fetching featured projects:', featuredError);
        throw featuredError;
      }
      
      console.log(`Found ${featuredData?.length || 0} featured projects:`, featuredData?.map(p => p.title));
      
      // If we have enough featured projects, use them
      if (featuredData && featuredData.length >= 4) {
        return featuredData;
      }
      
      // Otherwise, get ALL active projects to fill the gap
      console.log('Not enough featured projects, fetching all active projects...');
      const { data: allData, error: allError } = await supabase
        .from('projects')
        .select('*')
        .eq('status', 'active')
        .order('createdAt', { ascending: false })
        .limit(8);
      
      if (allError) {
        console.error('Error fetching all projects:', allError);
        throw allError;
      }
      
      console.log(`Found ${allData?.length || 0} total active projects:`, allData?.map(p => p.title));
      return allData || [];
    },
    retry: false,
    staleTime: Infinity,
  });

  // Fetch rewards from database
  const { data: rewards = [] } = useQuery({
    queryKey: ["rewards-hero-v3"],
    queryFn: async () => {
      console.log('Fetching rewards for HeroSectionV3...');
      
      // First try to get featured rewards
      const { data: featuredData, error: featuredError } = await supabase
        .from('rewards')
        .select('*')
        .eq('featured', true)
        .order('pointsCost', { ascending: true })
        .limit(8);
      
      if (featuredError) {
        console.error('Error fetching featured rewards:', featuredError);
        throw featuredError;
      }
      
      console.log(`Found ${featuredData?.length || 0} featured rewards:`, featuredData?.map(r => r.name));
      
      // If we have enough featured rewards, use them
      if (featuredData && featuredData.length >= 4) {
        return featuredData;
      }
      
      // Otherwise, get ALL rewards to fill the gap
      console.log('Not enough featured rewards, fetching all rewards...');
      const { data: allData, error: allError } = await supabase
        .from('rewards')
        .select('*')
        .order('pointsCost', { ascending: true })
        .limit(8);
      
      if (allError) {
        console.error('Error fetching all rewards:', allError);
        throw allError;
      }
      
      console.log(`Found ${allData?.length || 0} total rewards:`, allData?.map(r => r.name));
      return allData || [];
    },
    retry: false,
    staleTime: Infinity,
  });

  // Filter to only featured projects for rotation
  const featuredProjects = projects.filter(project => project.featured === true);
  
  // Get current project (use first 3 featured projects for rotation, fallback to first available)
  const currentProject = featuredProjects[currentStartupIndex] || featuredProjects[0] || projects[0];
  
  // Get available tiers from current project (same logic as case study)
  const getAvailableTiers = (project: Project | null | undefined) => {
    if (!project) return [];
    
    const tiers = [];
    for (let i = 1; i <= 7; i++) {
      const donation = project[`donation_${i}` as keyof Project] as number;
      const impact = project[`impact_${i}` as keyof Project] as string;
      const impactUnit = project.impact_unit as string;
      
      if (donation && impact) {
        tiers.push({
          donation,
          impact,
          unit: impactUnit || "impact created",
          points: donation * 10 // Calculate points based on donation amount
        });
      }
    }
    return tiers.sort((a, b) => a.donation - b.donation);
  };

  const availableTiers = getAvailableTiers(currentProject);
  
  // Initialize donation amount when project changes
  useEffect(() => {
    if (currentProject && availableTiers.length > 0 && initializedRef.current !== currentProject.id) {
      setDonationAmount(availableTiers[0].donation);
      initializedRef.current = currentProject.id;
    }
  }, [currentProject, availableTiers]);
  
  const currentTier = availableTiers.find(t => t.donation === donationAmount) || availableTiers[0];
  
  // Dynamic data from database
  const impactAmount = currentTier?.impact || "0";
  const impactUnit = currentTier?.unit || "impact created";
  const impactPoints = currentTier?.points || 0;
  const impactVerb = currentProject?.impact_verb || "help";
  const impactNoun = currentProject?.impact_noun || "people";
  
  // Calculate rewards value (25% more than donation amount)
  const calculateRewardsValue = (amount: number) => {
    return Math.floor(amount * 1.25); // 1.25x multiplier (25% more)
  };

  const currentRewardsValue = calculateRewardsValue(donationAmount);

  // Donation amounts from current project tiers
  const donationAmounts = availableTiers.map(tier => tier.donation);

  // H1 dynamic word rotation (independent, every 3 seconds)
  useEffect(() => {
    const h1Words = ['rewarding', 'transparent', 'efficient', 'meaningful'];
    
    h1IntervalRef.current = setInterval(() => {
      setCurrentH1Index((prev) => (prev + 1) % h1Words.length);
    }, 3000); // 3 seconds for H1 words

    return () => {
      if (h1IntervalRef.current) {
        clearInterval(h1IntervalRef.current);
      }
    };
  }, []);

  // Subheadline rotation with locking behavior (rotate between first 3 FEATURED projects, every 6 seconds)
  useEffect(() => {
    if (!isLocked && featuredProjects.length > 0) {
      startupIntervalRef.current = setInterval(() => {
        setCurrentStartupIndex((prev) => (prev + 1) % Math.min(3, featuredProjects.length));
      }, 6000); // 6 seconds for subheadline
    }

    return () => {
      if (startupIntervalRef.current) {
        clearInterval(startupIntervalRef.current);
      }
    };
  }, [isLocked, featuredProjects.length]);

  // Lock rotation when user interacts with donation amount
  const handleDonationInteraction = () => {
    setIsLocked(true);
    
    // Clear existing timeout
    if (lockTimeout) {
      clearTimeout(lockTimeout);
    }
    
    // Set new timeout to unlock after 10 seconds of inactivity
    const newTimeout = setTimeout(() => {
      setIsLocked(false);
    }, 10000);
    
    setLockTimeout(newTimeout);
  };

  // Unlock rotation manually
  const handleUnlock = () => {
    setIsLocked(false);
    if (lockTimeout) {
      clearTimeout(lockTimeout);
      setLockTimeout(null);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (showDropdown) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showDropdown]);

  // Don't render until we have projects
  if (!projects || projects.length === 0 || !currentProject) {
    return null;
  }

  return (
    <section className="relative overflow-hidden min-h-[80vh] md:min-h-[90vh] flex items-center" style={{ backgroundColor: BRAND_COLORS.bgBeige }}>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-12 items-start">
          {/* Left Column - Hero Content */}
          <div className="space-y-6 md:space-y-8 text-center lg:text-left">
            <div>
              <h1 className={TYPOGRAPHY.hero} style={{ fontFamily: "'Satoshi', 'Inter', system-ui, sans-serif" }}>
                <div className="mb-2" style={{ color: BRAND_COLORS.textPrimary }}>
                  Supporting real impact
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span style={{ color: BRAND_COLORS.textPrimary }}>
                    made{" "}
                  </span>
                  <div style={{ color: BRAND_COLORS.primaryOrange }}>
                    <span className="px-3 py-1 rounded-lg overflow-hidden justify-center inline-flex bg-white">
                      {["rewarding", "transparent", "efficient", "meaningful"][currentH1Index % 4]}
                    </span>
                  </div>
                </div>
              </h1>
              
              {/* Interactive Dynamic Subheadline with Lock Indicator */}
              <div className="mt-4">
                <p className="text-xl lg:text-2xl max-w-lg leading-relaxed" style={{ color: BRAND_COLORS.textPrimary }}>
                  Support selected social enterprises like <span className="font-semibold" style={{ color: BRAND_COLORS.textPrimary }}>{currentProject.title}</span> with{' '}
                  <span className="relative inline-block">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDropdown(!showDropdown);
                        handleDonationInteraction();
                      }}
                      className="font-semibold cursor-pointer transition-all duration-200 hover:scale-105 border-b-2 border-dotted border-orange-300 hover:border-orange-500 hover:border-solid"
                      style={{ color: BRAND_COLORS.primaryOrange }}
                    >
                      ${donationAmount}
                    </button>
                    
                    {/* Dropdown */}
                    {showDropdown && donationAmounts.length > 0 && (
                      <span className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[120px]">
                        {donationAmounts.map((amount) => (
                          <button
                            key={amount}
                            onClick={(e) => {
                              e.stopPropagation();
                              setDonationAmount(amount);
                              setShowDropdown(false);
                              handleDonationInteraction();
                            }}
                            className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors duration-150"
                            style={{ color: amount === donationAmount ? BRAND_COLORS.primaryOrange : BRAND_COLORS.textPrimary }}
                          >
                            ${amount}
                          </button>
                        ))}
                      </span>
                    )}
                  </span>
                  
                  {/* Lock Icon - directly after dollar amount */}
                  {isLocked && (
                    <button
                      onClick={handleUnlock}
                      className="inline-block ml-1 text-gray-500 hover:text-orange-500 transition-colors duration-200"
                      title="Click to unlock preview"
                    >
                      <Lock className="w-4 h-4" />
                    </button>
                  )}
                  
                  {' '}→ help{' '}
                  <span className="font-semibold" style={{ color: BRAND_COLORS.textPrimary }}>{impactVerb}</span>{' '}
                  <span className="font-semibold" style={{ color: BRAND_COLORS.primaryOrange }}>{impactAmount}</span>{' '}
                  <span className="font-semibold" style={{ color: BRAND_COLORS.primaryOrange }}>{impactNoun}</span> → earn rewards from sustainable brands worth up to{' '}
                  <span className="font-semibold" style={{ color: BRAND_COLORS.primaryOrange }}>${currentRewardsValue}</span>.
                </p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start w-full sm:w-auto">
              <Button 
                size="lg" 
                className="text-white px-6 py-3 text-base md:text-lg font-medium w-full sm:w-auto"
                style={{ backgroundColor: BRAND_COLORS.primaryOrange }}
                asChild
              >
                <a href="https://tally.so/r/m6MqAe" target="_blank" rel="noopener noreferrer">
                  Become a Founding Member
                </a>
              </Button>
              
              <Button 
                size="lg" 
                className="px-6 py-3 text-base md:text-lg font-medium bg-white hover:bg-gray-50 w-full sm:w-auto"
                style={{ color: BRAND_COLORS.textPrimary }}
                asChild
              >
                <Link href="/projects">
                  See Social Enterprises
                </Link>
              </Button>
            </div>

            {/* Microcopy */}
            <div className="flex items-center justify-center lg:justify-start mt-4">
              <div className="text-sm text-gray-500">
                100% goes to social enterprises • Visible impact • Real rewards
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="flex justify-center lg:justify-start">
              <div className="text-sm text-secondary">
                100% goes to impact • No platform fees • Cancel anytime
              </div>
            </div>
          </div>

          {/* Right Column - Unified Impact Box (EXACT COPY from original) */}
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            {/* Top: Projects Slider - 4 cards with half-visible sides */}
            <div className="mb-4">
              <div 
                className="flex space-x-2 overflow-hidden"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {/* Static projects display - show 4 with last one cut off */}
                {projects.slice(0, 4).map((project, index) => (
                  <div
                    key={`${project.id}-${index}`}
                    className={`flex-shrink-0 w-32 h-32 rounded-xl overflow-hidden relative group cursor-pointer transition-all duration-300 ${
                      index === 0 ? 'ml-2' : ''
                    }`}
                    style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
                  >
                    {project.imageUrl ? (
                      <>
                        <>
                          <img
                            src={project.imageUrl}
                            alt={project.title}
                            className="w-full h-full object-cover group-hover:brightness-100 transition-all duration-300"
                          />
                          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/0 transition-all duration-300"></div>
                        </>
                        <div className="absolute bottom-2 left-2 bg-white/70 backdrop-blur-sm text-gray-800 text-[10px] font-medium px-2 py-1 rounded-md shadow-sm">
                          {project.category || 'Education'}
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-100 to-green-100 flex flex-col items-center justify-center p-2 opacity-40 group-hover:opacity-100 transition-all duration-300">
                        <div className="absolute bottom-2 left-2 bg-white text-gray-800 text-[10px] font-medium px-2 py-1 rounded-md shadow-sm">
                          {project.category || 'Impact'}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Middle: Flow connector with text */}
            <div className="mb-4">
              <div className="bg-gray-50 rounded-lg p-3 text-center relative">
                <p className="text-sm text-gray-700 font-medium">
                  Supporting changemakers & sustainable brands
                </p>
              </div>
            </div>

            {/* Bottom: Rewards Slider - 4 cards with half-visible right side */}
            <div>
              <div 
                className="flex space-x-2 overflow-hidden"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {/* Static rewards display - show 4 with last one cut off */}
                {rewards.slice(0, 4).map((reward, index) => (
                  <div
                    key={`${reward.id}-${index}`}
                    className="flex-shrink-0 w-32 h-32 rounded-xl overflow-hidden relative group cursor-pointer transition-all duration-300"
                    style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
                  >
                    {reward.imageUrl ? (
                      <>
                        <>
                          <img
                            src={reward.imageUrl}
                            alt={reward.title}
                            className="w-full h-full object-cover group-hover:brightness-100 transition-all duration-300"
                          />
                          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/0 transition-all duration-300"></div>
                        </>
                        <div className="absolute bottom-2 left-2 bg-white/70 backdrop-blur-sm text-gray-800 text-[10px] font-medium px-2 py-1 rounded-md shadow-sm">
                          {reward.category || 'Reward'}
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center opacity-40 group-hover:opacity-100 transition-all duration-300">
                        <div className="absolute bottom-2 left-2 bg-white text-gray-800 text-[10px] font-medium px-2 py-1 rounded-md shadow-sm">
                          Reward
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}