import { Shield, CheckCircle, Award } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrustBadgeProps {
  type: "verified" | "featured" | "certified";
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function TrustBadge({ type, className, size = "md" }: TrustBadgeProps) {
  const badges = {
    verified: {
      icon: CheckCircle,
      text: "Verified by Dopaya",
      bgColor: "bg-green-50",
      textColor: "text-green-700",
      borderColor: "border-green-200",
      iconColor: "text-green-600"
    },
    featured: {
      icon: Award,
      text: "Featured Partner",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700", 
      borderColor: "border-blue-200",
      iconColor: "text-blue-600"
    },
    certified: {
      icon: Shield,
      text: "Impact Certified",
      bgColor: "bg-purple-50",
      textColor: "text-purple-700",
      borderColor: "border-purple-200", 
      iconColor: "text-purple-600"
    }
  };

  const badge = badges[type];
  const Icon = badge.icon;

  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base"
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4", 
    lg: "h-5 w-5"
  };

  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 rounded-full border font-medium",
      badge.bgColor,
      badge.textColor,
      badge.borderColor,
      sizeClasses[size],
      className
    )}>
      <Icon className={cn(badge.iconColor, iconSizes[size])} />
      <span>{badge.text}</span>
    </div>
  );
}