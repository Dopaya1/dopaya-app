import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { UserImpact, Project } from "@shared/schema";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useI18n } from "@/lib/i18n/i18n-context";
import { formatNumber, formatCurrency } from "@/lib/i18n/formatters";
import { Share2, Info } from "lucide-react";
import { trackEvent } from "@/lib/simple-analytics";
import { useQuery } from "@tanstack/react-query";
import { calculateImpact } from "@/lib/impact-calculator";
import { getProjectImpactUnit, getProjectImpactNoun, getProjectImpactVerb } from "@/lib/i18n/project-content";
import { useState, useEffect } from "react";

interface ImpactStat {
  id: string;
  emoji: string;
  value: number;
  label: string;
  unit?: string;
  format: (val: number) => string;
}

interface ImpactSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  impact: UserImpact | undefined;
  onShareStat: (stat: ImpactStat) => void;
}

interface SupportedProjectWithDonations {
  project: Project;
  totalAmount: number;
  totalImpactPoints: number;
  donationCount: number;
  lastDonationDate: Date | null;
  donations: any[];
}

export function ImpactSummaryModal({ isOpen, onClose, impact, onShareStat }: ImpactSummaryModalProps) {
  const { t } = useTranslation();
  const { language } = useI18n();

  // Fetch supported projects with donations to calculate real impact
  const { data: supportedProjectsWithDonations, isLoading: isLoadingProjects, error: projectsError } = useQuery<SupportedProjectWithDonations[]>({
    queryKey: ["/api/user/supported-projects-with-donations"],
    enabled: isOpen && !!impact, // Only fetch when modal is open
  });

  // Debug logging
  useEffect(() => {
    if (isOpen) {
      console.log('[ImpactSummaryModal] Modal opened, checking data...');
      console.log('[ImpactSummaryModal] impact:', impact);
      console.log('[ImpactSummaryModal] supportedProjectsWithDonations:', supportedProjectsWithDonations);
      console.log('[ImpactSummaryModal] isLoadingProjects:', isLoadingProjects);
      console.log('[ImpactSummaryModal] projectsError:', projectsError);
    }
  }, [isOpen, supportedProjectsWithDonations, isLoadingProjects, projectsError, impact]);

  if (!impact) return null;

  // Calculate real impact from donations - grouped by unit with project context
  const calculateRealImpact = () => {
    if (!supportedProjectsWithDonations || supportedProjectsWithDonations.length === 0) {
      return [];
    }

    // Group impact by unit and collect project info for description
    const impactByUnit: Record<string, { 
      value: number; 
      unit: string;
      noun: string;
      verb: string;
      emoji: string;
    }> = {};

    supportedProjectsWithDonations.forEach((item) => {
      const { project, donations } = item;
      
      console.log('[ImpactSummaryModal] Processing project:', {
        projectTitle: project?.title,
        donationsCount: donations?.length,
        donations: donations,
        hasDonations: donations && donations.length > 0,
      });
      
      if (donations && donations.length > 0) {
        const unit = getProjectImpactUnit(project, language) || project.impactUnit || 'impact';
        const noun = getProjectImpactNoun(project, language) || unit;
        const verb = getProjectImpactVerb(project, language) || 'enabled';
        
        // Get emoji based on impact type (you can customize this)
        let emoji = '🌱'; // default
        const unitLower = unit.toLowerCase();
        const nounLower = noun.toLowerCase();
        if (unitLower.includes('wasser') || unitLower.includes('water') || unitLower.includes('liter')) {
          emoji = '💧';
        } else if (unitLower.includes('baum') || unitLower.includes('tree')) {
          emoji = '🌳';
        } else if (unitLower.includes('mahlzeit') || unitLower.includes('meal')) {
          emoji = '🍽️';
        } else if (nounLower.includes('sehkraft') || nounLower.includes('vision') || nounLower.includes('sight')) {
          emoji = '👁';
        } else if (unitLower.includes('mensch') || unitLower.includes('person') || unitLower.includes('people')) {
          emoji = '👥';
        } else if (unitLower.includes('kind') || unitLower.includes('child')) {
          emoji = '👶';
        } else if (unitLower.includes('bildung') || unitLower.includes('education') || unitLower.includes('schul')) {
          emoji = '📚';
        } else if (unitLower.includes('plastik') || unitLower.includes('plastic')) {
          emoji = '🌱';
        }
        
        donations.forEach((donation: any) => {
          // Only process real donations from database with valid amounts
          const donationAmount = donation.amount || 0;
          console.log('[ImpactSummaryModal] Processing donation:', {
            donationId: donation.id,
            donationAmount: donationAmount,
            hasId: !!donation.id,
            isValid: donationAmount > 0 && donation.id,
          });
          
          // Ensure we only count actual donations (amount > 0 and from database)
          if (donationAmount > 0 && donation.id) {
            const impactResult = calculateImpact(project, donationAmount);
            console.log('[ImpactSummaryModal] Impact result:', {
              impact: impactResult?.impact,
              unit: impactResult?.unit,
              isValid: impactResult && impactResult.impact > 0,
            });
            
            // Only add if impact calculation returned valid result
            if (impactResult && impactResult.impact > 0) {
              if (!impactByUnit[unit]) {
                impactByUnit[unit] = { 
                  value: 0, 
                  unit,
                  noun,
                  verb,
                  emoji
                };
              }
              impactByUnit[unit].value += impactResult.impact;
            }
          }
        });
      }
    });

    // Convert to array and format with descriptive text
    return Object.values(impactByUnit).map((item, index) => {
      const roundedValue = Math.round(item.value);
      const formattedValue = formatNumber(roundedValue);
      
      // Create compact label phrase based on impact type
      // Examples: "900 Menschen mit wiederhergestellter Sehkraft", "300 Monatszugänge zu sauberem Trinkwasser"
      let label = '';
      const unitLower = item.unit.toLowerCase();
      const nounLower = item.noun.toLowerCase();
      
      if (language === 'de') {
        // German formatting
        if (unitLower.includes('wasser') || unitLower.includes('water') || unitLower.includes('liter')) {
          label = `${formattedValue} Monatszugänge zu sauberem Trinkwasser`;
        } else if (unitLower.includes('mensch') || unitLower.includes('person') || unitLower.includes('people')) {
          if (nounLower.includes('sehkraft') || nounLower.includes('vision') || nounLower.includes('sight')) {
            label = `${formattedValue} Menschen mit wiederhergestellter Sehkraft`;
          } else {
            label = `${formattedValue} ${item.noun} unterstützt`;
          }
        } else if (unitLower.includes('bildung') || unitLower.includes('education') || unitLower.includes('schul')) {
          label = `${formattedValue} Schulwochen finanziert`;
        } else if (unitLower.includes('plastik') || unitLower.includes('plastic')) {
          label = `${formattedValue} kg Plastik recycelt`;
        } else {
          // Fallback: use verb
          label = `${formattedValue} ${item.noun} ${item.verb}`;
        }
      } else {
        // English formatting
        if (unitLower.includes('wasser') || unitLower.includes('water') || unitLower.includes('liter')) {
          label = `${formattedValue} monthly access to clean drinking water`;
        } else if (unitLower.includes('mensch') || unitLower.includes('person') || unitLower.includes('people')) {
          if (nounLower.includes('sehkraft') || nounLower.includes('vision') || nounLower.includes('sight')) {
            label = `${formattedValue} people with restored vision`;
          } else {
            label = `${formattedValue} ${item.noun} supported`;
          }
        } else if (unitLower.includes('bildung') || unitLower.includes('education') || unitLower.includes('schul')) {
          label = `${formattedValue} school weeks funded`;
        } else if (unitLower.includes('plastik') || unitLower.includes('plastic')) {
          label = `${formattedValue} kg plastic recycled`;
        } else {
          // Fallback: use verb
          label = `${formattedValue} ${item.noun} ${item.verb}`;
        }
      }
      
      return {
        id: `impact-${item.unit}-${index}`,
        emoji: item.emoji,
        value: roundedValue,
        label: label,
        unit: item.unit,
        format: (val: number) => `${formatNumber(val)} ${item.noun}`,
      };
    });
  };

  const realImpactStats = calculateRealImpact();
  const [showAll, setShowAll] = useState(false);
  const TOP_LIMIT = 3;

  // Debug logging for calculated stats
  useEffect(() => {
    if (isOpen && supportedProjectsWithDonations) {
      console.log('[ImpactSummaryModal] realImpactStats calculated:', realImpactStats);
      console.log('[ImpactSummaryModal] realImpactStats length:', realImpactStats.length);
      if (supportedProjectsWithDonations.length > 0) {
        console.log('[ImpactSummaryModal] First project with donations:', {
          project: supportedProjectsWithDonations[0].project?.title,
          donationsCount: supportedProjectsWithDonations[0].donations?.length,
          donations: supportedProjectsWithDonations[0].donations,
        });
      }
    }
  }, [isOpen, realImpactStats, supportedProjectsWithDonations]);

  // Only show real impact stats (no amount, no projects, no impact points)
  const stats: ImpactStat[] = realImpactStats;
  const displayedStats = showAll ? stats : stats.slice(0, TOP_LIMIT);
  const remainingCount = stats.length - TOP_LIMIT;

  const handleShareClick = (stat: ImpactStat) => {
    trackEvent('click_share', 'engagement', stat.id);
    onShareStat(stat);
  };

  const handleOpen = () => {
    trackEvent('open_impact_summary_modal', 'engagement', 'dashboard');
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
      } else {
        handleOpen();
      }
    }}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="pt-6">
          <SheetTitle className="text-2xl font-bold">
            {t("impactSummary.title")}
          </SheetTitle>
          <SheetDescription className="text-base mt-2">
            {t("impactSummary.subtitle")}
          </SheetDescription>
          <p className="text-sm text-gray-600 mt-3">
            {t("impactSummary.sharePrompt")}
          </p>
        </SheetHeader>
        
        <div className="mt-8 space-y-3">
          {isLoadingProjects ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500">Loading impact data...</p>
            </div>
          ) : projectsError ? (
            <div className="text-center py-8">
              <p className="text-sm text-red-500">Error loading impact data</p>
            </div>
          ) : displayedStats.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500">
                {supportedProjectsWithDonations && supportedProjectsWithDonations.length > 0
                  ? ""
                  : "No supported projects found. Support a project to see your impact here."}
              </p>
            </div>
          ) : (
            displayedStats.map((stat) => (
            <div
              key={stat.id}
              className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all bg-white"
            >
              {/* Left: Large number + Emoji */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-3xl" aria-hidden="true">
                  {stat.emoji}
                </span>
                <span className="text-2xl font-bold text-gray-900">
                  {formatNumber(stat.value)}
                </span>
              </div>
              
              {/* Middle: Compact label phrase */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-700 leading-tight">
                  {stat.label}
                </div>
              </div>
              
              {/* Right: Share button */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  onClick={() => handleShareClick(stat)}
                  className="bg-[#f2662d] hover:bg-[#d9551f] text-white"
                  size="sm"
                  aria-label={t("impactSummary.shareButton", { stat: stat.label })}
                >
                  {t("impactSummary.share")}
                </Button>
              </div>
            </div>
            ))
          )}
          
          {/* Show "more" button if there are more than TOP_LIMIT */}
          {!showAll && remainingCount > 0 && (
            <Button
              variant="outline"
              onClick={() => setShowAll(true)}
              className="w-full mt-4"
            >
              {t("impactSummary.showMore", { count: remainingCount })}
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

