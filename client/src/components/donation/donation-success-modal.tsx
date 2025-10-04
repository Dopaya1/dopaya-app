import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Heart, Sparkles } from "lucide-react";
import { useLocation } from "wouter";

interface DonationSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  impactPoints?: number;
}

export function DonationSuccessModal({ 
  isOpen, 
  onClose, 
  amount, 
  impactPoints = Math.floor(amount * 10) 
}: DonationSuccessModalProps) {
  const [, navigate] = useLocation();

  const handleViewDashboard = () => {
    onClose();
    navigate("/dashboard");
  };

  const handleContinueBrowsing = () => {
    onClose();
    navigate("/projects");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] text-center">
        <DialogHeader className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Thank You for Your Donation!
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-6 space-y-3">
            <div className="flex items-center justify-center gap-2 text-orange-600">
              <Heart className="w-5 h-5 fill-current" />
              <span className="font-semibold">Your Generous Contribution</span>
            </div>
            
            <div className="text-3xl font-bold text-gray-900">
              ${amount.toFixed(2)}
            </div>
            
            <div className="flex items-center justify-center gap-2 text-blue-600">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm">
                You've earned <strong>{impactPoints}</strong> Impact Points!
              </span>
            </div>
          </div>

          <div className="text-gray-600 space-y-2">
            <p>
              Your donation is making a real difference in communities around the world.
            </p>
            <p className="text-sm">
              You'll receive an email confirmation shortly with your donation receipt.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              onClick={handleViewDashboard}
              className="flex-1 bg-orange-600 hover:bg-orange-700"
            >
              View My Dashboard
            </Button>
            <Button 
              onClick={handleContinueBrowsing}
              variant="outline"
              className="flex-1"
            >
              Continue Browsing Projects
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}