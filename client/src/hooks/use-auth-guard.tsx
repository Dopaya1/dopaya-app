import { useAuth } from "@/hooks/use-auth";
import { useCallback } from "react";

interface DonationIntent {
  amount: number;
  projectId?: string | number;
  projectTitle?: string;
  context?: string;
}

export function useAuthGuard() {
  const { user } = useAuth();

  const guardDonation = useCallback((
    donationIntent: DonationIntent,
    onSuccess: () => void,
    onAuthRequired: () => void
  ) => {
    if (!user) {
      // Store donation intent in localStorage for after login
      localStorage.setItem('pendingDonation', JSON.stringify({
        ...donationIntent,
        timestamp: Date.now()
      }));
      
      onAuthRequired();
      return false;
    }
    
    onSuccess();
    return true;
  }, [user]);

  const getPendingDonation = useCallback((): DonationIntent | null => {
    try {
      const stored = localStorage.getItem('pendingDonation');
      if (!stored) return null;
      
      const parsed = JSON.parse(stored);
      
      // Check if it's not too old (15 minutes)
      if (Date.now() - parsed.timestamp > 15 * 60 * 1000) {
        localStorage.removeItem('pendingDonation');
        return null;
      }
      
      return parsed;
    } catch (error) {
      localStorage.removeItem('pendingDonation');
      return null;
    }
  }, []);

  const clearPendingDonation = useCallback(() => {
    localStorage.removeItem('pendingDonation');
  }, []);

  return {
    guardDonation,
    getPendingDonation,
    clearPendingDonation,
    isAuthenticated: !!user
  };
}