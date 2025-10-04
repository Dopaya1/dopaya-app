import { Link } from "wouter";
import { Project } from "@shared/schema";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCategoryColors } from "@/lib/category-colors";
import { TrustBadge } from "@/components/ui/trust-badge";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const categoryColors = getCategoryColors(project.category || '');
  
  return (
    <Card className="impact-card overflow-hidden flex flex-col h-full">
      <div className="w-full h-48 overflow-hidden relative">
        <img 
          src={project.imageUrl}
          alt={project.title}
          className="w-full h-full object-cover"
        />
        {/* Trust badge overlay */}
        <div className="absolute top-2 right-2">
          <TrustBadge type="verified" size="sm" />
        </div>
      </div>
      <CardContent className="p-4 flex-grow">
        <div className="flex items-center gap-2 mb-2">
          <Badge 
            className={`${categoryColors.badge} hover:${categoryColors.badge} font-medium rounded-full px-2 py-0.5 text-xs`}
            variant="outline"
          >
            {project.category}
          </Badge>
          {project.featured && (
            <TrustBadge type="featured" size="sm" />
          )}
        </div>
        <h3 className="text-lg font-bold text-dark font-heading mb-2">{project.title}</h3>
        
        {/* Mission Statement */}
        {project.missionStatement && (
          <p className="text-sm text-neutral mb-2 line-clamp-3 leading-relaxed">
            {project.missionStatement}
          </p>
        )}
        
        <p className="text-sm text-neutral mb-4 line-clamp-3">{project.description}</p>
        
        {/* Impact Points Display */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
          <div className="text-xs text-amber-700 font-medium mb-1">Impact Points Ratio</div>
          <div className="text-sm text-amber-800">
            <span className="font-bold">$1 = 10 Points</span> • <span className="font-bold">${project.impactPointsMultiplier || 10}x</span> Multiplier
          </div>
          <div className="text-xs text-amber-600 mt-1">
            $25 donation = {(project.impactPointsMultiplier || 10) * 25 * 10} Impact Points
          </div>
        </div>
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
