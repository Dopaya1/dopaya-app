import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Menu, X, ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { AuthModal } from "@/components/auth/auth-modal";
import dopayaLogo from "@assets/Dopaya Logo.png";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showJoinDropdown, setShowJoinDropdown] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "register">("login");
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  const openAuthModal = (tab: "login" | "register") => {
    setAuthModalTab(tab);
    setShowAuthModal(true);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowJoinDropdown(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  const links = [
    { href: "/projects", label: "Social Enterprises" },
    { href: "/rewards", label: "Rewards" },
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact" },
  ];
  
  const joinUsLinks = [
    { href: "/brands", label: "For Brands" },
    { href: "/social-enterprises", label: "For Social Enterprises" },
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
            <Link href="/" className="flex-shrink-0 flex items-center">
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
              {/* Join Us Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  className={`flex items-center px-3 py-2 text-sm font-medium ${
                    isActive("/brands") || isActive("/social-enterprises")
                      ? "text-primary"
                      : "text-dark hover:text-primary"
                  }`}
                  onClick={() => setShowJoinDropdown(!showJoinDropdown)}
                  onMouseEnter={() => setShowJoinDropdown(true)}
                >
                  Join Us
                  <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${showJoinDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {/* Dropdown Menu */}
                {showJoinDropdown && (
                  <div 
                    className="absolute mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                    onMouseLeave={() => setShowJoinDropdown(false)}
                  >
                    <div className="py-1">
                      {joinUsLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className={`block px-4 py-2 text-sm ${
                            isActive(link.href)
                              ? "bg-gray-100 text-primary"
                              : "text-gray-700 hover:bg-gray-100 hover:text-primary"
                          }`}
                          onClick={() => setShowJoinDropdown(false)}
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 text-sm font-medium ${
                    isActive(link.href)
                      ? "text-primary"
                      : "text-dark hover:text-primary"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          
          <div className="hidden md:flex items-center">
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
                <button 
                  onClick={() => openAuthModal("login")}
                  className="text-dark hover:text-primary px-4 py-2 text-sm font-medium"
                >
                  Log In
                </button>
                <Button 
                  onClick={() => openAuthModal("register")}
                  className="ml-3"
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
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
          {/* Join Us section in mobile menu */}
          <div className="border-b border-gray-200 pb-2 mb-2">
            <div className="px-3 py-2 text-base font-medium text-gray-900">Join Us</div>
            {joinUsLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-3 py-2 pl-6 rounded-md text-sm font-medium ${
                  isActive(link.href)
                    ? "text-primary"
                    : "text-gray-600 hover:text-primary"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
          
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
              <>
                <button
                  onClick={() => {
                    openAuthModal("login");
                    setIsMenuOpen(false);
                  }}
                  className="block px-3 py-2 rounded-md text-base font-medium text-dark hover:text-primary"
                >
                  Log In
                </button>
                <button
                  onClick={() => {
                    openAuthModal("register");
                    setIsMenuOpen(false);
                  }}
                  className="block px-3 py-2 rounded-md text-base font-medium text-white bg-primary hover:bg-primary/90"
                >
                  Sign Up
                </button>
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
