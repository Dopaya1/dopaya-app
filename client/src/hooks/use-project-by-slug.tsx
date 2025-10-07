import { useQuery } from "@tanstack/react-query";
import { Project } from "@shared/schema";
import { supabase } from "@/lib/supabase";

export function useProjectBySlug(slug: string) {
  const { data: project, isLoading, error } = useQuery<Project | null>({
    queryKey: ["project-by-slug", slug],
    queryFn: async () => {
      if (!slug) return null;
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('slug', slug)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null;
        }
        throw error;
      }
      return data;
    },
    enabled: !!slug,
  });
  
  // Get main image from project data
  const mainImage = project?.imageUrl || project?.image1;

  return {
    project,
    mainImage,
    isLoading,
    error
  };
}