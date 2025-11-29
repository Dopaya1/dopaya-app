import { useQuery } from "@tanstack/react-query";
import { UserImpactHistory } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export function ImpactChart() {
  const { data: impactHistory, isLoading, error } = useQuery<UserImpactHistory[]>({
    queryKey: ["/api/user/impact-history"],
  });

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Impact Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500 text-center py-10">
            Error loading impact history: {error.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Check if we have real impact history data
  const hasImpactHistory = impactHistory && impactHistory.length > 0;

  return (
    <div>
      {/* Header and description moved to parent component */}
      <div>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Skeleton className="h-full w-full" />
          </div>
        ) : !hasImpactHistory ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-sm text-gray-500 text-center">
              When you start supporting projects, your impact over time will appear here.
            </p>
          </div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={impactHistory}
                margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eaeaea" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tickMargin={10}
                  stroke="#718096"
                  fontSize={12}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tickMargin={10}
                  stroke="#718096"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    padding: '0.75rem'
                  }}
                  formatter={(value: number, name: string) => {
                    if (name === 'points') return [`${value.toLocaleString()} points`, 'Impact Points'];
                    if (name === 'impactCreated') return [`${value.toLocaleString()}`, 'Impact Created'];
                    if (name === 'donationAmount') return [`$${value.toLocaleString()}`, 'Total Donations'];
                    return [value, name];
                  }}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="points" 
                  stroke="#F55701" 
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#F55701', strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: '#F55701', stroke: '#fff', strokeWidth: 2 }}
                  animationDuration={1500}
                />
                <Line 
                  type="monotone" 
                  dataKey="impactCreated" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#10B981', strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: '#10B981', stroke: '#fff', strokeWidth: 2 }}
                  animationDuration={1500}
                  strokeDasharray="5 5"
                />
                <Line 
                  type="monotone" 
                  dataKey="donationAmount" 
                  stroke="#8B5CF6" 
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#8B5CF6', strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: '#8B5CF6', stroke: '#fff', strokeWidth: 2 }}
                  animationDuration={1500}
                  strokeDasharray="10 5"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
