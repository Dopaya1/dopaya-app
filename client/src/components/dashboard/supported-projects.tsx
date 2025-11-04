import { useQuery } from "@tanstack/react-query";
import { Project } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";

export function SupportedProjects() {
  const { data: projects, isLoading, error } = useQuery<Project[]>({
    queryKey: ["/api/user/supported-projects"],
  });

  if (error) {
    return (
      <div className="text-red-500 text-center py-4">
        Error loading supported projects: {error.message}
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-dark font-heading mb-6">Social Enterprises Supported</h2>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(3).fill(0).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="w-full h-48" />
              <CardContent className="p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                <div className="flex justify-between items-center">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !projects || projects.length === 0 ? (
        <div className="text-center py-6 bg-white rounded-lg shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-neutral mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p className="text-neutral">You haven't supported any social enterprises yet.</p>
          <Link href="/projects">
            <a className="inline-block mt-3 text-primary hover:underline">
              Explore social enterprises to support
            </a>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <img src={project.imageUrl} alt={project.title} className="w-full h-48 object-cover" />
              <CardContent className="p-4">
                <h3 className="text-lg font-bold text-dark font-heading mb-2">{project.title}</h3>
                <p className="text-sm text-neutral mb-4 whitespace-pre-line">{project.description}</p>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-neutral">${project.goalAmount?.toLocaleString() || '0'} goal</span>
                  <Link href={`/project/${project.slug || project.id}`} className="text-primary hover:underline text-sm font-medium flex items-center">
                    View
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
