import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { TrendingUp, Users, Gift, Target, Play, Eye, ChevronRight, ArrowUp } from "lucide-react";
import { TextRotate } from "@/components/ui/text-rotate";
import { LayoutGroup, motion } from "motion/react";
import { useState } from "react";
import { InteractiveValueCalculator } from "@/components/ui/interactive-value-calculator";
import { TYPOGRAPHY } from "@/constants/typography";
import { BRAND_COLORS } from "@/constants/colors";
import { MOBILE } from "@/constants/mobile";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import type { Project, Reward } from "@shared/schema";
import { supabase } from "@/lib/supabase";
import { getProjectImageUrl } from "@/lib/image-utils";

export function HeroSection() {
  const projectsRef = useRef<HTMLDivElement>(null);
  const rewardsRef = useRef<HTMLDivElement>(null);

  // Fallback data for when database is not available
  const fallbackProjects = [
    { id: 1, title: "Sanitrust Pads", imageUrl: "", category: "Health", featured: true },
    { id: 2, title: "PanjurliLabs", imageUrl: "", category: "Environment", featured: true },
    { id: 3, title: "Allika", imageUrl: "", category: "Women Empowerment", featured: true },
    { id: 4, title: "Ignis Careers", imageUrl: "", category: "Education", featured: true },
    { id: 5, title: "Khadyam", imageUrl: "", category: "Agriculture", featured: true },
  ];

  const fallbackRewards = [
    { id: 1, title: "Herbal Face Wash", imageUrl: "", category: "Beauty", pointsCost: 150, featured: true },
    { id: 2, title: "Eco Bag", imageUrl: "", category: "Lifestyle", pointsCost: 100, featured: true },
    { id: 3, title: "Gift Card", imageUrl: "", category: "Shopping", pointsCost: 500, featured: true },
  ];

  // Fetch specific featured projects for the image grid (limit to featured only)
  const { data: projects = fallbackProjects, isError: projectsError } = useQuery<Project[]>({
    queryKey: ["projects-hero"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('featured', true)
        .eq('status', 'active')
        .order('createdAt', { ascending: false })
        .limit(6); // Reduced from 8 to keep focused
      
      if (error) throw error;
      return data || fallbackProjects;
    },
    retry: false,
    staleTime: Infinity,
  });

  // Fetch specific featured rewards for the rewards section
  const { data: rewards = fallbackRewards, isError: rewardsError } = useQuery<Reward[]>({
    queryKey: ["rewards-hero"],
    queryFn: async () => {
      // Try points_cost first (snake_case - database column name)
      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .eq('featured', true)
        .order('points_cost', { ascending: false }) // Show highest pointsCost first
        .limit(6); // Reduced from 8 to keep focused
      
      if (error) {
        console.error('[HeroSection] Error fetching rewards:', error);
        // Fallback: try pointsCost or sort manually
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('rewards')
          .select('*')
          .eq('featured', true)
          .limit(6);
        
        if (fallbackError) throw fallbackError;
        
        // Sort manually by points_cost or pointsCost
        const sorted = (fallbackData || []).sort((a: any, b: any) => {
          const aCost = a.points_cost || a.pointsCost || 0;
          const bCost = b.points_cost || b.pointsCost || 0;
          return bCost - aCost; // Descending order
        });
        
        return sorted.length > 0 ? sorted : fallbackRewards;
      }
      
      return data || fallbackRewards;
    },
    retry: false,
    staleTime: Infinity,
  });

  // Auto-scroll effects disabled - static display only

  return (
    <section className="relative overflow-hidden min-h-[80vh] md:min-h-[90vh] flex items-center" style={{ backgroundColor: BRAND_COLORS.bgBeige }}>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-12 items-center">
          {/* Left Column - Hero Content */}
          <div className="space-y-6 md:space-y-8 text-center lg:text-left">
            <div>
              <LayoutGroup>
                <motion.h1 
                  className={TYPOGRAPHY.hero}
                  style={{ fontFamily: "'Satoshi', 'Inter', system-ui, sans-serif" }}
                  layout
                >
                  <motion.div
                    className="mb-2"
                    layout
                    transition={{ type: "spring", damping: 30, stiffness: 400 }}
                    style={{ color: BRAND_COLORS.textPrimary }}
                  >
                    Supporting real impact
                  </motion.div>
                  <motion.div 
                    className="flex flex-wrap items-center gap-2"
                    layout
                    transition={{ type: "spring", damping: 30, stiffness: 400 }}
                  >
                    <motion.span
                      style={{ color: BRAND_COLORS.textPrimary }}
                      layout
                    >
                      made{" "}
                    </motion.span>
                    <div style={{ color: BRAND_COLORS.primaryOrange }}>
                      <TextRotate
                        texts={[
                          "rewarding",
                          "transparent", 
                          "efficient",
                          "meaningful"
                        ]}
                        mainClassName="px-3 py-1 rounded-lg overflow-hidden justify-center inline-flex bg-white"
                        staggerFrom="last"
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "-120%" }}
                        staggerDuration={0.025}
                        splitLevelClassName="overflow-hidden pb-1"
                        transition={{ type: "spring", damping: 30, stiffness: 400 }}
                        rotationInterval={2500}
                      />
                    </div>
                  </motion.div>
                </motion.h1>
              </LayoutGroup>
              
              <p className="text-xl lg:text-2xl mt-2 max-w-lg" style={{ color: BRAND_COLORS.textPrimary }}>
                Every dollar you invest supports entrepreneurs creating lasting change — education, water, and livelihoods — and rewards you back.
              </p>
            </div>

            {/* CTA Buttons - Moved up below subheadline */}
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

          {/* Right Column - Unified Impact Box */}
          <div className="bg-white rounded-2xl p-8" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            {/* Top: Projects Slider - smaller cards with white labels */}
            <div className="mb-8">
              <div 
                ref={projectsRef}
                className="flex space-x-3 overflow-x-auto scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {/* Static projects display */}
                {projects.map((project, index) => (
                  <div
                    key={`${project.id}-${index}`}
                    className="flex-shrink-0 w-32 h-32 rounded-xl overflow-hidden relative group cursor-pointer transition-all duration-300"
                    style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
                  >
                    {getProjectImageUrl(project) ? (
                      <>
                        <>
                          <img
                            src={getProjectImageUrl(project) || ''}
                            alt={project.title}
                            className="w-full h-full object-cover group-hover:brightness-100 transition-all duration-300"
                          />
                          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/0 transition-all duration-300"></div>
                        </>
                        <div className="absolute bottom-2 left-2 bg-white/70 backdrop-blur-sm text-gray-800 text-xs font-medium px-2 py-1 rounded-md shadow-sm">
                          {project.category || 'Education'}
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-100 to-green-100 flex flex-col items-center justify-center p-2 opacity-40 group-hover:opacity-100 transition-all duration-300">
                        <div className="absolute bottom-2 left-2 bg-white text-gray-800 text-xs font-medium px-2 py-1 rounded-md shadow-sm">
                          {project.category || 'Impact'}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Middle: Interactive Value Calculator */}
            <div className="mb-8">
              <InteractiveValueCalculator />
            </div>

            {/* Bottom: Rewards Slider - smaller cards with white labels, scrolling opposite direction */}
            <div>
              <div 
                ref={rewardsRef}
                className="flex space-x-3 overflow-x-auto scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {/* Static rewards display */}
                {rewards.map((reward, index) => (
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
                        <div className="absolute bottom-2 left-2 bg-white/70 backdrop-blur-sm text-gray-800 text-xs font-medium px-2 py-1 rounded-md shadow-sm">
                          {reward.category || 'Reward'}
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center opacity-40 group-hover:opacity-100 transition-all duration-300">
                        <div className="absolute bottom-2 left-2 bg-white text-gray-800 text-xs font-medium px-2 py-1 rounded-md shadow-sm">
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

      {/* Subtle background elements */}
      <div className="absolute top-20 right-20 w-32 h-32 rounded-full" style={{ backgroundColor: 'var(--bg-gray)' }}></div>
      <div className="absolute bottom-20 left-20 w-24 h-24 rounded-full" style={{ backgroundColor: 'var(--bg-cool)' }}></div>
    </section>
  );
}