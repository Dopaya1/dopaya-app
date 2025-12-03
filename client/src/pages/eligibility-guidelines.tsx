import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle, Building2, Target, User, DollarSign, Globe, MapPin, Zap } from "lucide-react";
import { SEOHead } from "@/components/seo/seo-head";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useI18n } from "@/lib/i18n/i18n-context";
import { LanguageLink } from "@/components/ui/language-link";

export default function EligibilityGuidelines() {
  const { t } = useTranslation();
  const { language } = useI18n();
  
  return (
    <>
      <SEOHead
        title={t("eligibility.seoTitle")}
        description={t("eligibility.seoDescription")}
        keywords={t("eligibility.seoKeywords")}
        canonicalUrl={`https://dopaya.com${language === 'de' ? '/de/eligibility' : '/eligibility'}`}
        alternateUrls={{
          en: 'https://dopaya.com/eligibility',
          de: 'https://dopaya.com/de/eligibility',
        }}
      />
      <EligibilityContent />
    </>
  );
}

function EligibilityContent() {
  const { t } = useTranslation();
  
  const criteria = [
    {
      icon: Building2,
      title: t("eligibility.criteria.businessModel.title"),
      description: t("eligibility.criteria.businessModel.description"),
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      borderColor: "border-blue-200"
    },
    {
      icon: Target,
      title: t("eligibility.criteria.organizationType.title"),
      description: t("eligibility.criteria.organizationType.description"),
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      borderColor: "border-green-200"
    },
    {
      icon: CheckCircle,
      title: t("eligibility.criteria.impactOrientation.title"),
      description: t("eligibility.criteria.impactOrientation.description"),
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      borderColor: "border-purple-200"
    },
    {
      icon: User,
      title: t("eligibility.criteria.founderProfile.title"),
      description: t("eligibility.criteria.founderProfile.description"),
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
      borderColor: "border-orange-200"
    },
    {
      icon: DollarSign,
      title: t("eligibility.criteria.useOfFunds.title"),
      description: t("eligibility.criteria.useOfFunds.description"),
      bgColor: "bg-red-50",
      iconColor: "text-red-600",
      borderColor: "border-red-200"
    },
    {
      icon: Globe,
      title: t("eligibility.criteria.sector.title"),
      description: t("eligibility.criteria.sector.description"),
      bgColor: "bg-teal-50",
      iconColor: "text-teal-600",
      borderColor: "border-teal-200"
    },
    {
      icon: MapPin,
      title: t("eligibility.criteria.region.title"),
      description: t("eligibility.criteria.region.description"),
      bgColor: "bg-indigo-50",
      iconColor: "text-indigo-600",
      borderColor: "border-indigo-200"
    },
    {
      icon: Zap,
      title: t("eligibility.criteria.efficiency.title"),
      description: t("eligibility.criteria.efficiency.description"),
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
              {t("eligibility.title")}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-gray-600 max-w-3xl mx-auto mb-8"
            >
              {t("eligibility.subtitle")}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <a href="https://tally.so/r/3EM0vA" target="_blank" rel="noopener noreferrer">
                <Button className="text-white px-8 py-3 text-lg" style={{ backgroundColor: '#f2662d' }}>
                  {t("eligibility.applyNow")}
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
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t("eligibility.selectionCriteriaTitle")}</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t("eligibility.selectionCriteriaSubtitle")}
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
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t("eligibility.keyRequirementsTitle")}</h2>
            <p className="text-lg text-gray-600">
              {t("eligibility.keyRequirementsSubtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                {t("eligibility.whatWeAreLookingFor")}
              </h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  {t("eligibility.lookingFor.earlyStage")}
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  {t("eligibility.lookingFor.revenueGenerating")}
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  {t("eligibility.lookingFor.quantifiableImpact")}
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  {t("eligibility.lookingFor.missionDriven")}
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center mr-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                </span>
                {t("eligibility.currentLimitations")}
              </h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  {t("eligibility.limitations.traditionalNGOs")}
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  {t("eligibility.limitations.noMeasurableImpact")}
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  {t("eligibility.limitations.unregistered")}
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
            <h2 className="text-3xl font-bold mb-4">{t("eligibility.ctaTitle")}</h2>
            <p className="text-xl mb-8 opacity-90">
              {t("eligibility.ctaDescription")}
            </p>
            <a href="https://tally.so/r/3EM0vA" target="_blank" rel="noopener noreferrer">
              <Button className="bg-white hover:bg-gray-100 px-8 py-3 text-lg font-semibold" style={{ color: '#f2662d' }}>
                {t("eligibility.submitApplication")}
              </Button>
            </a>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">{t("eligibility.questionsTitle")}</h3>
          <p className="text-gray-600 mb-6">
            {t("eligibility.questionsDescription")}
          </p>
          <LanguageLink href="/contact" className="font-medium" style={{ color: '#f2662d' }}>
            {t("eligibility.contactForGuidance")}
          </LanguageLink>
        </div>
      </section>
    </div>
  );
}