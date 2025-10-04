import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Heart, X } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Project } from "@shared/schema";
import { useAuthGuard } from "@/hooks/use-auth-guard";

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  project?: Project;
  generalDonation?: boolean;
  initialAmount?: number;
}

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const PRESET_AMOUNTS = [10, 25, 50, 100, 250, 500];

export function DonationModal({ isOpen, onClose, project, generalDonation = false, initialAmount }: DonationModalProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { guardDonation } = useAuthGuard();

  // Set initial amount when modal opens or initialAmount changes
  useEffect(() => {
    if (initialAmount && isOpen) {
      // Check if initialAmount matches any preset amounts
      if (PRESET_AMOUNTS.includes(initialAmount)) {
        setSelectedAmount(initialAmount);
        setCustomAmount("");
      } else {
        // Use custom amount for non-preset values
        setSelectedAmount(null);
        setCustomAmount(initialAmount.toString());
      }
    }
  }, [initialAmount, isOpen]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedAmount(null);
      setCustomAmount("");
    }
  }, [isOpen]);

  const currentAmount = selectedAmount || (customAmount ? parseFloat(customAmount) : 0);
  const impactPoints = Math.floor(currentAmount * (project?.impactPointsMultiplier || 10));

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    setSelectedAmount(null);
  };

  const handleDonate = async () => {
    if (currentAmount < 5) {
      toast({
        title: "Invalid Amount",
        description: "Minimum donation amount is $5.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error("Stripe failed to load");
      }

      const response = await apiRequest("POST", "/api/create-checkout-session", {
        amount: currentAmount,
        projectId: project?.id || null,
        projectTitle: project?.title || "General Donation",
        userEmail: user?.email || 'donor@dopaya.com',
        userId: user?.id || 'anonymous'
      });

      const data = await response.json();
      console.log('Stripe response:', data);

      if (data.sessionUrl) {
        // Direct redirect to Stripe checkout URL
        window.location.href = data.sessionUrl;
        return;
      }

      if (data.sessionId) {
        const { error } = await stripe.redirectToCheckout({
          sessionId: data.sessionId,
        });
        
        if (error) {
          throw error;
        }
      } else {
        throw new Error('No session ID or URL received from server');
      }


    } catch (error: any) {
      console.error("Donation error:", error);
      toast({
        title: "Donation Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getImpactDescription = () => {
    if (!project || !currentAmount) return "";
    
    // Calculate impact based on project's impact metrics
    const impactUnit = project.impactUnit || "impact";
    let impactAmount = 0;
    
    // Use the project's donation tiers to calculate impact
    if (project.donation1 && project.impact1 && currentAmount >= project.donation1) {
      impactAmount = Math.floor((currentAmount / project.donation1) * project.impact1);
    } else if (project.donation2 && project.impact2 && currentAmount >= project.donation2) {
      impactAmount = Math.floor((currentAmount / project.donation2) * project.impact2);
    } else if (project.donation3 && project.impact3 && currentAmount >= project.donation3) {
      impactAmount = Math.floor((currentAmount / project.donation3) * project.impact3);
    }
    
    if (impactAmount > 0) {
      return `Your $${currentAmount} donation will provide ${impactAmount} ${impactUnit}`;
    }
    
    return "";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="relative">
          <DialogTitle className="text-2xl font-bold text-center pr-8">
            {project ? `Support ${project.title}` : "Make a Donation"}
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 p-1 h-8 w-8"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-6">
          {/* Project Impact Preview */}
          {project && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Your Impact</h3>
              {currentAmount > 0 && (
                <div className="space-y-1">
                  <p className="text-blue-800 text-sm">
                    🎯 You'll earn {impactPoints.toLocaleString()} Impact Points
                  </p>
                  {getImpactDescription() && (
                    <p className="text-blue-800 text-sm">
                      🌟 {getImpactDescription()}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Preset Amount Buttons */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Choose an amount
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PRESET_AMOUNTS.map((amount) => (
                <Button
                  key={amount}
                  variant={selectedAmount === amount ? "default" : "outline"}
                  className="h-12 text-lg font-semibold"
                  onClick={() => handleAmountSelect(amount)}
                >
                  ${amount}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Amount Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Or enter a custom amount (minimum $5)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                $
              </span>
              <Input
                type="number"
                min="5"
                step="0.01"
                placeholder="0.00"
                value={customAmount}
                onChange={(e) => handleCustomAmountChange(e.target.value)}
                className="pl-8 h-12 text-lg"
              />
            </div>
          </div>

          {/* Total Display */}
          {currentAmount > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">Total Donation:</span>
                <span className="text-2xl font-bold text-primary">
                  ${currentAmount.toFixed(2)}
                </span>
              </div>
              {currentAmount >= 5 && (
                <p className="text-sm text-gray-600 mt-1">
                  You'll earn {impactPoints.toLocaleString()} Impact Points
                </p>
              )}
            </div>
          )}

          {/* Donate Button */}
          <Button
            className="w-full h-12 text-lg font-semibold"
            onClick={handleDonate}
            disabled={currentAmount < 5 || isLoading}
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Heart className="w-5 h-5" />
                <span>Donate ${currentAmount.toFixed(2)}</span>
              </div>
            )}
          </Button>

          {/* Security Notice */}
          <p className="text-xs text-gray-500 text-center">
            🔒 Secure payment powered by Stripe. Your card information is never stored on our servers.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}