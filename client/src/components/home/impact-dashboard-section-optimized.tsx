import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, Users, Award, Eye, Calendar, Target } from "lucide-react";
import { Link } from "wouter";

export function ImpactDashboardSection() {
  // Sample impact data for dashboard preview
  const impactData = [
    { metric: "Lives Impacted", value: "1,247", change: "+23%" },
    { metric: "Social Enterprises Supported", value: "8", change: "+2%" },
    { metric: "Impact Points Earned", value: "2,450", change: "+180%" },
    { metric: "Community Connections", value: "34", change: "+12%" }
  ];

  const recentActivity = [
    { action: "Supported Clean Water Initiative", points: "+150 points", impact: "Provided 15 families with clean water access", date: "2 days ago" },
    { action: "Unlocked Sustainable Products Reward", points: "-300 points", impact: "Exclusive discount on eco-friendly products", date: "5 days ago" },
    { action: "Referred Sarah to join community", points: "+100 points", impact: "New community member creating impact", date: "1 week ago" }
  ];

  return (
    <section id="impact-dashboard" className="py-16" style={{ backgroundColor: 'var(--bg-beige)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-heading font-medium mb-4" style={{ color: 'var(--text-primary)' }}>
            Your Impact Dashboard Preview
          </h2>
          <p className="text-lg max-w-3xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            See exactly how your support creates change. Track real impact, connect with your community, 
            and access exclusive benefits—all in one place.
          </p>
        </div>

        {/* Dashboard Preview */}
        <div className="bg-white rounded-2xl p-8 mb-8" style={{ boxShadow: 'var(--shadow-hover, 0 4px 12px rgba(0,0,0,0.1))' }}>
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h3 className="text-xl font-heading font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Welcome back, Future Changemaker!</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Here's your impact overview for this month</p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="text-white px-6 py-3 rounded-lg" style={{ backgroundColor: 'var(--primary-orange)' }}>
                <div className="text-center">
                  <div className="text-sm opacity-90">Founding Member Status</div>
                  <div className="text-lg font-medium">Lifetime Benefits</div>
                </div>
              </div>
            </div>
          </div>

          {/* Impact Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {impactData.map((item, index) => (
              <div key={index} className="rounded-lg p-4" style={{ backgroundColor: 'var(--bg-cool)' }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-2xl font-heading font-medium" style={{ color: 'var(--text-primary)' }}>{item.value}</div>
                  <div className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{item.change}</div>
                </div>
                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.metric}</div>
              </div>
            ))}
          </div>

          {/* Recent Activity */}
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-heading font-medium mb-4 flex items-center" style={{ color: 'var(--text-primary)' }}>
                <BarChart3 className="h-5 w-5 mr-2" style={{ color: 'var(--text-secondary)' }} />
                Recent Activity
              </h4>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="border-l-4 pl-4 py-2" style={{ borderColor: 'var(--primary-orange)' }}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>{activity.action}</div>
                        <div className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>{activity.impact}</div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{activity.date}</div>
                      </div>
                      <div className="text-sm font-medium" style={{ color: 'var(--primary-orange)' }}>{activity.points}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-[#1a1a3a] mb-4 flex items-center">
                <Users className="h-5 w-5 mr-2 text-[#e94e35]" />
                Community Connections
              </h4>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-10 h-10 bg-[#e94e35] rounded-full flex items-center justify-center text-white font-semibold">
                    J
                  </div>
                  <div>
                    <div className="font-medium text-[#1a1a3a]">Join Impact Groups</div>
                    <div className="text-sm text-gray-600">Connect with other changemakers</div>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  • Clean Water Advocates (23 members)
                  • Education Innovation Group (45 members)
                  • Sustainable Agriculture Network (67 members)
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <h5 className="font-medium text-blue-900 mb-2 flex items-center">
                  <Award className="h-4 w-4 mr-2" />
                  Founding Member Benefits
                </h5>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Early access to new social enterprises</li>
                  <li>• Exclusive founder dinner invitations</li>
                  <li>• Direct connection with SE founders</li>
                  <li>• Priority support and community access</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Key Features Highlight */}
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-[#e94e35]/10 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Eye className="h-6 w-6 text-[#e94e35]" />
            </div>
            <h3 className="font-semibold text-[#1a1a3a] mb-2">Full Transparency</h3>
            <p className="text-sm text-gray-600">
              See exactly where your support goes and track real outcomes with verified impact reports.
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-[#e94e35]/10 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Users className="h-6 w-6 text-[#e94e35]" />
            </div>
            <h3 className="font-semibold text-[#1a1a3a] mb-2">Community Connection</h3>
            <p className="text-sm text-gray-600">
              Connect with other changemakers, join impact groups, and participate in exclusive events.
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-[#e94e35]/10 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Target className="h-6 w-6 text-[#e94e35]" />
            </div>
            <h3 className="font-semibold text-[#1a1a3a] mb-2">Meaningful Progress</h3>
            <p className="text-sm text-gray-600">
              Track your impact journey with functional dashboards that show real change, not just points.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
            Ready to see your impact in action?
          </p>
          <Button 
            asChild
            size="lg" 
            className="text-white px-8 py-4"
            style={{ backgroundColor: 'var(--primary-orange)' }}
          >
            <Link href="#community">
              Join the Community
              <TrendingUp className="h-5 w-5 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}