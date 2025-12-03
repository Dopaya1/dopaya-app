import { ProjectCard } from "./project-card";
import { Project } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LanguageLink } from "@/components/ui/language-link";
import { useTranslation } from "@/lib/i18n/use-translation";

interface ProjectGridProps {
  projects: Project[] | undefined;
  isLoading: boolean;
  error?: Error | null;
  showTourTarget?: boolean;
}

export function ProjectGrid({ projects, isLoading, error, showTourTarget }: ProjectGridProps) {
  const { t } = useTranslation();
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array(8).fill(0).map((_, i) => (
          <Card key={i} className="impact-card overflow-hidden">
            <Skeleton className="w-full h-48" />
            <div className="p-4">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-6 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-4" />
              <Skeleton className="h-10 w-full" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">Error loading projects: {error.message}</p>
      </div>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="text-center py-10 bg-white rounded-lg shadow-sm p-8 max-w-3xl mx-auto">
        <div className="mb-6">
          <p className="text-lg font-medium text-gray-700 mb-4">
            {t("projects.noProjectsFound")} {t("projects.noProjectsFoundDescription")}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a 
            href="https://tally.so/r/3EM0vA" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block"
          >
            <Button className="text-white min-w-[200px]" style={{ backgroundColor: '#f2662d' }}>
              {t("projects.applyWithMyProject")}
            </Button>
          </a>
          
          <LanguageLink href="/contact">
            <Button variant="outline" className="bg-white border-[#f2662d] text-[#f2662d] hover:bg-[#fff8f7] min-w-[200px]">
              {t("projects.nominateProject")}
            </Button>
          </LanguageLink>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project, index) => (
        <div key={project.id} data-tour={index === 0 && showTourTarget ? "first-project" : undefined}>
          <ProjectCard project={project} />
        </div>
      ))}
    </div>
  );
}
