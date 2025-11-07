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

      // Fetch all press mentions for this project with press source name
      // Try with press_source_id foreign key first
      const { data, error } = await supabase
        .from('project_press_mentions')
        .select(`
          *,
          press_sources!press_source_id (
            name
          )
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) {
        // Try without explicit foreign key specification
        const { data: data2, error: error2 } = await supabase
          .from('project_press_mentions')
          .select(`
            *,
            press_sources (
              name
            )
          `)
          .eq('project_id', projectId)
          .order('created_at', { ascending: false });

        if (error2) {
          // Try alternative column names or without join
          const { data: data3, error: error3 } = await supabase
            .from('project_press_mentions')
            .select('*')
            .eq('project_id', projectId)
            .order('created_at', { ascending: false });

          if (error3) {
            console.error('Error fetching project_press_mentions:', error3);
            return [];
          }

          return (data3 || []) as ProjectPressMention[];
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

