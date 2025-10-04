import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CheckCircle, X, Trophy, Heart } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export function SuccessBanner() {
  const [location, setLocation] = useLocation();
  const [showBanner, setShowBanner] = useState(false);
  const [donationAmount, setDonationAmount] = useState<number | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    const amount = urlParams.get('amount');
    
    if (status === 'success') {
      setShowBanner(true);
      if (amount) {
        setDonationAmount(parseFloat(amount));
      }
      
      // Clean up URL after showing banner
      const timeoutId = setTimeout(() => {
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      }, 1000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [location]);

  const handleClose = () => {
    setShowBanner(false);
    // Clean up URL
    const newUrl = window.location.pathname;
    window.history.replaceState({}, '', newUrl);
  };

  if (!showBanner) {
    return null;
  }

  const impactPoints = donationAmount ? Math.floor(donationAmount * 10) : 0;
  const displayName = user?.firstName || user?.username || "Impact Hero";

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4">
      <Alert className="bg-green-50 border-green-200 shadow-lg">
        <div className="flex items-start space-x-3">
          <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
          
          <div className="flex-1 min-w-0">
            <AlertDescription className="text-green-800">
              <div className="space-y-2">
                <div className="font-semibold text-lg">
                  🎉 Thank you, {displayName}!
                </div>
                
                <div className="space-y-1 text-sm">
                  {donationAmount && (
                    <p>
                      <Heart className="w-4 h-4 inline mr-1" />
                      Your ${donationAmount.toFixed(2)} donation was successful!
                    </p>
                  )}
                  
                  {impactPoints > 0 && (
                    <p>
                      <Trophy className="w-4 h-4 inline mr-1" />
                      You've earned {impactPoints.toLocaleString()} Impact Points!
                    </p>
                  )}
                  
                  <p className="text-green-700 font-medium">
                    Your generosity is making a real difference in the world. 
                    Thank you for being part of our impact community! 🌟
                  </p>
                </div>
              </div>
            </AlertDescription>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className="p-1 h-6 w-6 text-green-600 hover:text-green-800 flex-shrink-0"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </Alert>
    </div>
  );
}