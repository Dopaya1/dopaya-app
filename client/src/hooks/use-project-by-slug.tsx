import { useQuery } from "@tanstack/react-query";
import { Project } from "@shared/schema";

export function useProjectBySlug(slug: string) {
  const { data: projects, isLoading, error } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const project = projects?.find(p => p.slug === slug);
  
  // Get main image from project data
  const mainImage = project?.imageUrl || project?.image1;

  return {
    project,
    mainImage,
    isLoading,
    error
  };
}