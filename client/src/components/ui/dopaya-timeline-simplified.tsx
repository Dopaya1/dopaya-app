import React from "react";
import { Timeline } from "@/components/ui/timeline";
import { CheckCircle, Clock, Target, Users, Heart, TrendingUp, ArrowRight, Wind } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getProjectImageUrl } from "@/lib/image-utils";
import type { Project } from "@shared/schema";
import { useTranslation } from "@/lib/i18n/use-translation";

export function DopayaTimelineSimplified() {
  const { t } = useTranslation();
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
      title: t("socialEnterprises.timelineNowTitle"),
      content: (
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">{t("socialEnterprises.timelineNowHeading")}</h3>
          <p className="text-gray-600 text-sm mb-4">
            {t("socialEnterprises.timelineNowDescription")}
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
                {t("socialEnterprises.timelineLoadingProjects")}
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
              {t("socialEnterprises.timelineNowJoinCommunity")} <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      )
    },
    {
      title: t("socialEnterprises.timelineSoonTitle"),
      content: (
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">{t("socialEnterprises.timelineSoonHeading")}</h3>
          <p className="text-gray-600 text-sm mb-4">
            {t("socialEnterprises.timelineSoonDescription")}
          </p>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-orange-600" />
                </div>
                <h4 className="text-sm font-bold text-gray-900">{t("socialEnterprises.timelineSoonVcFunding")}</h4>
              </div>
              <p className="text-xs text-gray-600">{t("socialEnterprises.timelineSoonVcDescription")}</p>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-orange-600" />
                </div>
                <h4 className="text-sm font-bold text-gray-900">{t("socialEnterprises.timelineSoonGrantApplications")}</h4>
              </div>
              <p className="text-xs text-gray-600">{t("socialEnterprises.timelineSoonGrantDescription")}</p>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4 text-orange-600" />
                </div>
                <h4 className="text-sm font-bold text-gray-900">{t("socialEnterprises.timelineSoonCorporatePartnership")}</h4>
              </div>
              <p className="text-xs text-gray-600">{t("socialEnterprises.timelineSoonCorporateDescription")}</p>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Target className="w-4 h-4 text-orange-600" />
                </div>
                <h4 className="text-sm font-bold text-gray-900">{t("socialEnterprises.timelineSoonGovernmentGrants")}</h4>
              </div>
              <p className="text-xs text-gray-600">{t("socialEnterprises.timelineSoonGovernmentDescription")}</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: t("socialEnterprises.timelineFutureTitle"),
      content: (
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">{t("socialEnterprises.timelineFutureHeading")}</h3>
          <p className="text-gray-600 text-sm">
            {t("socialEnterprises.timelineFutureDescription")}
          </p>
        </div>
      )
    }
  ];

  return (
    <Timeline 
      data={data} 
      title={t("socialEnterprises.timelineSectionTitle")}
      subtitle={t("socialEnterprises.timelineSectionSubtitle")}
    />
  );
}