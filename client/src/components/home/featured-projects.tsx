import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Project } from "@shared/schema";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DataError, EmptyState } from "@/components/ui/data-error";
import { useDbStatus } from "@/hooks/use-db-status";
import { getCategoryColors } from "@/lib/category-colors";
import { supabase } from "@/lib/supabase";


export function FeaturedProjects() {
  const { data: projects, isLoading, error, isError } = useQuery<Project[]>({
    queryKey: ["projects-featured"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('featured', true)
        .eq('status', 'active')
        .order('createdAt', { ascending: false })
        .limit(4);
      
      if (error) throw error;
      return data || [];
    },
  });
  
  const { isConnected } = useDbStatus();

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-dark font-heading">Latest Projects</h2>
          <p className="mt-4 max-w-2xl mx-auto text-neutral">
            Support these high-impact initiatives and track how your donations make real-world impact. Each project is carefully vetted by the Dopaya team.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            // Loading state with skeletons
            Array(4).fill(0).map((_, i) => (
              <Card key={i} className="impact-card overflow-hidden">
                <Skeleton className="w-full h-48" />
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-6 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-4" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))
          ) : !isConnected ? (
            // Database connection error
            <div className="col-span-full">
              <DataError 
                title="Project Data Unavailable" 
                message="We're unable to retrieve project data at this time." 
                itemType="project"
              />
            </div>
          ) : isError ? (
            // Other error
            <div className="col-span-full">
              <DataError 
                title="Failed to Load Projects" 
                message={error instanceof Error ? error.message : "An unexpected error occurred."}
                itemType="project" 
              />
            </div>
          ) : projects && projects.length === 0 ? (
            // No projects found
            <div className="col-span-full">
              <EmptyState 
                title="No Projects Found" 
                message="There are no featured projects available at this time. Please check back later." 
                itemType="project"
              />
            </div>
          ) : (
            // Display projects
            (projects || []).map((project) => {
              const categoryColors = getCategoryColors(project.category || '');
              return (
                <Card key={project.id} className="impact-card overflow-hidden flex flex-col h-full">
                  <div className="w-full h-48 overflow-hidden">
                    <img 
                      src={project.imageUrl}
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-4 flex-grow">
                    <Badge 
                      className={`mb-2 ${categoryColors.badge} hover:${categoryColors.badge} font-medium rounded-full px-2 py-0.5 text-xs`}
                      variant="outline"
                    >
                      {project.category}
                    </Badge>
                    <h3 className="text-lg font-bold text-dark font-heading mb-2">{project.title}</h3>
                    
                    {/* Mission Statement */}
                    {project.missionStatement && (
                      <p className="text-sm text-neutral mb-2 line-clamp-3 leading-relaxed">
                        {project.missionStatement}
                      </p>
                    )}
                    
                    <p className="text-sm text-neutral mb-4 line-clamp-3">{project.description}</p>
                  </CardContent>
                  <CardFooter className="p-4 pt-0 mt-auto flex flex-col space-y-2">
                    <Link href={`/projects/${project.slug}`} className="w-full">
                      <Button variant="outline" className="w-full">
                        View Project 
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </Button>
                    </Link>

                  </CardFooter>
                </Card>
              );
            })
          )}
        </div>

        <div className="mt-10 text-center">
          <Link href="/projects">
            <Button className="bg-[#e94e35] hover:bg-[#cc4530] text-white">
              Browse All Projects
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
