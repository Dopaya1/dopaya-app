import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { TYPOGRAPHY } from "@/constants/typography";
import { BRAND_COLORS } from "@/constants/colors";

export function FoundingMemberCTA() {
  return (
    <section className="py-24" style={{ backgroundColor: BRAND_COLORS.primaryOrange }}>
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 
            className={`${TYPOGRAPHY.section} mb-4 text-white`}
            style={{ fontFamily: "'Satoshi', 'Inter', system-ui, sans-serif" }}
          >
            Join our community as an early backer
          </h2>
          
          <p className="text-lg md:text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            Be among the first supporters to shape the future of impact investing
          </p>
          
          
          {/* Benefits Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-8 max-w-4xl mx-auto">
            <div className="bg-white/10 p-4 rounded-lg">
              <h3 className="font-semibold mb-2 text-white">Immediate Benefits</h3>
              <ul className="text-sm text-white/80 space-y-1">
                <li>• 50 Impact Points ($5 value)</li>
                <li>• Founding Member status forever</li>
                <li>• Early access to new features</li>
              </ul>
            </div>
            
            <div className="bg-white/10 p-4 rounded-lg">
              <h3 className="font-semibold mb-2 text-white">Community Access</h3>
              <ul className="text-sm text-white/80 space-y-1">
                <li>• Exclusive founder dinners</li>
                <li>• Direct input on platform direction</li>
                <li>• Connect with other changemakers</li>
              </ul>
            </div>
          </div>
          
          <Button 
            size="lg" 
            className="bg-white text-orange-600 hover:bg-gray-50 px-8 py-4 text-lg font-medium"
            asChild
          >
            <a href="https://tally.so/r/m6MqAe" target="_blank" rel="noopener noreferrer">
              Join Waitlist
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </Button>
          
          <p className="text-sm text-white/70 mt-4">
            Limited availability • No costs • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
}
