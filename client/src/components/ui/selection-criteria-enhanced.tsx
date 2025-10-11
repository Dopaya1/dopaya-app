import React from 'react';
import { motion } from 'framer-motion';
import { EnhancedCard } from './enhanced-card';
import { Building2, Target, Users, DollarSign, Globe, MapPin, Zap, CheckCircle } from 'lucide-react';

interface CriteriaItem {
  title: string;
  description: string;
  icon?: React.ReactNode;
  variant: 'default' | 'dots' | 'gradient' | 'plus' | 'neubrutalism' | 'inner' | 'lifted' | 'corners';
}

export function SelectionCriteriaEnhanced() {
  const criteria: CriteriaItem[] = [
    {
      title: "Business Model & Stage",
      description: "Early-stage, legally registered, with proven revenue or potential.",
      variant: "default"
    },
    {
      title: "Organization Type",
      description: "Pvt Ltd, Section 8, or similar revenue-generating social ventures. NGOs not eligible.",
      variant: "default"
    },
    {
      title: "Impact Orientation",
      description: "Clear, measurable social or environmental impact, ideally quantifiable.",
      variant: "default"
    },
    {
      title: "Founder Profile",
      description: "Mission-driven, entrepreneurial founders committed to long-term change.",
      variant: "default"
    },
    {
      title: "Use of Funds",
      description: "Donations must be used for tangible impact with long-term sustainability.",
      variant: "default"
    },
    {
      title: "Sector",
      description: "All sectors welcome, as long as measurable impact is demonstrated.",
      variant: "default"
    },
    {
      title: "Region",
      description: "No geographic restrictions if measurable local outcomes are ensured.",
      variant: "default"
    },
    {
      title: "Efficiency",
      description: "High dollar-to-impact ratio, now or in future. Highly efficient team using AI for operations and scaling.",
      variant: "default"
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Eligibility Criteria</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Searching for impactful social enterprises who align with our mission and want to change the system with us.
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {criteria.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="h-full"
            >
              <EnhancedCard
                variant={item.variant}
                className="h-full bg-white hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex flex-col items-start text-left">
                  <h4 className="font-semibold text-gray-900 mb-3 text-lg">
                    {item.title}
                  </h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </EnhancedCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
