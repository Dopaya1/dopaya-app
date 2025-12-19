import { LanguageLink } from "@/components/ui/language-link";
import { Project } from "@shared/schema";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCategoryColors } from "@/lib/category-colors";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { trackProjectClick } from "@/lib/simple-analytics";
import { getProjectImageUrl } from "@/lib/image-utils";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useI18n } from "@/lib/i18n/i18n-context";
import { getProjectMissionStatement, getProjectDescription } from "@/lib/i18n/project-content";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const { t } = useTranslation();
  const { language } = useI18n();
  const categoryColors = getCategoryColors(project.category || '');
  const projectImageUrl = getProjectImageUrl(project);
  
  // Get language-specific content
  const projectMissionStatement = getProjectMissionStatement(project, language);
  const projectDescription = getProjectDescription(project, language);

  const handleProjectClick = () => {
    trackProjectClick(project.slug, project.title);
  };
  
  // For Universal Fund: navigate directly to support page
  // Check both camelCase (schema) and snake_case (database) variants
  const isUniversalFund = project.isUniversalFund === true || (project as any).is_universal_fund === true;
  const projectLink = isUniversalFund 
    ? `/support/${project.slug}`
    : `/project/${project.slug}`;
  
  // Gold border only for Universal Fund projects
  const cardClassName = isUniversalFund 
    ? "impact-card overflow-hidden flex flex-col h-full border-amber-300"
    : "impact-card overflow-hidden flex flex-col h-full";
  
  return (
    <Card className={cardClassName}>
      <div className="w-full h-48 overflow-hidden">
        <OptimizedImage
          src={projectImageUrl || '/placeholder-project.png'}
          alt={project.title}
          width={400}
          height={192}
          quality={85}
          className="w-full h-full object-cover"
          fallbackSrc="/placeholder-project.png"
          onError={() => console.warn(`Failed to load image for project: ${project.title}`)}
        />
      </div>
      <CardContent className="p-4 flex-grow">
        <Badge 
          className={`mb-2 ${categoryColors.badge} hover:${categoryColors.badge} font-medium rounded-full px-2 py-0.5 text-xs`}
          variant="outline"
        >
          {project.category}
        </Badge>
        <h3 className="text-lg font-bold text-dark font-heading mb-2">{project.title}</h3>
        
        {/* Mission Statement */}
        {projectMissionStatement && (
          <p className="text-sm text-neutral mb-2 line-clamp-3 leading-relaxed whitespace-pre-line">
            {projectMissionStatement}
          </p>
        )}
        
        {projectDescription && (
          <p className="text-sm text-neutral mb-4 line-clamp-3 whitespace-pre-line">{projectDescription}</p>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0 mt-auto">
        <LanguageLink href={projectLink}>
          <Button 
            className="w-full text-white" 
            style={{ backgroundColor: '#f2662d' }}
            onClick={handleProjectClick}
          >
            {t("projects.viewProject")}
          </Button>
        </LanguageLink>
      </CardFooter>
    </Card>
  );
}
