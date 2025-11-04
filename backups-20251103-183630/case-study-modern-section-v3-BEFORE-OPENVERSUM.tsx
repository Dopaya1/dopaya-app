import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Project } from "@shared/schema";
import { TYPOGRAPHY } from "@/constants/typography";
import { BRAND_COLORS } from "@/constants/colors";
import ExpandableGallery from "@/components/ui/gallery-animation";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ChevronDown, Target, GraduationCap, Droplets, Leaf, Wind, Heart, Users } from "lucide-react";
import sdgWheelImg from "@assets/sdg wheel.png";
import { SDGNotificationBell } from "@/components/ui/sdg-notification-bell";
import { getProjectImageUrl } from "@/lib/image-utils";

export function CaseStudyModernSectionV3() {
  const [selectedProject, setSelectedProject] = React.useState<Project | null>(null);
  const [donationAmount, setDonationAmount] = React.useState(0);
  const [showDonationDropdown, setShowDonationDropdown] = React.useState(false);
  const initializedRef = React.useRef<string | null>(null);

  // Reuse same featured projects order as V2 for parity
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["projects-case-study-modern-v3"],
    queryFn: async () => {
      const projectOrder = ['ignis-careers', 'allika-eco-products', 'panjurli-labs', 'sanitrust-pads'];
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('status', 'active')
        .eq('featured', true)
        .in('slug', projectOrder);
      if (error) throw error;
      const sorted = projectOrder
        .map(slug => data?.find(p => p.slug === slug))
        .filter(Boolean) as Project[];
      return sorted;
    },
    staleTime: Infinity,
    retry: false,
  });

  // Prepare gallery images and taglines from first three highlighted projects
  const topProjects = projects.slice(0, 3);
  const images = [
    ...topProjects.map(p => p.imageUrl || 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?q=80&w=1200&auto=format&fit=crop'),
    (sdgWheelImg as unknown as string)
  ];
  const taglines = [
    ...topProjects.map(p => {
      const sector = p.category || 'Impact';
      return `${sector} →:`; // only sector with arrow
    }),
    'Explore all projects →:'
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
    if (!project) return [] as { donation: number; impact: string; unit: string; points: number }[];
    const tiers: { donation: number; impact: string; unit: string; points: number }[] = [];
    for (let i = 1; i <= 7; i++) {
      const donation = project[`donation_${i}` as keyof Project] as unknown as number;
      const impact = project[`impact_${i}` as keyof Project] as unknown as string;
      const impactUnit = project.impact_unit as string;
      if (donation && impact) {
        tiers.push({ donation, impact, unit: impactUnit || 'impact created', points: donation * 10 });
      }
    }
    return tiers.sort((a, b) => a.donation - b.donation);
  };
  const availableTiers = getAvailableTiers(selectedProject);
  React.useEffect(() => {
    if (selectedProject && availableTiers.length > 0 && initializedRef.current !== selectedProject.id) {
      setDonationAmount(availableTiers[0].donation);
      initializedRef.current = selectedProject.id;
    }
  }, [selectedProject, availableTiers]);
  const currentTier = availableTiers.find(t => t.donation === donationAmount) || availableTiers[0];
  const impactAmount = currentTier?.impact || '0';
  const impactUnit = currentTier?.unit || 'impact created';
  const impactPoints = currentTier?.points || 0;
  const impactVerb = selectedProject?.impact_verb || 'help';
  const impactNoun = selectedProject?.impact_noun || 'people';

  return (
    <section className="py-24" style={{ backgroundColor: BRAND_COLORS.bgWhite }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header (same copy and layout as V2, centered) */}
          <div className="text-center mb-12 md:mb-16">
          <h2 className={`${TYPOGRAPHY.section} mb-4`} style={{ 
            color: BRAND_COLORS.textPrimary, 
            fontFamily: "'Satoshi', 'Inter', system-ui, sans-serif" 
          }}>
            How do you want to change the world today?
          </h2>
          <div className="text-xl max-w-2xl mx-auto mb-6 flex items-center justify-center gap-2" style={{ color: BRAND_COLORS.textSecondary }}>
            <span>Choose a social enterprise and see real impact you can create. Why Social Enterprises?</span>
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
                  See the impact you can create
                </h3>
                <p className="text-base lg:text-lg" style={{ color: BRAND_COLORS.textSecondary }}>
                  with {selectedProject.title}
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 p-6 lg:p-12">
                <div className="space-y-8 order-2 lg:order-1">
                  <div>
                    <div className="text-center lg:text-left">
                      <p className="text-2xl lg:text-4xl font-semibold leading-[1.4]" style={{ color: BRAND_COLORS.textPrimary }}>
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
                              {availableTiers.map((tier) => (
                                <button key={tier.donation} onClick={() => { setDonationAmount(tier.donation); setShowDonationDropdown(false); }} className="w-full p-2 text-left hover:bg-gray-50 transition-colors min-h-[36px]">
                                  <span className="text-lg font-bold" style={{ color: BRAND_COLORS.primaryOrange }}>
                                    ${tier.donation}
                                  </span>
                                </button>
                              ))}
                            </div>
                          )}
                        </span> and help{' '}
                        <span className="font-bold" style={{ color: BRAND_COLORS.textPrimary }}>{impactVerb}</span>{' '}
                        <span className="font-bold" style={{ color: BRAND_COLORS.primaryOrange }}>{impactAmount}</span>{' '}
                        <span className="font-bold" style={{ color: BRAND_COLORS.primaryOrange }}>{impactNoun}</span>{' '}
                        <span style={{ color: BRAND_COLORS.textSecondary }}>— earn</span>{' '}
                        <span className="font-bold" style={{ color: BRAND_COLORS.textPrimary }}>{impactPoints}</span>{' '}
                        <span style={{ color: BRAND_COLORS.textSecondary }}>Impact Points</span>.
                      </p>
                    </div>

                    <div className="mt-8 lg:mt-10 text-center lg:text-left">
                      <Button size="lg" className="text-white font-semibold px-6 lg:px-8 py-3 lg:py-4 text-base lg:text-lg min-h-[44px] lg:min-h-[48px] w-full sm:w-auto" style={{ backgroundColor: BRAND_COLORS.primaryOrange }} asChild>
                        <Link href={`/project/${selectedProject.slug || selectedProject.id}`}>
                          Support This Project
                        </Link>
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
                        <p className="text-sm lg:text-base leading-relaxed font-medium" style={{ color: BRAND_COLORS.textPrimary }}>
                          {selectedProject.missionStatement || selectedProject.description || "Supporting sustainable livelihoods and community development."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}


