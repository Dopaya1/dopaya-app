import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SEOHead } from "@/components/seo/seo-head";
import { SPACING } from "@/constants/spacing";
import { TYPOGRAPHY } from "@/constants/typography";
import { Link } from "wouter";
import { useTranslation } from "@/lib/i18n/use-translation";
import { LanguageLink } from "@/components/ui/language-link";

export default function FAQPage() {
  const { t } = useTranslation();
  
  // FAQ data for structured data (must match FAQContent)
  const faqStructuredData = [
    {
      "@type": "Question",
      "name": t("faq.questions.whySupportSocialEnterprises.question"),
      "acceptedAnswer": {
        "@type": "Answer",
        "text": t("faq.questions.whySupportSocialEnterprises.answer")
      }
    },
    {
      "@type": "Question",
      "name": t("faq.questions.howMuchDoesDopayaTake.question"),
      "acceptedAnswer": {
        "@type": "Answer",
        "text": t("faq.questions.howMuchDoesDopayaTake.answer")
      }
    },
    {
      "@type": "Question",
      "name": t("faq.questions.howDoesDopayaEnsure.question"),
      "acceptedAnswer": {
        "@type": "Answer",
        "text": t("faq.questions.howDoesDopayaEnsure.answer")
      }
    },
    {
      "@type": "Question",
      "name": t("faq.questions.howCanSocialEnterpriseJoin.question"),
      "acceptedAnswer": {
        "@type": "Answer",
        "text": `${t("faq.questions.howCanSocialEnterpriseJoin.answer")} ${t("faq.questions.howCanSocialEnterpriseJoin.applyHere")}: https://tally.so/r/3EM0vA`
      }
    },
    {
      "@type": "Question",
      "name": t("faq.questions.howDoBrandsCollaborate.question"),
      "acceptedAnswer": {
        "@type": "Answer",
        "text": `${t("faq.questions.howDoBrandsCollaborate.answer")} ${t("faq.questions.howDoBrandsCollaborate.partnerWithUs")}: https://tally.so/r/3lvVg5`
      }
    },
    {
      "@type": "Question",
      "name": t("faq.questions.isThereCostForBrands.question"),
      "acceptedAnswer": {
        "@type": "Answer",
        "text": t("faq.questions.isThereCostForBrands.answer")
      }
    },
    {
      "@type": "Question",
      "name": t("faq.questions.isThereCostForSocialEnterprises.question"),
      "acceptedAnswer": {
        "@type": "Answer",
        "text": t("faq.questions.isThereCostForSocialEnterprises.answer")
      }
    },
    {
      "@type": "Question",
      "name": t("faq.questions.canIChooseContribution.question"),
      "acceptedAnswer": {
        "@type": "Answer",
        "text": t("faq.questions.canIChooseContribution.answer")
      }
    },
    {
      "@type": "Question",
      "name": t("faq.questions.whatKindOfRewards.question"),
      "acceptedAnswer": {
        "@type": "Answer",
        "text": t("faq.questions.whatKindOfRewards.answer")
      }
    },
    {
      "@type": "Question",
      "name": t("faq.questions.areContributionsTaxDeductible.question"),
      "acceptedAnswer": {
        "@type": "Answer",
        "text": t("faq.questions.areContributionsTaxDeductible.answer")
      }
    }
  ];

  return (
    <>
      <SEOHead
        title={t("faq.seoTitle")}
        description={t("faq.seoDescription")}
        keywords="FAQ, frequently asked questions, social enterprise contributions, platform fees, NGO vs social enterprise, supporter questions, impact points, social impact platform, how does dopaya work"
        canonicalUrl="https://dopaya.com/faq"
        ogType="website"
        ogImage="https://dopaya.com/og-image.png"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": faqStructuredData
        }}
      />
      <FAQContent />
    </>
  );
}

function FAQContent() {
  const { t } = useTranslation();
  
  const faqs = [
    {
      question: t("faq.questions.whySupportSocialEnterprises.question"),
      answer: t("faq.questions.whySupportSocialEnterprises.answer"),
    },
    {
      question: t("faq.questions.howMuchDoesDopayaTake.question"),
      answer: t("faq.questions.howMuchDoesDopayaTake.answer"),
    },
    {
      question: t("faq.questions.howDoesDopayaEnsure.question"),
      answer: t("faq.questions.howDoesDopayaEnsure.answer"),
    },
    {
      question: t("faq.questions.howCanSocialEnterpriseJoin.question"),
      answer: (
        <span>
          {t("faq.questions.howCanSocialEnterpriseJoin.answer")}{" "}
          <a 
            href="https://tally.so/r/3EM0vA" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-orange-600 hover:text-orange-700 underline"
          >
            {t("faq.questions.howCanSocialEnterpriseJoin.applyHere")}
          </a>
        </span>
      )
    },
    {
      question: t("faq.questions.howDoBrandsCollaborate.question"),
      answer: (
        <span>
          {t("faq.questions.howDoBrandsCollaborate.answer")}{" "}
          <a 
            href="https://tally.so/r/3lvVg5" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-orange-600 hover:text-orange-700 underline"
          >
            {t("faq.questions.howDoBrandsCollaborate.partnerWithUs")}
          </a>
        </span>
      )
    },
    {
      question: t("faq.questions.isThereCostForBrands.question"),
      answer: t("faq.questions.isThereCostForBrands.answer"),
    },
    {
      question: t("faq.questions.isThereCostForSocialEnterprises.question"),
      answer: t("faq.questions.isThereCostForSocialEnterprises.answer"),
    },
    {
      question: t("faq.questions.canIChooseContribution.question"),
      answer: t("faq.questions.canIChooseContribution.answer"),
    },
    {
      question: t("faq.questions.whatKindOfRewards.question"),
      answer: t("faq.questions.whatKindOfRewards.answer"),
    },
    {
      question: t("faq.questions.areContributionsTaxDeductible.question"),
      answer: t("faq.questions.areContributionsTaxDeductible.answer"),
    }
  ];

  return (
    <div className="min-h-screen bg-white">
        {/* Header */}
        <section className="bg-gradient-to-r from-orange-50 to-orange-100 py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 font-heading">
              {t("faq.title")}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t("faq.subtitle")}
            </p>
          </div>
        </section>

        {/* FAQ Content */}
        <section className={SPACING.section}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Accordion type="multiple" defaultValue={["item-0", "item-1"]} className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-b border-gray-200">
                  <AccordionTrigger className={`text-left font-medium py-6 ${TYPOGRAPHY.subsection} hover:text-orange-600`}>
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className={`text-gray-600 pb-6 ${TYPOGRAPHY.body}`}>
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-heading">
              {t("faq.stillHaveQuestions")}
            </h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              {t("faq.contactSupportText")}
            </p>
            <LanguageLink 
              href="/contact"
              className="inline-flex items-center px-6 py-3 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors"
            >
              {t("faq.contactSupport")}
            </LanguageLink>
          </div>
        </section>
      </div>
  );
}