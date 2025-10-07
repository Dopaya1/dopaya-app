import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Award, TrendingUp, Heart, ArrowRight } from "lucide-react";

export function CommunityInvitationCTA() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log("Email submitted:", email);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <section className="py-16" style={{ backgroundColor: 'var(--text-primary)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
            <div className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-6 flex items-center justify-center">
              <Heart className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Welcome to the Founding Community!
            </h2>
            <p className="text-xl text-gray-200 mb-6">
              You're now part of something meaningful. We'll be in touch soon with your founding member benefits 
              and exclusive early access details.
            </p>
            <p className="text-gray-300">
              Check your email for next steps and community access information.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16" style={{ backgroundColor: 'var(--text-primary)' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-white mb-4">
            Join the Founding Community
          </h2>
          <p className="text-xl text-gray-200 max-w-2xl mx-auto">
            Ready to start creating impact? Be part of the founding community that's changing 
            how we support sustainable solutions.
          </p>
        </div>

        {/* Benefits Preview */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <Award className="h-8 w-8 text-yellow-400 mx-auto mb-3" />
            <h3 className="font-semibold text-white mb-2">50 Impact Points</h3>
            <p className="text-sm text-gray-300">Start with bonus points (no monetary commitment required)</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <Users className="h-8 w-8 text-blue-400 mx-auto mb-3" />
            <h3 className="font-semibold text-white mb-2">Founding Member Status</h3>
            <p className="text-sm text-gray-300">Lifetime recognition and early adopter benefits</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <TrendingUp className="h-8 w-8 text-green-400 mx-auto mb-3" />
            <h3 className="font-semibold text-white mb-2">Early Access</h3>
            <p className="text-sm text-gray-300">First access to new features and exclusive experiences</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <Heart className="h-8 w-8 text-red-400 mx-auto mb-3" />
            <h3 className="font-semibold text-white mb-2">Impact Community</h3>
            <p className="text-sm text-gray-300">Connect with other changemakers and social enterprise founders</p>
          </div>
        </div>

        {/* Join Form */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-2">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                required
                className="bg-white/20 border-white/30 text-white placeholder-gray-300 focus:border-white/50 focus:ring-white/25"
              />
            </div>

            <Button 
              type="submit"
              size="lg"
              className="w-full bg-[#e94e35] hover:bg-[#cc4530] text-white font-semibold py-4 text-lg"
            >
              Join the Founding Community
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/20">
            <p className="text-sm text-gray-300 leading-relaxed">
              By joining, you'll be among the first to access our platform when we launch. 
              You'll receive your founding member benefits, connect with verified social enterprises, 
              and start creating measurable impact while unlocking exclusive community rewards.
            </p>
          </div>
        </div>

        {/* Natural Social Sharing Context */}
        <div className="mt-10 pt-8 border-t border-white/20">
          <p className="text-gray-300 mb-4">
            Know someone who cares about sustainable impact?
          </p>
          <div className="flex justify-center space-x-4">
            <Button 
              variant="outline" 
              size="sm"
              className="border-white/30 text-white hover:bg-white/10"
              onClick={() => navigator.share?.({ 
                title: 'Join Dopaya Founding Community', 
                text: 'Creating impact through social enterprises + exclusive community rewards',
                url: window.location.href 
              })}
            >
              Share with Friends
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}