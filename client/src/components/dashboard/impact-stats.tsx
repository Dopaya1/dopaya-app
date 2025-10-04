import { useQuery } from "@tanstack/react-query";
import { UserImpact } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export function ImpactStats() {
  const { data: impact, isLoading, error } = useQuery<UserImpact>({
    queryKey: ["/api/user/impact"],
  });

  const statItems = [
    { 
      title: "Amount donated", 
      value: impact?.amountDonated || 0, 
      format: (val: number) => `$${val.toLocaleString()}`,
      change: impact?.amountDonatedChange || 0,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
        </svg>
      )
    },
    { 
      title: "Projects supported", 
      value: impact?.projectsSupported || 0, 
      format: (val: number) => val.toString(),
      change: impact?.projectsSupportedChange || 0,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
        </svg>
      )
    },
    { 
      title: "Impact created", 
      value: impact?.impactPoints || 0, 
      format: (val: number) => val.toLocaleString(),
      change: impact?.impactPointsChange || 0,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
        </svg>
      )
    },
  ];

  if (error) {
    return (
      <div className="text-red-500 text-center py-4">
        Error loading impact data: {error.message}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      {isLoading ? (
        Array(3).fill(0).map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-start mb-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-5 w-14" />
            </div>
            <Skeleton className="h-8 w-32" />
          </div>
        ))
      ) : (
        statItems.map((item, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-sm text-neutral">{item.title}</h2>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                item.change > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              }`}>
                {item.change > 0 ? "+" : ""}{item.change}%
              </span>
            </div>
            <div className="flex items-center">
              <span className="text-3xl font-bold text-dark">{item.format(item.value)}</span>
              <span className={`${item.change > 0 ? "text-green-500" : "text-neutral"}`}>
                {item.icon}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
