import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Project } from "@shared/schema";
import { ProjectFilter, FilterValues } from "@/components/projects/project-filter";
import { ProjectGrid } from "@/components/projects/project-grid";
import { SEOHead } from "@/components/seo/seo-head";

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
  
  // Fetch projects with filters
  const { data: projects, isLoading, error } = useQuery<Project[]>({
    queryKey: [`/api/projects${queryString ? `?${queryString}` : ""}`],
  });

  return (
    <div className="py-12">
      <SEOHead
        title="Social Impact Projects"
        description="Discover and support carefully vetted high-impact social enterprises making a difference worldwide. Track your donations and see real-world change."
        keywords="social projects, impact investing, social enterprises, charitable donations, development projects, sustainability projects"
        canonicalUrl="https://dopaya.org/projects"
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Development Status Banner */}
        <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-center">
            <span className="text-sm font-medium text-green-800">
              ✅ <strong>Live Platform:</strong> All social enterprises verified and ready for support • Launching full rewards system November 2025
            </span>
          </div>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-dark font-heading mb-4">Verified Social Enterprises</h1>
          <p className="text-neutral max-w-2xl mx-auto">
            Support these high-impact social enterprises and earn <strong>10 Impact Points per $1</strong> donated.
            Each enterprise is verified by Dopaya and tracked for real impact delivery.
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
      

      <div className="bg-[#e94e35] py-16 mt-16">
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
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-[#e94e35] bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#e94e35]"
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
