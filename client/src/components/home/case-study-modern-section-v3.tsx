import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Project } from "@shared/schema";
import { TYPOGRAPHY } from "@/constants/typography";
import { BRAND_COLORS } from "@/constants/colors";
import ExpandableGallery from "@/components/ui/gallery-animation";
import { LanguageLink } from "@/components/ui/language-link";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ChevronDown, Target, GraduationCap, Droplets, Leaf, Wind, Heart, Users } from "lucide-react";
import sdgWheelImg from "@assets/sdg wheel.png";
import { SDGNotificationBell } from "@/components/ui/sdg-notification-bell";
import { getProjectImageUrl } from "@/lib/image-utils";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useI18n } from "@/lib/i18n/i18n-context";
import { getProjectImpactUnit, getProjectImpactNoun, getProjectImpactVerb, getProjectMissionStatement, getProjectDescription } from "@/lib/i18n/project-content";
import { isOnboardingPreviewEnabled } from "@/lib/feature-flags";
import { useLocation } from "wouter";
import { calculateImpactUnified, generateCtaText } from "@/lib/impact-calculator";

export function CaseStudyModernSectionV3() {
  const { t } = useTranslation();
  const { language } = useI18n();
  const [, navigate] = useLocation();
  const previewEnabled = isOnboardingPreviewEnabled();
  const [selectedProject, setSelectedProject] = React.useState<Project | null>(null);
  const [donationAmount, setDonationAmount] = React.useState(0);
  const [showDonationDropdown, setShowDonationDropdown] = React.useState(false);
  const [showWaitlistDialog, setShowWaitlistDialog] = React.useState(false);
  const initializedRef = React.useRef<string | number | null>(null);

  // Featured projects for case study section (up to 3, plus "All Projects" box)
  // Fetch latest featured projects ordered by creation date
  // Exclude Universal Fund projects
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["projects-case-study-modern-v3-latest"],
    queryFn: async () => {
      // Try with created_at first (snake_case)
      let { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('status', 'active')
        .eq('featured', true)
        .order('created_at', { ascending: false })
        .limit(10); // Fetch more to ensure we have enough after filtering
      
      // If that fails, try with createdAt (camelCase)
      if (error) {
        console.warn('Error with created_at, trying createdAt:', error);
        const result = await supabase
          .from('projects')
          .select('*')
          .eq('status', 'active')
          .eq('featured', true)
          .order('createdAt', { ascending: false })
          .limit(10);
        data = result.data;
        error = result.error;
      }
      
      if (error) {
        console.error('Error fetching featured projects:', error);
        // Return empty array instead of throwing to prevent breaking the UI
        return [];
      }
      
      // Client-side filter to exclude Universal Fund projects
      // Check both camelCase and snake_case variants
      const filtered = (data || []).filter((project: any) => {
        const isUniversalFund = project.is_universal_fund === true || project.isUniversalFund === true;
        return !isUniversalFund;
      });
      
      // If no featured projects found after filtering, fallback to any active projects (excluding Universal Fund)
      if (filtered.length === 0) {
        console.warn('No featured projects found after filtering, fetching latest active projects as fallback');
        const fallback = await supabase
          .from('projects')
          .select('*')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(10);
        
        const fallbackFiltered = (fallback.data || []).filter((project: any) => {
          const isUniversalFund = project.is_universal_fund === true || project.isUniversalFund === true;
          return !isUniversalFund;
        });
        
        return (fallbackFiltered.slice(0, 5)) as Project[];
      }
      
      const result = filtered.slice(0, 5) as Project[];
      console.log(`Case Study: Found ${result.length} featured projects:`, result.map(p => p.title));
      return result;
    },
    staleTime: Infinity,
    retry: false,
  });

  // Prepare gallery images and taglines from first three highlighted projects (always max 3)
  const topProjects = projects.slice(0, 3);
  console.log(`Case Study: Using ${topProjects.length} projects for gallery`);
  const images = [
    ...topProjects.map(p => getProjectImageUrl(p) || p.imageUrl || 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?q=80&w=1200&auto=format&fit=crop'),
    (sdgWheelImg as unknown as string)
  ];
  const taglines = [
    ...topProjects.map(p => {
      const sector = p.category || 'Impact';
      return `${sector} →:`; // only sector with arrow
    }),
    t("homeSections.caseStudy.exploreAllProjects")
  ];

  const sectorToIcon = (sector: string) => {
    const s = (sector || '').toLowerCase();
    const iconProps = { className: 'w-4 h-4 text-white' } as const;
    if (s.includes('education')) return <GraduationCap {...iconProps} />;
    if (s.includes('water')) return <Droplets {...iconProps} />;
    if (s.includes('energy') || s.includes('wind') || s.includes('solar')) return <Wind {...iconProps} />;
    if (s.includes('health')) return <Heart {...iconProps} />;
    if (s.includes('environment') || s.includes('agri') || s.includes('eco')) return <Leaf {...iconProps} />;
    return <Users {...iconProps} />;
  };
  const icons = [
    ...topProjects.map(p => sectorToIcon(p.category || '')),
    null as any
  ];

  // Donation tiers util (same as V2)
  const getAvailableTiers = (project: Project | null) => {
    if (!project) return [] as { donation: number; unit: string; points: number }[];
    const tiers: { donation: number; unit: string; points: number }[] = [];
    for (let i = 1; i <= 7; i++) {
      const donation = project[`donation_${i}` as keyof Project] as unknown as number;
      const impactUnit = getProjectImpactUnit(project, language) || 'impact created';
      if (donation) {
        tiers.push({ donation, unit: impactUnit || 'impact created', points: donation * 10 });
      }
    }
    return tiers.sort((a, b) => a.donation - b.donation);
  };
  const availableTiers = getAvailableTiers(selectedProject);
  const fallbackDonations = [10, 25, 50, 100];
  const donationOptions = availableTiers.length > 0 ? availableTiers.map(t => t.donation) : fallbackDonations;
  React.useEffect(() => {
    const projectKey = selectedProject ? (selectedProject.id ?? selectedProject.slug ?? null) : null;
    if (selectedProject && initializedRef.current !== projectKey) {
      if (availableTiers.length > 0) {
        setDonationAmount(availableTiers[0].donation);
      } else {
        setDonationAmount(fallbackDonations[2]); // default to 50 if no tiers
      }
      initializedRef.current = projectKey;
    }
  }, [selectedProject, availableTiers]);
  const currentTier = availableTiers.find(t => t.donation === donationAmount) || availableTiers[0];
  // Impact calculation (new unified logic with fallback)
  const impactResult = selectedProject
    ? calculateImpactUnified(selectedProject, donationAmount || 0, language === 'de' ? 'de' : 'en')
    : null;
  
  // Try to generate CTA text from templates (new system)
  const generatedCtaText = selectedProject && impactResult
    ? generateCtaText(selectedProject, donationAmount || 0, impactResult, language === 'de' ? 'de' : 'en')
    : null;
  
  // Parse generated text to extract impact+unit and freitext separately
  const parseCtaText = (text: string, lang: 'en' | 'de') => {
    if (lang === 'de') {
      // Format: "Unterstütze {project} mit ${amount} und hilf {impact} {unit} {freitext} — verdiene {points} Impact Points"
      const match = text.match(/und hilf (.+?) — verdiene/);
      if (match) {
        const impactAndFreitext = match[1];
        // Split by impact amount (number) to separate impact+unit from freitext
        const impactMatch = impactAndFreitext.match(/^(\d+(?:\.\d+)?)\s+([^\s]+)\s+(.+)$/);
        if (impactMatch) {
          return {
            impact: impactMatch[1],
            unit: impactMatch[2],
            freitext: impactMatch[3]
          };
        }
      }
    } else {
      // Format: "Support {project} with ${amount} and help {impact} {unit} {freitext} — earn {points} Impact Points"
      const match = text.match(/and help (.+?) — earn/);
      if (match) {
        const impactAndFreitext = match[1];
        // Split by impact amount (number) to separate impact+unit from freitext
        const impactMatch = impactAndFreitext.match(/^(\d+(?:\.\d+)?)\s+([^\s]+)\s+(.+)$/);
        if (impactMatch) {
          return {
            impact: impactMatch[1],
            unit: impactMatch[2],
            freitext: impactMatch[3]
          };
        }
      }
    }
    return null;
  };
  
  const parsedCta = generatedCtaText ? parseCtaText(generatedCtaText, language === 'de' ? 'de' : 'en') : null;
  
  // Fallback values for old system
  const impactAmount = impactResult
    ? (impactResult.impact % 1 === 0 ? impactResult.impact.toString() : impactResult.impact.toFixed(2))
    : (currentTier?.impact || '0');
  const impactUnit = impactResult?.unit || currentTier?.unit || 'impact created';
  const impactPoints = selectedProject
    ? Math.floor((selectedProject.impactPointsMultiplier ?? (selectedProject as any)?.impact_points_multiplier ?? 10) * (donationAmount || 0))
    : (currentTier?.points || 0);
  const impactVerb = selectedProject ? getProjectImpactVerb(selectedProject, language) || 'help' : 'help';
  const impactNoun = selectedProject ? getProjectImpactNoun(selectedProject, language) || 'people' : 'people';

  return (
    <section className="py-24" style={{ backgroundColor: BRAND_COLORS.bgWhite }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header (same copy and layout as V2, centered) */}
          <div className="text-center mb-12 md:mb-16">
          <h2 className={`${TYPOGRAPHY.section} mb-4`} style={{ 
            color: BRAND_COLORS.textPrimary, 
            fontFamily: "'Satoshi', 'Inter', system-ui, sans-serif" 
          }}>
            {t("homeSections.caseStudy.title")}
          </h2>
          <div className="text-xl max-w-2xl mx-auto mb-6 flex items-center justify-center gap-2" style={{ color: BRAND_COLORS.textSecondary }}>
            <span>{t("homeSections.caseStudy.subtitle")}</span>
            <SDGNotificationBell />
          </div>
        </div>

        {/* Expandable gallery representing highlighted social enterprises */}
        <div className="flex justify-center">
          <ExpandableGallery
            images={images}
            taglines={taglines}
            className="w-full max-w-4xl"
            icons={icons}
            onImageClick={(index) => {
              if (index < topProjects.length) {
                setSelectedProject(topProjects[index]);
              } else {
                window.location.href = '/projects';
              }
            }}
          />
        </div>

        {/* Popup identical behavior to V2 */}
        {selectedProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">
              <button
                onClick={() => { setSelectedProject(null); setShowDonationDropdown(false); initializedRef.current = null; }}
                className="absolute top-6 right-6 z-10 p-2 rounded-full bg-white/90 hover:bg-white shadow-sm transition-colors"
              >
                ✕
              </button>

              <div className="p-6 lg:p-8 border-b" style={{ borderColor: BRAND_COLORS.borderSubtle }}>
                <h3 className="text-xl lg:text-2xl font-bold mb-1" style={{ color: BRAND_COLORS.textPrimary }}>
                  {t("homeSections.caseStudy.seeImpact")}
                </h3>
                <p className="text-base lg:text-lg" style={{ color: BRAND_COLORS.textSecondary }}>
                  {t("homeSections.caseStudy.withProject")} {selectedProject.title}
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 p-6 lg:p-12">
                <div className="space-y-8 order-2 lg:order-1">
                  <div>
                    <div className="text-center lg:text-left">
                      {generatedCtaText ? (
                        // New system: Use generated CTA text from templates
                        <p className="text-2xl lg:text-4xl font-semibold leading-[1.4]" style={{ color: BRAND_COLORS.textPrimary }}>
                          {language === 'de' ? (
                            <>
                              Unterstütze <span className="font-bold" style={{ color: BRAND_COLORS.textPrimary }}>{selectedProject.title}</span> mit{' '}
                              <span className="relative inline-block">
                                <button
                                  onClick={() => setShowDonationDropdown(!showDonationDropdown)}
                                  className="inline-flex items-center gap-1 border-b-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors min-h-[48px] px-2 font-bold"
                                  style={{ color: BRAND_COLORS.primaryOrange }}
                                >
                                  ${donationAmount}
                                  <ChevronDown className="h-5 w-5" />
                                </button>
                                {showDonationDropdown && (
                                  <div className="absolute top-full left-0 mt-2 bg-white border rounded-lg shadow-lg z-10 min-w-[140px]" style={{ borderColor: BRAND_COLORS.borderSubtle }}>
                                    {donationOptions.map((amount) => (
                                      <button key={amount} onClick={() => { setDonationAmount(amount); setShowDonationDropdown(false); }} className="w-full p-2 text-left hover:bg-gray-50 transition-colors min-h-[36px]">
                                        <span className="text-lg font-bold" style={{ color: BRAND_COLORS.primaryOrange }}>
                                          ${amount}
                                        </span>
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </span>
                              {' '}und hilf{' '}
                              {parsedCta ? (
                                <>
                                  <span className="font-bold" style={{ color: BRAND_COLORS.primaryOrange }}>
                                    {parsedCta.impact} {parsedCta.unit}
                                  </span>
                                  {' '}
                                  <span style={{ color: BRAND_COLORS.textPrimary }}>
                                    {parsedCta.freitext}
                                  </span>
                                </>
                              ) : (
                                <span className="font-bold" style={{ color: BRAND_COLORS.primaryOrange }}>
                                  {impactAmount} {impactUnit}
                                </span>
                              )}
                              {' '}
                              <span style={{ color: BRAND_COLORS.textSecondary }}>
                                <span style={{ fontSize: '0.7em', verticalAlign: 'baseline' }}>—</span> {t("homeSections.caseStudy.earn").replace('— ', '')}
                              </span>
                              {' '}
                              <span className="font-bold" style={{ color: BRAND_COLORS.textSecondary }}>
                                {generatedCtaText.split('verdiene ')[1]?.split(' Impact Points')[0] || impactPoints}
                              </span>
                              {' '}
                              <span style={{ color: BRAND_COLORS.textSecondary }}>{t("homeSections.caseStudy.impactPoints")}</span><span style={{ color: BRAND_COLORS.textSecondary }}>.</span>
                            </>
                          ) : (
                            <>
                              Support <span className="font-bold" style={{ color: BRAND_COLORS.textPrimary }}>{selectedProject.title}</span> with{' '}
                              <span className="relative inline-block">
                                <button
                                  onClick={() => setShowDonationDropdown(!showDonationDropdown)}
                                  className="inline-flex items-center gap-1 border-b-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors min-h-[48px] px-2 font-bold"
                                  style={{ color: BRAND_COLORS.primaryOrange }}
                                >
                                  ${donationAmount}
                                  <ChevronDown className="h-5 w-5" />
                                </button>
                                {showDonationDropdown && (
                                  <div className="absolute top-full left-0 mt-2 bg-white border rounded-lg shadow-lg z-10 min-w-[140px]" style={{ borderColor: BRAND_COLORS.borderSubtle }}>
                                    {donationOptions.map((amount) => (
                                      <button key={amount} onClick={() => { setDonationAmount(amount); setShowDonationDropdown(false); }} className="w-full p-2 text-left hover:bg-gray-50 transition-colors min-h-[36px]">
                                        <span className="text-lg font-bold" style={{ color: BRAND_COLORS.primaryOrange }}>
                                          ${amount}
                                        </span>
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </span>
                              {' '}and help{' '}
                              {parsedCta ? (
                                <>
                                  <span className="font-bold" style={{ color: BRAND_COLORS.primaryOrange }}>
                                    {parsedCta.impact} {parsedCta.unit}
                                  </span>
                                  {' '}
                                  <span style={{ color: BRAND_COLORS.textPrimary }}>
                                    {parsedCta.freitext}
                                  </span>
                                </>
                              ) : (
                                <span className="font-bold" style={{ color: BRAND_COLORS.primaryOrange }}>
                                  {impactAmount} {impactUnit}
                                </span>
                              )}
                              {' '}
                              <span style={{ color: BRAND_COLORS.textSecondary }}>
                                <span style={{ fontSize: '0.7em', verticalAlign: 'baseline' }}>—</span> {t("homeSections.caseStudy.earn").replace('— ', '')}
                              </span>
                              {' '}
                              <span className="font-bold" style={{ color: BRAND_COLORS.textSecondary }}>
                                {generatedCtaText.split('earn ')[1]?.split(' Impact Points')[0] || impactPoints}
                              </span>
                              {' '}
                              <span style={{ color: BRAND_COLORS.textSecondary }}>{t("homeSections.caseStudy.impactPoints")}</span><span style={{ color: BRAND_COLORS.textSecondary }}>.</span>
                            </>
                          )}
                        </p>
                      ) : (
                        // Fallback: Old system with verb/noun
                        <p className="text-2xl lg:text-4xl font-semibold leading-[1.4]" style={{ color: BRAND_COLORS.textPrimary }}>
                          {t("homeSections.caseStudy.support")} <span className="font-bold" style={{ color: BRAND_COLORS.textPrimary }}>{selectedProject.title}</span> {t("homeSections.caseStudy.withProject")}{' '}
                          <span className="relative inline-block">
                            <button
                              onClick={() => setShowDonationDropdown(!showDonationDropdown)}
                              className="inline-flex items-center gap-1 border-b-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors min-h-[48px] px-2 font-bold"
                              style={{ color: BRAND_COLORS.primaryOrange }}
                            >
                              ${donationAmount}
                              <ChevronDown className="h-5 w-5" />
                            </button>
                            {showDonationDropdown && (
                              <div className="absolute top-full left-0 mt-2 bg-white border rounded-lg shadow-lg z-10 min-w-[140px]" style={{ borderColor: BRAND_COLORS.borderSubtle }}>
                                {donationOptions.map((amount) => (
                                  <button key={amount} onClick={() => { setDonationAmount(amount); setShowDonationDropdown(false); }} className="w-full p-2 text-left hover:bg-gray-50 transition-colors min-h-[36px]">
                                    <span className="text-lg font-bold" style={{ color: BRAND_COLORS.primaryOrange }}>
                                      ${amount}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </span> {t("homeSections.caseStudy.andHelp")}{' '}
                          {language === 'de' ? (
                            <>
                              <span className="font-bold" style={{ color: BRAND_COLORS.primaryOrange }}>{impactAmount}</span>{' '}
                              <span className="font-bold" style={{ color: BRAND_COLORS.primaryOrange }}>{impactNoun}</span>{' '}
                              <span className="font-bold" style={{ color: BRAND_COLORS.textPrimary }}>{impactVerb}</span>{' '}
                            </>
                          ) : (
                            <>
                              <span className="font-bold" style={{ color: BRAND_COLORS.textPrimary }}>{impactVerb}</span>{' '}
                              <span className="font-bold" style={{ color: BRAND_COLORS.primaryOrange }}>{impactAmount}</span>{' '}
                              <span className="font-bold" style={{ color: BRAND_COLORS.primaryOrange }}>{impactNoun}</span>{' '}
                            </>
                          )}
                          <span style={{ color: BRAND_COLORS.textSecondary }}>
                            <span style={{ fontSize: '0.7em', verticalAlign: 'baseline' }}>—</span> {t("homeSections.caseStudy.earn").replace('— ', '')}
                          </span>{' '}
                          <span className="font-bold" style={{ color: BRAND_COLORS.textSecondary }}>{impactPoints}</span>{' '}
                          <span style={{ color: BRAND_COLORS.textSecondary }}>{t("homeSections.caseStudy.impactPoints")}</span><span style={{ color: BRAND_COLORS.textSecondary }}>.</span>
                        </p>
                      )}
                    </div>

                    <div className="mt-8 lg:mt-10 text-center lg:text-left flex flex-col sm:flex-row gap-4">
                      <Button 
                        size="lg" 
                        variant="outline"
                        className="px-6 lg:px-8 py-3 lg:py-4 text-base lg:text-lg font-medium w-full sm:w-auto bg-white hover:bg-gray-50 border-gray-300"
                        style={{ color: BRAND_COLORS.textPrimary }}
                        asChild
                      >
                        <LanguageLink href={`/project/${selectedProject.slug || selectedProject.id}`}>
                          {t("homeSections.caseStudy.readMore")}
                        </LanguageLink>
                      </Button>
                      <Button 
                        size="lg" 
                        className="text-white px-6 lg:px-8 py-3 lg:py-4 text-base lg:text-lg font-medium w-full sm:w-auto" 
                        style={{ backgroundColor: BRAND_COLORS.primaryOrange }}
                        onClick={() => {
                          if (previewEnabled && selectedProject?.slug) {
                            navigate(`/support/${selectedProject.slug}?previewOnboarding=1`);
                          } else {
                            setShowWaitlistDialog(true);
                          }
                        }}
                      >
                        {t("homeSections.caseStudy.supportThisProject")}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 order-1 lg:order-2">
                  <div className="rounded-lg overflow-hidden relative" style={{ border: `1px solid ${BRAND_COLORS.borderSubtle}` }}>
                    {getProjectImageUrl(selectedProject) ? (
                      <img src={getProjectImageUrl(selectedProject) || ''} alt={selectedProject.title} className="w-full h-72 lg:h-80 object-cover" />
                    ) : (
                      <div className="w-full h-72 lg:h-80 flex items-center justify-center" style={{ backgroundColor: BRAND_COLORS.bgCool }}>
                        <Target className="h-16 w-16" />
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0">
                      <div className="bg-white/50 backdrop-blur-sm p-3">
                        <p className="text-sm lg:text-base leading-relaxed font-medium whitespace-pre-line" style={{ color: BRAND_COLORS.textPrimary }}>
                          {getProjectMissionStatement(selectedProject, language) || getProjectDescription(selectedProject, language) || (language === 'de' ? "Unterstützung nachhaltiger Lebensgrundlagen und Gemeinschaftsentwicklung." : "Supporting sustainable livelihoods and community development.")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Waiting List Dialog */}
        <Dialog open={showWaitlistDialog} onOpenChange={setShowWaitlistDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center">{t("projectDetail.waitlistTitle")}</DialogTitle>
              <DialogDescription className="text-center pt-4">
                {t("projectDetail.waitlistDescription")}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-col sm:flex-col gap-3 pt-4">
              <Button 
                onClick={() => {
                  window.open("https://tally.so/r/m6MqAe", "_blank");
                }}
                className="w-full"
                style={{ backgroundColor: BRAND_COLORS.primaryOrange }}
              >
                {t("projectDetail.joinWaitlist")}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowWaitlistDialog(false)}
                className="w-full"
              >
                {t("projectDetail.close")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}


