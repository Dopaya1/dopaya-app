import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export function SignupCTA() {
  const { user } = useAuth();

  return (
    <section className="bg-primary py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white font-heading">Join the movement — Get early access</h2>
          <p className="mt-4 max-w-2xl mx-auto text-white/80">
            Be among the first to support impactful projects and earn exclusive rewards.
          </p>
          <div className="mt-8 flex justify-center">
            {user ? (
              <Link href="/projects">
                <Button className="bg-white text-primary hover:bg-gray-100">
                  Explore Projects
                </Button>
              </Link>
            ) : (
              <a href="https://tally.so/r/m6MqAe" target="_blank" rel="noopener noreferrer">
                <Button className="bg-white text-primary hover:bg-gray-100">
                  Get on the Waitlist
                </Button>
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
