import { useQuery } from "@tanstack/react-query";
import { Project } from "@shared/schema";
import { supabase } from "@/lib/supabase";

export function useProject(id: number) {
  const { data: project, isLoading, error } = useQuery<Project>({
    queryKey: [`projects`, id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  return {
    project,
    projectMedia: [],
    isLoading,
    error,
    mainImage: project?.imageUrl
  };
}

export function useProjects() {
  const { data: projects, isLoading, error } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('createdAt', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  return {
    projects: projects || [],
    isLoading,
    error,
  };
}