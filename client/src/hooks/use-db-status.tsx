import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

type DatabaseStatus = {
  success: boolean;
  message: string;
  error?: string;
  details?: any;
};

type DatabaseStats = {
  success: boolean;
  stats?: {
    users: number;
    projects: number;
    rewards: number;
  };
  error?: string;
};

/**
 * Hook to check database connectivity status
 */
export function useDbStatus() {
  const { 
    data: status,
    isLoading: isStatusLoading,
    isError: isStatusError,
    refetch: refetchStatus
  } = useQuery<DatabaseStatus>({
    queryKey: ['db-status'],
    queryFn: async () => {
      try {
        // Test connection by querying projects table
        const { data, error } = await supabase
          .from('projects')
          .select('id')
          .limit(1);
        
        if (error) {
          return {
            success: false,
            message: 'Database connection failed',
            error: error.message
          };
        }
        
        return {
          success: true,
          message: 'Database connection successful'
        };
      } catch (err) {
        return {
          success: false,
          message: 'Database connection failed',
          error: err instanceof Error ? err.message : 'Unknown error'
        };
      }
    },
    refetchInterval: 0, // Only fetch manually
    refetchOnWindowFocus: false,
    retry: 1
  });

  const { 
    data: stats,
    isLoading: isStatsLoading,
    isError: isStatsError,
    refetch: refetchStats
  } = useQuery<DatabaseStats>({
    queryKey: ['db-stats'],
    queryFn: async () => {
      try {
        const [
          { count: projectsCount },
          { count: usersCount },
          { count: rewardsCount }
        ] = await Promise.all([
          supabase.from('projects').select('*', { count: 'exact', head: true }),
          supabase.from('users').select('*', { count: 'exact', head: true }),
          supabase.from('rewards').select('*', { count: 'exact', head: true })
        ]);

        return {
          success: true,
          stats: {
            projects: projectsCount || 0,
            users: usersCount || 0,
            rewards: rewardsCount || 0
          }
        };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : 'Unknown error'
        };
      }
    },
    refetchInterval: 0, // Only fetch manually
    refetchOnWindowFocus: false,
    enabled: !!status?.success, // Only fetch stats if DB is connected
    retry: 1
  });
  
  const isConnected = !!status?.success;
  const isLoading = isStatusLoading || isStatsLoading;
  const isError = isStatusError || isStatsError;
  
  const refetch = () => {
    refetchStatus();
    if (isConnected) {
      refetchStats();
    }
  };

  return {
    isConnected,
    isLoading,
    isError,
    status,
    stats,
    refetch
  };
}