import { useState } from "react";
import { Link } from "wouter";
import { ExternalLink, Building2, Shield, Users } from "lucide-react";
import { useProjectBySlug } from "@/hooks/use-project-by-slug";
import { TYPOGRAPHY } from "@/constants/typography";
import { BRAND_COLORS } from "@/constants/colors";
import { MOBILE } from "@/constants/mobile";

export function InstitutionalProofSimple() {
  const [selectedInstitution, setSelectedInstitution] = useState<string | null>(null);
  const { project: ignisProject } = useProjectBySlug("ignis-careers");

  const institutions = [
    {
      id: 'acumen',
      name: 'Acumen',
      logo: '/src/assets/SE_Backers/Acumen.png',
      description: 'Global leader in social impact education and measurement frameworks. As a social impact investor firm, they provide rigorous training programs for social entrepreneurs, develop comprehensive impact assessment methodologies, and invest in early-stage social enterprises worldwide.',
      website: 'https://acumenacademy.org'
    },
    {
      id: 'dasra',
      name: 'Dasra',
      logo: '/src/assets/SE_Backers/dasra.png',
      description: 'Strategic philanthropy foundation that works with philanthropists and social entrepreneurs to accelerate social change. Dasra has been instrumental in building the social enterprise ecosystem in India.',
      website: 'https://dasra.org'
    },
    {
      id: 'graymatters',
      name: 'GrayMatters Capital',
      logo: '/src/assets/SE_Backers/Graymatters Capital.png',
      description: 'Impact investment firm focused on early-stage social enterprises. They provide capital and strategic support to entrepreneurs building scalable solutions for underserved communities.',
      website: 'https://graymatterscap.com'
    },
    {
      id: 'miller-center',
      name: 'Miller Center',
      logo: '/src/assets/SE_Backers/Miller Center.png',
      description: 'Global accelerator for social entrepreneurs. Miller Center provides mentorship, training, and access to capital for social enterprises working to solve the world\'s most pressing challenges.',
      website: 'https://www.millersocent.org'
    },
    {
      id: 'yunus',
      name: 'Yunus Social Business',
      logo: '/src/assets/SE_Backers/Yunus Social business.png',
      description: 'Founded by Nobel Peace Prize winner Muhammad Yunus, this organization creates and funds social businesses to solve social problems. They focus on sustainable business models that create positive social impact.',
      website: 'https://yunussb.com'
    }
  ];

  const supportedProjects = [
    { 
      id: 1, 
      name: ignisProject?.title || 'Ignis Careers', 
      image: ignisProject?.imageUrl || '/api/placeholder/100/100', 
      slug: 'ignis-careers', 
      description: ignisProject?.summary || 'Career development and skill training for underprivileged youth' 
    }
  ];

  return (
    <section className="py-24" style={{ backgroundColor: BRAND_COLORS.bgCool }}>
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8 md:mb-12">
          {institutions.map((institution) => (
            <div
              key={institution.id}
              onClick={() => setSelectedInstitution(selectedInstitution === institution.id ? null : institution.id)}
              onTouchEnd={(e) => {
                e.preventDefault();
                setSelectedInstitution(selectedInstitution === institution.id ? null : institution.id);
              }}
              className={`cursor-pointer p-4 md:p-6 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 min-h-[120px] md:min-h-[140px] ${
                selectedInstitution === institution.id 
                  ? 'bg-gray-50 shadow-lg' 
                  : 'bg-white hover:bg-gray-50'
              }`}
              style={{ 
                border: `1px solid ${BRAND_COLORS.borderSubtle}`,
                boxShadow: selectedInstitution === institution.id ? '0 4px 12px rgba(0,0,0,0.1)' : '0 2px 4px rgba(0,0,0,0.05)',
                WebkitTapHighlightColor: 'transparent'
              }}
            >
              <div className="text-center">
                <div className="flex items-center justify-center p-6 h-24 mb-3 rounded-lg transition-all duration-300 hover:scale-105" 
                     style={{ backgroundColor: BRAND_COLORS.bgWhite }}>
                  <img 
                    src={institution.logo} 
                    alt={`${institution.name} logo`}
                    className="max-h-12 max-w-full object-contain transition-all duration-300"
                  />
                </div>
                <h3 className="text-sm font-semibold" style={{ color: BRAND_COLORS.textPrimary }}>
                  {institution.name}
                </h3>
                <div className="text-xs mt-1 font-medium" style={{ color: BRAND_COLORS.primaryOrange }}>
                  Tap to learn more
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Institution Details */}
        {selectedInstitution && (
          <div className="bg-white rounded-2xl p-8 shadow-lg" style={{ border: `1px solid ${BRAND_COLORS.borderSubtle}` }}>
            {(() => {
              const institution = institutions.find(i => i.id === selectedInstitution);
              if (!institution) return null;
              
              return (
                <div className="grid lg:grid-cols-3 gap-8">
                  {/* Left: Institution Info */}
                  <div className="lg:col-span-2">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 flex items-center justify-center">
                        <img 
                          src={institution.logo} 
                          alt={`${institution.name} logo`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold" style={{ color: BRAND_COLORS.textPrimary }}>
                          {institution.name}
                        </h3>
                      </div>
                    </div>
                    
                    <p className="text-base mb-6 leading-relaxed" style={{ color: BRAND_COLORS.textSecondary }}>
                      {institution.description}
                    </p>
                    
                    <a 
                      href={institution.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
                      style={{ color: BRAND_COLORS.primaryOrange }}
                    >
                      Visit {institution.name}
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>

                  {/* Right: Supported Projects */}
                  <div className="lg:col-span-1">
                    <div className="flex items-center gap-2 mb-4">
                      <Users className="h-5 w-5" style={{ color: BRAND_COLORS.primaryOrange }} />
                      <h4 className="text-lg font-semibold" style={{ color: BRAND_COLORS.textPrimary }}>
                        Supported Projects
                      </h4>
                    </div>
                    
                    <div className="space-y-3">
                      {supportedProjects.map((project) => (
                        <Link key={project.id} href={`/project/${project.slug}`}>
                          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                              <img 
                                src={project.image} 
                                alt={project.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.nextElementSibling.style.display = 'flex';
                                }}
                              />
                              <div className="w-full h-full bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center text-xs font-medium" style={{ display: 'none' }}>
                                {project.name.charAt(0)}
                              </div>
                            </div>
                            <div>
                              <div className="font-medium text-sm" style={{ color: BRAND_COLORS.textPrimary }}>
                                {project.name}
                              </div>
                              <div className="text-xs" style={{ color: BRAND_COLORS.textSecondary }}>
                                {project.description}
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </section>
  );
}
