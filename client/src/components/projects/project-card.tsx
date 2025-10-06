import { Link } from "wouter";
import { Project } from "@shared/schema";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCategoryColors } from "@/lib/category-colors";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const categoryColors = getCategoryColors(project.category || '');
  
  return (
    <Card className="impact-card overflow-hidden flex flex-col h-full">
      <div className="w-full h-48 overflow-hidden">
        <img 
          src={project.imageUrl}
          alt={project.title}
          className="w-full h-full object-cover"
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
          <p className="text-sm text-neutral mb-2 line-clamp-3 leading-relaxed">
            {project.missionStatement}
          </p>
        )}
        
        <p className="text-sm text-neutral mb-4 line-clamp-3">{project.description}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0 mt-auto">
        <Link href={`/projects/${project.slug}`}>
          <Button className="w-full bg-[#e94e35] hover:bg-[#cc4530] text-white">
            View Project
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
