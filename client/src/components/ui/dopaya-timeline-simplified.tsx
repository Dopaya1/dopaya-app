import React from "react";
import { Timeline } from "@/components/ui/timeline";
import { CheckCircle, Clock, Target, Users, Heart, TrendingUp, ArrowRight, Wind } from "lucide-react";
import { supabase } from "@/lib/supabase";

export function DopayaTimelineSimplified() {
  const [featuredProjects, setFeaturedProjects] = React.useState<any[]>([]);

  React.useEffect(() => {
    const fetchFeaturedProjects = async () => {
      try {
        const { data: projects, error } = await supabase
          .from('projects')
          .select('id, title, description, imageUrl, category')
          .in('slug', ['ignis-careers', 'allika-eco-products', 'panjurli-labs', 'sanitrust-pads'])
          .order('title');

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

  const getImageForProject = (projectName: string) => {
    switch (projectName) {
      case 'Ignis Careers':
        return '/src/assets/Abdul Mujeeb_1749476510704.png';
      case 'Allika':
        return '/src/assets/allika.png';
      case 'Panjurli Labs':
        return '/src/assets/Shalini Singh_1749476510708.png';
      case 'Sanitrust Pads':
        return '/src/assets/Abdul Mujeeb_1749476510704.png';
      default:
        return '/src/assets/Abdul Mujeeb_1749476510704.png';
    }
  };

  const getIconForProject = (projectName: string) => {
    switch (projectName) {
      case 'Ignis Careers':
        return <Users className="w-6 h-6 text-orange-600" />;
      case 'Allika':
        return <Heart className="w-6 h-6 text-orange-600" />;
      case 'Panjurli Labs':
        return <Wind className="w-6 h-6 text-orange-600" />;
      case 'Sanitrust Pads':
        return <Target className="w-6 h-6 text-orange-600" />;
      default:
        return <Users className="w-6 h-6 text-orange-600" />;
    }
  };

  const getSectorForProject = (project: any) => {
    if (project.category) {
      return project.category;
    }
    
    switch (project.title) {
      case 'Ignis Careers':
        return 'Education & Skills';
      case 'Allika':
        return 'Healthcare';
      case 'Panjurli Labs':
        return 'Environment';
      case 'Sanitrust Pads':
        return 'Health & Hygiene';
      default:
        return 'Social Impact';
    }
  };

  const data = [
    {
      title: "Now",
      content: (
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Impact Rewards Platform</h3>
          <p className="text-gray-600 text-sm mb-4">
            Your supporters get tangible rewards for supporting you. Build a sustainable community, not dependency.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {(featuredProjects.length > 0 ? featuredProjects : [
              { id: 1, title: 'Ignis Careers', description: 'Empowering youth through education and skills development', category: 'Education & Skills' },
              { id: 2, title: 'Allika', description: 'Improving healthcare access and outcomes for communities', category: 'Healthcare' },
              { id: 3, title: 'Panjurli Labs', description: 'Tackling air pollution with innovative filtration technology', category: 'Environment' },
              { id: 4, title: 'Sanitrust Pads', description: 'Promoting health and hygiene through sustainable products', category: 'Health & Hygiene' }
            ]).map((project) => (
              <div key={project.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="aspect-video w-full overflow-hidden">
                  {(project.imageUrl || getImageForProject(project.title)) ? (
                    <img 
                      src={project.imageUrl || getImageForProject(project.title)} 
                      alt={project.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className="w-full h-full bg-gray-100 flex items-center justify-center"
                    style={{ display: (project.imageUrl || getImageForProject(project.title)) ? 'none' : 'flex' }}
                  >
                    {getIconForProject(project.title)}
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="mb-2">
                    <span className="inline-block bg-green-100 text-green-800 text-[10px] font-medium px-2 py-0.5 rounded-full">
                      {getSectorForProject(project)}
                    </span>
                  </div>
                  
                  <h4 className="text-sm font-bold text-gray-900 mb-2">{project.title}</h4>
                  
                  <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                    {project.description || 'Making a positive impact in their community.'}
                  </p>
                </div>
              </div>
            ))}
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