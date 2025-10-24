import React, { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Target, TrendingUp, Users, Heart, ArrowRight, Wind, ChevronDown, GraduationCap, BookOpen, Lightbulb } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Project } from "@shared/schema";
import { SDGNotificationBell } from "@/components/ui/sdg-notification-bell";
import { TYPOGRAPHY } from "@/constants/typography";
import sdgWheelImg from "@assets/sdg wheel.png";
import { BRAND_COLORS } from "@/constants/colors";

export function CaseStudyModernSectionV2() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [donationAmount, setDonationAmount] = useState(0);
  const [showDonationDropdown, setShowDonationDropdown] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const initializedRef = React.useRef<string | null>(null);
  const touchRef = useRef<HTMLDivElement>(null);

  // Fetch featured projects in specific order
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["projects-case-study-modern-v2"],
    queryFn: async () => {
      // Define the specific order we want
      const projectOrder = ['ignis-careers', 'allika-eco-products', 'panjurli-labs', 'sanitrust-pads'];
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('status', 'active')
        .eq('featured', true)
        .in('slug', projectOrder);
      
      if (error) throw error;
      
      // Sort the results according to our desired order
      const sortedProjects = projectOrder
        .map(slug => data?.find(project => project.slug === slug))
        .filter(Boolean) as Project[];
      
      return sortedProjects;
    },
    retry: false,
    staleTime: Infinity,
  });

  const closeProjectDetail = () => {
    setSelectedProject(null);
    setDonationAmount(0);
    setShowDonationDropdown(false);
    initializedRef.current = null;
  };

  // Get available tiers from selected project
  const getAvailableTiers = (project: Project | null) => {
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

  const availableTiers = getAvailableTiers(selectedProject);
  
  // Initialize donation amount when project is selected
  React.useEffect(() => {
    if (selectedProject && availableTiers.length > 0 && initializedRef.current !== selectedProject.id) {
      setDonationAmount(availableTiers[0].donation);
      initializedRef.current = selectedProject.id;
    }
  }, [selectedProject, availableTiers]);
  
      const currentTier = availableTiers.find(t => t.donation === donationAmount) || availableTiers[0];
      const impactAmount = currentTier?.impact || "0";
      const impactUnit = currentTier?.unit || "impact created";
      const impactPoints = currentTier?.points || 0;
      
      // Get impact verb and noun from project data
      const impactVerb = selectedProject?.impact_verb || "help";
      const impactNoun = selectedProject?.impact_noun || "people";

  // Swipe gesture handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe || isRightSwipe) {
      const currentIndex = availableTiers.findIndex(t => t.donation === donationAmount);
      let newIndex = currentIndex;
      
      if (isLeftSwipe && currentIndex < availableTiers.length - 1) {
        newIndex = currentIndex + 1;
      } else if (isRightSwipe && currentIndex > 0) {
        newIndex = currentIndex - 1;
      }
      
      if (newIndex !== currentIndex && availableTiers[newIndex]) {
        setDonationAmount(availableTiers[newIndex].donation);
      }
    }
  };

  // Get impact preview icon based on project
  const getImpactIcon = () => {
    if (selectedProject?.name?.toLowerCase().includes('ignis') || selectedProject?.title?.toLowerCase().includes('ignis')) {
      return <GraduationCap className="h-6 w-6" style={{ color: BRAND_COLORS.primaryOrange }} />;
    } else if (selectedProject?.name?.toLowerCase().includes('panjurli') || selectedProject?.title?.toLowerCase().includes('panjurli')) {
      return <Wind className="h-6 w-6" style={{ color: BRAND_COLORS.primaryOrange }} />;
    } else if (selectedProject?.name?.toLowerCase().includes('allika') || selectedProject?.title?.toLowerCase().includes('allika')) {
      return <BookOpen className="h-6 w-6" style={{ color: BRAND_COLORS.primaryOrange }} />;
    } else {
      return <Users className="h-6 w-6" style={{ color: BRAND_COLORS.primaryOrange }} />;
    }
  };

  return (
    <section className="py-24" style={{ backgroundColor: BRAND_COLORS.bgWhite }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className={`${TYPOGRAPHY.section} mb-4`} style={{ 
            color: BRAND_COLORS.textPrimary, 
            fontFamily: "'Satoshi', 'Inter', system-ui, sans-serif" 
          }}>
            How do you want to change the world today?
          </h2>
          <p className="text-xl max-w-2xl mx-auto mb-6" style={{ color: BRAND_COLORS.textSecondary }}>
            Choose a social enterprise and see real impact you can create
          </p>
          
          {/* Why Social Enterprises Popover */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="text-sm" style={{ color: BRAND_COLORS.textSecondary }}>
              Why Dopaya focuses on Social Enterprises?
            </span>
            <SDGNotificationBell />
          </div>
        </div>

        {/* Project Cards - Desktop Grid / Mobile Slider */}
        <div className="mb-8 md:mb-12">
          {/* Desktop: Show all 5 boxes side-by-side */}
          <div className="hidden md:grid grid-cols-5 gap-6">
            {projects.map((project) => {
              const IconComponent = Target; // Default icon
              return (
                <div
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  className={`relative cursor-pointer rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 ${
                    selectedProject && selectedProject.id !== project.id ? 'opacity-50' : ''
                  }`}
                  style={{ 
                    backgroundColor: selectedProject && selectedProject.id !== project.id ? BRAND_COLORS.bgCool : BRAND_COLORS.bgWhite, 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    border: `1px solid ${BRAND_COLORS.borderSubtle}`
                  }}
                >
                  <div className="aspect-square relative">
                    {project.imageUrl ? (
                      <img
                        src={project.imageUrl}
                        alt={project.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center">
                        <IconComponent className="h-12 w-12" style={{ color: BRAND_COLORS.textSecondary }} />
                      </div>
                    )}
                    
                    {/* Mission Overlay - Dark background for text visibility */}
                    <div className="absolute inset-0 flex items-end p-3">
                      <div className="text-white">
                        <div className="flex items-center gap-2 mb-1 bg-black/60 px-2 py-1 rounded-md">
                          <IconComponent className="h-4 w-4" />
                          <h3 className="font-semibold text-sm">
                            {project.mission || project.category}
                          </h3>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* 5th Box - View All Projects */}
            <Link href="/projects">
            <div className="relative cursor-pointer rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 group"
                 style={{ 
                   backgroundColor: BRAND_COLORS.bgWhite, 
                   boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                   border: `1px solid ${BRAND_COLORS.borderSubtle}`
                 }}>
              <div className="aspect-square relative bg-gray-100">
                {/* Background spans full card */}
                <div className="absolute inset-0 w-full h-full bg-gray-100 flex items-center justify-center p-6">
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:shadow-md transition-shadow">
                      <img 
                        src={sdgWheelImg} 
                        alt="SDG Wheel" 
                        className="w-12 h-12 object-contain"
                      />
                    </div>
                    <h3 className="font-semibold text-lg mb-3 px-2" style={{ color: BRAND_COLORS.textPrimary }}>
                      View All Projects
                    </h3>
                    <p className="text-sm px-4 leading-relaxed" style={{ color: BRAND_COLORS.textSecondary }}>
                      Explore all our social enterprises
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Link>
          </div>
          
          {/* Mobile: Simple grid for now */}
          <div className="md:hidden grid grid-cols-2 gap-4">
            {projects.slice(0, 4).map((project) => {
              const IconComponent = Target; // Default icon
              return (
                <div
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  className={`relative cursor-pointer rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 ${
                    selectedProject && selectedProject.id !== project.id ? 'opacity-50' : ''
                  }`}
                  style={{ 
                    backgroundColor: selectedProject && selectedProject.id !== project.id ? BRAND_COLORS.bgCool : BRAND_COLORS.bgWhite, 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    border: `1px solid ${BRAND_COLORS.borderSubtle}`
                  }}
                >
                  <div className="aspect-square relative">
                    {project.imageUrl ? (
                      <img
                        src={project.imageUrl}
                        alt={project.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center">
                        <IconComponent className="h-12 w-12" style={{ color: BRAND_COLORS.textSecondary }} />
                      </div>
                    )}
                    
                    {/* Mission Overlay - Dark background for text visibility */}
                    <div className="absolute inset-0 flex items-end p-3">
                      <div className="text-white">
                        <div className="flex items-center gap-2 mb-1 bg-black/60 px-2 py-1 rounded-md">
                          <IconComponent className="h-4 w-4" />
                          <h3 className="font-semibold text-sm">
                            {project.mission || project.category}
                          </h3>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Mobile: 5th Box - View All Projects */}
            <Link href="/projects">
              <div className="relative cursor-pointer rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 group"
                   style={{ 
                     backgroundColor: BRAND_COLORS.bgWhite, 
                     boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                     border: `1px solid ${BRAND_COLORS.borderSubtle}`
                   }}
              >
                <div className="aspect-square relative bg-gray-100 flex items-center justify-center p-6">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:shadow-md transition-shadow">
                      <img 
                        src="/src/assets/sdg-wheel.svg" 
                        alt="SDG Wheel" 
                        className="w-10 h-10 object-contain"
                      />
                    </div>
                    <h3 className="font-semibold text-sm mb-2 px-2" style={{ color: BRAND_COLORS.textPrimary }}>
                      View All Projects
                    </h3>
                    <p className="text-xs px-2 leading-relaxed" style={{ color: BRAND_COLORS.textSecondary }}>
                      Explore all our social enterprises
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* GoFundMe-Style Popup - For all projects */}
        {selectedProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <div className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">
              <button
                onClick={closeProjectDetail}
                className="absolute top-6 right-6 z-10 p-2 rounded-full bg-white/90 hover:bg-white shadow-sm transition-colors"
              >
                <X className="h-5 w-5" style={{ color: BRAND_COLORS.textSecondary }} />
              </button>

              {/* Header */}
              <div className="p-6 lg:p-8 border-b" style={{ borderColor: BRAND_COLORS.borderSubtle }}>
                <h3 className="text-xl lg:text-2xl font-bold mb-1" style={{ color: BRAND_COLORS.textPrimary }}>
                  See the impact you can create
                </h3>
                <p className="text-base lg:text-lg" style={{ color: BRAND_COLORS.textSecondary }}>
                  with {selectedProject.title}
                </p>
              </div>

                  {/* Main Content - 2 Column Layout */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 p-6 lg:p-12">
                
                {/* Left Column - Dynamic Text */}
                <div className="space-y-8 order-2 lg:order-1">
                  <div>

                    {/* Large Dynamic Text with Integrated Dropdown */}
                    <div 
                      className="text-center lg:text-left"
                      onTouchStart={handleTouchStart}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                      ref={touchRef}
                    >
                      <p className="text-2xl lg:text-4xl font-semibold leading-[1.4]" style={{ color: BRAND_COLORS.textPrimary }}>
                        Support <span className="font-bold" style={{ color: BRAND_COLORS.textPrimary }}>{selectedProject.title}</span> with{' '}
                            <span className="relative inline-block">
                              <button
                                onClick={() => setShowDonationDropdown(!showDonationDropdown)}
                                className="inline-flex items-center gap-1 border-b-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors min-h-[48px] px-2 font-bold"
                                style={{ color: BRAND_COLORS.primaryOrange }}
                              >
                                ${donationAmount}
                                <ChevronDown className="h-5 w-5" />
                              </button>
                              
                              {showDonationDropdown && (
                                <div className="absolute top-full left-0 mt-2 bg-white border rounded-lg shadow-lg z-10 min-w-[140px]"
                                     style={{ borderColor: BRAND_COLORS.borderSubtle }}>
                                  {availableTiers.map((tier) => (
                                    <button
                                      key={tier.donation}
                                      onClick={() => {
                                        setDonationAmount(tier.donation);
                                        setShowDonationDropdown(false);
                                      }}
                                      className="w-full p-2 text-left hover:bg-gray-50 transition-colors min-h-[36px]"
                                    >
                                      <span className="text-lg font-bold" style={{ color: BRAND_COLORS.primaryOrange }}>
                                        ${tier.donation}
                                      </span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </span> and help{' '}
                            <span className="font-bold" style={{ color: BRAND_COLORS.textPrimary }}>{impactVerb}</span>{' '}
                            <span className="font-bold" style={{ color: BRAND_COLORS.primaryOrange }}>{impactAmount}</span>{' '}
                            <span className="font-bold" style={{ color: BRAND_COLORS.primaryOrange }}>{impactNoun}</span>{' '}
                            <span style={{ color: BRAND_COLORS.textSecondary }}>— earn</span>{' '}
                            <span className="font-bold" style={{ color: BRAND_COLORS.textPrimary }}>{impactPoints}</span>{' '}
                            <span style={{ color: BRAND_COLORS.textSecondary }}>Impact Points</span>.
                      </p>
                    </div>
                    
                        {/* Support Button */}
                        <div className="mt-8 lg:mt-10 text-center lg:text-left">
                          <Button 
                            size="lg"
                            className="text-white font-semibold px-6 lg:px-8 py-3 lg:py-4 text-base lg:text-lg min-h-[44px] lg:min-h-[48px] w-full sm:w-auto"
                            style={{ backgroundColor: BRAND_COLORS.primaryOrange }}
                            asChild
                          >
                            <Link href={`/project/${selectedProject.slug || selectedProject.id}`}>
                              Support This Project
                            </Link>
                          </Button>
                        </div>
                  </div>
                </div>

                {/* Right Column - Project Info & Image */}
                <div className="space-y-6 order-1 lg:order-2">
                    <div className="rounded-lg overflow-hidden relative" style={{ border: `1px solid ${BRAND_COLORS.borderSubtle}` }}>
                      {selectedProject.imageUrl ? (
                        <img
                          src={selectedProject.imageUrl}
                          alt={selectedProject.title}
                          className="w-full h-72 lg:h-80 object-cover"
                        />
                      ) : (
                        <div className="w-full h-72 lg:h-80 flex items-center justify-center" style={{ backgroundColor: BRAND_COLORS.bgCool }}>
                          <Target className="h-16 w-16" style={{ color: BRAND_COLORS.textMuted }} />
                        </div>
                      )}
                      
                      {/* Text overlay at bottom */}
                      <div className="absolute bottom-0 left-0 right-0">
                        <div className="bg-white/50 backdrop-blur-sm p-3">
                          <p className="text-sm lg:text-base leading-relaxed font-medium" style={{ color: BRAND_COLORS.textPrimary }}>
                            {selectedProject.missionStatement || selectedProject.description || "Supporting sustainable livelihoods and community development."}
                          </p>
                        </div>
                      </div>
                    </div>
                  
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
