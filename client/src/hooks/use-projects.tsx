import { useQuery } from "@tanstack/react-query";
import { Project, ProjectMedia } from "@shared/schema";

export function useProject(id: number) {
  const { data: project, isLoading: projectLoading, error: projectError } = useQuery<Project>({
    queryKey: [`/api/projects/${id}`],
  });

  const { data: projectMedia, isLoading: mediaLoading, error: mediaError } = useQuery<ProjectMedia[]>({
    queryKey: [`/api/projects/${id}/media`],
    enabled: !!project,
  });

  return {
    project,
    projectMedia,
    isLoading: projectLoading || mediaLoading,
    error: projectError || mediaError,
    mainImage: projectMedia?.find(media => media.type === "image" && media.sortOrder === 1)?.url || project?.imageUrl
  };
}

export function useProjects() {
  const { data: projects, isLoading, error } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
  });

  return {
    projects,
    isLoading,
    error,
  };
}