import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown, Star, TrendingUp } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { AuthModal } from "@/components/auth/auth-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import { UserImpact } from "@shared/schema";
// getUserLevel removed - using simple two-status system instead
import dopayaLogo from "@assets/Dopaya Logo.png";
import { trackEvent } from "@/lib/simple-analytics";
import { isOnboardingPreviewEnabled } from "@/lib/feature-flags";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "register">("login");
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const previewEnabled = isOnboardingPreviewEnabled();
  
  // Fetch user impact data for rank display
  const { data: impact, error: impactError } = useQuery<UserImpact>({
    queryKey: ["/api/user/impact"],
    enabled: !!user && previewEnabled,
  });
  
  // Safety check: if query failed, impact could be an error object
  const safeImpact = impactError ? undefined : impact;
  
  const impactPoints = safeImpact?.impactPoints ?? 0;
  const userStatus = safeImpact?.userStatus || "aspirer";
  
  // Simple two-status system
  const statusDisplayName = userStatus === "supporter" ? "Impact Supporter" : "Impact Aspirer";
  
  // For Impact Aspirers, show progress to first reward unlock (100 points)
  // For Supporters, no progress bar needed (rewards already unlocked)
  const showProgress = userStatus === "aspirer";
  const nextThreshold = 100; // First reward unlock at 100 points
  const progress = Math.min(100, Math.round((impactPoints / nextThreshold) * 100));

  const openAuthModal = (tab: "login" | "register") => {
    setAuthModalTab(tab);
    setShowAuthModal(true);
  };

  const links = [
    { href: "/projects", label: "Social Enterprises" },
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact" },
  ];

  const isActive = (path: string) => {
    // Get the path part without the hash
    const pathWithoutHash = path.split('#')[0];
    return location === pathWithoutHash;
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link 
              href="/" 
              className="flex-shrink-0 flex items-center"
                  onClick={() => trackEvent('logo_click', 'navigation', 'home')}
            >
              <img 
                src={dopayaLogo} 
                alt="Dopaya - Social Impact Platform Logo" 
                className="h-6 w-auto" 
              />
              <span className="sr-only">DOPAYA</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center justify-center flex-1">
            <div className="flex space-x-6">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 text-sm font-medium ${
                    isActive(link.href)
                      ? "text-primary"
                      : "text-dark hover:text-primary"
                  }`}
                  onClick={() => trackEvent('nav_link_click', 'navigation', link.label)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <>
                {/* Rank Display (preview only) */}
                {previewEnabled && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 hover:border-orange-300 transition-all">
                        <Star className="w-4 h-4 text-[#f2662d]" />
                        <span className="text-sm font-semibold text-gray-900">{statusDisplayName}</span>
                        <ChevronDown className="w-3 h-3 text-gray-500" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64 p-4">
                      <div className="space-y-3">
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <Star className="w-5 h-5 text-[#f2662d]" />
                            <h4 className="font-semibold text-gray-900">{statusDisplayName}</h4>
                          </div>
                          <p className="text-sm text-gray-600">
                            {impactPoints.toLocaleString()} Impact Points
                          </p>
                        </div>
                        
                        {showProgress && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs text-gray-600">
                              <span>Progress to unlock rewards</span>
                              <span className="font-medium">{progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-[#f2662d] to-yellow-400 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <p className="text-xs text-center text-gray-500">
                              {nextThreshold - impactPoints} IP to unlock rewards
                            </p>
                          </div>
                        )}
                        
                        <div className="pt-3 border-t space-y-2">
                          <Link 
                            href="/dashboard" 
                            className="block w-full text-sm font-semibold text-[#f2662d] bg-orange-50 hover:bg-orange-100 text-center rounded-full px-3 py-2 transition-colors"
                          >
                            View full impact dashboard
                          </Link>
                          <Link 
                            href="/rewards" 
                            className="block w-full text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 text-center rounded-full px-3 py-2 transition-colors"
                          >
                            Redeem rewards
                </Link>
                          <button
                            type="button"
                  onClick={handleLogout} 
                            className="mt-2 w-full text-xs text-gray-500 hover:text-gray-800 pt-2 border-t border-gray-100"
                  disabled={logoutMutation.isPending}
                >
                            {logoutMutation.isPending ? "Logging out…" : "Log out"}
                          </button>
                        </div>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </>
            ) : (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="text-dark hover:text-primary px-3 py-2 text-sm font-medium">
                      Join us
                      <ChevronDown className="ml-1 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-96 p-0">
                    <div className="grid grid-cols-1 gap-0">
                      <div className="p-4 hover:bg-[#f8f6f1] transition-colors">
                        <Link href="/social-enterprises" className="block">
                          <div className="font-semibold text-base text-gray-900 mb-2">As Social Enterprise</div>
                          <div className="text-sm text-gray-600 leading-relaxed">Get funding from supporters who understand your value and mission</div>
                        </Link>
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
                {previewEnabled ? (
                  <Button 
                    onClick={() => openAuthModal("login")}
                    data-testid="button-login-preview"
                  >
                    Log In
                  </Button>
                ) : (
                <Button 
                  onClick={() => window.open("https://tally.so/r/m6MqAe", "_blank")}
                  data-testid="button-waitlist"
                >
                  Join Waitlist
                </Button>
                )}
              </>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Button variant="ghost" onClick={toggleMenu} aria-expanded={isMenuOpen} aria-controls="mobile-menu">
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className={`md:hidden ${isMenuOpen ? "block" : "hidden"}`} id="mobile-menu">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive(link.href)
                  ? "text-primary"
                  : "text-dark hover:text-primary"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {/* Mobile Join us options */}
          <div className="px-3 py-2">
            <div className="text-sm font-medium text-gray-500 mb-2">Join us</div>
            <Link
              href="/social-enterprises"
              className="block px-3 py-2 rounded-md text-base font-medium text-dark hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              As Social Enterprise
            </Link>
          </div>
        </div>
        <div className="pt-4 pb-3 border-t border-gray-200">
          <div className="px-2 space-y-1">
            {user ? (
              <>
                {previewEnabled && (
                  <div className="px-3 py-3 mb-3 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-[#f2662d]" />
                        <span className="text-sm font-semibold text-gray-900">{statusDisplayName}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-600">
                        {impactPoints.toLocaleString()} IP
                      </span>
                    </div>
                    {showProgress && (
                      <div className="space-y-1">
                        <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-[#f2662d] to-yellow-400 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500">
                          {nextThreshold - impactPoints} IP to unlock rewards
                        </p>
                      </div>
                    )}
                  </div>
                )}
                
                <Link
                  href="/dashboard"
                  className="block px-3 py-2 rounded-md text-base font-medium text-dark hover:text-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                {previewEnabled && (
                  <Link
                    href="/rewards"
                    className="block px-3 py-2 rounded-md text-base font-medium text-dark hover:text-primary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Rewards
                  </Link>
                )}
                <Button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2"
                  disabled={logoutMutation.isPending}
                >
                  {logoutMutation.isPending ? "Logging Out..." : "Log Out"}
                </Button>
              </>
            ) : (
              <>
                {previewEnabled ? (
                  <button
                    onClick={() => {
                      openAuthModal("login");
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white bg-primary hover:bg-primary/90"
                    data-testid="button-login-mobile-preview"
                  >
                    Log In
                  </button>
            ) : (
              <button
                onClick={() => {
                  window.open("https://tally.so/r/m6MqAe", "_blank");
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white bg-primary hover:bg-primary/90"
                data-testid="button-waitlist-mobile"
              >
                Join Waitlist
              </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        defaultTab={authModalTab}
      />
    </nav>
  );
}
