import React from 'react';
import { useDbStatus } from '@/hooks/use-db-status';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertTriangle, Database, Shield } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function DbStatusAlert() {
  const { isConnected, isLoading, status, refetch } = useDbStatus();

  if (isLoading) {
    return (
      <Alert className="mb-4 bg-gray-50">
        <Skeleton className="h-4 w-4 mr-2" />
        <AlertTitle className="mb-2">
          <Skeleton className="h-4 w-32" />
        </AlertTitle>
        <AlertDescription>
          <Skeleton className="h-3 w-full mb-2" />
          <Skeleton className="h-3 w-3/4" />
        </AlertDescription>
      </Alert>
    );
  }

  if (!isConnected) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTriangle className="h-4 w-4 mr-2" />
        <AlertTitle className="mb-2">Database Connection Error</AlertTitle>
        <AlertDescription className="space-y-4">
          <p>We're currently unable to connect to our database. This means you might not see all project data or be able to perform certain actions.</p>
          <div className="flex justify-end">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetch()}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-3 w-3" />
              Retry Connection
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return null; // Don't show anything when connection is successful
}

export function DbDebugInfo() {
  const { isConnected, isLoading, status, stats, refetch } = useDbStatus();

  if (isLoading) {
    return (
      <div className="border rounded p-4 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Database className="h-4 w-4" />
          <h3 className="font-medium">Database Status</h3>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    );
  }

  return (
    <div className={`border rounded p-4 mb-4 ${isConnected ? 'bg-green-50' : 'bg-red-50'}`}>
      <div className="flex items-center gap-2 mb-2">
        {isConnected ? (
          <Shield className="h-4 w-4 text-green-500" />
        ) : (
          <AlertTriangle className="h-4 w-4 text-red-500" />
        )}
        <h3 className="font-medium">Database Status</h3>
        <div className="ml-auto">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => refetch()}
            className="h-7 gap-1"
          >
            <RefreshCw className="h-3 w-3" />
            Refresh
          </Button>
        </div>
      </div>
      
      <div className="text-sm">
        <div className="mb-2">
          <span className="font-medium">Status:</span> {isConnected ? 'Connected' : 'Disconnected'}
        </div>
        {status && (
          <div className="mb-2">
            <span className="font-medium">Message:</span> {status.message}
          </div>
        )}
        {status?.error && (
          <div className="mb-2 text-red-500">
            <span className="font-medium">Error:</span> {status.error}
          </div>
        )}
        {stats?.stats && (
          <div className="mb-2">
            <span className="font-medium">Database Records:</span>
            <ul className="list-disc list-inside ml-2">
              <li>Users: {stats.stats.users}</li>
              <li>Projects: {stats.stats.projects}</li>
              <li>Rewards: {stats.stats.rewards}</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}