import { useQuery } from "@tanstack/react-query";
import { ProjectPressMention } from "@shared/schema";
import { supabase } from "@/lib/supabase";

/**
 * Hook to fetch all press mentions for a specific project
 * Returns press mentions ordered by creation date (newest first)
 */
export function useProjectPressMentions(projectId: number | null) {
  const { data: pressMentions, isLoading, error } = useQuery<ProjectPressMention[]>({
    queryKey: ["project-press-mentions", projectId],
    queryFn: async () => {
      if (!projectId) return [];

      // Fetch all press mentions for this project
      const { data, error } = await supabase
        .from('project_press_mentions')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) {
        // Try alternative column names
        const { data: data2, error: error2 } = await supabase
          .from('project_press_mentions')
          .select('*')
          .eq('projectId', projectId)
          .order('createdAt', { ascending: false });

        if (error2) {
          console.error('Error fetching project_press_mentions:', error2);
          return [];
        }

        return (data2 || []) as ProjectPressMention[];
      }

      return (data || []) as ProjectPressMention[];
    },
    enabled: !!projectId,
  });

  return {
    pressMentions: pressMentions || [],
    isLoading,
    error,
  };
}

