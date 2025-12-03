import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Project } from "@shared/schema";
import { ProjectFilter, FilterValues } from "@/components/projects/project-filter";
import { ProjectGrid } from "@/components/projects/project-grid";
import { SEOHead } from "@/components/seo/seo-head";
import { supabase } from "@/lib/supabase";
import Joyride, { CallBackProps, STATUS, Step } from "react-joyride";
import { isOnboardingPreviewEnabled } from "@/lib/feature-flags";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Gift, Sparkles } from "lucide-react";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useI18n } from "@/lib/i18n/i18n-context";
import { addLanguagePrefix, removeLanguagePrefix } from "@/lib/i18n/utils";

// Import partner logo images
import iimbNsrcelLogo from "@assets/iimb-nsrcel.png";
import hdfcParivartan from "@assets/hdfc-parivartan.png";
import aicIiith from "@assets/aic-iiith.png";
import forbes30 from "@assets/forbes-30.png";
import startupIndia from "@assets/startup-india.png";
import unido from "@assets/unido.png";
import iitKharagpur from "@assets/iit-kharagpur.png";
import iVentureIsb from "@assets/i-venture-isb.png";

export default function ProjectsPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const previewEnabled = isOnboardingPreviewEnabled();
  const { t } = useTranslation();
  const { language } = useI18n();
  const [runTour, setRunTour] = useState(false);
  const [showEndOfTourBanner, setShowEndOfTourBanner] = useState(false);
  const [filters, setFilters] = useState<FilterValues>({
    search: "",
    category: "",
    country: ""
  });
  
  const [queryString, setQueryString] = useState("");
  
  // Create query string when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.search) params.append("search", filters.search);
    if (filters.category) params.append("category", filters.category);
    if (filters.country) params.append("country", filters.country);
    
    setQueryString(params.toString());
  }, [filters]);
  
  // Fetch projects with filters - only show active projects
  const { data: projects, isLoading, error } = useQuery<Project[]>({
    queryKey: [`projects-page-${queryString}`],
    queryFn: async () => {
      let query = supabase
        .from('projects')
        .select('*')
        .eq('status', 'active')
        .order('featured', { ascending: false })
        .order('createdAt', { ascending: false });
      
      // Apply filters
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
      
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      
      if (filters.country) {
        query = query.eq('country', filters.country);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    },
  });
  
  // Step 3 tooltip
  const step3: Step = {
    target: '[data-tour="first-project"]',
    content: "Pick a project you care about. Start with just $5 for your first support.",
    placement: "bottom",
    disableBeacon: true,
  };
  
  // Handle tour callbacks
  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRunTour(false);
      sessionStorage.setItem('onboardingTourCompleted', 'true');
      sessionStorage.removeItem('onboardingTourStepIndex');
      
      // Show end-of-tour CTAs banner (preview only)
      if (previewEnabled && status === STATUS.FINISHED) {
        setShowEndOfTourBanner(true);
        
        // Auto-dismiss after 10 seconds
        setTimeout(() => {
          setShowEndOfTourBanner(false);
        }, 10000);
      }
    }
  };
  
  // Check for tour step 3 (after projects is defined)
  useEffect(() => {
    if (previewEnabled && user) {
      const urlParams = new URLSearchParams(window.location.search);
      const tourStep = urlParams.get('tourStep');
      
      console.log('Projects page tour check:', { tourStep, projectsCount: projects?.length });
      
      if (tourStep === '3') {
        // Wait for projects to load, then start tour
        if (projects && projects.length > 0) {
          console.log('Starting step 3 tour on projects page');
          setTimeout(() => {
            setRunTour(true);
            // Clean up URL but keep preview flag
            const newUrl = window.location.pathname + '?previewOnboarding=1';
            window.history.replaceState({}, '', newUrl);
          }, 800);
        } else if (!isLoading) {
          // Projects loaded but empty, still try to start tour
          console.log('Projects empty, starting tour anyway');
          setTimeout(() => {
            setRunTour(true);
            const newUrl = window.location.pathname + '?previewOnboarding=1';
            window.history.replaceState({}, '', newUrl);
          }, 800);
        }
      }
    }
  }, [previewEnabled, user, projects, isLoading]);

  return (
    <div className="py-24 bg-white min-h-screen">
      <SEOHead
        title={t("projects.seoTitle")}
        description={t("projects.seoDescription")}
        keywords="social impact projects, social enterprises, impact investing, charitable donations, development projects, sustainability projects, social enterprise funding, impact measurement"
        canonicalUrl={`https://dopaya.com${language === 'de' ? '/de/projects' : '/projects'}`}
        ogType="website"
        ogImage="https://dopaya.com/og-projects.jpg"
        alternateUrls={{
          en: 'https://dopaya.com/projects',
          de: 'https://dopaya.com/de/projects',
        }}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": t("projects.title"),
          "description": t("projects.seoDescription"),
          "url": `https://dopaya.com${language === 'de' ? '/de/projects' : '/projects'}`,
          "mainEntity": {
            "@type": "ItemList",
            "name": t("projects.title"),
            "description": t("projects.seoDescription")
          }
        }}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-dark font-heading mb-4">{t("projects.pageTitle")}</h1>
          <p className="text-neutral max-w-2xl mx-auto">
            {t("projects.pageDescription")}
          </p>
          {t("projects.pageSubDescription") && (
            <p className="text-neutral max-w-2xl mx-auto mt-2">
              {t("projects.pageSubDescription")}
            </p>
          )}
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <ProjectFilter onFilterChange={setFilters} />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ProjectGrid
          projects={projects}
          isLoading={isLoading}
          error={error instanceof Error ? error : null}
          showTourTarget={previewEnabled && runTour}
        />
      </div>
      
      {/* End-of-Tour CTAs Banner */}
      {previewEnabled && showEndOfTourBanner && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5">
          <div className="bg-white rounded-lg shadow-2xl border-2 border-orange-300 p-6 max-w-md">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-full flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-[#f2662d]" />
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-lg font-bold text-gray-900">
                  Tour complete! 🎉
                </h4>
                <p className="text-sm text-gray-600">
                  You're all set! What would you like to do next?
                </p>
              </div>
              
              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => {
                    setShowEndOfTourBanner(false);
                    // Scroll to first project card
                    const firstProject = document.querySelector('[data-tour="first-project"]');
                    if (firstProject) {
                      firstProject.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                  }}
                  className="w-full bg-[#f2662d] hover:bg-[#d9551f] text-white font-semibold"
                  style={{ backgroundColor: '#f2662d' }}
                >
                  Explore Projects
                </Button>
                
                <button
                  onClick={() => {
                    setShowEndOfTourBanner(false);
                    navigate('/rewards?previewOnboarding=1');
                  }}
                  className="text-sm text-gray-600 hover:text-gray-800 flex items-center justify-center gap-1"
                >
                  <Gift className="w-4 h-4" />
                  See what rewards I can unlock
                </button>
              </div>
              
              <button
                onClick={() => setShowEndOfTourBanner(false)}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Step 3 Tour */}
      {previewEnabled && (
        <Joyride
          steps={[step3]}
          run={runTour}
          continuous
          showProgress
          showSkipButton
          callback={handleJoyrideCallback}
          styles={{
            options: {
              primaryColor: '#f2662d',
              zIndex: 10000,
            },
            buttonNext: {
              backgroundColor: '#f2662d',
              color: 'white',
            },
            buttonBack: {
              color: '#f2662d',
            },
            buttonSkip: {
              color: '#666',
            },
          }}
          locale={{
            back: 'Back',
            close: 'Close',
            last: 'Got it',
            next: 'Next',
            open: 'Open',
            skip: 'Skip tour',
          }}
        />
      )}
      

      <div className={`py-24 mt-16`} style={{ backgroundColor: '#f2662d' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white font-heading mb-4">{t("projects.ctaTitle")}</h2>
            <p className="text-white max-w-2xl mx-auto mb-8">
              {t("projects.ctaDescription")}
            </p>
            <a 
              href="https://tally.so/r/3EM0vA" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{ color: '#f2662d' }}
            >
              {t("projects.ctaButton")}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
