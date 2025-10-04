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

  // Enhanced placeholder data with aligned metrics based on logical relationships
  // Logic: 1 point per $1 donated, impact created is 2x donation amount
  const placeholderData = [
    { date: "Jan 1", points: 0, impactCreated: 0, donationAmount: 0 },
    { date: "Feb 15", points: 150, impactCreated: 300, donationAmount: 150 },
    { date: "Mar 3", points: 325, impactCreated: 650, donationAmount: 325 },
    { date: "Apr 10", points: 500, impactCreated: 1000, donationAmount: 500 },
    { date: "May 1", points: 650, impactCreated: 1300, donationAmount: 650 },
  ];

  const chartData = impactHistory || placeholderData;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Impact Performance</CardTitle>
        <div className="flex items-center space-x-6 text-sm mt-2">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-0.5 bg-primary"></div>
            <span className="text-gray-600">Impact Points</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-0.5 bg-green-500" style={{ borderStyle: 'dashed', borderWidth: '1px 0', background: 'none', borderColor: '#10B981' }}></div>
            <span className="text-gray-600">Impact Created</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-0.5 bg-purple-500" style={{ borderStyle: 'dashed', borderWidth: '1px 0', background: 'none', borderColor: '#8B5CF6' }}></div>
            <span className="text-gray-600">Donations ($)</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Skeleton className="h-full w-full" />
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
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
      </CardContent>
    </Card>
  );
}
