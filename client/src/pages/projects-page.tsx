import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Project } from "@shared/schema";
import { ProjectFilter, FilterValues } from "@/components/projects/project-filter";
import { ProjectGrid } from "@/components/projects/project-grid";
import { SEOHead } from "@/components/seo/seo-head";
import { supabase } from "@/lib/supabase";

// Import partner logo images
import iimbNsrcelLogo from "../assets/iimb-nsrcel.png";
import hdfcParivartan from "../assets/hdfc-parivartan.png";
import aicIiith from "../assets/aic-iiith.png";
import forbes30 from "../assets/forbes-30.png";
import startupIndia from "../assets/startup-india.png";
import unido from "../assets/unido.png";
import iitKharagpur from "../assets/iit-kharagpur.png";
import iVentureIsb from "../assets/i-venture-isb.png";

export default function ProjectsPage() {
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

  return (
    <div className="py-24">
      <SEOHead
        title="Social Impact Projects | Support Verified Social Enterprises | Dopaya"
        description="Discover and support carefully vetted high-impact social enterprises making a difference worldwide. Track your donations, earn impact points, and see real-world change."
        keywords="social impact projects, social enterprises, impact investing, charitable donations, development projects, sustainability projects, social enterprise funding, impact measurement"
        canonicalUrl="https://dopaya.org/projects"
        ogType="website"
        ogImage="https://dopaya.org/og-projects.jpg"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "Social Impact Projects",
          "description": "Discover and support carefully vetted high-impact social enterprises",
          "url": "https://dopaya.org/projects",
          "mainEntity": {
            "@type": "ItemList",
            "name": "Social Impact Projects",
            "description": "Verified social enterprises making real-world impact"
          }
        }}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-dark font-heading mb-4">Discover Social Enterprises</h1>
          <p className="text-neutral max-w-2xl mx-auto">
            Support these high-impact social enterprises and track how your contributions create real-world change.
            Each enterprise is carefully vetted by the Dopaya team.
          </p>
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
        />
      </div>
      

      <div className={`py-24 mt-16`} style={{ backgroundColor: '#f2662d' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white font-heading mb-4">Have a Social Enterprise?</h2>
            <p className="text-white max-w-2xl mx-auto mb-8">
              Join our platform to access funding, resources, and a community of supporters dedicated to positive social impact.
            </p>
            <a 
              href="https://tally.so/r/3EM0vA" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{ color: '#f2662d' }}
            >
              Apply to Join
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
