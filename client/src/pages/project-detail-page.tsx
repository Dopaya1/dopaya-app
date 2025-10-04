import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Project } from "@shared/schema";
import { ProjectDetailNew } from "@/components/projects/project-detail-new";
import { SEOHead } from "@/components/seo/seo-head";
import { Loader2 } from "lucide-react";

export default function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  
  const { data: project, isLoading, error } = useQuery<Project>({
    queryKey: [`/api/projects/by-slug/${slug}`],
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
        canonicalUrl={`https://dopaya.org/projects/${project.slug}`}
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
            "logo": "https://dopaya.org/logo.png"
          },
          "mainEntityOfPage": `https://dopaya.org/projects/${project.slug}`,
          "about": {
            "@type": "Thing",
            "name": project.category
          }
        }}
      />
      
      <ProjectDetailNew project={project} />
    </>
  );
}
