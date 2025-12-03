import { useState, useEffect, useRef } from "react";
import { SEOHead } from "@/components/seo/seo-head";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ChevronRight, CheckCircle, Users, BarChart, Star, TrendingUp, Award, Target, Zap, FileText, Building2, MessageCircle, GitMerge, Globe } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Project } from "@shared/schema";
import { supabase } from "@/lib/supabase";
import { getProjectImageUrl } from "@/lib/image-utils";
import { TextRotate } from "@/components/ui/text-rotate";
import DisplayCards from "@/components/ui/display-cards";
import { DopayaTimelineSimplified } from "@/components/ui/dopaya-timeline-simplified";
import { ContactSection } from "@/components/ui/contact-section";
import { SelectionCriteriaEnhanced } from "@/components/ui/selection-criteria-enhanced";
import { Carousel, TestimonialCard } from "@/components/ui/retro-testimonial";
import type { iTestimonial } from "@/components/ui/retro-testimonial";
import { TYPOGRAPHY } from "@/constants/typography";
import { BRAND_COLORS } from "@/constants/colors";
import { MOBILE } from "@/constants/mobile";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useI18n } from "@/lib/i18n/i18n-context";
import { LanguageLink } from "@/components/ui/language-link";

export default function SocialEnterprisesPage() {
  // Cache bust: 2025-01-27 11:22
  const { t } = useTranslation();
  const { language } = useI18n();
  const [isVisible, setIsVisible] = useState(false);
  const [showFreeTooltip, setShowFreeTooltip] = useState(false);
  const [showTimeTooltip, setShowTimeTooltip] = useState(false);
  const projectsRef = useRef<HTMLDivElement>(null);

  // Early adopter benefit cards data
  const benefitData: iTestimonial[] = [
    {
      name: "Full Dedication",
      designation: "Personalized Support",
      description: "We're focused on you, not hundreds of SEs. Get personalized attention and direct access to our team.",
      profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    {
      name: "Simple Process",
      designation: "Easy Application",
      description: "You apply, we handle the rest. No complex paperwork or lengthy processes. Just focus on your mission.",
      profileImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    {
      name: "Direct Exchange",
      designation: "Founder Access",
      description: "We understand your true pain points. Direct communication with founders who've been in your shoes.",
      profileImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    {
      name: "Early Ecosystem",
      designation: "Shape the Future",
      description: "Be part of building something bigger. Shape the future of impact funding and sustainable solutions.",
      profileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    {
      name: "No Platform Fees",
      designation: "100% to Impact",
      description: "All supporter funding goes directly to your cause. No platform fees, ever. We succeed when you succeed.",
      profileImage: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    {
      name: "Community Building",
      designation: "Sustainable Growth",
      description: "Build a community of supporters who understand your mission and become advocates for your cause.",
      profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    }
  ];

  const benefitCards = benefitData.map((benefit, index) => (
    <TestimonialCard
      key={benefit.name}
      testimonial={benefit}
      index={index}
      backgroundImage="https://images.unsplash.com/photo-1528458965990-428de4b1cb0d?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    />
  ));

  // Simplified benefit cards - just key advantage statements
  const simplifiedBenefitData: iTestimonial[] = [
    {
      name: "Exclusive Early Access",
      designation: "Founding Member Status",
      description: "Get exclusive early advantages and founding member benefits.",
      profileImage: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      icon: "community"
    },
    {
      name: "Personalized Support",
      designation: "Full Dedication",
      description: "Get direct access to our team and personalized attention.",
      profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      icon: "dedication"
    },
    {
      name: "Simple Process",
      designation: "Easy Application",
      description: "You apply, we handle the rest. No complex paperwork.",
      profileImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      icon: "process"
    },
    {
      name: "Co-Creation Opportunity",
      designation: "Shape the Future",
      description: "Help shape the future of impact funding with your feedback.",
      profileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      icon: "ecosystem"
    }
  ];

  const simplifiedBenefitCards = simplifiedBenefitData.map((benefit, index) => (
    <TestimonialCard
      key={benefit.name}
      testimonial={benefit}
      index={index}
      backgroundImage="https://images.unsplash.com/photo-1528458965990-428de4b1cb0d?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    />
  ));

  // Institution reaction cards data
  const founderProblemCards = [
    {
      icon: <Users className="size-4 text-orange-500" />,
      title: "Too Social for Investors",
      description: "\"You should focus on impact, but we expect a higher ROI\"",
      date: "Recent feedback from investor",
      iconClassName: "text-orange-500",
      titleClassName: "text-orange-600",
      className: "[grid-area:stack] hover:-translate-y-6 hover:scale-105 transition-all duration-500",
    },
    {
      icon: <Building2 className="size-4 text-red-500" />,
      title: "Not Understood by Banks",
      description: "\"Your business model doesn't fit our risk assessment criteria\"",
      date: "Recent feedback from bank",
      iconClassName: "text-red-500",
      titleClassName: "text-red-600",
      className: "[grid-area:stack] translate-x-4 translate-y-4 hover:-translate-y-2 hover:scale-105 transition-all duration-500",
    },
    {
      icon: <FileText className="size-4 text-purple-500" />,
      title: "Too Business for Grants",
      description: "\"You're too commercial for our charitable funding program\"",
      date: "Recent feedback from grant maker",
      iconClassName: "text-purple-500",
      titleClassName: "text-purple-600",
      className: "[grid-area:stack] translate-x-8 translate-y-8 hover:translate-y-4 hover:scale-105 transition-all duration-500",
    },
  ];

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Fetch active projects from Supabase
  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["projects-social-enterprises"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('status', 'active')
        .order('featured', { ascending: false })
        .order('createdAt', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  // Auto-scroll effect for projects
  useEffect(() => {
    const projectsContainer = projectsRef.current;
    if (!projectsContainer || !projects.length) return;

    const scroll = () => {
      if (projectsContainer.scrollLeft >= projectsContainer.scrollWidth - projectsContainer.clientWidth) {
        projectsContainer.scrollLeft = 0;
      } else {
        projectsContainer.scrollLeft += 1;
      }
    };

    const interval = setInterval(scroll, 50);
    return () => clearInterval(interval);
  }, [projects]);

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const cardHover = {
    scale: 1.03,
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    transition: { duration: 0.3 }
  };

  return (
    <>
      <SEOHead
        title={t("socialEnterprises.seoTitle")}
        description={t("socialEnterprises.seoDescription")}
        keywords={t("socialEnterprises.seoKeywords")}
        canonicalUrl={`https://dopaya.com${language === 'de' ? '/de/social-enterprises' : '/social-enterprises'}`}
        alternateUrls={{
          en: 'https://dopaya.com/social-enterprises',
          de: 'https://dopaya.com/de/social-enterprises',
        }}
        ogType="website"
        ogImage="https://dopaya.com/og-social-enterprises.jpg"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Social Enterprises Program",
          "description": "Platform for social enterprises to access funding, investors, and grant support",
          "url": "https://dopaya.com/social-enterprises",
          "mainEntity": {
            "@type": "Service",
            "name": "Social Enterprise Support Program",
            "provider": {
              "@type": "Organization",
              "name": "Dopaya"
            },
            "serviceType": "Business Support",
            "areaServed": "Global"
          }
        }}
      />
      
      <div className={`transition-opacity duration-700 overflow-x-hidden ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      

      {/* Hero Section */}
      <section className="py-24" style={{ backgroundColor: BRAND_COLORS.bgBeige }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
            <div className="lg:w-1/2 text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4" style={{ color: BRAND_COLORS.textPrimary }}>
                {language === 'de' ? (
                  <>
                    Schalte{" "}
                    <TextRotate
                      texts={["Finanzierung", "Sichtbarkeit", "Support", "Investoren", "Zuschüsse", "Community"]}
                      rotationInterval={2000}
                      mainClassName="inline-block text-orange-500"
                    />
                    {" "}frei, um dein soziales Unternehmen zu skalieren.
                  </>
                ) : (
                  <>
                    Unlock{" "}
                    <TextRotate
                      texts={["funding", "visibility", "support", "investors", "grants", "community"]}
                      rotationInterval={2000}
                      mainClassName="inline-block text-orange-500"
                    />
                    {" "}to scale your social enterprise.
                  </>
                )}
              </h1>
              <p className="text-xl mb-8" style={{ color: BRAND_COLORS.textSecondary }}>
                {t("socialEnterprises.heroSubtitle")}
              </p>
              
              <a href="https://tally.so/r/3EM0vA" target="_blank" rel="noopener noreferrer" className="block w-full sm:w-auto mx-auto lg:mx-0">
                <Button 
                  className="text-white px-8 py-6 text-lg rounded-md font-semibold shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto"
                  style={{ backgroundColor: BRAND_COLORS.primaryOrange }}
                >
                  {t("socialEnterprises.startApplication")}
                </Button>
              </a>
              
              {/* Key Benefits Below Button */}
              <div className="flex flex-wrap gap-4 mt-6 sm:mt-8 justify-center lg:justify-start">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-700">{t("socialEnterprises.freeForever")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-700">{t("socialEnterprises.simpleOnboarding")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-700">{t("socialEnterprises.limitedPilotAccess")}</span>
                </div>
              </div>
            </div>
            <div className="lg:w-1/2">
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7 }}
                className="bg-white rounded-xl shadow-xl p-6 border border-gray-100"
              >
                
                {/* Projects Section */}
                <div className="mb-8">
                  <div 
                    ref={projectsRef}
                    className="flex gap-3 overflow-x-hidden"
                  >
                    {(projects as Project[]).map((project: Project, index: number) => (
                      <div key={project.id} className="group hover:scale-105 transition-transform duration-200 relative flex-shrink-0 w-1/2 lg:w-1/4">
                        <img 
                          src={getProjectImageUrl(project) || 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'} 
                          alt={project.title} 
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <div className="absolute bottom-2 left-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            project.category === 'Education' ? 'bg-blue-100 text-blue-800' :
                            project.category === 'Environment' ? 'bg-green-100 text-green-800' :
                            project.category === 'Health' ? 'bg-red-100 text-red-800' :
                            project.category === 'Poverty' ? 'bg-purple-100 text-purple-800' :
                            project.category === 'Rural Development' ? 'bg-yellow-100 text-yellow-800' :
                            project.category === 'Agriculture' ? 'bg-orange-100 text-orange-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {project.category}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Benefits Section */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <div className="rounded-full bg-gray-100 w-12 h-12 flex items-center justify-center mx-auto mb-3">
                      <Target className="h-6 w-6 text-gray-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-800 mb-1">{t("socialEnterprises.sectorAgnostic")}</p>
                    <p className="text-xs text-gray-600">{t("socialEnterprises.allCausesWelcome")}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <div className="rounded-full bg-gray-100 w-12 h-12 flex items-center justify-center mx-auto mb-3">
                      <Zap className="h-6 w-6 text-gray-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-800 mb-1">{t("socialEnterprises.freeOfCost")}</p>
                    <p className="text-xs text-gray-600">{t("socialEnterprises.noPlatformFees")}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <div className="rounded-full bg-gray-100 w-12 h-12 flex items-center justify-center mx-auto mb-3">
                      <FileText className="h-6 w-6 text-gray-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-800 mb-1">{t("socialEnterprises.applicationOnly")}</p>
                    <p className="text-xs text-gray-600">{t("socialEnterprises.simpleProcess")}</p>
                  </div>
                </div>
                
              </motion.div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Problem Section */}
      <section className={`py-16 md:py-20 bg-white`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            {/* Left Column - Problem Statement */}
            <div className="lg:w-1/2 flex flex-col justify-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <h2 className={`${TYPOGRAPHY.section} mb-6`} style={{ color: BRAND_COLORS.textPrimary }}>
                  {t("socialEnterprises.problemTitle")}
                </h2>
                
                <div className="mb-6">
                  <p className="text-lg mb-4" style={{ color: BRAND_COLORS.textSecondary }}>
                    {t("socialEnterprises.problemDescription")}
                  </p>
                </div>
                
                <p className="text-lg font-medium" style={{ color: BRAND_COLORS.textSecondary }}>
                  {language === 'de' ? 'Wir versuchen, wirkungsvolle SEs mit individuellen Unterstützern zu verbinden. Damit du nicht Finanzierung und Sichtbarkeit jagen musst und dich auf das konzentrieren kannst, was wirklich zählt: Impact.' : 'We are trying to connect impactful SEs with individual supporters. So you don\'t have to chase funding and visibility and can focus on what truly matters: impact.'}
                </p>
              </motion.div>
            </div>

            {/* Right Column - Founder Problem Cards */}
            <div className="lg:w-1/2 w-full">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="flex justify-center overflow-hidden"
              >
                <div className="relative w-full max-w-xs md:max-w-sm">
                  <DisplayCards cards={founderProblemCards} />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - IMPROVED VERSION */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className={`${TYPOGRAPHY.section} mb-4`}>{t("socialEnterprises.processSectionTitle")}</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {t("socialEnterprises.processSectionSubtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl border border-gray-100 p-6 text-center hover:shadow-lg transition-all duration-300"
            >
              <div className="bg-gray-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 border-2 border-gray-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="bg-orange-50 text-orange-600 text-xs font-medium px-2 py-1 rounded-full inline-block mb-3">
                {language === 'de' ? 'SCHRITT 1' : 'STEP 1'}
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">{t("socialEnterprises.processStep1")}</h3>
              <p className="text-gray-600 text-sm">
                {t("socialEnterprises.step1Description")}
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl border border-gray-100 p-6 text-center hover:shadow-lg transition-all duration-300"
            >
              <div className="bg-gray-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 border-2 border-gray-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="bg-orange-50 text-orange-600 text-xs font-medium px-2 py-1 rounded-full inline-block mb-3">
                {language === 'de' ? 'SCHRITT 2' : 'STEP 2'}
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">{t("socialEnterprises.processStep2")}</h3>
              <p className="text-gray-600 text-sm">
                {t("socialEnterprises.step2Description")}
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl border border-gray-100 p-6 text-center hover:shadow-lg transition-all duration-300"
            >
              <div className="bg-gray-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 border-2 border-gray-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
              <div className="bg-orange-50 text-orange-600 text-xs font-medium px-2 py-1 rounded-full inline-block mb-3">
                {language === 'de' ? 'SCHRITT 3' : 'STEP 3'}
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">{t("socialEnterprises.processStep3")}</h3>
              <p className="text-gray-600 text-sm">
                {t("socialEnterprises.step3Description")}
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl border border-gray-100 p-6 text-center hover:shadow-lg transition-all duration-300"
            >
              <div className="bg-gray-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 border-2 border-gray-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="bg-orange-50 text-orange-600 text-xs font-medium px-2 py-1 rounded-full inline-block mb-3">
                {language === 'de' ? 'SCHRITT 4' : 'STEP 4'}
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">{t("socialEnterprises.processStep4")}</h3>
              <p className="text-gray-600 text-sm">
                {t("socialEnterprises.step4Description")}
              </p>
            </motion.div>
          </div>

          <div className="mt-12">
            <div className="grid md:grid-cols-3 gap-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <h4 className="font-semibold text-gray-900 mb-2">{t("socialEnterprises.benefit1Title")}</h4>
                <p className="text-gray-600 text-sm">{t("socialEnterprises.benefit1Description")}</p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <h4 className="font-semibold text-gray-900 mb-2">{t("socialEnterprises.benefit2Title")}</h4>
                <p className="text-gray-600 text-sm">{t("socialEnterprises.benefit2Description")}</p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <h4 className="font-semibold text-gray-900 mb-2">{t("socialEnterprises.benefit3Title")}</h4>
                <p className="text-gray-600 text-sm">{t("socialEnterprises.benefit3Description")}</p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Pilot Program Section - Moved from top */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="rounded-xl p-8 shadow-lg" style={{ backgroundColor: BRAND_COLORS.primaryOrange }}>
              <h3 className="text-3xl font-bold text-white mb-4">
                {t("socialEnterprises.pilotProgramTitle")}
              </h3>
              <p className="text-orange-100 mb-8 text-xl max-w-2xl mx-auto">
                {t("socialEnterprises.pilotProgramDescription")}
              </p>
              <div className="flex flex-col items-center gap-6">
                <a href="https://tally.so/r/3EM0vA" target="_blank" rel="noopener noreferrer">
                  <Button 
                    className="px-8 py-4 text-xl rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 bg-white hover:bg-gray-50"
                    style={{ color: BRAND_COLORS.primaryOrange }}
                  >
                    {t("socialEnterprises.applyForPilotProgram")}
                  </Button>
                </a>
                <LanguageLink
                  href="/eligibility" 
                  className="text-orange-100 hover:text-white transition-colors text-lg underline"
                >
                  {t("socialEnterprises.checkEligibility")}
                </LanguageLink>
                <div className="mt-4 text-orange-100 text-base">
                  <p>{t("socialEnterprises.pilotProgramBenefits")}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Animated Timeline Section */}
      <section id="timeline" className="py-24" style={{ backgroundColor: BRAND_COLORS.bgBeige }}>
        <DopayaTimelineSimplified />
      </section>

      {/* Enhanced Eligibility Criteria Section */}
      {/* Cache bust: 2025-01-27 12:15 - Efficiency criterion included */}
      <div id="eligibility">
        <SelectionCriteriaEnhanced />
      </div>

      {/* FAQ Section */}
      <section className="py-24" style={{ backgroundColor: BRAND_COLORS.bgWhite }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className={`${TYPOGRAPHY.section} mb-4`} style={{ 
              color: BRAND_COLORS.textPrimary, 
              fontFamily: "'Satoshi', 'Inter', system-ui, sans-serif" 
            }}>
              {t("socialEnterprises.faqTitle")}
            </h2>
            <p className="text-xl max-w-2xl mx-auto" style={{ color: BRAND_COLORS.textSecondary }}>
              {t("socialEnterprises.faqSubtitle")}
            </p>
          </div>
          
          <Accordion type="multiple" className="w-full">
            <AccordionItem value="item-1" className="border-b" style={{ borderColor: BRAND_COLORS.borderSubtle }}>
              <AccordionTrigger className={`text-left font-medium py-6 hover:no-underline ${TYPOGRAPHY.subsection}`} style={{ color: BRAND_COLORS.textPrimary }}>
                {t("socialEnterprises.faq1Question")}
              </AccordionTrigger>
              <AccordionContent className={`pb-6 ${TYPOGRAPHY.body}`} style={{ color: BRAND_COLORS.textSecondary }}>
                {t("socialEnterprises.faq1Answer")}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="border-b" style={{ borderColor: BRAND_COLORS.borderSubtle }}>
              <AccordionTrigger className={`text-left font-medium py-6 hover:no-underline ${TYPOGRAPHY.subsection}`} style={{ color: BRAND_COLORS.textPrimary }}>
                {t("socialEnterprises.faq2Question")}
              </AccordionTrigger>
              <AccordionContent className={`pb-6 ${TYPOGRAPHY.body}`} style={{ color: BRAND_COLORS.textSecondary }}>
                {t("socialEnterprises.faq2Answer")}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="border-b" style={{ borderColor: BRAND_COLORS.borderSubtle }}>
              <AccordionTrigger className={`text-left font-medium py-6 hover:no-underline ${TYPOGRAPHY.subsection}`} style={{ color: BRAND_COLORS.textPrimary }}>
                {t("socialEnterprises.faq3Question")}
              </AccordionTrigger>
              <AccordionContent className={`pb-6 ${TYPOGRAPHY.body}`} style={{ color: BRAND_COLORS.textSecondary }}>
                {t("socialEnterprises.faq3Answer")}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="border-b" style={{ borderColor: BRAND_COLORS.borderSubtle }}>
              <AccordionTrigger className={`text-left font-medium py-6 hover:no-underline ${TYPOGRAPHY.subsection}`} style={{ color: BRAND_COLORS.textPrimary }}>
                {t("socialEnterprises.faq4Question")}
              </AccordionTrigger>
              <AccordionContent className={`pb-6 ${TYPOGRAPHY.body}`} style={{ color: BRAND_COLORS.textSecondary }}>
                {t("socialEnterprises.faq4Answer")}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="border-b" style={{ borderColor: BRAND_COLORS.borderSubtle }}>
              <AccordionTrigger className={`text-left font-medium py-6 hover:no-underline ${TYPOGRAPHY.subsection}`} style={{ color: BRAND_COLORS.textPrimary }}>
                {t("socialEnterprises.faq5Question")}
              </AccordionTrigger>
              <AccordionContent className={`pb-6 ${TYPOGRAPHY.body}`} style={{ color: BRAND_COLORS.textSecondary }}>
                {t("socialEnterprises.faq5Answer")}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6" className="border-b" style={{ borderColor: BRAND_COLORS.borderSubtle }}>
              <AccordionTrigger className={`text-left font-medium py-6 hover:no-underline ${TYPOGRAPHY.subsection}`} style={{ color: BRAND_COLORS.textPrimary }}>
                {t("socialEnterprises.faq6Question")}
              </AccordionTrigger>
              <AccordionContent className={`pb-6 ${TYPOGRAPHY.body}`} style={{ color: BRAND_COLORS.textSecondary }}>
                {t("socialEnterprises.faq6Answer")}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-7" className="border-b" style={{ borderColor: BRAND_COLORS.borderSubtle }}>
              <AccordionTrigger className={`text-left font-medium py-6 hover:no-underline ${TYPOGRAPHY.subsection}`} style={{ color: BRAND_COLORS.textPrimary }}>
                {t("socialEnterprises.faq7Question")}
              </AccordionTrigger>
              <AccordionContent className={`pb-6 ${TYPOGRAPHY.body}`} style={{ color: BRAND_COLORS.textSecondary }}>
                {t("socialEnterprises.faq7Answer")}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Contact Section */}
      <ContactSection />

      {/* Apply Now Section */}
      <section className="py-24" style={{ backgroundColor: BRAND_COLORS.bgCool }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="rounded-xl shadow-lg p-8 text-center"
            style={{ backgroundColor: BRAND_COLORS.primaryOrange }}
          >
            <h2 className={`${TYPOGRAPHY.section} mb-4 text-white`}>
              {t("socialEnterprises.finalCtaTitle")}
            </h2>
            <p className="text-orange-100 mb-8 text-lg max-w-2xl mx-auto">
              {t("socialEnterprises.finalCtaSubtitle")}
            </p>
            <a href="https://tally.so/r/3EM0vA" target="_blank" rel="noopener noreferrer">
              <Button 
                className="px-8 py-4 text-lg rounded-md font-semibold shadow-lg hover:shadow-xl transition-all duration-300 bg-white hover:bg-gray-50"
                style={{ color: BRAND_COLORS.primaryOrange }}
              >
                {t("socialEnterprises.joinCommunity")}
              </Button>
            </a>
          </motion.div>
        </div>
      </section>

      {/* Sticky bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 py-3 px-4 z-50 md:hidden">
        <div className="flex justify-between items-center">
          <p className="font-medium text-gray-800">{t("socialEnterprises.stickyCtaText")}</p>
          <a href="https://tally.so/r/3EM0vA" target="_blank" rel="noopener noreferrer">
            <Button size="sm" className="text-white px-4 py-2" style={{ backgroundColor: BRAND_COLORS.primaryOrange }}>
              {t("socialEnterprises.applyNow")}
            </Button>
          </a>
        </div>
      </div>
      </div>
    </>
  );
}