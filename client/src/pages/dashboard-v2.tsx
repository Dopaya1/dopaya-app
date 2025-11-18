import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { UserImpact } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { ImpactStats } from "@/components/dashboard/impact-stats";
import { ImpactChart } from "@/components/dashboard/impact-chart";
import { SupportedProjects } from "@/components/dashboard/supported-projects";
import { ImpactRankDisplay } from "@/components/dashboard/impact-rank-display";
import { Helmet } from "react-helmet";
import { Link, useLocation } from "wouter";
import { DonationSuccessModal } from "@/components/donation/donation-success-modal";
import { useState, useEffect } from "react";
import { getDailyQuoteForUser, ImpactQuote } from "@/constants/impact-quotes";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function DashboardV2() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [donationAmount, setDonationAmount] = useState(0);
  const [dailyQuote, setDailyQuote] = useState<ImpactQuote | null>(null);

  // Check for success parameters in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    const amount = urlParams.get('amount');
    
    if (status === 'success' && amount) {
      setDonationAmount(parseFloat(amount));
      setShowSuccessModal(true);
      
      // Clean up URL parameters
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, []);
  
  const { data: impact, error: impactError } = useQuery<UserImpact>({
    queryKey: ["/api/user/impact"],
  });
  
  // Safety check: if query failed, impact could be an error object
  const safeImpact = impactError ? undefined : impact;

  const displayName = user?.firstName || user?.username || (user?.email ? user.email.split('@')[0] : "Supporter");
  const userStatus = safeImpact?.userStatus || "aspirer";
  const statusDisplayName = userStatus === "supporter" ? "Impact Supporter" : "Impact Aspirer";
  // Use actual impact points from API
  const impactPoints = safeImpact?.impactPoints ?? 0;
  const totalDonations = safeImpact?.amountDonated ?? 0;
  const projectsSupported = safeImpact?.projectsSupported ?? 0;
  const supportCount = projectsSupported;
  
  // Calculate points value (~$0.10 per point)
  const pointsValue = Math.round(impactPoints * 0.1);
  
  // Check if user is first-time (50 IP from welcome bonus, 0 projects supported)
  const isFirstTimeUser = safeImpact 
    ? (impactPoints === 50 && (safeImpact?.projectsSupported || 0) === 0)
    : false;
  
  // Pick a daily quote per user (stable for the day, per login)
  useEffect(() => {
    const quote = getDailyQuoteForUser(user?.id);
    setDailyQuote(quote);
  }, [user?.id]);

  // Check if tooltips should show
  const showTooltipA = isFirstTimeUser && sessionStorage.getItem('tooltipA_shown') !== 'true';
  const showTooltipB = supportCount === 0;
  const showTooltipC = supportCount === 0; // Will show on first featured project card

  // Mark tooltip A as shown after first display
  useEffect(() => {
    if (showTooltipA) {
      const timer = setTimeout(() => {
        sessionStorage.setItem('tooltipA_shown', 'true');
      }, 5000); // Show for 5 seconds then mark as shown
      return () => clearTimeout(timer);
    }
  }, [showTooltipA]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Helmet>
        <title>Dashboard V2 | Dopaya</title>
        <meta name="description" content="Track your impact and manage your donations on Dopaya." />
      </Helmet>
      
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-dark font-heading">
          Welcome back, {displayName}
        </h1>
        <p className="text-lg text-gray-600 mt-2">
          You have <span className="font-semibold text-gray-900">{impactPoints}</span> Impact Points — ≈${pointsValue}
        </p>
        <div className="mt-4">
          <TooltipProvider>
            <Tooltip open={showTooltipB ? undefined : false}>
              <TooltipTrigger asChild>
                <Button 
                  className="w-auto" 
                  onClick={() => window.location.href = '/projects'}
                  data-tour="support-button"
                >
                  Support a project
                </Button>
              </TooltipTrigger>
              {showTooltipB && (
                <TooltipContent>
                  <p>Support your first project and unlock your next 50 Impact Points.</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Daily quote box */}
      {dailyQuote && dailyQuote.text && (
        <div className="mb-8 max-w-xl">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 px-4 py-3">
            <div className="flex items-start gap-2">
              <span className="mt-0.5 text-green-600">🌱</span>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Today's Thought
                </p>
                <p className="text-sm italic text-gray-800">
                  "{dailyQuote.text}"
                </p>
                <p className="text-xs text-gray-500">— {dailyQuote.author}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <ImpactStats />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-12">
        {/* Left sidebar - User profile */}
        <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col items-center">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div className="text-center mb-4 relative" data-tour="impact-points">
            <TooltipProvider>
              <Tooltip open={showTooltipA ? undefined : false}>
                <TooltipTrigger asChild>
                  <div>
                    <h2 className="text-2xl font-bold text-dark">
                      {impactPoints.toLocaleString()}
                    </h2>
                    <p className="text-sm text-neutral">Impact Points</p>
                  </div>
                </TooltipTrigger>
                {showTooltipA && (
                  <TooltipContent>
                    <p>You've already earned 50 Impact Points — use them to unlock brand rewards.</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
          
          {/* Impact Rank Display */}
          <div className="mb-6 w-full">
            <ImpactRankDisplay 
              impactPoints={impactPoints} 
              totalDonations={totalDonations}
            />
            {isFirstTimeUser && (
              <div className="mt-3 w-full relative">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>Progress to first reward</span>
                  <span>50 / 100 Impact Points</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#f2662d] transition-all"
                    style={{ width: `${Math.min(impactPoints, 100)}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Complete your first support action to unlock your first reward!
                </p>
              </div>
            )}
          </div>

          <div className="w-full space-y-3">
            <Button 
              className="w-full" 
              onClick={() => window.location.href = '/projects'}
              data-tour="support-button"
            >
              SUPPORT
            </Button>
            <Button variant="outline" className="w-full" onClick={() => window.location.href = '/rewards'}>
              REDEEM POINTS
            </Button>
          </div>
        </div>

        {/* Impact Performance graph */}
        <div className="lg:col-span-3">
          <ImpactChart />
        </div>
      </div>

      <SupportedProjects 
        supportCount={supportCount}
        showEmptyStateText={true}
        showTooltipOnFirst={showTooltipC}
      />
      
      <DonationSuccessModal 
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        amount={donationAmount}
      />
    </div>
  );
}
