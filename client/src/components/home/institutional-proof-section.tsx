import { Building2, CheckCircle, Users, Award } from "lucide-react";

export function InstitutionalProofSection() {
  // Sample institutional partners - Replace with real logos and partnerships
  const institutions = [
    {
      name: "Innovation Hub",
      logo: "/placeholder-institution-1.png",
      description: "Supporting sustainable innovation and social enterprise development",
      relationship: "Incubator Partner"
    },
    {
      name: "Impact Foundation",
      logo: "/placeholder-institution-2.png", 
      description: "Funding verified social enterprises with proven business models",
      relationship: "Funding Partner"
    },
    {
      name: "University Research Center",
      logo: "/placeholder-institution-3.png",
      description: "Academic validation of social impact measurement methodologies",
      relationship: "Research Partner"
    },
    {
      name: "Government Innovation Lab",
      logo: "/placeholder-institution-4.png",
      description: "Supporting policy development for social enterprise sector",
      relationship: "Policy Partner"
    }
  ];

  // Sample SE founder testimonials - Replace with real quotes and permissions
  const testimonials = [
    {
      quote: "Dopaya's verification process gave us credibility with investors and customers. Their community genuinely cares about sustainable impact.",
      founder: "Maria Santos",
      company: "Clean Water Solutions",
      impact: "500+ families with clean water access",
      image: "/placeholder-founder-1.jpg"
    },
    {
      quote: "The platform helped us reach supporters who understand the difference between aid and sustainable solutions. Our growth has been remarkable.",
      founder: "Raj Patel", 
      company: "Education Technology Initiative",
      impact: "2,000+ students with digital access",
      image: "/placeholder-founder-2.jpg"
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-[#1a1a3a] mb-4">
            Trusted by Leading Institutions
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Our social enterprises are backed by established institutions and verified through rigorous processes
          </p>
        </div>

        {/* Institutional Partners Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {institutions.map((institution, index) => (
            <div key={index} className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-center">
                {/* Placeholder for institution logo */}
                <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="font-semibold text-[#1a1a3a] mb-2">{institution.name}</h3>
                <p className="text-xs text-[#e94e35] font-medium mb-3">{institution.relationship}</p>
                <p className="text-sm text-gray-600">{institution.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* How We Verify Social Enterprises */}
        <div className="bg-white rounded-2xl p-8 mb-16">
          <div className="text-center mb-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-[#1a1a3a] mb-2">
              How We Verify Social Enterprises
            </h3>
            <p className="text-gray-600">
              Transparent verification process ensuring authentic impact and sustainable business models
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Award className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-[#1a1a3a] mb-2">Business Model Review</h4>
              <p className="text-sm text-gray-600">
                Financial sustainability, scalability assessment, and long-term viability analysis
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-[#1a1a3a] mb-2">Impact Verification</h4>
              <p className="text-sm text-gray-600">
                Measurable outcomes, beneficiary testimonials, and third-party validation of claims
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="font-semibold text-[#1a1a3a] mb-2">Team Assessment</h4>
              <p className="text-sm text-gray-600">
                Founder background, team expertise, and commitment to sustainable social impact
              </p>
            </div>
          </div>
        </div>

        {/* Social Enterprise Founder Testimonials */}
        <div>
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-[#1a1a3a] mb-2">
              What Our Social Enterprise Partners Say
            </h3>
            <p className="text-gray-600">
              Real testimonials from verified social enterprise founders
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0 flex items-center justify-center">
                    <Users className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-600 mb-4 italic">"{testimonial.quote}"</p>
                    <div>
                      <p className="font-semibold text-[#1a1a3a]">{testimonial.founder}</p>
                      <p className="text-sm text-gray-500">{testimonial.company}</p>
                      <p className="text-sm text-[#e94e35] font-medium mt-1">{testimonial.impact}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Note about permissions and authenticity */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800 text-center">
            <strong>Note:</strong> All testimonials and institutional partnerships will be replaced with real, 
            verified relationships with proper permissions before launch. Placeholder content shown for design reference only.
          </p>
        </div>
      </div>
    </section>
  );
}