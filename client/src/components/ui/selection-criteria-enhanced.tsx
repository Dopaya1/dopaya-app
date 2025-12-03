import React from 'react';
import { motion } from 'framer-motion';
import { EnhancedCard } from './enhanced-card';
import { Building2, Target, Users, DollarSign, Globe, MapPin, Zap, CheckCircle } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';

interface CriteriaItem {
  title: string;
  description: string;
  icon?: React.ReactNode;
  variant: 'default' | 'dots' | 'gradient' | 'plus' | 'neubrutalism' | 'inner' | 'lifted' | 'corners';
}

export function SelectionCriteriaEnhanced() {
  const { t } = useTranslation();
  
  const criteria: CriteriaItem[] = [
    {
      title: t("socialEnterprises.eligibilityBusinessModel"),
      description: t("socialEnterprises.eligibilityBusinessModelDesc"),
      variant: "default"
    },
    {
      title: t("socialEnterprises.eligibilityOrganizationType"),
      description: t("socialEnterprises.eligibilityOrganizationTypeDesc"),
      variant: "default"
    },
    {
      title: t("socialEnterprises.eligibilityImpactOrientation"),
      description: t("socialEnterprises.eligibilityImpactOrientationDesc"),
      variant: "default"
    },
    {
      title: t("socialEnterprises.eligibilityFounderProfile"),
      description: t("socialEnterprises.eligibilityFounderProfileDesc"),
      variant: "default"
    },
    {
      title: t("socialEnterprises.eligibilityUseOfFunds"),
      description: t("socialEnterprises.eligibilityUseOfFundsDesc"),
      variant: "default"
    },
    {
      title: t("socialEnterprises.eligibilitySector"),
      description: t("socialEnterprises.eligibilitySectorDesc"),
      variant: "default"
    },
    {
      title: t("socialEnterprises.eligibilityRegion"),
      description: t("socialEnterprises.eligibilityRegionDesc"),
      variant: "default"
    },
    {
      title: t("socialEnterprises.eligibilityEfficiency"),
      description: t("socialEnterprises.eligibilityEfficiencyDesc"),
      variant: "default"
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">{t("socialEnterprises.eligibilityTitle")}</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {t("socialEnterprises.eligibilitySubtitle")}
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
