import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { DonationModal } from "./donation-modal";
import { Project } from "@shared/schema";

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
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => setIsModalOpen(true)}
      >
        {children || (
          <>
            <Heart className="w-4 h-4 mr-2" />
            Donate Now
          </>
        )}
      </Button>

      <DonationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        project={project}
        generalDonation={generalDonation}
      />
    </>
  );
}