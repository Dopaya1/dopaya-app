import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  useSimpleAnalytics,
  trackSearch,
  trackSocialShare,
  trackPerformance
} from '@/lib/simple-analytics';
import { 
  Search, 
  Share2, 
  Heart, 
  MousePointer, 
  TrendingUp,
  Users,
  Target,
  BarChart3
} from 'lucide-react';

export default function AnalyticsTestPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [testResults, setTestResults] = useState<string[]>([]);
  const { trackEvent, trackProjectClick, trackDonation } = useSimpleAnalytics();

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testAnalytics = () => {
    setTestResults([]);
    addResult('🧪 Starting analytics tests...');
    
    // Test basic event tracking
    trackEvent('analytics_test', 'testing', 'test_button');
    addResult('✅ Basic event tracking test sent');
    
    // Test project interaction
    trackProjectClick('test-project', 'Test Project');
    addResult('✅ Project interaction tracking test sent');
    
    // Test donation tracking
    trackDonation('test-project', 50);
    addResult('✅ Donation tracking test sent');
    
    // Test search tracking
    if (searchQuery) {
      trackSearch(searchQuery, 5);
      addResult(`✅ Search tracking test sent: "${searchQuery}"`);
    }
    
    // Test social share tracking
    trackSocialShare('facebook', 'test_content', window.location.href);
    addResult('✅ Social share tracking test sent');
    
    // Test performance metric
    trackPerformance('test_metric', 100);
    addResult('✅ Performance metric tracking test sent');
    
    // Test project view
    trackEvent('project_view', 'engagement', 'Test Project');
    addResult('✅ Project view tracking test sent');
    
    // Test waitlist signup
    trackEvent('waitlist_signup', 'conversion', 'analytics_test');
    addResult('✅ Waitlist signup tracking test sent');
    
    addResult('🎉 All analytics tests completed!');
    addResult('📊 Check Google Analytics Real-time reports to verify events');
  };

  const testPageView = () => {
    addResult('🔄 Testing page view tracking...');
    // Page view is automatically tracked by usePageTracking hook
    addResult('✅ Page view should be automatically tracked');
  };

  const testConversion = () => {
    addResult('💰 Testing conversion tracking...');
    trackEvent('donation_completed', 'conversion', 'test-project', 100);
    addResult('✅ Conversion tracking test sent');
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Test Suite</h1>
          <p className="text-gray-600">Test and verify Google Analytics 4 integration</p>
        </div>

        {/* Test Controls */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Test Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <Button onClick={testAnalytics} className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Run All Tests
              </Button>
              <Button onClick={testPageView} variant="outline" className="flex items-center gap-2">
                <MousePointer className="h-4 w-4" />
                Test Page View
              </Button>
              <Button onClick={testConversion} variant="outline" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Test Conversion
              </Button>
              <Button onClick={clearResults} variant="outline">
                Clear Results
              </Button>
            </div>
            
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Label htmlFor="search-query">Test Search Query</Label>
                <Input
                  id="search-query"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter search term to test..."
                />
              </div>
              <Button 
                onClick={() => {
                  if (searchQuery) {
                    trackSearch(searchQuery, Math.floor(Math.random() * 10) + 1);
                    addResult(`🔍 Search test sent: "${searchQuery}"`);
                  }
                }}
                disabled={!searchQuery}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Search className="h-4 w-4" />
                Test Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Test Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 p-4 rounded-lg max-h-96 overflow-y-auto">
              {testResults.length === 0 ? (
                <p className="text-gray-500 text-center">No test results yet. Click "Run All Tests" to start.</p>
              ) : (
                <div className="space-y-1 text-sm font-mono">
                  {testResults.map((result, index) => (
                    <div key={index} className="text-gray-800">{result}</div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Analytics Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                What's Being Tracked
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>✅ Page views and navigation</li>
                <li>✅ Project interactions and views</li>
                <li>✅ Donation button clicks</li>
                <li>✅ Form submissions</li>
                <li>✅ Search queries</li>
                <li>✅ Social media shares</li>
                <li>✅ Performance metrics</li>
                <li>✅ User engagement</li>
                <li>✅ Conversion events</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                Google Analytics Setup
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><strong>Measurement ID:</strong> G-TW0YWV68V3</p>
                <p><strong>Status:</strong> <span className="text-green-600">Active</span></p>
                <p><strong>Debug Mode:</strong> {process.env.NODE_ENV === 'development' ? 'Enabled' : 'Disabled'}</p>
                <p><strong>Real-time Reports:</strong> Available in GA4</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>How to Verify Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Open Google Analytics 4 dashboard</li>
              <li>Go to "Reports" → "Realtime"</li>
              <li>Run the tests above</li>
              <li>Check that events appear in real-time</li>
              <li>Verify custom events in "Events" section</li>
              <li>Check "Conversions" for donation events</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
