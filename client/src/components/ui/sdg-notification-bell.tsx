"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Bell, Target, Users, Globe, Heart, Zap, Shield } from "lucide-react";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useI18n } from "@/lib/i18n/i18n-context";
import { translations } from "@/lib/i18n/translations";

interface SDGReason {
  id: number;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

// Icon mapping für die Gründe
const iconMap = [Target, Users, Globe, Zap, Heart, Shield];

interface SDGNotificationBellProps {
  className?: string;
}

export function SDGNotificationBell({ className }: SDGNotificationBellProps) {
  const { t } = useTranslation();
  const { language } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  
  // Lade die Gründe aus den Übersetzungen
  const sdgReasons = translations[language].homeSections.caseStudy.sdgBell.reasons.map((reason, index) => ({
    id: index + 1,
    title: reason.title,
    description: reason.description,
    icon: iconMap[index] || Target,
  }));
  
  const unreadCount = sdgReasons.length;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          size="icon" 
          variant="outline" 
          className={`relative ${className}`}
          aria-label={t("homeSections.caseStudy.sdgBell.title")}
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
          <h3 className="font-semibold text-sm">{t("homeSections.caseStudy.sdgBell.title")}</h3>
          <p className="text-xs text-muted-foreground mt-1">
            {t("homeSections.caseStudy.sdgBell.subtitle", { count: unreadCount })}
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
            {t("homeSections.caseStudy.sdgBell.footer")}
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}

