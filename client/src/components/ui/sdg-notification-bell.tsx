"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Bell, Target, Users, Globe, Heart, Zap, Shield } from "lucide-react";

interface SDGReason {
  id: number;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const sdgReasons: SDGReason[] = [
  {
    id: 1,
    title: "Sustainable Business Models",
    description: "Social enterprises use sustainable business models to create long-term impact, unlike traditional NGOs that often rely on recurring donations.",
    icon: Target,
  },
  {
    id: 2,
    title: "Community Empowerment",
    description: "They focus on empowering local communities and creating self-sustaining solutions that continue to benefit people long after initial support.",
    icon: Users,
  },
  {
    id: 3,
    title: "Environmental Impact",
    description: "Many social enterprises work directly towards UN Sustainable Development Goals, addressing climate change, clean water, and environmental protection.",
    icon: Globe,
  },
  {
    id: 4,
    title: "Social Innovation",
    description: "They develop innovative solutions to social problems, often creating new markets and opportunities for underserved communities.",
    icon: Zap,
  },
  {
    id: 5,
    title: "Measurable Impact",
    description: "Social enterprises provide clear, measurable impact metrics and transparent reporting on how your investment creates real change.",
    icon: Heart,
  },
  {
    id: 6,
    title: "Financial Sustainability",
    description: "They generate their own revenue streams, reducing dependence on donations and ensuring long-term viability of their impact work.",
    icon: Shield,
  },
];

interface SDGNotificationBellProps {
  className?: string;
}

export function SDGNotificationBell({ className }: SDGNotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = sdgReasons.length;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          size="icon" 
          variant="outline" 
          className={`relative ${className}`}
          aria-label="Why Social Enterprises?"
        >
          <Bell size={16} strokeWidth={2} aria-hidden="true" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 left-full min-w-5 -translate-x-1/2 px-1">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        {/* Header */}
        <div className="border-b px-4 py-3">
          <h3 className="font-semibold text-sm">Why Social Enterprises?</h3>
          <p className="text-xs text-muted-foreground mt-1">
            {unreadCount} reasons why we focus on social enterprises
          </p>
        </div>

        {/* Reasons List */}
        <div className="max-h-96 overflow-y-auto">
          {sdgReasons.map((reason, index) => {
            const Icon = reason.icon;
            return (
              <div
                key={reason.id}
                className="flex items-start gap-3 border-b px-4 py-4 last:border-b-0 hover:bg-accent/50 transition-colors"
              >
                <div className="mt-1 text-primary">
                  <Icon size={18} />
                </div>
                <div className="flex-1 space-y-1">
                  <h4 className="font-medium text-sm text-foreground">
                    {reason.title}
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {reason.description}
                  </p>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {index + 1}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="border-t px-4 py-3">
          <p className="text-xs text-muted-foreground text-center">
            Working towards UN Sustainable Development Goals
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}

