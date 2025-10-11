import React, { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Target, TrendingUp, Users, Heart, ArrowRight, Wind } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Project } from "@shared/schema";
import { SDGNotificationBell } from "@/components/ui/sdg-notification-bell";
import { TYPOGRAPHY } from "@/constants/typography";
import { BRAND_COLORS } from "@/constants/colors";

export function CaseStudyModernSection() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [donationAmount, setDonationAmount] = useState(0);
  const initializedRef = React.useRef<string | null>(null);

  // Fetch featured projects in specific order
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["projects-case-study-modern"],
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
    return tiers;
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
                    
                    {/* Mission Overlay */}
                    <div className="absolute inset-0 bg-black/60 flex items-end p-3">
                      <div className="text-white">
                        <div className="flex items-center gap-2 mb-1">
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
                        src="/src/assets/sdg-wheel.svg" 
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
                    
                    {/* Mission Overlay */}
                    <div className="absolute inset-0 bg-black/60 flex items-end p-3">
                      <div className="text-white">
                        <div className="flex items-center gap-2 mb-1">
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
                <div className="aspect-square relative bg-gray-100 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-blue-100 to-green-100 rounded-full flex items-center justify-center">
                      <img 
                        src="/src/assets/SDG_Wheel.png" 
                        alt="SDG Wheel" 
                        className="w-8 h-8 object-contain"
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
            </Link>
          </div>
        </div>

        {/* Modern Card Layout Case Study - Popup */}
        {selectedProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl">
            <button
              onClick={closeProjectDetail}
              className="absolute top-6 right-6 z-10 p-2 rounded-full bg-white/90 hover:bg-white shadow-sm transition-colors"
            >
              <X className="h-5 w-5" style={{ color: BRAND_COLORS.textSecondary }} />
            </button>

            {/* Main Content Grid - 3 columns with individual borders */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[400px]">
              
              {/* Left: Project Info Card */}
              <div className="relative rounded-xl overflow-hidden" style={{ border: `1px solid ${BRAND_COLORS.borderSubtle}` }}>
                <div className="p-6 bg-white w-full h-full transition-all duration-300 hover:scale-[1.02] origin-center text-left">
                <Badge className="mb-3" style={{ backgroundColor: '#FFF4ED', color: BRAND_COLORS.primaryOrange }}>
                  Real impact case
                </Badge>
                
                <h3 className="text-xl font-bold mb-6" style={{ 
                  color: BRAND_COLORS.textPrimary, 
                  fontFamily: "'Satoshi', 'Inter', system-ui, sans-serif" 
                }}>
                  {selectedProject.title}
                </h3>

                <p className="text-base mb-8 leading-relaxed" style={{ color: BRAND_COLORS.textSecondary }}>
                  {selectedProject.missionStatement || selectedProject.description || "Supporting sustainable livelihoods and community development."}
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    size="sm"
                    className="text-white font-semibold px-4 py-2 text-sm shadow-lg w-auto"
                    style={{ backgroundColor: BRAND_COLORS.primaryOrange }}
                    asChild
                  >
                    <a href="https://tally.so/r/m6MqAe" target="_blank" rel="noopener noreferrer">
                      Support This Project
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </a>
                  </Button>
                  <Button 
                    size="sm"
                    variant="outline"
                    className="font-semibold px-4 py-2 text-sm w-auto"
                    style={{ 
                      color: BRAND_COLORS.textPrimary,
                      borderColor: BRAND_COLORS.borderSubtle
                    }}
                    asChild
                  >
                    <Link href={`/project/${selectedProject.slug || selectedProject.id}`}>
                      Learn More
                    </Link>
                  </Button>
                </div>
                </div>
              </div>

              {/* Center: Impact Controls Card */}
              <div className="p-6 bg-gray-50 rounded-xl transition-all duration-300 hover:scale-[1.02] text-left" style={{ border: `1px solid ${BRAND_COLORS.borderSubtle}` }}>
                <h4 className="text-lg font-semibold mb-4" style={{ color: BRAND_COLORS.textPrimary }}>
                  Calculate the impact you can do
                </h4>
                
                <div className="mb-4">
                  <div className="text-3xl font-bold mb-3" style={{ color: BRAND_COLORS.primaryOrange }}>
                    ${donationAmount}
                  </div>
                  
                  {availableTiers.length > 1 && (
                    <>
                      <input
                        type="range"
                        min={0}
                        max={availableTiers.length - 1}
                        step="1"
                        value={availableTiers.findIndex(t => t.donation === donationAmount) >= 0 ? availableTiers.findIndex(t => t.donation === donationAmount) : 0}
                        onChange={(e) => {
                          const index = Number(e.target.value);
                          if (availableTiers[index]) {
                            setDonationAmount(availableTiers[index].donation);
                          }
                        }}
                        className="w-full h-2 rounded-full appearance-none cursor-pointer mb-3"
                        style={{
                          background: `linear-gradient(to right, ${BRAND_COLORS.primaryOrange} 0%, ${BRAND_COLORS.primaryOrange} ${((availableTiers.findIndex(t => t.donation === donationAmount) || 0) / (availableTiers.length - 1)) * 100}%, #e5e7eb ${((availableTiers.findIndex(t => t.donation === donationAmount) || 0) / (availableTiers.length - 1)) * 100}%, #e5e7eb 100%)`
                        }}
                      />
                      <div className="flex justify-between text-xs" style={{ color: BRAND_COLORS.textSecondary }}>
                        <span>${availableTiers[0].donation}</span>
                        <span>${availableTiers[availableTiers.length - 1].donation}</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Impact Stats */}
                <div className="space-y-3">
                  <div className="p-4 rounded-xl" style={{ border: `1px solid ${BRAND_COLORS.borderSubtle}` }}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FFF4ED' }}>
                        {selectedProject?.name?.toLowerCase().includes('panjurli') ? (
                          <Wind className="h-5 w-5" style={{ color: BRAND_COLORS.primaryOrange }} />
                        ) : (
                          <Users className="h-5 w-5" style={{ color: BRAND_COLORS.primaryOrange }} />
                        )}
                      </div>
                      <div>
                        <div className="text-2xl font-bold" style={{ color: BRAND_COLORS.textPrimary }}>
                          {impactAmount}
                        </div>
                        <div className="text-sm" style={{ color: BRAND_COLORS.textSecondary }}>{impactUnit}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 rounded-xl" style={{ border: `1px solid ${BRAND_COLORS.borderSubtle}` }}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FFF4ED' }}>
                        <TrendingUp className="h-4 w-4" style={{ color: BRAND_COLORS.primaryOrange }} />
                      </div>
                      <div>
                        <div className="text-xl font-bold" style={{ color: BRAND_COLORS.primaryOrange }}>
                          {impactPoints}
                        </div>
                        <div className="text-sm" style={{ color: BRAND_COLORS.textSecondary }}>Impact Points</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Image Card */}
              <div className="relative overflow-hidden rounded-xl text-left" style={{ border: `1px solid ${BRAND_COLORS.borderSubtle}` }}>
                <div className="w-full h-full transition-all duration-300 hover:scale-[1.02] origin-center">
                  {selectedProject.imageUrl ? (
                    <div className="relative h-full min-h-[500px]">
                      <img
                        src={selectedProject.imageUrl}
                        alt={selectedProject.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      {/* Gradient overlay for better text readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>
                  ) : (
                    <div className="w-full h-full min-h-[500px] flex items-center justify-center" style={{ backgroundColor: BRAND_COLORS.bgCool }}>
                      <Target className="h-16 w-16" style={{ color: BRAND_COLORS.textMuted }} />
                    </div>
                  )}
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
