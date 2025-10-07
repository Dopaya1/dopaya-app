import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { TrendingUp, Users, Gift, Target, ArrowRight, Play } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import type { Project, Reward } from "@shared/schema";
import { supabase } from "@/lib/supabase";

export function HeroSection() {
  const projectsRef = useRef<HTMLDivElement>(null);
  const rewardsRef = useRef<HTMLDivElement>(null);

  // Fetch specific featured projects for the image grid (limit to featured only)
  const { data: projects = [] } = useQuery<Project[]>({
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
      return data || [];
    },
  });

  // Fetch specific featured rewards for the rewards section
  const { data: rewards = [] } = useQuery<Reward[]>({
    queryKey: ["rewards-hero"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .eq('featured', true)
        .order('pointsCost', { ascending: true })
        .limit(6); // Reduced from 8 to keep focused
      
      if (error) throw error;
      return data || [];
    },
  });

  // Auto-scroll effect for projects (scrolls left)
  useEffect(() => {
    const projectsContainer = projectsRef.current;
    if (!projectsContainer) return;

    const scrollDistance = 2;
    const scrollInterval = 50;
    let scrollPosition = 0;

    const interval = setInterval(() => {
      if (projectsContainer.scrollLeft >= projectsContainer.scrollWidth - projectsContainer.clientWidth) {
        scrollPosition = 0;
        projectsContainer.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        scrollPosition += scrollDistance;
        projectsContainer.scrollTo({ left: scrollPosition, behavior: 'auto' });
      }
    }, scrollInterval);

    return () => clearInterval(interval);
  }, [projects]);

  // Auto-scroll effect for rewards (scrolls right)
  useEffect(() => {
    const rewardsContainer = rewardsRef.current;
    if (!rewardsContainer) return;

    const scrollDistance = -2;
    const scrollInterval = 50;
    let scrollPosition = 0;

    const interval = setInterval(() => {
      if (rewardsContainer.scrollLeft <= 0) {
        scrollPosition = rewardsContainer.scrollWidth - rewardsContainer.clientWidth;
        rewardsContainer.scrollTo({ left: scrollPosition, behavior: 'smooth' });
      } else {
        scrollPosition += scrollDistance;
        rewardsContainer.scrollTo({ left: scrollPosition, behavior: 'auto' });
      }
    }, scrollInterval);

    return () => clearInterval(interval);
  }, [rewards]);

  return (
    <section className="relative overflow-hidden min-h-[90vh] flex items-center" style={{ backgroundColor: 'var(--bg-white)' }}>
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
          {/* Left Column - Hero Content */}
          <div className="space-y-8 text-center lg:text-left">
            <div>
              <h1 className="text-4xl md:text-5xl font-heading font-medium leading-tight">
                <span style={{ color: 'var(--text-primary)' }}>Support Social Change.</span>
                <br />
                <span style={{ color: 'var(--primary-orange)' }}>Get More Back.</span>
              </h1>
              <p className="text-lg mt-6 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Support social enterprises creating lasting change + unlock exclusive rewards and community access
              </p>
            </div>

            {/* Key Benefits */}
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto lg:mx-0">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" style={{ color: 'var(--text-secondary)' }} />
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Sustainable Impact</span>
              </div>
              <div className="flex items-center space-x-2">
                <Gift className="h-5 w-5" style={{ color: 'var(--text-secondary)' }} />
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Exclusive Rewards</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5" style={{ color: 'var(--text-secondary)' }} />
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Community Access</span>
              </div>
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5" style={{ color: 'var(--text-secondary)' }} />
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Verified Outcomes</span>
              </div>
            </div>

            {/* CTA Buttons - Only ONE primary button per brand guide */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button 
                size="lg" 
                className="text-white px-8 py-4 text-lg font-medium"
                style={{ backgroundColor: 'var(--primary-orange)' }}
                asChild
              >
                <Link href="#explore">
                  See How It Works
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              </Button>
              
              <Button 
                size="lg" 
                variant="outline" 
                className="px-8 py-4 text-lg font-medium border-gray-300 hover:bg-gray-50"
                style={{ color: 'var(--text-primary)' }}
              >
                <Play className="h-5 w-5 mr-2" style={{ color: 'var(--text-secondary)' }} />
                Watch Demo
              </Button>
            </div>

            {/* Trust Indicator */}
            <div className="pt-6" style={{ borderTop: '1px solid var(--border-subtle)' }}>
              <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>Trusted by leading institutions</p>
              <div className="flex items-center justify-center lg:justify-start space-x-6 opacity-60">
                <div className="w-16 h-8 rounded flex items-center justify-center" style={{ backgroundColor: 'var(--bg-gray)' }}>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Logo</span>
                </div>
                <div className="w-16 h-8 rounded flex items-center justify-center" style={{ backgroundColor: 'var(--bg-gray)' }}>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Logo</span>
                </div>
                <div className="w-16 h-8 rounded flex items-center justify-center" style={{ backgroundColor: 'var(--bg-gray)' }}>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Logo</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Visual Impact Display */}
          <div className="space-y-8">
            {/* Projects Slider */}
            <div className="bg-white rounded-2xl p-6" style={{ boxShadow: 'var(--shadow-card, 0 1px 3px rgba(0,0,0,0.1))' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading font-medium flex items-center" style={{ color: 'var(--text-primary)' }}>
                  <TrendingUp className="h-5 w-5 mr-2" style={{ color: 'var(--text-secondary)' }} />
                  Creating Impact
                </h3>
                <Link href="/projects" className="text-sm hover:underline" style={{ color: 'var(--primary-orange)' }}>
                  View All
                </Link>
              </div>
              
              <div 
                ref={projectsRef}
                className="flex space-x-4 overflow-x-hidden scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-gray-200"
                  >
                    {project.imageUrl ? (
                      <img
                        src={project.imageUrl}
                        alt={project.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#e94e35]/20 to-[#1a1a3a]/20 flex items-center justify-center">
                        <span className="text-xs text-gray-500 text-center px-1">
                          {project.title?.slice(0, 15)}...
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <p className="text-sm mt-3" style={{ color: 'var(--text-secondary)' }}>
                Featured social enterprises with verified impact
              </p>
            </div>

            {/* Rewards Slider */}
            <div className="bg-white rounded-2xl p-6" style={{ boxShadow: 'var(--shadow-card, 0 1px 3px rgba(0,0,0,0.1))' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading font-medium flex items-center" style={{ color: 'var(--text-primary)' }}>
                  <Gift className="h-5 w-5 mr-2" style={{ color: 'var(--text-secondary)' }} />
                  Unlock Rewards
                </h3>
                <Link href="/rewards" className="text-sm hover:underline" style={{ color: 'var(--primary-orange)' }}>
                  View All
                </Link>
              </div>
              
              <div 
                ref={rewardsRef}
                className="flex space-x-4 overflow-x-hidden scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {rewards.map((reward) => (
                  <div
                    key={reward.id}
                    className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-gray-200"
                  >
                    {reward.imageUrl ? (
                      <img
                        src={reward.imageUrl}
                        alt={reward.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#e94e35]/20 to-[#1a1a3a]/20 flex items-center justify-center">
                        <span className="text-xs text-gray-500 text-center px-1">
                          {reward.title?.slice(0, 15)}...
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <p className="text-sm mt-3" style={{ color: 'var(--text-secondary)' }}>
                Exclusive rewards from verified partners
              </p>
            </div>

            {/* Impact Preview */}
            <div className="rounded-2xl p-6" style={{ backgroundColor: 'var(--bg-cool)' }}>
              <h3 className="font-heading font-medium mb-4 flex items-center" style={{ color: 'var(--text-primary)' }}>
                <Target className="h-5 w-5 mr-2" style={{ color: 'var(--text-secondary)' }} />
                Your Impact Journey
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Support</span>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Create lasting change</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Impact</span>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Verified outcomes</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Rewards</span>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Exclusive access</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Community</span>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Connect with changemakers</span>
                </div>
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