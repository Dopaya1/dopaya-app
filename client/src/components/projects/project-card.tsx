import { Link } from "wouter";
import { Project } from "@shared/schema";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCategoryColors } from "@/lib/category-colors";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { trackProjectClick } from "@/lib/simple-analytics";
import { getProjectImageUrl } from "@/lib/image-utils";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const categoryColors = getCategoryColors(project.category || '');
  const projectImageUrl = getProjectImageUrl(project);

  const handleProjectClick = () => {
    trackProjectClick(project.slug, project.title);
  };
  
  return (
    <Card className="impact-card overflow-hidden flex flex-col h-full">
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
        {project.missionStatement && (
          <p className="text-sm text-neutral mb-2 line-clamp-3 leading-relaxed whitespace-pre-line">
            {project.missionStatement}
          </p>
        )}
        
        <p className="text-sm text-neutral mb-4 line-clamp-3 whitespace-pre-line">{project.description}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0 mt-auto">
        <Link href={`/project/${project.slug}`}>
          <Button 
            className="w-full text-white" 
            style={{ backgroundColor: '#f2662d' }}
            onClick={handleProjectClick}
          >
            View Project
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
