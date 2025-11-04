import { useQuery } from "@tanstack/react-query";
import { Backer, Project } from "@shared/schema";
import { supabase } from "@/lib/supabase";

/**
 * Hook to fetch all featured backers from the database
 * Returns only backers where featured = true
 */
export function useFeaturedBackers() {
  const { data: backers, isLoading, error } = useQuery<Backer[]>({
    queryKey: ["featured-backers"],
    queryFn: async () => {
      // Try multiple possible column name variations
      // Supabase might return snake_case or camelCase
      const { data, error } = await supabase
        .from('backers')
        .select('*')
        .eq('featured', true)
        .order('name', { ascending: true });
      
      if (error) {
        // If featured column doesn't work, try Featured
        const { data: data2, error: error2 } = await supabase
          .from('backers')
          .select('*')
          .eq('Featured', true)
          .order('name', { ascending: true });
        
        if (error2) {
          console.error('Error fetching featured backers:', error2);
          throw error2;
        }
        
        return data2 as Backer[];
      }
      
      return data as Backer[];
    },
  });

  return {
    backers: backers || [],
    isLoading,
    error,
  };
}

/**
 * Hook to fetch all projects supported by a specific backer
 * Uses the project_backers junction table to find related projects
 */
export function useBackerProjects(backerId: number | null) {
  const { data: projects, isLoading, error } = useQuery<Project[]>({
    queryKey: ["backer-projects", backerId],
    queryFn: async () => {
      if (!backerId) return [];

      // First, get all project_backers entries for this backer
      const { data: projectBackers, error: pbError } = await supabase
        .from('project_backers')
        .select('project_id')
        .eq('backer_id', backerId);

      if (pbError) {
        // Try alternative column names
        const { data: pbData2, error: pbError2 } = await supabase
          .from('project_backers')
          .select('projectId')
          .eq('backerId', backerId);

        if (pbError2) {
          console.error('Error fetching project_backers:', pbError2);
          return [];
        }

        // Extract project IDs
        const projectIds = (pbData2 || []).map((pb: any) => pb.projectId || pb.project_id).filter(Boolean);
        
        if (projectIds.length === 0) return [];

        // Fetch all projects
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('*')
          .in('id', projectIds);

        if (projectsError) {
          console.error('Error fetching projects:', projectsError);
          return [];
        }

        return (projectsData || []) as Project[];
      }

      // Extract project IDs from project_backers
      const projectIds = (projectBackers || []).map((pb: any) => pb.project_id || pb.projectId).filter(Boolean);
      
      if (projectIds.length === 0) return [];

      // Fetch all projects using the IDs
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .in('id', projectIds);

      if (projectsError) {
        console.error('Error fetching projects:', projectsError);
        return [];
      }

      return (projectsData || []) as Project[];
    },
    enabled: !!backerId,
  });

  return {
    projects: projects || [],
    isLoading,
    error,
  };
}

/**
 * Hook to fetch a single backer by ID
 */
export function useBacker(backerId: number | null) {
  const { data: backer, isLoading, error } = useQuery<Backer | null>({
    queryKey: ["backer", backerId],
    queryFn: async () => {
      if (!backerId) return null;

      const { data, error } = await supabase
        .from('backers')
        .select('*')
        .eq('id', backerId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null;
        }
        throw error;
      }

      return data as Backer;
    },
    enabled: !!backerId,
  });

  return {
    backer,
    isLoading,
    error,
  };
}

/**
 * Hook to fetch all backers for a specific project
 * Uses the project_backers junction table to find related backers
 */
export function useProjectBackers(projectId: number | null) {
  const { data: backers, isLoading, error } = useQuery<Backer[]>({
    queryKey: ["project-backers", projectId],
    queryFn: async () => {
      if (!projectId) return [];

      // First, get all project_backers entries for this project
      const { data: projectBackers, error: pbError } = await supabase
        .from('project_backers')
        .select('backer_id')
        .eq('project_id', projectId);

      if (pbError) {
        // Try alternative column names
        const { data: pbData2, error: pbError2 } = await supabase
          .from('project_backers')
          .select('backerId')
          .eq('projectId', projectId);

        if (pbError2) {
          console.error('Error fetching project_backers:', pbError2);
          return [];
        }

        // Extract backer IDs
        const backerIds = (pbData2 || []).map((pb: any) => pb.backerId || pb.backer_id).filter(Boolean);
        
        if (backerIds.length === 0) return [];

        // Fetch all backers
        const { data: backersData, error: backersError } = await supabase
          .from('backers')
          .select('*')
          .in('id', backerIds)
          .order('name', { ascending: true });

        if (backersError) {
          console.error('Error fetching backers:', backersError);
          return [];
        }

        return (backersData || []) as Backer[];
      }

      // Extract backer IDs from project_backers
      const backerIds = (projectBackers || []).map((pb: any) => pb.backer_id || pb.backerId).filter(Boolean);
      
      if (backerIds.length === 0) return [];

      // Fetch all backers using the IDs
      const { data: backersData, error: backersError } = await supabase
        .from('backers')
        .select('*')
        .in('id', backerIds)
        .order('name', { ascending: true });

      if (backersError) {
        console.error('Error fetching backers:', backersError);
        return [];
      }


      return (backersData || []) as Backer[];
    },
    enabled: !!projectId,
  });

  return {
    backers: backers || [],
    isLoading,
    error,
  };
}

