import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Project } from "@shared/schema";
import { ProjectDetailNew } from "@/components/projects/project-detail-new";
import { ProjectDetailNewV3 } from "@/components/projects/project-detail-new-v3";
import { SEOHead } from "@/components/seo/seo-head";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  
  // Projects that should use the v3 template
  const v3Slugs = ['openversum', 'ignis-careers', 'vision-friend'];
  const useV3Template = slug && v3Slugs.includes(slug);
  
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
          <h1 className="text-2xl font-bold text-dark font-heading mb-2">Project Not Found</h1>
          <p className="text-neutral">
            The project you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <SEOHead
        title={project.title}
        description={project.description || project.summary || `Support ${project.title}, a social impact project making a difference in ${project.category}.`}
        keywords={`${project.title}, ${project.category}, social impact, donation, ${project.primarySdg ? `SDG ${project.primarySdg}, ` : ''}social enterprise, development project`}
        canonicalUrl={useV3Template ? `https://dopaya.com/project/${project.slug}` : `https://dopaya.com/project/${project.slug}`}
        ogType="article"
        ogImage={project.imageUrl || undefined}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": project.title,
          "description": project.description || project.summary,
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
          "mainEntityOfPage": `https://dopaya.com/project/${project.slug}`,
          "about": {
            "@type": "Thing",
            "name": project.category
          }
        }}
      />
      
      {useV3Template ? (
        <ProjectDetailNewV3 project={project} />
      ) : (
        <ProjectDetailNew project={project} />
      )}
    </>
  );
}
