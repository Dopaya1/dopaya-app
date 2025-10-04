import { useQuery } from '@tanstack/react-query';

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
    queryKey: ['/api/system/db-status'],
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
    queryKey: ['/api/system/db-stats'],
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