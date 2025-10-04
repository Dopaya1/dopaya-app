import { AlertCircle, Database } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useDbStatus } from "@/hooks/use-db-status";
import { Link } from "wouter";

interface DataErrorProps {
  title?: string;
  message?: string;
  withAction?: boolean;
  itemType?: string;
}

export function DataError({
  title = "Data Unavailable",
  message = "We're unable to retrieve the requested data at this time.",
  withAction = true,
  itemType = "item"
}: DataErrorProps) {
  const { isConnected, status } = useDbStatus();
  
  // If we specifically know it's a database connection issue
  const isDbConnectionIssue = !isConnected;
  
  // Get error message from status if available
  const errorMessage = status?.message || message;
  
  return (
    <Alert variant="destructive" className="my-4 border-red-500/50 bg-red-500/10">
      <div className="flex items-start gap-4">
        {isDbConnectionIssue ? (
          <Database className="h-5 w-5 text-red-500" />
        ) : (
          <AlertCircle className="h-5 w-5 text-red-500" />
        )}
        <div className="space-y-2 flex-1">
          <AlertTitle>{title}</AlertTitle>
          <AlertDescription className="text-muted-foreground">
            {isDbConnectionIssue 
              ? `We're currently experiencing database connectivity issues. The ${itemType}s cannot be displayed at this moment.`
              : message}
            
            {status?.error && (
              <p className="mt-2 text-xs opacity-80">
                Error details: {status.error}
              </p>
            )}
          </AlertDescription>
          
          {withAction && (
            <div className="mt-4 flex gap-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
              <Button
                variant="ghost"
                size="sm"
                asChild
              >
                <Link href="/">
                  Return home
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </Alert>
  );
}

export function EmptyState({
  title = "No items found",
  message = "There are no items to display at this time.",
  itemType = "item"
}: Omit<DataErrorProps, 'withAction'>) {
  return (
    <div className="bg-muted/50 border rounded-lg p-8 my-4 text-center">
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground">{message}</p>
      {itemType === "project" && (
        <Button 
          variant="outline" 
          className="mt-4"
          asChild
        >
          <Link href="/projects/new">
            Submit a project
          </Link>
        </Button>
      )}
    </div>
  );
}