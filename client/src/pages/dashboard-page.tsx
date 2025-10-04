import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { UserImpact } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { ImpactStats } from "@/components/dashboard/impact-stats";
import { ImpactChart } from "@/components/dashboard/impact-chart";
import { SupportedProjects } from "@/components/dashboard/supported-projects";
import { ImpactRankDisplay } from "@/components/dashboard/impact-rank-display";
import { getUserLevel } from "@/lib/auth";
import { Helmet } from "react-helmet";
import { Link } from "wouter";
import { SuccessBanner } from "@/components/donation/success-banner";
import { DonationSuccessModal } from "@/components/donation/donation-success-modal";
import { useState, useEffect } from "react";

export default function DashboardPage() {
  const { user } = useAuth();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [donationAmount, setDonationAmount] = useState(0);

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
  
  const { data: impact } = useQuery<UserImpact>({
    queryKey: ["/api/user/impact"],
  });

  const displayName = user?.firstName || user?.username || (user?.email ? user.email.split('@')[0] : "Impact Legend");
  const userLevel = impact?.userLevel || getUserLevel(impact?.impactPoints || 0);
  const impactPoints = impact?.impactPoints || 650; // Aligned with chart data logic (1 point per $1)
  const totalDonations = 650; // Using demo value since totalDonations is not in schema yet
  
  // Determine number of trophies based on impact level
  const getTrophyCount = (level: string): number => {
    switch(level) {
      case "Impact Legend": return 5;
      case "Changemaker": return 4;
      case "Supporter": return 2;
      default: return 1;
    }
  };
  
  const trophyCount = getTrophyCount(userLevel);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Helmet>
        <title>Dashboard | Dopaya</title>
        <meta name="description" content="Track your impact and manage your donations on Dopaya." />
      </Helmet>
      

      
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-dark font-heading">Hi, {displayName}</h1>
      </div>

      <ImpactStats />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-12">
        {/* Left sidebar - User profile */}
        <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col items-center">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-dark">{impactPoints.toLocaleString()}</h2>
            <p className="text-sm text-neutral">Impact Points</p>
          </div>
          
          {/* Impact Rank Display */}
          <div className="mb-6 w-full">
            <ImpactRankDisplay 
              impactPoints={impactPoints} 
              totalDonations={totalDonations}
            />
          </div>

          <div className="w-full space-y-3">
            <Button className="w-full" onClick={() => window.location.href = '/projects'}>
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

      <SupportedProjects />
      
      <DonationSuccessModal 
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        amount={donationAmount}
      />
    </div>
  );
}
