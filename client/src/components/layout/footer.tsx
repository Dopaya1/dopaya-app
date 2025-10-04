import { Link } from "wouter";
import dopayaLogo from "@assets/Dopaya Logo.png";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and description */}
          <div>
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <img 
                  src={dopayaLogo} 
                  alt="Dopaya - Social Impact Platform Logo" 
                  className="h-6 w-auto" 
                />
              </Link>
            </div>
            <p className="mt-4 text-sm text-gray-300">
              A platform connecting donors with high-impact social enterprises to create real-world change.
            </p>

          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4 font-heading">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/projects" className="text-gray-300 hover:text-white">Social Projects</Link>
              </li>
              <li>
                <Link href="/rewards" className="text-gray-300 hover:text-white">Rewards</Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-300 hover:text-white">About Us</Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-white">Contact</Link>
              </li>
            </ul>
          </div>

          {/* For Project Owners */}
          <div>
            <h3 className="text-lg font-bold mb-4 font-heading">For Project Owners</h3>
            <ul className="space-y-2">
              <li>
                <a href="https://tally.so/r/3EM0vA" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white">Submit a Project</a>
              </li>
              <li>
                <Link href="/eligibility" className="text-gray-300 hover:text-white">Eligibility Guidelines</Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-300 hover:text-white">FAQ</Link>
              </li>

            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-bold mb-4 font-heading">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/terms" className="text-gray-300 hover:text-white">Terms of Service</Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-300 hover:text-white">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/cookies" className="text-gray-300 hover:text-white">Cookie Policy</Link>
              </li>

            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400">&copy; {new Date().getFullYear()} Dopaya. All rights reserved.</p>

        </div>
      </div>
    </footer>
  );
}
