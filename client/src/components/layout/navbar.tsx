import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { AuthModal } from "@/components/auth/auth-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import dopayaLogo from "@assets/Dopaya Logo.png";
import { trackEvent } from "@/lib/simple-analytics";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "register">("login");
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

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
                <Link href="/dashboard" className="text-dark hover:text-primary px-4 py-2 text-sm font-medium">
                  Dashboard
                </Link>
                <Button 
                  onClick={handleLogout} 
                  variant="outline" 
                  className="ml-3"
                  disabled={logoutMutation.isPending}
                >
                  {logoutMutation.isPending ? "Logging Out..." : "Log Out"}
                </Button>
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
                    <div className="grid grid-cols-2 gap-0">
                      <div className="p-4 hover:bg-[#f8f6f1] transition-colors">
                        <Link href="/brands" className="block">
                          <div className="font-semibold text-base text-gray-900 mb-2">As Brand</div>
                          <div className="text-sm text-gray-600 leading-relaxed">Partner with us to reach conscious consumers and build brand loyalty through impact</div>
                        </Link>
                      </div>
                      <div className="p-4 hover:bg-[#f8f6f1] transition-colors">
                        <Link href="/social-enterprises" className="block">
                          <div className="font-semibold text-base text-gray-900 mb-2">As Social Enterprise</div>
                          <div className="text-sm text-gray-600 leading-relaxed">Get funding from supporters who understand your value and mission</div>
                        </Link>
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button 
                  onClick={() => window.open("https://tally.so/r/m6MqAe", "_blank")}
                  data-testid="button-waitlist"
                >
                  Join Waitlist
                </Button>
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
              href="/brands"
              className="block px-3 py-2 rounded-md text-base font-medium text-dark hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              As Brand
            </Link>
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
                <Link
                  href="/dashboard"
                  className="block px-3 py-2 rounded-md text-base font-medium text-dark hover:text-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
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
