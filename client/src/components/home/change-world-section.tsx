import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useProjectBySlug } from "@/hooks/use-project-by-slug";
import { useDonationTiers } from "@/hooks/use-donation-tiers";
import { Link } from "wouter";
import { Users } from "lucide-react";
import { DonationModal } from "@/components/donation/donation-modal";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { AuthModal } from "@/components/auth/auth-modal";
import { useAuth } from "@/hooks/use-auth";

export function ChangeWorldSection() {
  const [selectedCause, setSelectedCause] = useState(0);
  const [donationAmount, setDonationAmount] = useState(500);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { guardDonation, getPendingDonation, clearPendingDonation } = useAuthGuard();
  const { user } = useAuth();

  // Check for pending donation after authentication
  useEffect(() => {
    if (user) {
      const pendingDonation = getPendingDonation();
      if (pendingDonation && pendingDonation.context === 'case-study') {
        clearPendingDonation();
        setDonationAmount(pendingDonation.amount);
        setShowDonationModal(true);
      }
    }
  }, [user, getPendingDonation, clearPendingDonation]);
  
  // Project slugs for the 4 case studies
  const projectSlugs = ["allika-eco-products", "unbubble", "panjurli-labs", "ignis-careers"];
  
  // Fetch project data for each slug (no need for separate mainImage since we use imageUrl from project)
  const { project: allikaProject } = useProjectBySlug("allika-eco-products");
  const { project: unbubbleProject } = useProjectBySlug("unbubble");
  const { project: panjurliProject } = useProjectBySlug("panjurli-labs");
  const { project: ignisProject } = useProjectBySlug("ignis-careers");

  // Get current project based on selected cause
  const currentProject = useMemo(() => {
    switch(selectedCause) {
      case 0: return allikaProject;    // Environment
      case 1: return unbubbleProject;  // Technology
      case 2: return panjurliProject;  // Health
      case 3: return ignisProject;     // Education
      default: return null;
    }
  }, [selectedCause, allikaProject, unbubbleProject, panjurliProject, ignisProject]);

  // Get current project slug
  const currentProjectSlug = useMemo(() => {
    if (!currentProject) return null;
    return currentProject.slug;
  }, [currentProject]);

  // Fetch donation tiers for current project
  const { data: donationTiersData, isLoading: tiersLoading } = useDonationTiers(currentProjectSlug);

  // Calculate real impact based on donation tiers from Supabase
  const { impactAmount, impactUnit, impactPoints } = useMemo(() => {
    // Get project-specific impact unit from current project
    const projectImpactUnit = (currentProject as any)?.impact_unit || "impact units";
    
    if (!donationTiersData || !donationTiersData.tiers.length) {
      return { impactAmount: 0, impactUnit: projectImpactUnit, impactPoints: 0 };
    }

    // Find the exact tier that matches the donation amount
    const exactTier = donationTiersData.tiers.find(tier => tier.donation === donationAmount);
    if (exactTier) {
      return {
        impactAmount: exactTier.impact,
        impactUnit: projectImpactUnit,
        impactPoints: donationAmount * donationTiersData.impactPointsMultiplier
      };
    }

    // If no exact match, find the closest lower tier
    const sortedTiers = [...donationTiersData.tiers].sort((a, b) => a.donation - b.donation);
    const lowerTier = sortedTiers.reverse().find(tier => tier.donation <= donationAmount);
    
    if (lowerTier) {
      return {
        impactAmount: lowerTier.impact,
        impactUnit: projectImpactUnit,
        impactPoints: donationAmount * donationTiersData.impactPointsMultiplier
      };
    }

    return { impactAmount: 0, impactUnit: projectImpactUnit, impactPoints: 0 };
  }, [donationAmount, donationTiersData, currentProject]);

  // Update donation amount when project changes to match first available tier
  useEffect(() => {
    if (donationTiersData && donationTiersData.tiers.length > 0) {
      const firstTier = donationTiersData.tiers[0];
      setDonationAmount(firstTier.donation);
    }
  }, [donationTiersData]);

  // Handle slider changes to snap to exact donation tier values
  const handleSliderChange = (value: number) => {
    if (!donationTiersData || !donationTiersData.tiers.length) return;
    
    // Find the closest donation tier to the slider value
    const tiers = donationTiersData.tiers;
    let closestTier = tiers[0];
    let minDistance = Math.abs(value - tiers[0].donation);
    
    for (const tier of tiers) {
      const distance = Math.abs(value - tier.donation);
      if (distance < minDistance) {
        minDistance = distance;
        closestTier = tier;
      }
    }
    
    setDonationAmount(closestTier.donation);
  };

  // Text truncation utilities for better readability
  const truncateText = (text: string, maxLength: number) => {
    if (!text || text.length <= maxLength) return text;
    
    // Find the last complete word before the max length
    const truncated = text.substring(0, maxLength);
    const lastSpaceIndex = truncated.lastIndexOf(' ');
    
    if (lastSpaceIndex === -1) return truncated + '...';
    return truncated.substring(0, lastSpaceIndex) + '...';
  };

  const truncateHeadline = (text: string) => truncateText(text, 60);
  const truncateDescription = (text: string) => truncateText(text, 120);

  // Dynamic cause data using real Supabase project information
  const causes = useMemo(() => [
    {
      emoji: "🌱",
      title: allikaProject?.category || "Environment",
      description: allikaProject?.summary || "Sustainable eco-friendly solutions",
      category: "environment",
      projectId: allikaProject?.id,
      caseStudy: {
        name: allikaProject?.title || "Allika Eco Products",
        headline: truncateHeadline(allikaProject?.missionStatement || "Creating Sustainable Environmental Impact"),
        emoji: "♻️",
        description: truncateDescription(allikaProject?.aboutUs || "Creating eco-friendly alternatives using innovative sustainable solutions"),
        tagline: `Your donation creates ${selectedCause === 0 ? impactAmount : 'impact'} ${selectedCause === 0 ? impactUnit : ((allikaProject as any)?.impact_unit || 'impact units')}`,
        impact: `+${selectedCause === 0 ? impactAmount : 'impact'} ${selectedCause === 0 ? impactUnit : ((allikaProject as any)?.impact_unit || 'impact units')}`,
        unit: (allikaProject as any)?.impact_unit || 'impact units'
      }
    },
    {
      emoji: "🔍",
      title: unbubbleProject?.category || "Technology",
      description: unbubbleProject?.summary || "Innovative technology solutions",
      category: "technology",
      projectId: unbubbleProject?.id,
      caseStudy: {
        name: unbubbleProject?.title || "Unbubble",
        headline: truncateHeadline(unbubbleProject?.missionStatement || "Revolutionary Technology Innovation"),
        emoji: "📱",
        description: truncateDescription(unbubbleProject?.aboutUs || "Breaking barriers through innovative technology solutions"),
        tagline: `Your donation enables ${selectedCause === 1 ? impactAmount : 'impact'} ${selectedCause === 1 ? impactUnit : ((unbubbleProject as any)?.impact_unit || 'impact units')}`,
        impact: `+${selectedCause === 1 ? impactAmount : 'impact'} ${selectedCause === 1 ? impactUnit : ((unbubbleProject as any)?.impact_unit || 'impact units')}`,
        unit: (unbubbleProject as any)?.impact_unit || 'impact units'
      }
    },
    {
      emoji: "🩺",
      title: panjurliProject?.category || "Health",
      description: panjurliProject?.summary || "Advanced healthcare research",
      category: "health",
      projectId: panjurliProject?.id,
      caseStudy: {
        name: panjurliProject?.title || "Panjurli Labs",
        headline: truncateHeadline(panjurliProject?.missionStatement || "Advancing Healthcare Through Research"),
        emoji: "🏥",
        description: truncateDescription(panjurliProject?.aboutUs || "Advanced research and development for better healthcare outcomes"),
        tagline: `Your donation supports ${selectedCause === 2 ? impactAmount : 'impact'} ${selectedCause === 2 ? impactUnit : ((panjurliProject as any)?.impact_unit || 'impact units')}`,
        impact: `+${selectedCause === 2 ? impactAmount : 'impact'} ${selectedCause === 2 ? impactUnit : ((panjurliProject as any)?.impact_unit || 'impact units')}`,
        unit: (panjurliProject as any)?.impact_unit || 'impact units'
      }
    },
    {
      emoji: "🎓",
      title: ignisProject?.category || "Education",
      description: ignisProject?.summary || "Career development programs",
      category: "education",
      projectId: ignisProject?.id,
      caseStudy: {
        name: ignisProject?.title || "Ignis Careers",
        headline: truncateHeadline(ignisProject?.missionStatement || "Empowering Careers Through Education"),
        emoji: "💼",
        description: truncateDescription(ignisProject?.aboutUs || "Comprehensive career development and educational programs"),
        tagline: `Your donation empowers ${selectedCause === 3 ? impactAmount : 'impact'} ${selectedCause === 3 ? impactUnit : ((ignisProject as any)?.impact_unit || 'impact units')}`,
        impact: `+${selectedCause === 3 ? impactAmount : 'impact'} ${selectedCause === 3 ? impactUnit : ((ignisProject as any)?.impact_unit || 'impact units')}`,
        unit: (ignisProject as any)?.impact_unit || 'impact units'
      }
    },
    {
      emoji: "👥",
      title: "Others",
      description: "Discover more diverse social impact projects",
      category: "others",
      projectId: null,
      isProjectsLink: true,
      caseStudy: {
        name: "Explore All Projects",
        headline: "Discover More Ways to Create Impact",
        emoji: "🌟",
        description: "Browse our complete collection of verified social impact projects across various causes.",
        tagline: "Explore dozens of impactful projects waiting for your support",
        impact: "Find the perfect project that matches your passion for social change",
        unit: "projects"
      }
    }
  ], [allikaProject, unbubbleProject, panjurliProject, ignisProject, impactAmount, impactUnit]);

  return (
    <section id="change-world" className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-black">How do you want to change the world today?</h2>
          <p className="text-xl text-black max-w-3xl mx-auto mb-4">
            Choose a cause and see exactly how your contribution creates sustainable impact
          </p>
          <div className="flex items-center justify-center space-x-2 text-primary">
            <span className="inline-block animate-pulse">👆</span>
            <span className="text-sm font-medium">Tap any card to explore case studies</span>
          </div>
        </div>
        
        <div className="relative mb-12">
          {/* Mobile view - horizontal slider */}
          <div className="md:hidden overflow-x-auto pb-4 pt-4">
            <div className="flex space-x-4 px-4" style={{ minWidth: "min-content" }}>
              {causes.map((cause, idx) => (
                idx === 4 ? (
                  <Link href="/projects" key={idx}>
                    <div 
                      className="flex-shrink-0 w-64 bg-white rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden cursor-pointer"
                    >
                      <div className="p-6 text-center">
                        <div className="text-4xl mb-3 flex justify-center">
                          <div className="flex justify-center items-center h-16 w-16 rounded-full bg-purple-100">
                            <Users className="w-8 h-8 text-purple-600" />
                          </div>
                        </div>
                        <h3 className="font-bold text-lg mb-2 text-black">{cause.title}</h3>
                        <p className="text-sm text-gray-600">{cause.description}</p>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div 
                    key={idx} 
                    className={`flex-shrink-0 w-64 bg-white rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden cursor-pointer 
                      ${selectedCause === idx 
                        ? 'ring-2 ring-primary transform scale-105 opacity-100' 
                        : Math.abs(selectedCause - idx) === 1 
                          ? 'opacity-70 filter grayscale-[40%]' 
                          : 'opacity-50 filter grayscale-[70%]'
                      }`}
                    onClick={() => setSelectedCause(idx)}
                  >
                    <div className="p-6 text-center">
                      <div className="text-4xl mb-3">{cause.emoji}</div>
                      <h3 className="font-bold text-lg mb-2 text-black">{cause.title}</h3>
                      <p className="text-sm text-gray-600">{cause.description}</p>
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>
          
          {/* Desktop view - grid */}
          <div className="hidden md:grid md:grid-cols-5 md:gap-4">
            {causes.map((cause, idx) => (
              idx === 4 ? (
                <Link href="/projects" key={idx}>
                  <div 
                    className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer hover:ring-2 hover:ring-primary"
                  >
                    <div className="p-6 text-center">
                      <div className="text-4xl mb-3 flex justify-center">
                        <div className="flex justify-center items-center h-16 w-16 rounded-full bg-purple-100">
                          <Users className="w-8 h-8 text-purple-600" />
                        </div>
                      </div>
                      <h3 className="font-bold text-lg mb-2 text-black">{cause.title}</h3>
                      <p className="text-sm text-gray-600">{cause.description}</p>
                    </div>
                  </div>
                </Link>
              ) : (
                <div 
                  key={idx} 
                  className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer 
                    ${selectedCause === idx 
                      ? 'ring-2 ring-primary transform scale-105' 
                      : ''}`}
                  onClick={() => setSelectedCause(idx)}
                >
                  <div className="p-6 text-center">
                    <div className="text-4xl mb-3">{cause.emoji}</div>
                    <h3 className="font-bold text-lg mb-2 text-black">{cause.title}</h3>
                    <p className="text-sm text-gray-600">{cause.description}</p>
                  </div>
                </div>
              )
            ))}
          </div>
          <div className="mt-4 flex justify-center md:hidden">
            <div className="flex space-x-2">
              {causes.map((_, idx) => (
                <button 
                  key={idx}
                  onClick={() => setSelectedCause(idx)}
                  className={`w-2 h-2 rounded-full ${selectedCause === idx ? 'bg-primary' : 'bg-gray-300'}`}
                  aria-label={`View ${causes[idx].title} case study`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 md:p-8">
              <div className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-4">
                Case Study
              </div>
              <div className="transition-opacity duration-300">
                <h3 className="text-2xl font-bold mb-2 text-black">{causes[selectedCause].caseStudy.headline}</h3>
                <p className="text-black mb-4 text-sm">
                  {causes[selectedCause].caseStudy.description}
                </p>
              </div>
              
              <div className="space-y-4 mb-6">
                {/* Donation Amount Slider */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-black">Donation amount</span>
                    <span className="text-sm font-medium text-black">${donationAmount}</span>
                  </div>
                  {donationTiersData && donationTiersData.tiers.length > 0 ? (
                    <>
                      <input
                        type="range"
                        min={0}
                        max={donationTiersData.tiers.length - 1}
                        step={1}
                        value={donationTiersData.tiers.findIndex(tier => tier.donation === donationAmount)}
                        onChange={(e) => {
                          const tierIndex = parseInt(e.target.value);
                          if (donationTiersData.tiers[tierIndex]) {
                            setDonationAmount(donationTiersData.tiers[tierIndex].donation);
                          }
                        }}
                        className="w-full accent-primary"
                      />
                      <div className="flex justify-between text-xs text-gray-600 mt-1">
                        <span>${donationTiersData.tiers[0].donation.toLocaleString()}</span>
                        <span>${donationTiersData.tiers[donationTiersData.tiers.length - 1].donation.toLocaleString()}</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-gray-500 py-4">
                      {tiersLoading ? "Loading donation options..." : "No donation tiers available"}
                    </div>
                  )}
                </div>
                
                {/* Impact Boxes - Side by Side */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Impact Created Box */}
                  <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                    <div className="flex flex-col items-center justify-between h-full">
                      <span className="text-xs font-medium text-green-800 mb-1">Impact created</span>
                      <div className="bg-white rounded-md px-3 py-1 shadow-sm w-full text-center">
                        <span className="text-lg font-bold text-green-700">{impactAmount}</span>
                        <span className="text-xs text-green-700 ml-1">{impactUnit}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Impact Points Box */}
                  <div className="bg-orange-50 rounded-lg p-3 border border-orange-100">
                    <div className="flex flex-col items-center justify-between h-full">
                      <span className="text-xs font-medium text-orange-800 mb-1">Impact points</span>
                      <div className="bg-white rounded-md px-3 py-1 shadow-sm w-full text-center">
                        <span className="text-lg font-bold text-orange-500">{impactPoints}</span>
                        <span className="text-xs text-orange-500 ml-1">pts</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <Button 
                className="w-full bg-primary text-white hover:bg-primary/90 transition-transform hover:scale-105"
                onClick={() => {
                  guardDonation(
                    {
                      amount: donationAmount,
                      projectId: currentProject?.id,
                      projectTitle: currentProject?.title || causes[selectedCause].caseStudy.name,
                      context: 'case-study'
                    },
                    () => setShowDonationModal(true),
                    () => setShowAuthModal(true)
                  );
                }}
              >
                Contribute ${donationAmount} → Make payment
              </Button>
              
              <DonationModal
                isOpen={showDonationModal}
                onClose={() => setShowDonationModal(false)}
                project={currentProject || undefined}
                initialAmount={donationAmount}
              />

              <AuthModal 
                isOpen={showAuthModal} 
                onClose={() => setShowAuthModal(false)}
                defaultTab="login"
              />
              
              {currentProjectSlug && (
                <div className="mt-3 text-center">
                  <Link href={`/projects/${currentProjectSlug}`} className="text-primary hover:underline text-sm">
                    View full project details for {causes[selectedCause].caseStudy.name}
                  </Link>
                </div>
              )}
            </div>
            
            <div className={`p-0 flex items-center justify-center overflow-hidden transition-all duration-500 bg-gradient-to-br ${
              selectedCause === 0 ? 'from-blue-50 to-blue-100' : 
              selectedCause === 1 ? 'from-orange-50 to-amber-100' : 
              selectedCause === 2 ? 'from-green-50 to-green-100' : 
              selectedCause === 3 ? 'from-amber-50 to-amber-100' : 'from-rose-50 to-rose-100'
            }`}>
              <div className="w-full h-full">
                {/* Show current project's image from Supabase */}
                {currentProject?.imageUrl ? (
                  <div className="relative h-full">
                    <img 
                      src={currentProject.imageUrl} 
                      alt={currentProject.title} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 text-white">
                      <h4 className="text-xl font-bold mb-1">
                        {currentProject.title}
                      </h4>
                      <p className="text-white/90 text-sm font-medium mb-2">
                        {impactAmount} {impactUnit}
                      </p>
                      <div className="mt-3 bg-white/20 backdrop-blur-sm rounded-lg p-2">
                        <p className="text-white font-medium">+{impactPoints} Impact Points</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-6 transition-all duration-300 transform h-full flex flex-col justify-center">
                    <div className="text-6xl mb-4 transform transition-all duration-500 hover:scale-125">{causes[selectedCause].caseStudy.emoji}</div>
                    <p className="text-primary text-lg font-medium">
                      {causes[selectedCause].caseStudy.tagline}
                    </p>
                    <p className="text-gray-600 mt-2">{causes[selectedCause].caseStudy.impact}</p>
                    <div className="mt-4 p-3 bg-white rounded-lg shadow-sm">
                      <p className="text-orange-500 font-medium">+{impactPoints} Impact Points</p>
                      <p className="text-sm text-gray-500">Can be redeemed for exclusive rewards</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}