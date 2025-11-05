import React from "react";
import { Timeline } from "@/components/ui/timeline";
import { CheckCircle, Clock, Target, Users, Heart, TrendingUp, ArrowRight, Wind } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getProjectImageUrl } from "@/lib/image-utils";
import type { Project } from "@shared/schema";

export function DopayaTimelineSimplified() {
  const [featuredProjects, setFeaturedProjects] = React.useState<Project[]>([]);

  React.useEffect(() => {
    const fetchFeaturedProjects = async () => {
      try {
        const { data: projects, error } = await supabase
          .from('projects')
          .select('*')
          .eq('status', 'active')
          .eq('featured', true)
          .order('createdAt', { ascending: false })
          .limit(4);

        if (error) {
          console.error('Error fetching featured projects:', error);
          return;
        }

        setFeaturedProjects(projects || []);
      } catch (error) {
        console.error('Error fetching featured projects:', error);
      }
    };

    fetchFeaturedProjects();
  }, []);

  const getIconForProject = (category?: string) => {
    if (!category) return <Users className="w-6 h-6 text-orange-600" />;
    
    const categoryLower = category.toLowerCase();
    if (categoryLower.includes('education') || categoryLower.includes('skills')) {
      return <Users className="w-6 h-6 text-orange-600" />;
    } else if (categoryLower.includes('health')) {
      return <Heart className="w-6 h-6 text-orange-600" />;
    } else if (categoryLower.includes('environment') || categoryLower.includes('climate')) {
      return <Wind className="w-6 h-6 text-orange-600" />;
    } else {
      return <Target className="w-6 h-6 text-orange-600" />;
    }
  };

  const data = [
    {
      title: "Now",
      content: (
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Impact Rewards Platform</h3>
          <p className="text-gray-600 text-sm mb-4">
            Showcase your social enterprise to get additional visibility and funding from supporters who get rewarded for their belief in you
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {featuredProjects.length > 0 ? featuredProjects.map((project) => {
              const projectImage = getProjectImageUrl(project);
              
              return (
                <div key={project.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="aspect-video w-full overflow-hidden">
                    {projectImage ? (
                      <img 
                        src={projectImage} 
                        alt={project.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className="w-full h-full bg-gray-100 flex items-center justify-center"
                      style={{ display: projectImage ? 'none' : 'flex' }}
                    >
                      {getIconForProject(project.category)}
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="mb-2">
                      <span className="inline-block bg-green-100 text-green-800 text-[10px] font-medium px-2 py-0.5 rounded-full">
                        {project.category || 'Social Impact'}
                      </span>
                    </div>
                    
                    <h4 className="text-sm font-bold text-gray-900 mb-2">{project.title}</h4>
                    
                    <p className="text-xs text-gray-600 mb-3 line-clamp-2 whitespace-pre-line">
                      {project.summary || project.description || project.missionStatement || 'Making a positive impact in their community.'}
                    </p>
                  </div>
                </div>
              );
            }) : (
              // Fallback when no featured projects are loaded
              <div className="col-span-full text-center text-gray-500 text-sm py-8">
                Loading featured projects...
              </div>
            )}
          </div>
          
          <div className="text-center">
            <a 
              href="https://tally.so/r/3EM0vA" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 text-sm font-medium"
            >
              Join our community <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      )
    },
    {
      title: "Soon",
      content: (
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Unlocking additional funding streams</h3>
          <p className="text-gray-600 text-sm mb-4">
            Expanding beyond individual supporters to connect you with institutional funding sources.
          </p>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-orange-600" />
                </div>
                <h4 className="text-sm font-bold text-gray-900">Impact VC Funding Connect</h4>
              </div>
              <p className="text-xs text-gray-600">Connect with impact investors who understand your business model</p>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-orange-600" />
                </div>
                <h4 className="text-sm font-bold text-gray-900">AI-Based Grant Applications</h4>
              </div>
              <p className="text-xs text-gray-600">Automated grant matching and application assistance</p>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4 text-orange-600" />
                </div>
                <h4 className="text-sm font-bold text-gray-900">Corporate Partnership Network</h4>
              </div>
              <p className="text-xs text-gray-600">Strategic partnerships with mission-aligned corporations</p>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Target className="w-4 h-4 text-orange-600" />
                </div>
                <h4 className="text-sm font-bold text-gray-900">Government Grant Database</h4>
              </div>
              <p className="text-xs text-gray-600">Access to government funding opportunities and support</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Future",
      content: (
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Making Impact Funding More Efficient and Transparent to create lasting change.</h3>
          <p className="text-gray-600 text-sm">
            We believe in sustainable solutions, not dependency-creating aid. Our vision is to create a comprehensive ecosystem where social enterprises can access the right funding at the right time, with complete transparency and efficiency.
          </p>
        </div>
      )
    }
  ];

  return <Timeline data={data} />;
}