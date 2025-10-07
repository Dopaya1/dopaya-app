import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { TrendingUp, Users, Gift, Target } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import type { Project, Reward } from "@shared/schema";
import { supabase } from "@/lib/supabase";


export function HeroSection() {
  const projectsRef = useRef<HTMLDivElement>(null);
  const rewardsRef = useRef<HTMLDivElement>(null);

  // Fetch specific featured projects for the image grid
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["projects-hero"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('featured', true)
        .eq('active', true)
        .order('createdAt', { ascending: false })
        .limit(8);
      
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
        .limit(8);
      
      if (error) throw error;
      return data || [];
    },
  });

  // Auto-scroll effect for projects (scrolls left)
  useEffect(() => {
    const projectsContainer = projectsRef.current;
    if (!projectsContainer) return;

    const scroll = () => {
      if (projectsContainer.scrollLeft >= projectsContainer.scrollWidth - projectsContainer.clientWidth) {
        projectsContainer.scrollLeft = 0;
      } else {
        projectsContainer.scrollLeft += 1;
      }
    };

    const interval = setInterval(scroll, 50);
    return () => clearInterval(interval);
  }, [projects]);

  // Auto-scroll effect for rewards (scrolls right)
  useEffect(() => {
    const rewardsContainer = rewardsRef.current;
    if (!rewardsContainer) return;

    const scroll = () => {
      if (rewardsContainer.scrollLeft <= 0) {
        rewardsContainer.scrollLeft = rewardsContainer.scrollWidth - rewardsContainer.clientWidth;
      } else {
        rewardsContainer.scrollLeft -= 1;
      }
    };

    const interval = setInterval(scroll, 50);
    return () => clearInterval(interval);
  }, [rewards]);

  return (
    <>
      {/* Enhanced Hero Section */}
      <section className="py-20 bg-[#F9F7F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Text Content */}
            <div className="order-1 lg:order-1 flex flex-col justify-center">
              <h1 className="text-4xl sm:text-5xl font-bold text-dark font-heading tracking-tight md:leading-tight">
                Track your impact. See where every dollar goes. 
                <span className="text-primary"> Earn rewards you love.</span>
              </h1>
              
              <p className="mt-3 text-lg text-neutral max-w-3xl">
                Support impactful projects, track your donations' impact in real-time, and earn Impact Points for making a difference.
              </p>
              
              <div className="mt-8 flex flex-col sm:flex-row">
                <Link href="/projects" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full mb-3 sm:mb-0 sm:mr-3 sm:w-auto">
                    Explore Social Projects
                  </Button>
                </Link>

                <a href="https://tally.so/r/m6MqAe" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Get on the Waitlist
                  </Button>
                </a>
              </div>
              

            </div>
            
            {/* Right Side - Visual Interactive */}
            <div className="order-2 lg:order-2">
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                
                {/* Projects Section */}
                <div className="mb-8">
                  <div 
                    ref={projectsRef}
                    className="flex gap-3 overflow-x-hidden"
                  >
                    {(projects as Project[]).map((project: Project, index: number) => (
                      <div key={project.id} className="group hover:scale-105 transition-transform duration-200 relative flex-shrink-0 w-1/2 lg:w-1/4">
                        <img 
                          src={project.imageUrl || 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'} 
                          alt={project.title} 
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <div className="absolute bottom-2 left-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            project.category === 'Education' ? 'bg-blue-100 text-blue-800' :
                            project.category === 'Environment' ? 'bg-green-100 text-green-800' :
                            project.category === 'Health' ? 'bg-red-100 text-red-800' :
                            project.category === 'Poverty' ? 'bg-purple-100 text-purple-800' :
                            project.category === 'Rural Development' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {project.category}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mini Dashboard Preview */}
                <div className="mb-8 p-4 bg-gray-50 rounded-xl">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Impact Score</p>
                      <p className="text-2xl font-bold text-gray-900">2,450</p>
                      <p className="text-xs text-green-600 flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +325 this month
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Rank</p>
                      <p className="text-lg font-bold text-primary">Changemaker</p>
                    </div>
                  </div>
                </div>

                {/* Rewards Preview */}
                <div>
                  <div 
                    ref={rewardsRef}
                    className="flex gap-3 overflow-x-hidden"
                  >
                    {(rewards as Reward[]).filter(reward => reward.id !== 1).map((reward: Reward, index: number) => (
                      <div key={reward.id} className="group hover:scale-105 transition-transform duration-200 relative flex-shrink-0 w-1/2 lg:w-1/4">
                        <img 
                          src={reward.imageUrl || 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'} 
                          alt={reward.title} 
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <div className="absolute bottom-2 left-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            reward.category === 'Food' ? 'bg-orange-100 text-orange-800' :
                            reward.category === 'Handicrafts' ? 'bg-purple-100 text-purple-800' :
                            reward.category === 'Fashion' ? 'bg-pink-100 text-pink-800' :
                            reward.category === 'Tech' ? 'bg-blue-100 text-blue-800' :
                            reward.category === 'Home' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {reward.category}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
