import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Project } from "@shared/schema";
import { ProjectDetailNew } from "@/components/projects/project-detail-new";
import { ProjectDetailNewV3 } from "@/components/projects/project-detail-new-v3";
import { SEOHead } from "@/components/seo/seo-head";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useI18n } from "@/lib/i18n/i18n-context";
import { getProjectTitle, getProjectDescription, getProjectSummary } from "@/lib/i18n/project-content";
import { addLanguagePrefix, removeLanguagePrefix } from "@/lib/i18n/utils";

export default function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();
  const { language } = useI18n();
  
  const { data: project, isLoading, error } = useQuery<Project | null>({
    queryKey: ["project-detail", slug],
    queryFn: async () => {
      if (!slug) return null;
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('slug', slug)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null;
        }
        throw error;
      }
      return data;
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center py-12">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h1 className="text-2xl font-bold text-dark font-heading mb-2">{t("projectDetail.projectNotFound")}</h1>
          <p className="text-neutral">
            {t("projectDetail.projectNotFoundDescription")}
          </p>
        </div>
      </div>
    );
  }
  
  // Get language-specific content
  const projectTitle = getProjectTitle(project, language);
  const projectDescription = getProjectDescription(project, language);
  const projectSummary = getProjectSummary(project, language);
  
  // Build canonical URL with language prefix
  const canonicalPath = language === 'de' 
    ? `/de/project/${project.slug}`
    : `/project/${project.slug}`;
  const canonicalUrl = `https://dopaya.com${canonicalPath}`;
  
  // Build alternate URLs
  const alternateUrls = {
    en: `https://dopaya.com/project/${project.slug}`,
    de: `https://dopaya.com/de/project/${project.slug}`,
  };
  
  return (
    <>
      <SEOHead
        title={projectTitle}
        description={projectDescription || projectSummary || `${t("projectDetail.supportProject")} ${projectTitle}, ein soziales Impact-Projekt, das einen Unterschied in ${project.category} macht.`}
        keywords={`${projectTitle}, ${project.category}, social impact, donation, ${project.primarySdg ? `SDG ${project.primarySdg}, ` : ''}social enterprise, development project`}
        canonicalUrl={canonicalUrl}
        alternateUrls={alternateUrls}
        ogType="article"
        ogImage={project.imageUrl || undefined}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": projectTitle,
          "description": projectDescription || projectSummary,
          "image": project.imageUrl,
          "author": {
            "@type": "Organization",
            "name": "Dopaya"
          },
          "publisher": {
            "@type": "Organization",
            "name": "Dopaya",
            "logo": "https://dopaya.com/logo.png"
          },
          "mainEntityOfPage": canonicalUrl,
          "about": {
            "@type": "Thing",
            "name": project.category
          }
        }}
      />
      
      {/* Always use V3 template for all projects. If fallback is ever needed,
          swap back to ProjectDetailNew (legacy template). */}
      <ProjectDetailNewV3 project={project} />
    </>
  );
}
