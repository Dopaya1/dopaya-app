import { useQuery } from "@tanstack/react-query";
import { UserImpact } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useI18n } from "@/lib/i18n/i18n-context";
import { formatNumber, formatCurrency } from "@/lib/i18n/formatters";

export function ImpactStats() {
  const { data: impact, isLoading, error } = useQuery<UserImpact>({
    queryKey: ["/api/user/impact"],
  });
  const { t } = useTranslation();
  const { language } = useI18n();

  const statItems = [
    { 
      title: t("dashboard.totalSupportAmount"), 
      value: impact?.amountDonated || 0, 
      format: (val: number) => formatCurrency(val, language),
      change: impact?.amountDonatedChange || 0,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
        </svg>
      )
    },
    { 
      title: t("dashboard.startupsSupported"), 
      value: impact?.projectsSupported || 0, 
      format: (val: number) => formatNumber(val),
      change: impact?.projectsSupportedChange || 0,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
        </svg>
      )
    },
    { 
      title: t("dashboard.impactPoints"), 
      value: impact?.impactPoints || 0, 
      format: (val: number) => formatNumber(val),
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
        {t("dashboard.errorLoadingData")} {error.message}
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
            <div className="mb-2">
              <h2 className="text-sm text-neutral">{item.title}</h2>
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
