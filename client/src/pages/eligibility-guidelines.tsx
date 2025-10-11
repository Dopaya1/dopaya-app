import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle, Building2, Target, User, DollarSign, Globe, MapPin, Zap } from "lucide-react";
import { SEOHead } from "@/components/seo/seo-head";

export default function EligibilityGuidelines() {
  return (
    <>
      <SEOHead
        title="Eligibility Guidelines"
        description="Discover the eligibility criteria for social enterprises to join Dopaya. Learn about our requirements for business model, impact orientation, and founder profile."
        keywords="eligibility criteria, social enterprises, application requirements, impact ventures, business model, social entrepreneurship"
        canonicalUrl="https://dopaya.org/eligibility"
      />
      <EligibilityContent />
    </>
  );
}

function EligibilityContent() {
  const criteria = [
    {
      icon: Building2,
      title: "Business Model & Stage",
      description: "We are looking for early-stage social enterprises with a proven and viable business model that shows clear potential for revenue generation and long-term impact.",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      borderColor: "border-blue-200"
    },
    {
      icon: Target,
      title: "Organization Type",
      description: "We support for-profit or revenue-generating social enterprises, including Pvt Ltd and Section 8 companies (if impact- and revenue-driven). Traditional grant-dependent NGOs are currently not eligible. Ventures should be legally registered and ideally under 5 years old.",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      borderColor: "border-green-200"
    },
    {
      icon: CheckCircle,
      title: "Impact Orientation",
      description: "There must be a strong social or environmental impact focus, with a clear and transparent link between donation and tangible outcomes. Ideally, impact can be demonstrated in a quantifiable, compelling way.",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      borderColor: "border-purple-200"
    },
    {
      icon: User,
      title: "Founder Profile",
      description: "We seek exceptional founders with a strong personal mission, entrepreneurial drive, and a collaborative mindset who are committed to long-term social change.",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
      borderColor: "border-orange-200"
    },
    {
      icon: DollarSign,
      title: "Use of Funds",
      description: "Donations should be used for immediate, visible impact implementation — without losing the long-term benefits of a sustainable, revenue-generating business model.",
      bgColor: "bg-red-50",
      iconColor: "text-red-600",
      borderColor: "border-red-200"
    },
    {
      icon: Globe,
      title: "Sector",
      description: "We are sector-agnostic and open to any field as long as there is a clear, measurable social or environmental impact.",
      bgColor: "bg-teal-50",
      iconColor: "text-teal-600",
      borderColor: "border-teal-200"
    },
    {
      icon: MapPin,
      title: "Region",
      description: "We are globally open. There is no geographic limitation as long as the enterprise addresses a pressing issue with measurable outcomes.",
      bgColor: "bg-indigo-50",
      iconColor: "text-indigo-600",
      borderColor: "border-indigo-200"
    },
    {
      icon: Zap,
      title: "Efficiency",
      description: "High dollar-to-impact ratio, now or in future. Highly efficient team using AI for operations and scaling.",
      bgColor: "bg-yellow-50",
      iconColor: "text-yellow-600",
      borderColor: "border-yellow-200"
    }
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-24 bg-gradient-to-r from-[#F9F7F0] to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
            >
              Eligibility Guidelines
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-gray-600 max-w-3xl mx-auto mb-8"
            >
              We're looking for exceptional social enterprises that combine impact with sustainability. 
              Review our criteria to see if your venture aligns with our mission.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <a href="https://tally.so/r/3EM0vA" target="_blank" rel="noopener noreferrer">
                <Button className="text-white px-8 py-3 text-lg" style={{ backgroundColor: '#f2662d' }}>
                  Apply Now
                </Button>
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Criteria Section */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Selection Criteria</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Each criterion reflects our commitment to supporting ventures that create meaningful, 
              measurable impact while building sustainable business models.
            </p>
          </div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
          >
            {criteria.map((criterion, index) => (
              <motion.div
                key={index}
                variants={item}
                className={`${criterion.bgColor} ${criterion.borderColor} border-2 rounded-xl p-8 hover:shadow-lg transition-shadow duration-300`}
              >
                <div className={`rounded-full ${criterion.bgColor} w-16 h-16 flex items-center justify-center mb-6`}>
                  <criterion.icon className={`h-8 w-8 ${criterion.iconColor}`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{criterion.title}</h3>
                <p className="text-gray-700 leading-relaxed">{criterion.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Key Points Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Key Requirements Summary</h2>
            <p className="text-lg text-gray-600">
              Your social enterprise should meet these essential criteria
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                What We're Looking For
              </h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Early-stage ventures with proven business models
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Revenue-generating social enterprises
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Quantifiable social/environmental impact
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Mission-driven, collaborative founders
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center mr-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                </span>
                Current Limitations
              </h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Traditional grant-dependent NGOs
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Projects without measurable impact
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Unregistered organizations
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="rounded-2xl p-12 text-white"
            style={{ background: 'linear-gradient(to right, #f2662d, #e55a1f)' }}
          >
            <h2 className="text-3xl font-bold mb-4">Ready to Make an Impact?</h2>
            <p className="text-xl mb-8 opacity-90">
              If your social enterprise aligns with our criteria, we'd love to hear from you. 
              Join our community of changemakers today.
            </p>
            <a href="https://tally.so/r/3EM0vA" target="_blank" rel="noopener noreferrer">
              <Button className="bg-white hover:bg-gray-100 px-8 py-3 text-lg font-semibold" style={{ color: '#f2662d' }}>
                Submit Your Application
              </Button>
            </a>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Questions About Eligibility?</h3>
          <p className="text-gray-600 mb-6">
            Our team is here to help you understand if your venture is a good fit for our platform.
          </p>
          <a href="/contact" className="font-medium" style={{ color: '#f2662d' }}>
            Contact us for guidance →
          </a>
        </div>
      </section>
    </div>
  );
}