import { useEffect } from "react";
import { useLocation } from "wouter";

interface AuthRedirectProps {
  onOpenModal: (tab: "login" | "register") => void;
}

export function AuthRedirect({ onOpenModal }: AuthRedirectProps) {
  const [location, navigate] = useLocation();

  useEffect(() => {
    // Check if URL contains action=signup for registration
    const shouldShowRegister = window.location.href.includes('action=signup');
    
    // Open the appropriate modal tab
    onOpenModal(shouldShowRegister ? "register" : "login");
    
    // Redirect to home
    navigate("/");
  }, [onOpenModal, navigate]);

  return null; // This component doesn't render anything
}