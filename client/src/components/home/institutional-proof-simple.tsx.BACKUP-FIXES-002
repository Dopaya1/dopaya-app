import { useState } from "react";
import { Link } from "wouter";
import { ExternalLink, Building2, Shield, Users, Loader2 } from "lucide-react";
import { TYPOGRAPHY } from "@/constants/typography";
import { BRAND_COLORS } from "@/constants/colors";
import { MOBILE } from "@/constants/mobile";
import { getProjectImageUrl, getLogoUrl } from "@/lib/image-utils";
import { useFeaturedBackers, useBackerProjects } from "@/hooks/use-backers";

export function InstitutionalProofSimple() {
  const [selectedInstitutionId, setSelectedInstitutionId] = useState<number | null>(null);
  
  // Fetch featured backers from database
  const { backers, isLoading: isLoadingBackers, error: backersError } = useFeaturedBackers();
  
  // Fetch projects for selected backer
  const { projects: supportedProjects, isLoading: isLoadingProjects } = useBackerProjects(selectedInstitutionId);

  // Get selected backer data
  const selectedBacker = backers.find(b => b.id === selectedInstitutionId);

  return (
    <section className="py-24" style={{ backgroundColor: BRAND_COLORS.bgBeige }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className={`${TYPOGRAPHY.section} mb-4`} style={{ 
            color: BRAND_COLORS.textPrimary, 
            fontFamily: "'Satoshi', 'Inter', system-ui, sans-serif" 
          }}>
            Trusted by Leading Institutions
          </h2>
          <p className="text-xl max-w-2xl mx-auto" style={{ color: BRAND_COLORS.textSecondary }}>
            Our selected social enterprises are backed by leading, impact-focused institutions
          </p>
        </div>

        {/* Institution Logos Grid */}
        {isLoadingBackers ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" style={{ color: BRAND_COLORS.primaryOrange }} />
          </div>
        ) : backersError ? (
          <div className="text-center py-12 text-red-500">
            Error loading backers. Please try again later.
          </div>
        ) : backers.length === 0 ? (
          <div className="text-center py-12" style={{ color: BRAND_COLORS.textSecondary }}>
            No featured backers available at this time.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8 md:mb-12">
            {backers.map((backer) => {
              const logoUrl = getLogoUrl(backer.logoPath || backer.logo_path);
              return (
                <div
                  key={backer.id}
                  onClick={() => setSelectedInstitutionId(selectedInstitutionId === backer.id ? null : backer.id)}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    setSelectedInstitutionId(selectedInstitutionId === backer.id ? null : backer.id);
                  }}
                  className={`cursor-pointer p-4 md:p-6 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 min-h-[120px] md:min-h-[140px] ${
                    selectedInstitutionId === backer.id 
                      ? 'bg-gray-50 shadow-lg' 
                      : 'bg-white hover:bg-gray-50'
                  }`}
                  style={{ 
                    border: `1px solid ${BRAND_COLORS.borderSubtle}`,
                    boxShadow: selectedInstitutionId === backer.id ? '0 4px 12px rgba(0,0,0,0.1)' : '0 2px 4px rgba(0,0,0,0.05)',
                    WebkitTapHighlightColor: 'transparent'
                  }}
                >
                    <div className="text-center">
                    <div className="flex items-center justify-center p-6 h-24 mb-3 rounded-lg transition-all duration-300 hover:scale-105" 
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
                    <h3 className="text-sm font-semibold" style={{ color: BRAND_COLORS.textPrimary }}>
                      {backer.name}
                    </h3>
                    <div className="text-xs mt-1 font-medium" style={{ color: BRAND_COLORS.textSecondary }}>
                      Tap to learn more
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Selected Institution Details */}
        {selectedBacker && (
          <div className="bg-white rounded-2xl p-8 shadow-lg relative" style={{ border: `1px solid ${BRAND_COLORS.borderSubtle}` }}>
            {/* Close Button */}
            <button
              onClick={() => setSelectedInstitutionId(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left: Institution Info */}
              <div className="lg:col-span-2">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 flex items-center justify-center">
                    {(() => {
                      const logoUrl = getLogoUrl(selectedBacker.logoPath || selectedBacker.logo_path);
                      return logoUrl ? (
                        <img 
                          src={logoUrl} 
                          alt={`${selectedBacker.name} logo`}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                      ) : null;
                    })()}
                    <div className="w-full h-full bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center text-lg font-medium" style={{ display: 'none' }}>
                      {selectedBacker.name?.charAt(0) || '?'}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold" style={{ color: BRAND_COLORS.textPrimary }}>
                      {selectedBacker.name}
                    </h3>
                  </div>
                </div>
                
                <p className="text-base mb-6 leading-relaxed" style={{ color: BRAND_COLORS.textSecondary }}>
                  {selectedBacker.shortDescription || selectedBacker.short_description || 'No description available.'}
                </p>
                
                {selectedBacker.websiteUrl || selectedBacker.website_url ? (
                  <a 
                    href={selectedBacker.websiteUrl || selectedBacker.website_url || '#'} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
                    style={{ color: BRAND_COLORS.primaryOrange }}
                  >
                    Visit {selectedBacker.name}
                    <ExternalLink className="h-4 w-4" />
                  </a>
                ) : null}
              </div>

              {/* Right: Supported Projects */}
              <div className="lg:col-span-1">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="h-5 w-5" style={{ color: BRAND_COLORS.primaryOrange }} />
                  <h4 className="text-lg font-semibold" style={{ color: BRAND_COLORS.textPrimary }}>
                    Supported Projects
                  </h4>
                </div>
                
                {isLoadingProjects ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" style={{ color: BRAND_COLORS.primaryOrange }} />
                  </div>
                ) : supportedProjects.length === 0 ? (
                  <div className="text-sm" style={{ color: BRAND_COLORS.textSecondary }}>
                    No projects found for this institution.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {supportedProjects.map((project) => {
                      const projectImage = getProjectImageUrl(project) || '/api/placeholder/100/100';
                      return (
                        <Link key={project.id} href={`/project/${project.slug}`}>
                          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                              <img 
                                src={projectImage} 
                                alt={project.title || 'Project'}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                  if (fallback) fallback.style.display = 'flex';
                                }}
                              />
                              <div className="w-full h-full bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center text-xs font-medium" style={{ display: 'none' }}>
                                {project.title?.charAt(0) || '?'}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm" style={{ color: BRAND_COLORS.textPrimary }}>
                                {project.title}
                              </div>
                              <div className="text-xs line-clamp-2" style={{ color: BRAND_COLORS.textSecondary }}>
                                {(() => {
                                  const text = project.missionStatement || project.mission_statement || project.summary || project.description || 'No description available.';
                                  // Truncate to ~80 characters for a teaser
                                  return text.length > 80 ? `${text.substring(0, 80)}...` : text;
                                })()}
                              </div>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
