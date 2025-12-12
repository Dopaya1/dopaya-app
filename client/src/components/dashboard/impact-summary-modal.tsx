import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { UserImpact, Project } from "@shared/schema";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useI18n } from "@/lib/i18n/i18n-context";
import { formatNumber, formatCurrency } from "@/lib/i18n/formatters";
import { Share2, Info } from "lucide-react";
import { trackEvent } from "@/lib/simple-analytics";
import { useQuery } from "@tanstack/react-query";
import { calculateImpactUnified } from "@/lib/impact-calculator";
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

  // Calculate real impact from donations - grouped by PROJECT (each project gets separate entry)
  const calculateRealImpact = () => {
    if (!supportedProjectsWithDonations || supportedProjectsWithDonations.length === 0) {
      return [];
    }

    // Group impact by PROJECT (not by unit) - each project gets its own entry
    // NEW: Use snapshots from donations, fallback to calculation
    const impactByProject: Array<{ 
      projectId: number;
      projectTitle: string;
      value: number; 
      unit: string;
      noun: string;
      verb: string;
      emoji: string;
      generatedText?: string; // Store generated text from snapshot for sharing
    }> = [];

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
        
        // Sum impact for this project and collect generated text
        let projectTotalImpact = 0;
        let projectGeneratedText: string | undefined;
        
        donations.forEach((donation: any) => {
          // Only process real donations from database with valid amounts
          const donationAmount = donation.amount || 0;
          console.log('[ImpactSummaryModal] Processing donation:', {
            donationId: donation.id,
            donationAmount: donationAmount,
            hasId: !!donation.id,
            isValid: donationAmount > 0 && donation.id,
            hasCalculatedImpact: donation.calculated_impact != null,
            hasGeneratedText: !!(donation.generated_text_past_en || donation.generated_text_past_de),
          });
          
          // Ensure we only count actual donations (amount > 0 and from database)
          if (donationAmount > 0 && donation.id) {
            let calculatedImpact: number;
            let generatedText: string | undefined;
            
            // Priority 1: Use calculated_impact from snapshot (new donations)
            if (donation.calculated_impact != null) {
              calculatedImpact = Number(donation.calculated_impact);
              // Also try to get generated text from snapshot
              generatedText = language === 'de' 
                ? (donation.generated_text_past_de || donation.generated_text_past_en)
                : (donation.generated_text_past_en || donation.generated_text_past_de);
            } 
            // Priority 2: Fallback to calculateImpactUnified (old donations or new without snapshot)
            else {
              const impactResult = calculateImpactUnified(project, donationAmount, language === 'de' ? 'de' : 'en');
              calculatedImpact = impactResult.impact;
            }
            
            console.log('[ImpactSummaryModal] Impact result:', {
              calculatedImpact,
              unit,
              generatedText: generatedText?.substring(0, 50),
            });
            
            // Only add if impact calculation returned valid result
            if (calculatedImpact > 0) {
              projectTotalImpact += calculatedImpact;
              // Store generated text if available (use the first one found)
              if (generatedText && !projectGeneratedText) {
                projectGeneratedText = generatedText;
              }
            }
          }
        });
        
        // Get emoji based on impact type - improved detection
        // Check generated text first (has most context), then unit/noun, then category
        let emoji = '🌱'; // default
        const unitLower = unit.toLowerCase();
        const nounLower = noun.toLowerCase();
        const categoryLower = (project.category || '').toLowerCase();
        const generatedTextLower = (projectGeneratedText || '').toLowerCase();
        
        const allText = `${generatedTextLower} ${unitLower} ${nounLower} ${categoryLower}`;
        
        // Priority detection based on impact type (most specific first)
        if (allText.includes('vision') || allText.includes('sight') || allText.includes('sehkraft') || nounLower.includes('vision') || nounLower.includes('sight')) {
          emoji = '👁';
        } else if (allText.includes('child') || allText.includes('kind') || unitLower.includes('child') || nounLower.includes('child') || allText.includes('educat')) {
          emoji = '👶';
        } else if (allText.includes('wasser') || allText.includes('water') || allText.includes('drinking') || unitLower.includes('water') || unitLower.includes('liter')) {
          emoji = '💧';
        } else if (allText.includes('tree') || allText.includes('baum') || unitLower.includes('tree')) {
          emoji = '🌳';
        } else if (allText.includes('meal') || allText.includes('mahlzeit') || allText.includes('food')) {
          emoji = '🍽️';
        } else if (allText.includes('tea') || allText.includes('farmer') || allText.includes('agriculture')) {
          emoji = '🌿';
        } else if (allText.includes('education') || allText.includes('bildung') || allText.includes('schul') || categoryLower === 'education') {
          emoji = '📚';
        } else if (allText.includes('plastic') || allText.includes('plastik') || allText.includes('recycl')) {
          emoji = '♻️';
        } else if (allText.includes('health') || categoryLower === 'health') {
          emoji = '🏥';
        } else if (allText.includes('women') || allText.includes('empowerment') || categoryLower.includes('women')) {
          emoji = '👩';
        } else if (allText.includes('energy') || categoryLower === 'energy') {
          emoji = '⚡';
        } else if (allText.includes('finance') || categoryLower === 'finance') {
          emoji = '💰';
        } else if (allText.includes('housing') || categoryLower === 'housing') {
          emoji = '🏠';
        } else if (allText.includes('sanitation') || categoryLower === 'sanitation') {
          emoji = '🚿';
        } else if (allText.includes('technology') || categoryLower === 'technology') {
          emoji = '💻';
        } else if (allText.includes('conservation') || categoryLower === 'conservation') {
          emoji = '🌍';
        } else if (allText.includes('environment') || categoryLower === 'environment') {
          emoji = '🌱';
        } else if (unitLower.includes('mensch') || unitLower.includes('person') || unitLower.includes('people')) {
          emoji = '👥';
        }
        
        // Add this project's impact as a separate entry
        if (projectTotalImpact > 0) {
          impactByProject.push({
            projectId: project.id,
            projectTitle: project.title,
            value: projectTotalImpact,
            unit,
            noun,
            verb,
            emoji,
            generatedText: projectGeneratedText
          });
        }
      }
    });

    // Convert to array and format with descriptive text (label ohne doppelte Zahl)
    return impactByProject.map((item, index) => {
      const roundedValue = Math.round(item.value);
      const formattedValue = formatNumber(roundedValue);
      
      // Priority 1: Use generated text from snapshot if available (ohne Zahl, Zahl steht links)
      let label = '';
      if (item.generatedText) {
        // Extract impact value from generated text and replace with aggregated value
        // Format: "{impact} {unit} {freitext}" -> "{unit} {freitext}" (ohne Zahl)
        const textMatch = item.generatedText.match(/^(\d+(?:\.\d+)?)\s+([^\s]+)\s+(.+)$/);
        if (textMatch) {
          const unitWord = textMatch[2];
          const freitext = textMatch[3];
          const freitextLower = freitext.toLowerCase();
          // Wenn Freitext schon mit Unit/people startet, keine Unit doppeln
          if (freitextLower.startsWith(unitWord.toLowerCase()) || freitextLower.startsWith('people')) {
            label = freitext;
          } else {
            label = `${unitWord} ${freitext}`;
          }
        } else {
          // Fallback: Zahl entfernen falls führend
          const withoutNumber = item.generatedText.replace(/^\d+(?:\.\d+)?\s+/, '');
          label = withoutNumber;
        }
      } 
      // Priority 2: Fallback to manual label generation (old system)
      else {
        const unitLower = item.unit.toLowerCase();
        const nounLower = item.noun.toLowerCase();
        
        if (language === 'de') {
          // German formatting (ohne Zahl)
          if (unitLower.includes('wasser') || unitLower.includes('water') || unitLower.includes('liter')) {
            label = `Monatszugänge zu sauberem Trinkwasser`;
          } else if (unitLower.includes('mensch') || unitLower.includes('person') || unitLower.includes('people')) {
            if (nounLower.includes('sehkraft') || nounLower.includes('vision') || nounLower.includes('sight')) {
              label = `Menschen mit wiederhergestellter Sehkraft`;
            } else {
              label = `${item.noun} unterstützt`;
            }
          } else if (unitLower.includes('bildung') || unitLower.includes('education') || unitLower.includes('schul')) {
            label = `Schulwochen finanziert`;
          } else if (unitLower.includes('plastik') || unitLower.includes('plastic')) {
            label = `kg Plastik recycelt`;
          } else {
            // Fallback: use verb
            label = `${item.noun} ${item.verb}`;
          }
        } else {
          // English formatting (ohne Zahl)
          if (unitLower.includes('wasser') || unitLower.includes('water') || unitLower.includes('liter')) {
            label = `monthly access to clean drinking water`;
          } else if (unitLower.includes('mensch') || unitLower.includes('person') || unitLower.includes('people')) {
            if (nounLower.includes('sehkraft') || nounLower.includes('vision') || nounLower.includes('sight')) {
              label = `people with restored vision`;
            } else {
              label = `${item.noun} supported`;
            }
          } else if (unitLower.includes('bildung') || unitLower.includes('education') || unitLower.includes('schul')) {
            label = `school weeks funded`;
          } else if (unitLower.includes('plastik') || unitLower.includes('plastic')) {
            label = `kg plastic recycled`;
          } else {
            // Fallback: use verb
            label = `${item.noun} ${item.verb}`;
          }
        }
      }
      
      return {
        id: `impact-project-${item.projectId}-${index}`,
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

