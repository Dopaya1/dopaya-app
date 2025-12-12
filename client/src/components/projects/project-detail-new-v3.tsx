import { useEffect, useState, useRef } from "react";
import { Project } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { LanguageLink } from "@/components/ui/language-link";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useI18n } from "@/lib/i18n/i18n-context";
import { getProjectTitle, getProjectDescription, getProjectSummary, getProjectMissionStatement, getProjectKeyImpact, getProjectAboutUs, getProjectImpactAchievements, getProjectFundUsage, getProjectSelectionReasoning, getProjectCountry, getProjectImpactUnit, getProjectImpactNoun, getProjectImpactVerb, hasGermanContent, getBackerShortDescription, getProjectFounderBio } from "@/lib/i18n/project-content";
import { calculateImpactUnified, generateCtaText } from "@/lib/impact-calculator";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { DonationButton } from "@/components/donation/donation-button";
import { OptimizedImage, EagerOptimizedImage } from "@/components/ui/optimized-image";
import { CheckCircle, Gift, Heart, ChevronLeft, ChevronRight, ChevronDown, Check, ArrowRightLeft, Heart as HeartIcon, ShieldCheck, CircleCheck } from "lucide-react";
import { BRAND_COLORS } from "@/constants/colors";
import { 
  FaFacebook, 
  FaTwitter, 
  FaLinkedin, 
  FaInstagram, 
  FaEnvelope, 
  FaYoutube, 
  FaTiktok, 
  FaGlobe,
  FaCheckCircle,
  FaMapMarkerAlt,
  FaUser,
  FaInfoCircle,
  FaLeaf,
  FaShareAlt
} from "react-icons/fa";
import { getCategoryColors } from "@/lib/category-colors";
import { MobileSlider } from "@/components/ui/mobile-slider";
import { SEOHead } from "@/components/seo/seo-head";
import { getProjectImageUrl, getLogoUrl } from "@/lib/image-utils";
import { useProjectBackers } from "@/hooks/use-backers";
import { useProjectPressMentions } from "@/hooks/use-press-mentions";
import { PressMentionCard } from "@/components/projects/press-mention-card";
import verifiedIcon from "@assets/SE-Page_Icons/Dopaya icon - verified Social enterprises.png";
import percentageIcon from "@assets/SE-Page_Icons/Dopaya icon - 100percentage.png";
import rewardsIcon from "@assets/SE-Page_Icons/Dopaya icon - Rewards.png";

// Normalize project (snake_case -> camelCase) for impact data
const normalizeProjectLocal = (proj: Project) => ({
  ...proj,
  impactFactor: (proj as any).impact_factor ?? proj.impactFactor,
  impactUnitSingularEn: (proj as any).impact_unit_singular_en ?? proj.impactUnitSingularEn,
  impactUnitPluralEn: (proj as any).impact_unit_plural_en ?? proj.impactUnitPluralEn,
  impactUnitSingularDe: (proj as any).impact_unit_singular_de ?? proj.impactUnitSingularDe,
  impactUnitPluralDe: (proj as any).impact_unit_plural_de ?? proj.impactUnitPluralDe,
  ctaTemplateEn: (proj as any).cta_template_en ?? proj.ctaTemplateEn,
  ctaTemplateDe: (proj as any).cta_template_de ?? proj.ctaTemplateDe,
  pastTemplateEn: (proj as any).past_template_en ?? proj.pastTemplateEn,
  pastTemplateDe: (proj as any).past_template_de ?? proj.pastTemplateDe,
  impactTiers: (proj as any).impact_tiers ?? proj.impactTiers,
  impactPointsMultiplier: (proj as any).impact_points_multiplier ?? proj.impactPointsMultiplier,
});

const hasImpactDataLocal = (proj: Project | null) => {
  if (!proj) return false;
  const tiers = (proj.impactTiers as any[]) || [];
  const hasTiers = Array.isArray(tiers) && tiers.length > 0;
  if (hasTiers) {
    return !!(
      proj.impactUnitSingularEn &&
      proj.impactUnitPluralEn &&
      proj.impactUnitSingularDe &&
      proj.impactUnitPluralDe &&
      tiers.some((t: any) => t && t.impact_factor != null && t.cta_template_en && t.cta_template_de && t.past_template_en && t.past_template_de)
    );
  }
  return !!(
    proj.impactFactor != null &&
    proj.impactUnitSingularEn &&
    proj.impactUnitPluralEn &&
    proj.impactUnitSingularDe &&
    proj.impactUnitPluralDe &&
    proj.ctaTemplateEn &&
    proj.ctaTemplateDe &&
    proj.pastTemplateEn &&
    proj.pastTemplateDe
  );
};

interface ProjectDetailProps {
  project: Project;
}

export function ProjectDetailNewV3({ project }: ProjectDetailProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  const { t } = useTranslation();
  const { language } = useI18n();
  
  // Get language-specific content
  const projectTitle = getProjectTitle(project, language);
  const projectDescription = getProjectDescription(project, language);
  const projectSummary = getProjectSummary(project, language);
  const projectMissionStatement = getProjectMissionStatement(project, language);
  const projectKeyImpact = getProjectKeyImpact(project, language);
  const projectAboutUs = getProjectAboutUs(project, language);
  const projectImpactAchievements = getProjectImpactAchievements(project, language);
  const projectFundUsage = getProjectFundUsage(project, language);
  const projectSelectionReasoning = getProjectSelectionReasoning(project, language);
  const projectCountry = getProjectCountry(project, language);
  const projectImpactUnit = getProjectImpactUnit(project, language);
  const projectImpactNoun = getProjectImpactNoun(project, language);
  const projectImpactVerb = getProjectImpactVerb(project, language);
  const projectFounderBio = getProjectFounderBio(project, language);
  const hasGerman = hasGermanContent(project);
  
  // Check if project has impact data (new system) - used to conditionally show impact box
  const normalizedProjectForImpact = normalizeProjectLocal(project);
  const hasImpactForDisplay = hasImpactDataLocal(normalizedProjectForImpact);
  
  // Debug: Log language and project data
  useEffect(() => {
    console.log('[ProjectDetailV3] Language:', language);
    console.log('[ProjectDetailV3] Project ID:', project?.id);
    console.log('[ProjectDetailV3] Has missionStatementDe (camelCase):', !!project?.missionStatementDe);
    console.log('[ProjectDetailV3] Has mission_statement_de (snake_case):', !!(project as any)?.mission_statement_de);
    console.log('[ProjectDetailV3] missionStatementDe value:', project?.missionStatementDe || (project as any)?.mission_statement_de);
    console.log('[ProjectDetailV3] Has keyImpactDe (camelCase):', !!project?.keyImpactDe);
    console.log('[ProjectDetailV3] Has key_impact_de (snake_case):', !!(project as any)?.key_impact_de);
    console.log('[ProjectDetailV3] keyImpactDe value:', project?.keyImpactDe || (project as any)?.key_impact_de);
    console.log('[ProjectDetailV3] Has countryDe (camelCase):', !!project?.countryDe);
    console.log('[ProjectDetailV3] Has country_de (snake_case):', !!(project as any)?.country_de);
    console.log('[ProjectDetailV3] countryDe value:', project?.countryDe || (project as any)?.country_de);
    console.log('[ProjectDetailV3] Has founderBioDe (camelCase):', !!project?.founderBioDe);
    console.log('[ProjectDetailV3] Has founder_bio_de (snake_case):', !!(project as any)?.founder_bio_de);
    console.log('[ProjectDetailV3] Has founderBio_de (Supabase camelCase):', !!(project as any)?.founderBio_de);
    console.log('[ProjectDetailV3] founderBioDe value:', project?.founderBioDe || (project as any)?.founder_bio_de || (project as any)?.founderBio_de);
    console.log('[ProjectDetailV3] Has founderBio (camelCase):', !!project?.founderBio);
    console.log('[ProjectDetailV3] Has founder_bio (snake_case):', !!(project as any)?.founder_bio);
    console.log('[ProjectDetailV3] founderBio value:', project?.founderBio || (project as any)?.founder_bio);
    // Debug: Log all keys that contain "founder" or "bio"
    const founderKeys = Object.keys(project || {}).filter(key => 
      key.toLowerCase().includes('founder') || key.toLowerCase().includes('bio')
    );
    console.log('[ProjectDetailV3] All founder/bio related keys:', founderKeys);
    console.log('[ProjectDetailV3] Raw project data (founder related):', 
      founderKeys.reduce((acc, key) => {
        acc[key] = (project as any)?.[key];
        return acc;
      }, {} as Record<string, any>)
    );
    console.log('[ProjectDetailV3] Resolved missionStatement:', projectMissionStatement);
    console.log('[ProjectDetailV3] Resolved keyImpact:', projectKeyImpact);
    console.log('[ProjectDetailV3] Resolved country:', projectCountry);
    console.log('[ProjectDetailV3] Resolved founderBio:', projectFounderBio);
  }, [language, project, projectMissionStatement, projectKeyImpact, projectCountry, projectFounderBio]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [donationAmount, setDonationAmount] = useState(25);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [storySlideVisible, setStorySlideVisible] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [showImpactInfo, setShowImpactInfo] = useState(false);
  const [selectedInstitution, setSelectedInstitution] = useState<number | null>(null);
  const [donationAmountInteractive, setDonationAmountInteractive] = useState(0);
  const [showDonationDropdown, setShowDonationDropdown] = useState(false);
  const [backerCarouselIndex, setBackerCarouselIndex] = useState(0);
  const [pressMentionCarouselIndex, setPressMentionCarouselIndex] = useState(0);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);
  const [showImpactPointsDialog, setShowImpactPointsDialog] = useState(false);
  const [infoBarIndex, setInfoBarIndex] = useState(0);
  const heroSectionRef = useRef<HTMLDivElement>(null);
  
  // Refs and state for scroll-to-section functionality
  const storyRef = useRef<HTMLDivElement>(null);
  const impactRef = useRef<HTMLDivElement>(null);
  const changemakersRef = useRef<HTMLDivElement>(null);
  const ourviewRef = useRef<HTMLDivElement>(null);
  const impactBoxRef = useRef<HTMLDivElement>(null);
  
  type TabId = 'story' | 'impact' | 'changemakers' | 'ourview' | 'impactbox';
  const [activeTab, setActiveTab] = useState<TabId>('story');
  
  const sectionRefs: Record<TabId, React.RefObject<HTMLDivElement>> = {
    story: storyRef,
    impact: impactRef,
    changemakers: changemakersRef,
    ourview: ourviewRef,
    impactbox: impactBoxRef,
  };
  
  // Scroll to section function
  const scrollToSection = (tabId: TabId) => {
    const ref = sectionRefs[tabId];
    if (ref.current) {
      const offset = 140; // Account for navbar + tab bar
      const elementPosition = ref.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };
  
  // Handle scroll position for sticky bottom bar and hide main navbar when past hero
  useEffect(() => {
    const handleScroll = () => {
      // Show the sticky bar after scrolling down 300px
      const scrollPosition = window.scrollY;
      setShowStickyBar(scrollPosition > 300);
      
      // Hide main navbar when hero section is scrolled completely past the top of viewport
      if (heroSectionRef.current) {
        const heroRect = heroSectionRef.current.getBoundingClientRect();
        const navbar = document.querySelector('nav[class*="sticky"]') as HTMLElement;
        // Hide navbar when hero section bottom is above viewport top (completely scrolled past)
        if (navbar && heroRect.bottom <= 0) {
          navbar.style.display = 'none';
        } else if (navbar) {
          navbar.style.display = '';
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    // Cleanup: restore navbar visibility on unmount
    return () => {
      window.removeEventListener('scroll', handleScroll);
      const navbar = document.querySelector('nav[class*="sticky"]') as HTMLElement;
      if (navbar) {
        navbar.style.display = '';
      }
    };
  }, []);

  // Helper function to check if URL is a video
  const isVideoUrl = (url: string): boolean => {
    if (!url) return false;
    const videoExtensions = ['.mp4', '.webm', '.mov', '.ogg', '.avi', '.mkv'];
    const videoDomains = ['youtube.com', 'youtu.be', 'vimeo.com', 'vimeocdn.com'];
    
    // Check file extension
    if (videoExtensions.some(ext => url.toLowerCase().endsWith(ext))) {
      return true;
    }
    
    // Check video platform URLs
    if (videoDomains.some(domain => url.toLowerCase().includes(domain))) {
      return true;
    }
    
    return false;
  };

  // Helper function to get media type (check imageType field first, then URL)
  const getMediaType = (url: string, index: number): 'image' | 'video' => {
    if (!url) return 'image';
    
    // First, check if there's an explicit imageType field in the project
    const typeFields: (keyof typeof project)[] = ['imageType1', 'imageType2', 'imageType3', 'imageType4', 'imageType5', 'imageType6'];
    if (index > 0 && index <= 6) {
      const typeField = typeFields[index - 1];
      const type = project[typeField];
      if (type === 'video') return 'video';
      if (type === 'image') return 'image';
    }
    
    // Fallback: check URL extension/domain
    return isVideoUrl(url) ? 'video' : 'image';
  };

  // Create an array of media items (images or videos) from project media fields
  const baseImages = [
    { url: project.imageUrl, type: getMediaType(project.imageUrl || '', 0) }, // Main image is always first
    { url: project.image1 || '', type: getMediaType(project.image1 || '', 1) },
    { url: project.image2 || '', type: getMediaType(project.image2 || '', 2) },
    { url: project.image3 || '', type: getMediaType(project.image3 || '', 3) },
    { url: project.image4 || '', type: getMediaType(project.image4 || '', 4) },
    { url: project.image5 || '', type: getMediaType(project.image5 || '', 5) },
    { url: project.image6 || '', type: getMediaType(project.image6 || '', 6) }
  ].filter(item => item.url); // Remove empty strings
  
  // Create array with story slide inserted after first image
  // Index 0: first image, Index 1: story slide, Index 2+: remaining images
  const totalSlides = baseImages.length > 1 ? baseImages.length + 1 : baseImages.length;
  const STORY_SLIDE_INDEX = 1; // Story slide is always at index 1 (between first and second image)

  // Handle fade-in animation for story slide
  useEffect(() => {
    if (selectedImageIndex === STORY_SLIDE_INDEX && baseImages.length > 1) {
      setStorySlideVisible(false);
      setTimeout(() => {
        setStorySlideVisible(true);
      }, 50);
    } else {
      setStorySlideVisible(false);
    }
  }, [selectedImageIndex, baseImages.length]);
  
  // Helper function to get current media item
  const getCurrentMediaItem = () => {
    if (selectedImageIndex === STORY_SLIDE_INDEX) {
      return null; // Story slide, not a media item
    }
    const actualIndex = selectedImageIndex < STORY_SLIDE_INDEX 
      ? selectedImageIndex 
      : selectedImageIndex - 1;
    return baseImages[actualIndex] || null;
  };
  
  // Intersection Observer to track active section
  useEffect(() => {
    const handleScroll = () => {
      const offset = 200; // Offset for sticky nav
      
      // Find which section is currently at the top of the viewport
      const sections: Array<{ id: TabId; ref: React.RefObject<HTMLDivElement> }> = [
        { id: 'story', ref: storyRef },
        { id: 'impact', ref: impactRef },
        { id: 'changemakers', ref: changemakersRef },
        { id: 'ourview', ref: ourviewRef },
      ];
      // Only include impactbox if project has impact data
      if (hasImpactForDisplay) {
        sections.push({ id: 'impactbox' as TabId, ref: impactBoxRef });
      }
      
      // Find the section that is currently closest to the top of the viewport
      let activeSection: TabId = 'story';
      let minDistance = Infinity;
      
      sections.forEach(({ id, ref }) => {
        if (ref.current) {
          const rect = ref.current.getBoundingClientRect();
          const sectionTop = rect.top + window.scrollY;
          const currentScroll = window.scrollY + offset;
          
          // If we've scrolled past the start of this section
          if (currentScroll >= sectionTop - 50) {
            const distance = currentScroll - sectionTop;
            // Prefer sections we've scrolled past but are closest to
            if (distance >= -50 && distance < minDistance) {
              minDistance = distance;
              activeSection = id;
            }
          }
        }
      });
      
      setActiveTab(activeSection);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Call once to set initial state
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [hasImpactForDisplay]);
  
  // Get available donation tiers from project
  const getAvailableTiers = (project: Project | null) => {
    if (!project) return [] as { donation: number; unit: string; points: number }[];
    const tiers: { donation: number; unit: string; points: number }[] = [];
    for (let i = 1; i <= 7; i++) {
      const donation = project[`donation_${i}` as keyof Project] as unknown as number;
      const impactUnit = getProjectImpactUnit(project, language) || 'impact created';
      if (donation) {
        tiers.push({
          donation,
          unit: impactUnit || 'impact created',
          points: donation * (project.impactPointsMultiplier || 10)
        });
      }
    }
    return tiers.sort((a, b) => a.donation - b.donation);
  };

  const availableTiers = getAvailableTiers(project);
  const fallbackDonations = [10, 25, 50, 100];
  const donationOptions = availableTiers.length > 0 ? availableTiers.map(t => t.donation) : fallbackDonations;
  
  // Initialize donation amount when project loads
  useEffect(() => {
    if (project && donationAmountInteractive === 0) {
      if (availableTiers.length > 0) {
        setDonationAmountInteractive(availableTiers[0].donation);
      } else {
        setDonationAmountInteractive(fallbackDonations[2]); // default to 50 if no tiers
      }
    }
  }, [project, availableTiers, donationAmountInteractive]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showDonationDropdown) {
        const target = event.target as HTMLElement;
        if (!target.closest('.donation-dropdown-container')) {
          setShowDonationDropdown(false);
        }
      }
    };

    if (showDonationDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showDonationDropdown]);

  // Fetch backers for this project from database
  const { backers, isLoading: isLoadingBackers } = useProjectBackers(project.id);
  
  // Fetch press mentions for this project from database
  const { pressMentions, isLoading: isLoadingPressMentions } = useProjectPressMentions(project.id);
  

  // Get visible backers for carousel (4 at a time on desktop, 2 on mobile)
  // IMPORTANT: Each backer should only appear once, even if we have fewer than requested backers
  const getVisibleBackers = (count: number) => {
    if (backers.length === 0) return [];
    
    // If we have fewer backers than requested, just return all unique backers
    if (backers.length <= count) {
      return backers;
    }
    
    // If we have more backers than requested, use carousel logic
    const visible: typeof backers = [];
    const usedIndices = new Set<number>();
    
    for (let i = 0; i < count && visible.length < backers.length; i++) {
      const idx = (backerCarouselIndex + i) % backers.length;
      // Only add if we haven't used this backer yet in this visible set
      if (!usedIndices.has(idx)) {
        visible.push(backers[idx]);
        usedIndices.add(idx);
      }
    }
    
    return visible;
  };

  // Get visible backers for mobile (2 at a time)
  const getVisibleBackersMobile = () => {
    return getVisibleBackers(2);
  };

  // Get visible press mentions for carousel (3 on desktop, 2 on mobile)
  const getVisiblePressMentions = (count: number = 3) => {
    if (pressMentions.length === 0) return [];
    
    // If we have fewer press mentions than requested, just return all of them
    if (pressMentions.length <= count) {
      return pressMentions;
    }
    
    // If we have more press mentions than requested, use carousel logic
    const visible: typeof pressMentions = [];
    const usedIndices = new Set<number>();
    
    for (let i = 0; i < count && visible.length < pressMentions.length; i++) {
      const idx = (pressMentionCarouselIndex + i) % pressMentions.length;
      // Only add if we haven't used this press mention yet in this visible set
      if (!usedIndices.has(idx)) {
        visible.push(pressMentions[idx]);
        usedIndices.add(idx);
      }
    }
    
    return visible;
  };

  // Get visible press mentions for mobile (2 at a time)
  const getVisiblePressMentionsMobile = () => {
    return getVisiblePressMentions(2);
  };

  // Auto-rotate carousel every 3 seconds (paused on user interaction)
  useEffect(() => {
    // Only auto-rotate if we have more than 4 backers (otherwise all fit on one page)
    if (isCarouselPaused || backers.length === 0 || backers.length <= 4) return;
    
    const interval = setInterval(() => {
      // Increment index and wrap around based on number of backers
      setBackerCarouselIndex((prev) => (prev + 1) % backers.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [isCarouselPaused, backers.length]);

  // Auto-rotate press mentions carousel every 3 seconds (paused on user interaction)
  useEffect(() => {
    // Only auto-rotate if we have more than 3 press mentions (otherwise all fit on one page)
    if (isCarouselPaused || pressMentions.length === 0 || pressMentions.length <= 3) return;
    
    const interval = setInterval(() => {
      // Increment index and wrap around based on number of press mentions
      setPressMentionCarouselIndex((prev) => (prev + 1) % pressMentions.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [isCarouselPaused, pressMentions.length]);

  // Auto-rotate info bar on mobile (every 3 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      setInfoBarIndex((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const currentTier = availableTiers.find(t => t.donation === donationAmountInteractive) || availableTiers[0];
  
  // Impact calculation (new unified logic with fallback)
  const impactResult = project && hasImpactForDisplay
    ? calculateImpactUnified(project, donationAmountInteractive || 0, language === 'de' ? 'de' : 'en')
    : null;
  
  // Try to generate CTA text from templates (new system)
  const generatedCtaText = project && impactResult && hasImpactForDisplay
    ? generateCtaText(project, donationAmountInteractive || 0, impactResult, language === 'de' ? 'de' : 'en')
    : null;
  
  // Parse generated text to extract impact+unit and freitext separately
  const parseCtaText = (text: string, lang: 'en' | 'de') => {
    if (lang === 'de') {
      const match = text.match(/und hilf (.+?) — verdiene/);
      if (match) {
        const impactAndFreitext = match[1];
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
      const match = text.match(/and help (.+?) — earn/);
      if (match) {
        const impactAndFreitext = match[1];
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
  
  // Display values (only if impact data available)
  const impactAmount = impactResult
    ? (impactResult.impact % 1 === 0 ? impactResult.impact.toString() : impactResult.impact.toFixed(2))
    : '0';
  const impactUnit = parsedCta?.unit || impactResult?.unit || 'impact units';
  const impactPoints = Math.floor((project.impactPointsMultiplier ?? (project as any)?.impact_points_multiplier ?? 10) * (donationAmountInteractive || 0));
  
  // Fallback function for copying to clipboard on older browsers
  const copyToClipboardFallback = (text: string) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      toast({
        title: "📋 Ready to Share!",
        description: "Text copied! Open Instagram and paste in your story or post.",
      });
      // Try to open Instagram app or web version
      setTimeout(() => {
        window.open('https://www.instagram.com/', '_blank');
      }, 1500);
    } catch (err) {
      toast({
        title: "❌ Copy Failed",
        description: "Please manually copy the text and share on Instagram.",
      });
    } finally {
      document.body.removeChild(textArea);
    }
  };

  // Function to handle social media sharing with proper text, link, and image
  const handleShare = async (platform: string) => {
    const url = window.location.href;
    const title = projectTitle;
    const shareMessage = `I am supporting ${title} to make a difference! 🌟`;
    const description = projectDescription?.substring(0, 150) || 'Check out this amazing social impact project';
    const imageUrl = project.imageUrl || project.coverImage || '/src/assets/Dopaya Logo.png';
    
    // Try native Web Share API first (works great on mobile!)
    if (platform === 'native' && navigator.share) {
      try {
        await navigator.share({
          title: shareMessage,
          text: `${shareMessage}\n\n${description}`,
          url: url
        });
        toast({
          title: "✅ Shared Successfully!",
          description: "Thanks for spreading the word!",
        });
        return;
      } catch (error) {
        // User cancelled or API not supported, continue to platform-specific
      }
    }
    
    let shareUrl = '';
    
    switch(platform) {
      case 'email':
        const emailSubject = `Join me in supporting ${title}`;
        const emailBody = `Hi there!

I am supporting ${title} to make a difference! 🌟

${description}

Join me in making an impact - every contribution counts:
${url}

Together we can create positive change!`;
        shareUrl = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
        // Open in new window for better compatibility
        window.open(shareUrl, '_self');
        toast({
          title: "📧 Opening Email Client",
          description: "Your email app should open in a moment!",
        });
        return;
        
      case 'facebook':
        // Use Facebook's Dialog API which reads Open Graph tags from the page
        // This will show the image, title, and description automatically
        shareUrl = `https://www.facebook.com/dialog/share?app_id=YOUR_APP_ID&display=popup&href=${encodeURIComponent(url)}&redirect_uri=${encodeURIComponent(url)}`;
        // Fallback to basic sharer if Dialog API doesn't work
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        
        toast({
          title: "📘 Sharing to Facebook",
          description: "Facebook will pull the image and description from the page!",
        });
        break;
        
      case 'instagram':
        // Instagram doesn't support direct URL sharing, so we'll copy to clipboard
        const instagramText = `${shareMessage}

${description}

Learn more and join the movement:
${url}

#SocialImpact #Dopaya #MakeADifference #${title.replace(/\s+/g, '')}`;
        
        // Try to copy to clipboard
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(instagramText);
          } else {
            copyToClipboardFallback(instagramText);
          }
          
          toast({
            title: "📸 Instagram Caption Ready!",
            description: "Caption copied to clipboard! Now:\n1. Save the project image\n2. Open Instagram\n3. Create a post with the image\n4. Paste the caption",
            duration: 8000,
          });
        } catch (error) {
          console.error('Clipboard failed:', error);
          copyToClipboardFallback(instagramText);
          toast({
            title: "📸 Instagram Caption Ready!",
            description: "Caption copied! Open Instagram and paste it with the project image.",
            duration: 6000,
          });
        }
        return;
        
      case 'twitter':
        const twitterText = `${shareMessage} ${url}`;
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}`;
        break;
        
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
        
      default:
        return;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes');
    }
  };
  
  // Calculate raised percentage
  const percentRaised = project.goal && project.goal > 0 ? 
    Math.min(100, Math.round((project.raised || 0) / project.goal * 100)) : 0;

  const impactPointsTiers = [
    { donation: 10, points: project.impactPointsMultiplier ? 10 * project.impactPointsMultiplier : 100 },
    { donation: 50, points: project.impactPointsMultiplier ? 50 * project.impactPointsMultiplier : 500 },
    { donation: 100, points: project.impactPointsMultiplier ? 100 * project.impactPointsMultiplier : 1000 },
    { donation: 500, points: project.impactPointsMultiplier ? 500 * project.impactPointsMultiplier : 5000 },
    { donation: 1000, points: project.impactPointsMultiplier ? 1000 * project.impactPointsMultiplier : 10000 },
  ];




  // Helper to render SDG goals with proper names
  const getSdgName = (goal: string) => {
    const sdgMap: Record<string, string> = {
      '1': 'No Poverty',
      '2': 'Zero Hunger',
      '3': 'Good Health and Well-being',
      '4': 'Quality Education',
      '5': 'Gender Equality',
      '6': 'Clean Water & Sanitation',
      '7': 'Affordable & Clean Energy',
      '8': 'Decent Work & Economic Growth',
      '9': 'Industry, Innovation & Infrastructure',
      '10': 'Reduced Inequalities',
      '11': 'Sustainable Cities & Communities',
      '12': 'Responsible Consumption & Production',
      '13': 'Climate Action',
      '14': 'Life Below Water',
      '15': 'Life on Land',
      '16': 'Peace, Justice & Strong Institutions',
      '17': 'Partnerships for the Goals'
    };
    
    return sdgMap[goal] || `Goal ${goal}`;
  };

  // Only display social links that are available
  const socialLinks = [
    { url: project.facebookUrl || undefined, icon: <FaFacebook size={20} />, name: 'Facebook' },
    { url: project.instagramUrl || undefined, icon: <FaInstagram size={20} />, name: 'Instagram' },
    { url: project.youtubeUrl || undefined, icon: <FaYoutube size={20} />, name: 'YouTube' },
    { url: project.linkedinUrl || undefined, icon: <FaLinkedin size={20} />, name: 'LinkedIn' },
    { url: project.tiktokUrl || undefined, icon: <FaTiktok size={18} />, name: 'TikTok' },
    { url: project.website || undefined, icon: <FaGlobe size={18} />, name: 'Website' }
  ].filter(link => link.url); // Only keep links that exist

  return (
    <>
      <SEOHead
        title={projectTitle}
        description={projectDescription || projectSummary || `${t("projectDetail.supportProject")} ${projectTitle} auf Dopaya - Echten sozialen Impact schaffen und Belohnungen verdienen`}
        keywords={`${projectTitle}, social impact, ${project.category}, Dopaya, social enterprise, impact investing, rewards`}
        ogImage={project.coverImage ? `${window.location.origin}${project.coverImage}` : `${window.location.origin}/src/assets/Dopaya Logo.png`}
        ogType="article"
        canonicalUrl={`${window.location.origin}/project/${project.slug || project.id}`}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": projectTitle,
          "description": projectDescription || projectSummary,
          "url": `${window.location.origin}/project/${project.slug || project.id}`,
          "image": project.coverImage ? `${window.location.origin}${project.coverImage}` : `${window.location.origin}/src/assets/Dopaya Logo.png`,
          "category": project.category
        }}
      />
      
      {/* Hero Section with Beige Background */}
      <div ref={heroSectionRef} className={BRAND_COLORS.bgBeige}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
          {/* Back Button */}
          <LanguageLink href="/projects" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            {t("projectDetail.backToProjects")}
          </LanguageLink>

          {/* Draft Banner */}
          {project.status === 'draft' && (
            <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Draft Preview
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>This page is in draft mode and not visible to the public. It won't appear in project listings until published.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Headline */}
          <div className="mb-4">
            <h1 className="text-4xl md:text-5xl font-bold text-dark font-heading">{projectTitle}</h1>
          </div>

          {/* Mission Statement - Below headline, above image slider */}
          {projectMissionStatement && (
            <div className="mb-8">
              <p className="text-xl text-neutral leading-relaxed whitespace-pre-line">
                {projectMissionStatement}
              </p>
            </div>
          )}

          {/* 3/4 - 1/4 Grid: Images Slider (Left) | Project Snapshot (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Images Slider (3/4) */}
            <div className="lg:col-span-8">
              {/* Main Image Slider with Story Slide */}
              <div className="relative mb-4">
                <div className="relative overflow-hidden rounded-lg bg-gray-100 min-h-[500px] flex items-center justify-center">
                  {/* Render Story Slide if selected, otherwise render image */}
                  {selectedImageIndex === STORY_SLIDE_INDEX && baseImages.length > 1 ? (
                    <div 
                      className="w-full h-full min-h-[500px] max-h-[600px] flex items-center justify-center px-20 md:px-24 lg:px-28 py-8 rounded-lg"
                      style={{ backgroundColor: '#DC582A' }}
                    >
                      <div 
                        className={`text-left max-w-2xl w-full ${storySlideVisible ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}
                        style={{ color: '#FFFFFF' }}
                      >
                        <h2 className="text-2xl md:text-3xl font-bold mb-4">{t("projectDetail.story")}</h2>
                        <p className="text-base md:text-lg mb-6 leading-relaxed">
                          {projectAboutUs ? (
                            projectAboutUs.length > 200 ? `${projectAboutUs.substring(0, 200)}...` : projectAboutUs
                          ) : (
                            projectDescription?.length > 200 ? `${projectDescription.substring(0, 200)}...` : projectDescription || 'Learn more about this inspiring social enterprise and the impact they are creating.'
                          )}
                        </p>
                        <button
                          onClick={() => {
                            scrollToSection('story');
                          }}
                          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm border-2 border-white rounded-lg font-semibold text-white hover:bg-white hover:text-[#DC582A] transition-all duration-300"
                          aria-label="Read full story"
                        >
                          {t("projectDetail.readFullStory")} <ChevronDown className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ) : (() => {
                    const currentMedia = getCurrentMediaItem();
                    if (!currentMedia) {
                      return (
                        <div className="w-full h-full max-h-[600px] flex items-center justify-center bg-gray-100">
                          <p className="text-gray-400">No media available</p>
                        </div>
                      );
                    }
                    
                    // Render video or image based on type
                    if (currentMedia.type === 'video') {
                      // Check if it's a YouTube URL
                      const isYouTube = currentMedia.url.includes('youtube.com') || currentMedia.url.includes('youtu.be');
                      const isVimeo = currentMedia.url.includes('vimeo.com');
                      
                      if (isYouTube) {
                        // Extract YouTube video ID (including Shorts)
                        let videoId = '';
                        const isShorts = currentMedia.url.toLowerCase().includes('/shorts/');
                        
                        // Try Shorts URL first: youtube.com/shorts/VIDEO_ID
                        if (isShorts) {
                          const shortsMatch = currentMedia.url.match(/\/shorts\/([^"&?\/\s]{11})/);
                          if (shortsMatch && shortsMatch[1]) {
                            videoId = shortsMatch[1];
                          }
                        }
                        
                        // Fallback: Standard YouTube URL patterns
                        if (!videoId) {
                          const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
                          const match = currentMedia.url.match(youtubeRegex);
                          if (match && match[1]) {
                            videoId = match[1];
                          }
                        }
                        
                        // Render iframe with appropriate styling
                        if (videoId) {
                          // Shorts: vertical format, centered and narrower
                          if (isShorts) {
                            return (
                              <div className="w-full flex items-center justify-center">
                                <iframe
                                  src={`https://www.youtube.com/embed/${videoId}`}
                                  className="w-full max-w-[315px] aspect-[9/16] min-h-[560px] max-h-[560px] rounded-lg"
                                  frameBorder="0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                  title={`${projectTitle} - Shorts Video`}
                                />
                              </div>
                            );
                          }
                          
                          // Regular YouTube video: horizontal format
                          return (
                            <iframe
                              src={`https://www.youtube.com/embed/${videoId}`}
                              className="w-full h-full min-h-[500px] max-h-[600px] rounded-lg"
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              title={`${projectTitle} - Video`}
                            />
                          );
                        }
                        
                        // Fallback: Direct video file if ID extraction fails
                        return (
                          <video
                            src={currentMedia.url}
                            controls
                            className="w-full h-full max-h-[600px] object-contain rounded-lg"
                            autoPlay={false}
                            loop={false}
                            playsInline
                          >
                            Your browser does not support the video tag.
                          </video>
                        );
                      } else if (isVimeo) {
                        // Extract Vimeo video ID
                        const vimeoRegex = /vimeo\.com\/(\d+)/;
                        const match = currentMedia.url.match(vimeoRegex);
                        const videoId = match && match[1] ? match[1] : null;
                        
                        return videoId ? (
                          <iframe
                            src={`https://player.vimeo.com/video/${videoId}`}
                            className="w-full h-full min-h-[500px] max-h-[600px] rounded-lg"
                            frameBorder="0"
                            allow="autoplay; fullscreen; picture-in-picture"
                            allowFullScreen
                            title={`${projectTitle} - Video`}
                          />
                        ) : (
                          <video
                            src={currentMedia.url}
                            controls
                            className="w-full h-full max-h-[600px] object-contain rounded-lg"
                            autoPlay={false}
                            loop={false}
                            playsInline
                          >
                            Your browser does not support the video tag.
                          </video>
                        );
                      } else {
                        // Direct video file (MP4, WebM, etc.)
                        return (
                          <video
                            src={currentMedia.url}
                            controls
                            className="w-full h-full max-h-[600px] object-contain rounded-lg"
                            autoPlay={false}
                            loop={false}
                            playsInline
                          >
                            Your browser does not support the video tag.
                          </video>
                        );
                      }
                    } else {
                      // Render image
                      return (
                        <EagerOptimizedImage
                          src={currentMedia.url}
                          alt={`${projectTitle} - Image ${selectedImageIndex < STORY_SLIDE_INDEX ? selectedImageIndex + 1 : selectedImageIndex}`} 
                          width={800}
                          height={600}
                          quality={90}
                          className="w-full h-full max-h-[600px] object-contain"
                          fallbackSrc="/placeholder-project.png"
                        />
                      );
                    }
                  })()}

                  {/* Navigation Arrows */}
                  {totalSlides > 1 && (
                    <>
                      {/* Previous Button */}
                      <button
                        onClick={() => {
                          const newIndex = (selectedImageIndex - 1 + totalSlides) % totalSlides;
                          setSelectedImageIndex(newIndex);
                          if (newIndex !== STORY_SLIDE_INDEX) {
                            setStorySlideVisible(false);
                          }
                        }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all"
                        aria-label="Previous slide"
                      >
                        <ChevronLeft className="h-6 w-6 text-gray-700" />
                      </button>
                      
                      {/* Next Button */}
                      <button
                        onClick={() => {
                          const newIndex = (selectedImageIndex + 1) % totalSlides;
                          setSelectedImageIndex(newIndex);
                          if (newIndex === STORY_SLIDE_INDEX) {
                            setTimeout(() => setStorySlideVisible(true), 10);
                          } else {
                            setStorySlideVisible(false);
                          }
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all"
                        aria-label="Next slide"
                      >
                        <ChevronRight className="h-6 w-6 text-gray-700" />
                      </button>
                      
                      {/* Slide Counter */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                        {selectedImageIndex + 1} / {totalSlides}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Project Snapshot (1/4) */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 sticky top-8">
                <h3 className="font-bold text-dark mb-4">{t("projectDetail.projectSnapshot")}</h3>
                <div className="space-y-2">
                  {projectKeyImpact && (
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="text-sm text-neutral">
                        {projectKeyImpact}
                      </div>
                    </div>
                  )}
                  
                  {/* Backed by Partners */}
                  {(() => {
                    const projectAny = project as any;
                    let partners: string[] = [];
                    let totalPartners: number = 0;
                    
                    // First, try to get from Supabase fields
                    const partnerField = projectAny.partners || 
                                       projectAny.backers || 
                                       projectAny.backedBy ||
                                       projectAny.backed_by ||
                                       projectAny.partnerNames || 
                                       projectAny.backersNames ||
                                       projectAny.backers_names ||
                                       projectAny.partner_names ||
                                       projectAny.backers_names ||
                                       projectAny.partnerNamesList ||
                                       projectAny.backersList ||
                                       projectAny.partner_names_list ||
                                       projectAny.backers_list ||
                                       projectAny.institutions ||
                                       projectAny.institutionNames ||
                                       projectAny.institution_names ||
                                       null;
                    
                    if (partnerField) {
                      // Handle different data types
                      if (Array.isArray(partnerField)) {
                        totalPartners = partnerField.length;
                        partners = partnerField.slice(0, 3);
                      } else if (typeof partnerField === 'string') {
                        // Try parsing as JSON first, then as comma-separated
                        try {
                          const parsed = JSON.parse(partnerField);
                          if (Array.isArray(parsed)) {
                            totalPartners = parsed.length;
                            partners = parsed.slice(0, 3);
                          } else {
                            totalPartners = 1;
                            partners = [parsed].slice(0, 3);
                          }
                        } catch {
                          // Not JSON, treat as comma-separated string
                          const allPartners = partnerField
                            .split(',')
                            .map(p => p.trim())
                            .filter(p => p.length > 0);
                          totalPartners = allPartners.length;
                          partners = allPartners.slice(0, 3);
                        }
                      }
                    }
                    
                    // Fallback: Use backers from database if available
                    if (partners.length === 0 && backers && backers.length > 0) {
                      totalPartners = backers.length;
                      partners = backers.slice(0, 3).map(b => b.name);
                    }
                    
                    // Display if we have partners
                    if (partners.length > 0) {
                      const hasMore = totalPartners > 3;
                      return (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="text-sm text-neutral">
                            <span className="font-medium">{t("projectDetail.backedBy")} </span>
                            {partners.join(' • ')}
                            {hasMore && <span className="text-gray-500"> {t("projectDetail.andMore")}</span>}
                          </div>
                        </div>
                      );
                    }
                    
                    return null;
                  })()}
                  
                  {project.category && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mt-4">
                      <span className="text-sm font-medium text-neutral">{t("projectDetail.category")}</span>
                      <span className={`px-2 py-1 ${getCategoryColors(project.category).badge} rounded-full text-xs`}>
                        {project.category}
                      </span>
                    </div>
                  )}
                  
                  {projectCountry && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-neutral">{t("projectDetail.location")}</span>
                      <span className="text-sm text-neutral">{projectCountry}</span>
                    </div>
                  )}
                  
                  {project.founderName && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-neutral">{t("projectDetail.founder")}</span>
                      <span className="text-sm text-neutral">{project.founderName}</span>
                    </div>
                  )}
                  
                  {project.impactPointsMultiplier && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-neutral">{t("projectDetail.impactMultiplier")}:</span>
                      <div className="flex items-center">
                        <span className="text-sm text-neutral">{project.impactPointsMultiplier}x</span>
                        <button 
                          className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
                          onClick={() => setShowImpactInfo(true)}
                          title={t("projectDetail.learnAboutImpactMultiplier")}
                        >
                          <FaInfoCircle className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Support Button */}
                <div className="mt-6">
                  <DonationButton 
                    project={project}
                    className="w-full py-3 text-lg font-bold"
                  >
                    {t("projectDetail.supportThisProject")}
                  </DonationButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Beige Info Bar - Full width with separators */}
      <div className="py-6 w-full flex items-center" style={{ backgroundColor: '#ebe8df' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          {/* Desktop: 3 columns */}
          <div className="hidden md:grid md:grid-cols-3 gap-0 items-center">
            <div className="flex items-center gap-3 md:border-r md:border-white md:pr-8 py-2">
              <ShieldCheck className="h-6 w-6 flex-shrink-0 text-white" strokeWidth={2} />
              <span className="text-sm text-gray-700">{t("projectDetail.carefullyVetted")}</span>
            </div>
            <div className="flex items-center gap-3 md:border-r md:border-white md:px-8 py-2">
              <ArrowRightLeft className="h-6 w-6 flex-shrink-0 text-white" strokeWidth={2} />
              <span className="text-sm text-gray-700">{t("projectDetail.supportGoesToInitiative")}</span>
            </div>
            <div className="flex items-center gap-3 md:pl-8 py-2">
              <Gift className="h-6 w-6 flex-shrink-0 text-white" strokeWidth={2} />
              <span className="text-sm text-gray-700">{t("projectDetail.earnPointsRedeemable")}</span>
            </div>
          </div>
          
          {/* Mobile: Auto-slider (1 item at a time) */}
          <div className="md:hidden relative overflow-hidden min-h-[60px] flex items-center">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${infoBarIndex * 100}%)` }}
            >
              <div className="w-full flex-shrink-0 flex items-center justify-center gap-3 px-4">
                <ShieldCheck className="h-6 w-6 flex-shrink-0 text-white" strokeWidth={2} />
                <span className="text-sm text-gray-700">{t("projectDetail.carefullyVetted")}</span>
              </div>
              <div className="w-full flex-shrink-0 flex items-center justify-center gap-3 px-4">
                <ArrowRightLeft className="h-6 w-6 flex-shrink-0 text-white" strokeWidth={2} />
                <span className="text-sm text-gray-700">{t("projectDetail.supportGoesToInitiative")}</span>
              </div>
              <div className="w-full flex-shrink-0 flex items-center justify-center gap-3 px-4">
                <Gift className="h-6 w-6 flex-shrink-0 text-white" strokeWidth={2} />
                <span className="text-sm text-gray-700">{t("projectDetail.earnPointsRedeemable")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation - Sticky nav bar (sticks at very top, replacing navbar when scrolled) */}
      <div className="sticky top-0 z-[60] bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-6 overflow-x-auto">
            {(() => {
              const tabs: Array<{ id: TabId; label: string }> = [
                { id: 'story', label: t("projectDetail.story") },
                { id: 'changemakers', label: t("projectDetail.theChangemaker") },
                { id: 'impact', label: t("projectDetail.impact") },
                { id: 'ourview', label: t("projectDetail.whyWeBackThem") },
              ];
              // Only show impactbox tab if project has impact data
              if (hasImpactForDisplay) {
                tabs.push({ id: 'impactbox', label: t("projectDetail.makeAnImpact") });
              }
              return tabs;
            })().map((tab) => (
              <button
                key={tab.id}
                onClick={() => scrollToSection(tab.id as TabId)}
                className="py-4 px-1 border-b-2 font-medium transition-colors whitespace-nowrap text-black hover:text-black"
                style={{
                  borderBottomColor: activeTab === tab.id ? BRAND_COLORS.primaryOrange : 'transparent'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Rest of page content */}
      <div className="bg-white">
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 ${showStickyBar ? 'pb-24' : ''}`}>
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Left Side (2/3 width) */}
          <div className="lg:col-span-8 w-full">

            {/* Story Section */}
            <div id="story" ref={storyRef} className="scroll-mt-36 mb-16 w-full">
              <span className="inline-block text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-orange-100 text-orange-800 mb-3">{t("projectDetail.about")}</span>
              <h2 className="text-xl font-bold text-dark font-heading mb-4 w-full">{t("projectDetail.aboutSocialEnterprise")}</h2>
              <div className="text-neutral mb-4 leading-relaxed whitespace-pre-line w-full block text-left">
                {projectDescription}
              </div>
              {projectAboutUs && (
                <div className="text-neutral mb-4 leading-relaxed whitespace-pre-line w-full block text-left">{projectAboutUs}</div>
              )}
            </div>

            {/* Changemakers Section */}
            <div id="changemakers" ref={changemakersRef} className="scroll-mt-36 mb-16 w-full">
              <span className="inline-block text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-orange-100 text-orange-800 mb-3">{t("projectDetail.theChangemaker")}</span>
              <div className="w-full">
                {project.founderName ? (
                  <div className="flex flex-col md:flex-row gap-6 w-full">
                    {/* Left: Founder Images */}
                    <div className="flex-shrink-0 founder-images-wrapper">
                      {/* Mobile: Slight overlapping images horizontally (3-5% overlay) */}
                      {/* Desktop: Slight overlapping images vertically (3-5% overlay) */}
                      <div className="relative md:relative md:w-auto" style={{ width: '136px', minHeight: '128px' }}>
                        {/* First Founder Image */}
                        <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden md:mx-0 relative z-10" style={{ marginLeft: 0 }}>
                        {project.founderImage ? (
                          <OptimizedImage
                            src={project.founderImage}
                            alt={project.founderName || t("images.founder")}
                            width={128}
                            height={128}
                            className="w-full h-full object-cover"
                            fallbackSrc="/placeholder-founder.png"
                          />
                        ) : (
                          <FaUser className="h-16 w-16 text-gray-400" />
                        )}
                        </div>
                        
                        {/* Second Founder Image (if founderImage2 exists) */}
                        {(() => {
                          const projectAny = project as any;
                          const founderImage2 = projectAny.founderImage2 || projectAny.founder_image2;
                          // Check if founderImage2 exists and has a value
                          if (founderImage2 && founderImage2.trim()) {
                            return (
                              <div 
                                className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden 
                                  absolute top-0 z-0 left-[122px]
                                  md:absolute md:left-0 md:top-[122px] md:z-0" 
                              >
                                <OptimizedImage
                                  src={founderImage2}
                                  alt={t("projectDetail.coFounder")}
                                  width={128}
                                  height={128}
                                  className="w-full h-full object-cover"
                                  fallbackSrc="/placeholder-founder.png"
                                />
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    </div>
                    
                    {/* Right: Founder Info */}
                    <div className="flex-1 w-full">
                      <h3 className="text-2xl font-bold text-dark mb-2 w-full">{project.founderName}</h3>
                      <div className="mb-4">
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                          {t("projectDetail.coFounder")}
                        </span>
                      </div>
                      {projectFounderBio && projectFounderBio.trim() ? (
                        <div className="text-neutral leading-relaxed whitespace-pre-line w-full block text-left">
                          {projectFounderBio}
                        </div>
                      ) : (
                        <div className="text-neutral leading-relaxed mb-4 w-full block text-left">
                          {t("projectDetail.founderBioFallback", { 
                            founderName: project.founderName || '', 
                            category: project.category?.toLowerCase() || '', 
                            projectTitle: projectTitle 
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 text-neutral leading-relaxed w-full">
                    <div className="w-full block text-left">
                      {t("projectDetail.teamBehindFallback1", { 
                        projectTitle: projectTitle, 
                        category: project.category?.toLowerCase() || '' 
                      })}
                    </div>
                    <div className="w-full block text-left">
                      {t("projectDetail.teamBehindFallback2")}
                    </div>
                    <div className="w-full block text-left">
                      {t("projectDetail.teamBehindFallback3", { projectTitle: projectTitle })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Impact Section */}
            <div id="impact" ref={impactRef} className="scroll-mt-36 mb-16 w-full">
          {projectImpactAchievements && (
            <div className="w-full">
              <span className="inline-block text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-orange-100 text-orange-800 mb-3">{t("projectDetail.impact")}</span>
              <h2 className="text-xl font-bold text-dark font-heading mb-4 w-full">{t("projectDetail.impactCreatedSoFar")}</h2>
              <div className="space-y-3 w-full">
                {projectImpactAchievements
                  .split(/\s*•\s*/)
                  .filter(point => point.trim().length > 0)
                  .map((point, idx) => {
                    const cleanedPoint = point.trim();
                    return (
                      <div key={idx} className="flex items-start w-full">
                        <FaCheckCircle className="h-5 w-5 text-green-500 mt-1 mr-3 flex-shrink-0" />
                        <div className="text-neutral leading-relaxed flex-1 w-full block text-left whitespace-normal">{cleanedPoint}</div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
            </div>

            {/* Why We Back Them Section - Merged Backers and Why We Chose Them */}
            <div id="ourview" ref={ourviewRef} className="scroll-mt-36 mb-16 w-full">
              <span className="inline-block text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-orange-100 text-orange-800 mb-3">{t("projectDetail.whyWeBackThem")}</span>
              
              {/* Why We Selected Content - First part of merged section */}
              <div className={`${BRAND_COLORS.bgBeige} rounded-lg pb-6 px-0 pt-0 w-full`}>
                <h2 className="text-xl font-bold text-dark font-heading mb-4 w-full">{t("projectDetail.whyWeSelected")} {projectTitle}{language === 'de' ? ' ausgewählt haben' : ''}</h2>
                <div className="space-y-4 text-neutral leading-relaxed w-full">
                    {(() => {
                      // Check all possible field name variations (Supabase may return different casing)
                      // Use language-specific selection reasoning
                      const reasoningText = projectSelectionReasoning;
                      
                      if (reasoningText && typeof reasoningText === 'string' && reasoningText.trim()) {
                        // Use project-specific text from database
                        return <div className="whitespace-pre-line w-full block text-left">{reasoningText}</div>;
                      } else {
                        // Fallback to generic text if no selectionReasoning is provided
                        return (
                          <div className="w-full block text-left">
                            {language === 'de' 
                              ? `Bei Dopaya wählen wir sorgfältig soziale Unternehmen aus, die echtes Engagement für messbaren Impact, nachhaltiges Wachstum und gemeinschaftsgetriebene Lösungen zeigen. ${projectTitle} hat uns aus mehreren überzeugenden Gründen überzeugt.`
                              : `At Dopaya, we carefully select social enterprises that demonstrate genuine commitment to measurable impact, sustainable growth, and community-driven solutions. ${projectTitle} stood out to us for several compelling reasons.`
                            }
                          </div>
                        );
                      }
                    })()}
                  </div>
                </div>

              {/* Trusted by Leading Organizations - Show if there are backers OR press mentions */}
              {(backers.length > 0 || pressMentions.length > 0) && (
                <h2 className="text-xl font-bold text-dark font-heading mb-4 mt-8 w-full block">{t("projectDetail.trustedByLeadingOrganizations")}</h2>
              )}

              {/* Backers Content - Second part of merged section */}
              {backers.length > 0 && (
                <>
                  <div className="text-base text-neutral mb-6 w-full block">
                    {t("projectDetail.trustedByDescription")}
                  </div>
                  
                  {/* Backer Logos Grid - 2 on mobile, 3 on md, 4 on lg with infinite carousel */}
                  {/* Desktop: Show 4 */}
                  <div 
                    className="hidden lg:grid lg:grid-cols-4 gap-6 mb-8 md:mb-12"
                    onMouseEnter={() => setIsCarouselPaused(true)}
                    onMouseLeave={() => setIsCarouselPaused(false)}
                  >
                    {getVisibleBackers(4).map((backer, idx) => {
                      // Try multiple possible field names for logo path
                      const logoPath = (backer as any).logoPath || (backer as any).logo_path || (backer as any).logoPath || '';
                      const logoUrl = getLogoUrl(logoPath);
                      
                      
                      return (
                        <div
                          key={`${backer.id}-${idx}-${backerCarouselIndex}`}
                          onClick={() => {
                            setSelectedInstitution(selectedInstitution === backer.id ? null : backer.id);
                            setIsCarouselPaused(true);
                          }}
                          onTouchEnd={(e) => {
                            e.preventDefault();
                            setSelectedInstitution(selectedInstitution === backer.id ? null : backer.id);
                            setIsCarouselPaused(true);
                          }}
                          className={`cursor-pointer p-4 md:p-6 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 min-h-[120px] md:min-h-[140px] ${
                            selectedInstitution === backer.id 
                              ? 'bg-gray-50 shadow-lg' 
                              : 'bg-white hover:bg-gray-50'
                          }`}
                          style={{ 
                            border: `1px solid ${BRAND_COLORS.borderSubtle}`,
                            boxShadow: selectedInstitution === backer.id ? '0 4px 12px rgba(0,0,0,0.1)' : '0 2px 4px rgba(0,0,0,0.05)',
                            WebkitTapHighlightColor: 'transparent'
                          }}
                        >
                          <div className="text-center">
                            <div className="flex items-center justify-center p-4 h-20 mb-2 rounded-lg transition-all duration-300 hover:scale-105" 
                                 style={{ backgroundColor: BRAND_COLORS.bgWhite }}>
                              {logoUrl ? (
                                <img 
                                  src={logoUrl}
                                  alt={`${backer.name} logo`}
                                  className="max-h-16 max-w-full object-contain transition-all duration-300"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                    if (fallback) fallback.style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              <div className="w-full h-full bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center text-xs font-medium" style={{ display: logoUrl ? 'none' : 'flex' }}>
                                {backer.name?.charAt(0) || '?'}
                              </div>
                            </div>
                            <h3 className="text-sm font-semibold mt-1" style={{ color: BRAND_COLORS.textPrimary }}>
                              {backer.name}
                            </h3>
                            <div className="text-xs mt-0.5 font-medium" style={{ color: BRAND_COLORS.textSecondary }}>
                              {t("projectDetail.tapToLearnMore")}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Mobile/Tablet: Show 2 on mobile, 3 on md */}
                  <div 
                    className="grid grid-cols-2 md:grid-cols-3 lg:hidden gap-6 mb-8 md:mb-12"
                    onMouseEnter={() => setIsCarouselPaused(true)}
                    onMouseLeave={() => setIsCarouselPaused(false)}
                  >
                    {getVisibleBackersMobile().map((backer, idx) => {
                      // Try multiple possible field names for logo path
                      const logoPath = (backer as any).logoPath || (backer as any).logo_path || (backer as any).logoPath || '';
                      const logoUrl = getLogoUrl(logoPath);
                      
                      
                      return (
                        <div
                          key={`${backer.id}-${idx}-${backerCarouselIndex}`}
                          onClick={() => {
                            setSelectedInstitution(selectedInstitution === backer.id ? null : backer.id);
                            setIsCarouselPaused(true);
                          }}
                          onTouchEnd={(e) => {
                            e.preventDefault();
                            setSelectedInstitution(selectedInstitution === backer.id ? null : backer.id);
                            setIsCarouselPaused(true);
                          }}
                          className={`cursor-pointer p-4 md:p-6 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 min-h-[120px] md:min-h-[140px] ${
                            selectedInstitution === backer.id 
                              ? 'bg-gray-50 shadow-lg' 
                              : 'bg-white hover:bg-gray-50'
                          }`}
                          style={{ 
                            border: `1px solid ${BRAND_COLORS.borderSubtle}`,
                            boxShadow: selectedInstitution === backer.id ? '0 4px 12px rgba(0,0,0,0.1)' : '0 2px 4px rgba(0,0,0,0.05)',
                            WebkitTapHighlightColor: 'transparent'
                          }}
                        >
                          <div className="text-center">
                            <div className="flex items-center justify-center p-4 h-20 mb-2 rounded-lg transition-all duration-300 hover:scale-105" 
                                 style={{ backgroundColor: BRAND_COLORS.bgWhite }}>
                              {logoUrl ? (
                                <img 
                                  src={logoUrl}
                                  alt={`${backer.name} logo`}
                                  className="max-h-16 max-w-full object-contain transition-all duration-300"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                    if (fallback) fallback.style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              <div className="w-full h-full bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center text-xs font-medium" style={{ display: logoUrl ? 'none' : 'flex' }}>
                                {backer.name?.charAt(0) || '?'}
                              </div>
                            </div>
                            <h3 className="text-sm font-semibold mt-1" style={{ color: BRAND_COLORS.textPrimary }}>
                              {backer.name}
                            </h3>
                            <div className="text-xs mt-0.5 font-medium" style={{ color: BRAND_COLORS.textSecondary }}>
                              {t("projectDetail.tapToLearnMore")}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Navigation for carousel - Desktop: show if more than 4, Mobile: show if more than 2 */}
                  {/* Desktop Navigation */}
                  {backers.length > 4 && (
                    <div className="hidden lg:flex justify-end items-center gap-1 -mt-4 mb-2">
                      <button
                        onClick={() => {
                          setBackerCarouselIndex((prev) => {
                            const newIndex = prev - 4;
                            return newIndex < 0 ? backers.length - (backers.length % 4 || 4) : newIndex;
                          });
                          setIsCarouselPaused(true);
                        }}
                        onMouseEnter={() => setIsCarouselPaused(true)}
                        className="p-1.5 rounded-md hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
                        aria-label="Previous backers"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setBackerCarouselIndex((prev) => {
                            const nextIndex = prev + 4;
                            return nextIndex >= backers.length ? 0 : nextIndex;
                          });
                          setIsCarouselPaused(true);
                        }}
                        onMouseEnter={() => setIsCarouselPaused(true)}
                        className="p-1.5 rounded-md hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
                        aria-label="Next backers"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  
                  {/* Mobile Navigation - show if more than 2 backers */}
                  {backers.length > 2 && (
                    <div className="lg:hidden flex justify-end items-center gap-1 -mt-4 mb-2">
                      <button
                        onClick={() => {
                          setBackerCarouselIndex((prev) => {
                            const newIndex = prev - 2;
                            return newIndex < 0 ? backers.length - (backers.length % 2 || 2) : newIndex;
                          });
                          setIsCarouselPaused(true);
                        }}
                        className="p-1.5 rounded-md hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
                        aria-label="Previous backers"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setBackerCarouselIndex((prev) => {
                            const nextIndex = prev + 2;
                            return nextIndex >= backers.length ? 0 : nextIndex;
                          });
                          setIsCarouselPaused(true);
                        }}
                        className="p-1.5 rounded-md hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
                        aria-label="Next backers"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  {/* Selected Backer Details */}
                  {selectedInstitution && (() => {
                    const backer = backers.find(b => b.id === selectedInstitution);
                    if (!backer) return null;
                    
                    // Try multiple possible field names
                    const logoPath = (backer as any).logoPath || (backer as any).logo_path || '';
                    const logoUrl = getLogoUrl(logoPath);
                    const shortDescription = getBackerShortDescription(backer, language);
                    const websiteUrl = (backer as any).websiteUrl || (backer as any).website_url || (backer as any).website || '';
                    
                    
                    return (
                      <div className="bg-white rounded-2xl p-8 shadow-lg mb-6 relative" style={{ border: `1px solid ${BRAND_COLORS.borderSubtle}` }}>
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-4">
                              {logoUrl ? (
                                <img 
                                  src={logoUrl}
                                  alt={`${backer.name} logo`}
                                  className="h-14 w-auto object-contain"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                    if (fallback) fallback.style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center text-lg font-medium" style={{ display: logoUrl ? 'none' : 'flex' }}>
                                {backer.name?.charAt(0) || '?'}
                              </div>
                              <h3 className="text-xl font-bold" style={{ color: BRAND_COLORS.textPrimary }}>
                                {backer.name}
                              </h3>
                            </div>
                          </div>
                          {/* Close Button - positioned absolutely */}
                          <button
                            onClick={() => {
                              setSelectedInstitution(null);
                              setIsCarouselPaused(false);
                            }}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
                            aria-label="Close"
                          >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                          <p className="text-neutral leading-relaxed mb-4">
                            {shortDescription || (language === 'de' ? 'Keine Beschreibung verfügbar.' : 'No description available.')}
                          </p>
                          {websiteUrl && (
                            <a 
                              href={websiteUrl || '#'} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
                              style={{ color: BRAND_COLORS.primaryOrange }}
                            >
                              {t("projectDetail.visitBacker", { name: backer.name })}
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </>
              )}

              {/* Recognition & Media Mentions Section */}
              {pressMentions.length > 0 && (
                <div className="mt-4 w-full">
                  <div className="text-base text-neutral mb-4 w-full block">
                    {t("projectDetail.recognizedInPress")}
                  </div>
                  
                  {/* Press Mentions Carousel */}
                  <div className="relative">
                    {/* Desktop: 3 columns */}
                    <div className="hidden md:grid md:grid-cols-3 gap-4 md:gap-6">
                      {getVisiblePressMentions(3).map((pressMention: any, idx: number) => {
                        return (
                          <PressMentionCard 
                            key={`${pressMention.id}-desktop-${idx}-${pressMentionCarouselIndex}`} 
                            pressMention={pressMention} 
                          />
                        );
                      })}
                    </div>
                    
                    {/* Mobile: 2 columns */}
                    <div className="grid md:hidden grid-cols-2 gap-4 md:gap-6">
                      {getVisiblePressMentionsMobile().map((pressMention: any, idx: number) => {
                        return (
                          <PressMentionCard 
                            key={`${pressMention.id}-mobile-${idx}-${pressMentionCarouselIndex}`} 
                            pressMention={pressMention} 
                          />
                        );
                      })}
                    </div>

                    {/* Navigation for carousel - Desktop: show if more than 3, Mobile: show if more than 2 */}
                    {/* Desktop Navigation */}
                    {pressMentions.length > 3 && (
                      <div className="hidden md:flex justify-end items-center gap-1 -mt-4 mb-2">
                        <button
                          onClick={() => {
                            setPressMentionCarouselIndex((prev) => {
                              const newIndex = prev - 3;
                              return newIndex < 0 ? pressMentions.length - (pressMentions.length % 3 || 3) : newIndex;
                            });
                            setIsCarouselPaused(true);
                          }}
                          onMouseEnter={() => setIsCarouselPaused(true)}
                          className="p-1.5 rounded-md hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
                          aria-label="Previous press mentions"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setPressMentionCarouselIndex((prev) => {
                              const nextIndex = prev + 3;
                              return nextIndex >= pressMentions.length ? 0 : nextIndex;
                            });
                            setIsCarouselPaused(true);
                          }}
                          onMouseEnter={() => setIsCarouselPaused(true)}
                          className="p-1.5 rounded-md hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
                          aria-label="Next press mentions"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                    
                    {/* Mobile Navigation - show if more than 2 press mentions */}
                    {pressMentions.length > 2 && (
                      <div className="md:hidden flex justify-end items-center gap-1 -mt-4 mb-2">
                        <button
                          onClick={() => {
                            setPressMentionCarouselIndex((prev) => {
                              const newIndex = prev - 2;
                              return newIndex < 0 ? pressMentions.length - (pressMentions.length % 2 || 2) : newIndex;
                            });
                            setIsCarouselPaused(true);
                          }}
                          className="p-1.5 rounded-md hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
                          aria-label="Previous press mentions"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setPressMentionCarouselIndex((prev) => {
                              const nextIndex = prev + 2;
                              return nextIndex >= pressMentions.length ? 0 : nextIndex;
                            });
                            setIsCarouselPaused(true);
                          }}
                          className="p-1.5 rounded-md hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
                          aria-label="Next press mentions"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Interactive Impact Calculator Box - Bottom of left side */}
            {/* Only show if project has impact data (new system) */}
            {hasImpactForDisplay && (availableTiers.length > 0 || donationOptions.length > 0) && (
              <div id="impactbox" ref={impactBoxRef} className="mt-12">
                <div className="rounded-lg p-4 lg:p-6" style={{ backgroundColor: BRAND_COLORS.bgBeige }}>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                    {/* Left: Text Content (2/3) */}
                    <div className="lg:col-span-2 flex flex-col">
                      <h2 className="text-xl font-bold font-heading mb-3" style={{ color: BRAND_COLORS.textPrimary }}>{t("projectDetail.readyToMakeDifference")}</h2>
                      <div className="text-2xl lg:text-3xl font-semibold leading-relaxed" style={{ color: BRAND_COLORS.textPrimary }}>
                        {t("projectDetail.supportProject")} <span className="font-bold" style={{ color: BRAND_COLORS.textPrimary }}>{projectTitle}</span> {language === 'de' ? 'mit' : 'with'}{' '}
                        <span className="relative inline-block donation-dropdown-container">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowDonationDropdown(!showDonationDropdown);
                            }}
                            className="inline-flex items-center gap-1 border-b-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors min-h-[48px] px-2 font-bold"
                            style={{ color: BRAND_COLORS.primaryOrange }}
                          >
                            ${donationAmountInteractive}
                            <ChevronDown className="h-5 w-5" />
                          </button>
                          {showDonationDropdown && (
                            <div className="absolute top-full left-0 mt-2 bg-white border rounded-lg shadow-lg z-10 min-w-[140px]" style={{ borderColor: BRAND_COLORS.borderSubtle }}>
                              {donationOptions.map((amount) => (
                                <button 
                                  key={amount} 
                                  onClick={(e) => { 
                                    e.stopPropagation();
                                    setDonationAmountInteractive(amount); 
                                    setShowDonationDropdown(false); 
                                  }} 
                                  className="w-full p-2 text-left hover:bg-gray-50 transition-colors min-h-[36px]"
                                >
                                  <span className="text-lg font-bold" style={{ color: BRAND_COLORS.primaryOrange }}>
                                    ${amount}
                                  </span>
                                </button>
                              ))}
                            </div>
                          )}
                        </span>
                        {' '}{language === 'de' ? 'und hilf' : 'and help'}{' '}
                        {generatedCtaText && parsedCta ? (
                          // New system: Use parsed template text
                          <>
                            <span className="font-bold" style={{ color: BRAND_COLORS.primaryOrange }}>
                              {parsedCta.impact} {parsedCta.unit}
                            </span>
                            {' '}
                            <span style={{ color: BRAND_COLORS.textPrimary }}>
                              {parsedCta.freitext}
                            </span>
                          </>
                        ) : impactResult ? (
                          // Fallback: Show impact amount and unit if available (from new system)
                          <>
                            <span className="font-bold" style={{ color: BRAND_COLORS.primaryOrange }}>
                              {impactAmount} {impactUnit}
                            </span>
                          </>
                        ) : (
                          // No impact data: Show simple message (should not happen if hasImpactForDisplay is true)
                          <span style={{ color: BRAND_COLORS.textPrimary }}>
                            {language === 'de' ? 'Gemeinschaften unterstützen' : 'support communities'}
                          </span>
                        )}
                        {' '}<span style={{ color: BRAND_COLORS.textSecondary }}>—</span> <span style={{ color: BRAND_COLORS.textSecondary }}>{language === 'de' ? 'verdiene' : 'earn'}</span>{' '}
                        <span className="font-bold" style={{ color: BRAND_COLORS.textSecondary }}>{impactPoints}</span>{' '}
                        <span style={{ color: BRAND_COLORS.textSecondary }}>{t("projectDetail.impactPoints")}</span>
                      </div>

                      <div className="mt-4">
                        <DonationButton 
                          project={project}
                          className="text-white font-semibold px-6 lg:px-8 py-3 lg:py-4 text-base lg:text-lg min-h-[44px] lg:min-h-[48px] w-full sm:w-auto rounded-lg"
                          style={{ backgroundColor: BRAND_COLORS.primaryOrange }}
                        >
                          {t("projectDetail.supportThisProject")}
                        </DonationButton>
                        
                        {/* Clickable info icon below button */}
                        <button
                          onClick={() => setShowImpactPointsDialog(true)}
                          className="mt-3 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors mx-auto lg:mx-0"
                        >
                          <FaInfoCircle className="h-4 w-4" />
                          <span>{t("projectDetail.learnAboutImpactPoints")}</span>
                        </button>
                      </div>
                    </div>

                    {/* Right: Startup Image (1/3) */}
                    <div className="lg:col-span-1 flex justify-center lg:justify-end">
                      <div className="relative w-full max-w-md h-64 lg:h-80 rounded-lg overflow-hidden">
                        {(() => {
                          const projectImageUrl = getProjectImageUrl(project);
                          return projectImageUrl ? (
                            <OptimizedImage
                              src={projectImageUrl}
                              alt={projectTitle}
                              width={400}
                              height={320}
                              className="w-full h-full object-cover rounded-lg"
                              fallbackSrc="/placeholder-project.png"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center rounded-lg">
                              <span className="text-4xl font-bold text-gray-400">{projectTitle.charAt(0)}</span>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

        </div>

        {/* Right Side (1/3 width) */}
        <div className="lg:col-span-4 lg:mt-6 space-y-6">
          {/* About the Changemaker Box - Hidden on mobile */}
          <div 
            className="hidden md:block bg-white rounded-lg shadow-sm border border-gray-100 p-6 self-start cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => scrollToSection('changemakers')}
          >
            <h3 className="font-bold text-dark mb-4">{t("projectDetail.aboutChangemaker")}</h3>
            <div className="flex items-center gap-4">
              {/* Founder Image */}
              <div className="flex-shrink-0">
                <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  {project.founderImage ? (
                    <OptimizedImage
                      src={project.founderImage}
                      alt={project.founderName || t("images.founder")}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                      fallbackSrc="/placeholder-founder.png"
                    />
                  ) : (
                    <FaUser className="h-10 w-10 text-gray-400" />
                  )}
                </div>
              </div>
              
              {/* Founder Info */}
              <div className="flex-1">
                <h4 className="font-bold text-dark text-lg mb-1">{project.founderName || t("images.founder")}</h4>
                <p className="text-sm text-gray-600 mb-2">{t("projectDetail.coFounder")}</p>
                <p className="text-sm text-neutral line-clamp-2">
                  {projectFounderBio && projectFounderBio.trim() 
                    ? (projectFounderBio.length > 150 
                        ? `${projectFounderBio.substring(0, 150)}...` 
                        : projectFounderBio)
                    : t("projectDetail.founderBioFallback", { 
                        founderName: project.founderName || t("images.founder"), 
                        category: project.category?.toLowerCase() || 'Impact', 
                        projectTitle: projectTitle 
                      })
                  }
                </p>
              </div>
            </div>
            
            {/* Click to learn more */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <button className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-2">
                {t("projectDetail.learnMoreAboutTeam")}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Get in Touch Box */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-dark mb-4">Get in Touch</h3>
            <div className="space-y-2">
              {project.email && (
                <a 
                  href={`mailto:${project.email}`} 
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center">
                    <FaEnvelope className="text-orange-500 mr-3 h-4 w-4" />
                    <span className="text-sm font-medium text-neutral">E-Mail</span>
                  </div>
                </a>
              )}
              
              {project.website && (
                <a 
                  href={project.website}
                  target="_blank"
                  rel="noopener noreferrer" 
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center">
                    <FaGlobe className="text-orange-500 mr-3 h-4 w-4" />
                    <span className="text-sm font-medium text-neutral">Website</span>
                  </div>
                </a>
              )}
              
              {project.instagramUrl && (
                <a 
                  href={project.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer" 
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center">
                    <FaInstagram className="text-orange-500 mr-3 h-4 w-4" />
                    <span className="text-sm font-medium text-neutral">Instagram</span>
                  </div>
                </a>
              )}
              
              {project.facebookUrl && (
                <a 
                  href={project.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer" 
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center">
                    <FaFacebook className="text-orange-500 mr-3 h-4 w-4" />
                    <span className="text-sm font-medium text-neutral">Facebook</span>
                  </div>
                </a>
              )}
              
              {project.youtubeUrl && (
                <a 
                  href={project.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer" 
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center">
                    <FaYoutube className="text-orange-500 mr-3 h-4 w-4" />
                    <span className="text-sm font-medium text-neutral">YouTube</span>
                  </div>
                </a>
              )}
              
              {project.linkedinUrl && (
                <a 
                  href={project.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer" 
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center">
                    <FaLinkedin className="text-orange-500 mr-3 h-4 w-4" />
                    <span className="text-sm font-medium text-neutral">LinkedIn</span>
                  </div>
                </a>
              )}
              
              {project.tiktokUrl && (
                <a 
                  href={project.tiktokUrl}
                  target="_blank"
                  rel="noopener noreferrer" 
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center">
                    <FaTiktok className="text-orange-500 mr-3 h-4 w-4" />
                    <span className="text-sm font-medium text-neutral">TikTok</span>
                  </div>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Sticky bottom bar for mobile support */}
      {showStickyBar && (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-100 p-3 z-50 safe-area-pb">
          {/* Mobile: Two equal-width buttons */}
          <div className="flex gap-2 md:hidden">
            {/* Share button - light gray bg, orange text */}
            {typeof navigator.share === 'function' && (
              <button
                onClick={() => handleShare('native')}
                className="flex-1 flex items-center justify-center gap-2 px-4 h-12 bg-gray-100 text-primary rounded-lg hover:bg-gray-200 transition-colors"
                title="Share"
              >
                <FaShareAlt className="h-4 w-4" />
                <span className="font-semibold">{t("projectDetail.share")}</span>
              </button>
            )}
            
            {/* Support button - orange bg, white text */}
            <DonationButton 
              project={project}
              className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold h-12"
            >
              {t("projectDetail.supportThisProject")}
            </DonationButton>
          </div>

          {/* Desktop: Share icons + Support button */}
          <div className="hidden md:flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-900">{t("projectDetail.shareThisProject")}</span>
              
              <button
                onClick={() => handleShare('email')}
                className="p-2 text-gray-900 hover:text-primary transition-colors"
                title="Share via Email"
              >
                <FaEnvelope className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleShare('facebook')}
                className="p-2 text-gray-900 hover:text-blue-600 transition-colors"
                title="Share on Facebook"
              >
                <FaFacebook className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleShare('instagram')}
                className="p-2 text-gray-900 hover:text-pink-500 transition-colors"
                title="Share on Instagram"
              >
                <FaInstagram className="h-5 w-5" />
              </button>
            </div>
            
            <DonationButton 
              project={project}
              className="bg-primary hover:bg-primary/90 text-white font-bold px-6 py-2"
            >
              {t("projectDetail.supportThisProject")}
            </DonationButton>
          </div>
        </div>
      )}

      {/* Impact Multiplier Info Dialog */}
      <Dialog open={showImpactInfo} onOpenChange={setShowImpactInfo}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("projectDetail.impactMultiplier")}</DialogTitle>
            <DialogDescription>
              {language === 'de' 
                ? 'Dein Beitrag von $10 bringt dir 100 Impact Points – basierend auf Dopayas verifiziertem Impact-System.'
                : 'Your $10 contribution earns 100 Impact Points — based on Dopaya\'s verified impact system.'
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowImpactInfo(false)}>
              {language === 'de' ? 'Verstanden!' : 'Got it!'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Donation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("projectDetail.supportProject")} {projectTitle}</DialogTitle>
            <DialogDescription>
              {t("projectDetail.chooseAmountDonate", { multiplier: project.impactPointsMultiplier || 10 })}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-3 gap-2 my-4">
            {[500, 1000, 5000, 10000, 25000].map((amount) => (
              <button
                key={amount}
                className={`p-2 border rounded-md ${
                  donationAmount === amount 
                    ? 'border-primary bg-primary/10' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setDonationAmount(amount)}
              >
                ${amount.toLocaleString()}
              </button>
            ))}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="custom-amount">Or enter a custom amount:</Label>
            <Input
              id="custom-amount"
              type="number"
              min="1"
              value={donationAmount}
              onChange={(e) => setDonationAmount(parseInt(e.target.value) || 0)}
            />
          </div>
          
          <div className="bg-orange-50 p-3 rounded-md mt-4">
            <p className="text-sm">
              <span className="font-bold">{t("projectDetail.impactPointsYoullEarn")} </span> 
              <span className="text-primary font-bold">
                {donationAmount * (project.impactPointsMultiplier || 10)}
              </span>
            </p>
          </div>
          

        </DialogContent>
      </Dialog>

      {/* Impact Points Info Dialog */}
      <Dialog open={showImpactPointsDialog} onOpenChange={setShowImpactPointsDialog}>
        <DialogContent className="max-w-xl bg-white">
          <DialogHeader>
            <DialogTitle>{t("projectDetail.supportChangeEarnPoints")}</DialogTitle>
          </DialogHeader>
          
          <div className="mt-4">
            {/* Impact points info - same content as right sidebar */}
            <div style={{ backgroundColor: '#F9FAFB' }} className="rounded-lg p-4 mb-6">
              <h3 className="font-bold text-dark mb-3">{t("projectDetail.impactPointsRedeemable")}</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 text-gray-600 font-medium">{t("projectDetail.yourSupport")}</th>
                      <th className="text-left py-2 text-gray-600 font-medium">{t("projectDetail.impactPointsTableHeader")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { donation: 10, points: (project.impactPointsMultiplier || 10) * 10, level: "Supporter" },
                      { donation: 50, points: (project.impactPointsMultiplier || 10) * 50, level: "Advocate" },
                      { donation: 100, points: (project.impactPointsMultiplier || 10) * 100, level: "Changemaker" },
                      { donation: 250, points: (project.impactPointsMultiplier || 10) * 250, level: "Impact Hero" },
                      { donation: 500, points: (project.impactPointsMultiplier || 10) * 500, level: "Impact Legend" },
                      { donation: 1000, points: (project.impactPointsMultiplier || 10) * 1000, level: "Hall of Fame" }
                    ].map((tier, idx) => (
                      <tr key={idx} className="border-b border-gray-100">
                        <td className="py-2">${tier.donation.toLocaleString()}</td>
                        <td className="py-2 font-medium text-primary">{tier.points.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setShowImpactPointsDialog(false)}>
              {language === 'de' ? 'Schließen' : 'Close'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </>
  );
}
