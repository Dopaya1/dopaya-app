import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";
import { Project } from "@shared/schema";
import { trackDonation, trackWaitlistSignup } from "@/lib/simple-analytics";

interface DonationButtonProps {
  project?: Project;
  variant?: "default" | "outline" | "secondary";
  size?: "sm" | "default" | "lg";
  className?: string;
  children?: React.ReactNode;
  generalDonation?: boolean;
}

export function DonationButton({ 
  project, 
  variant = "default", 
  size = "default", 
  className = "",
  children,
  generalDonation = false
}: DonationButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => {
          trackDonation(project?.slug || 'general', 0);
          setIsDialogOpen(true);
        }}
        data-testid="button-support-project"
      >
        {children || (
          <>
            <Heart className="w-4 h-4 mr-2" />
            Donate Now
          </>
        )}
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">We're Almost There Yet...</DialogTitle>
            <DialogDescription className="text-center pt-4">
              We are launching soon! Join our waitlist....
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-col gap-3 pt-4">
            <Button 
              onClick={() => {
                trackWaitlistSignup(project?.slug || 'general');
                window.open("https://tally.so/r/m6MqAe", "_blank");
              }}
              className="w-full"
              data-testid="button-join-waitlist-dialog"
            >
              Join Our Waitlist
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
              className="w-full"
              data-testid="button-close-dialog"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}