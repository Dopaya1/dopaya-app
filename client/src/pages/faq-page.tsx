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

export default function FAQPage() {
  return (
    <>
      <SEOHead
        title="FAQ | Frequently Asked Questions About Dopaya | Social Impact Platform"
        description="Get answers to common questions about Dopaya, social enterprise donations, platform fees, impact points, and how to join our community of changemakers."
        keywords="FAQ, frequently asked questions, social enterprise donations, platform fees, NGO vs social enterprise, donor questions, impact points, social impact platform, how does dopaya work"
        canonicalUrl="https://dopaya.org/faq"
        ogType="website"
        ogImage="https://dopaya.org/og-faq.jpg"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "How does Dopaya work?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Dopaya connects supporters with verified social enterprises. When you support a project, you earn impact points that can be redeemed for exclusive rewards from sustainable brands."
              }
            },
            {
              "@type": "Question",
              "name": "What are the platform fees?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Dopaya charges 0% platform fees. 100% of your donation goes directly to the social enterprise you choose to support."
              }
            },
            {
              "@type": "Question",
              "name": "What's the difference between NGOs and Social Enterprises?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Social enterprises are businesses that prioritize social impact alongside financial sustainability, while NGOs are typically non-profit organizations focused primarily on social causes."
              }
            }
          ]
        }}
      />
      <FAQContent />
    </>
  );
}

function FAQContent() {
  const faqs = [
    {
      question: "Why should I donate to social enterprises instead of NGOs?",
      answer: "Social enterprises use sustainable business models to create long-term impact. Unlike NGOs that often rely on recurring donations, social enterprises reinvest earnings into their mission — making your donation go further. Some even deliver a measurable social return on investment (SROI) of 2×, 3× or more."
    },
    {
      question: "How much does Dopaya take from donations?",
      answer: "Currently, 100% of your donation goes directly to social enterprises. We're supported by small community contributions and brand partnership fees. Our goal is to keep platform costs minimal while maximizing impact."
    },
    {
      question: "How does Dopaya ensure donations are used correctly?",
      answer: "Every social enterprise on Dopaya goes through a careful vetting process. We assess their impact model, financials, and governance to ensure credibility. We also track how funds are used and offer donors clear visibility through updates and dashboards."
    },
    {
      question: "How can my social enterprise join Dopaya?",
      answer: (
        <span>
          Social enterprises can apply through our simple onboarding form. We review each application carefully based on impact potential and alignment. If selected, you'll get access to our platform and tools to grow your funding and visibility.{" "}
          <a 
            href="https://tally.so/r/3EM0vA" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-orange-600 hover:text-orange-700 underline"
          >
            Apply here
          </a>
        </span>
      )
    },
    {
      question: "How do brands collaborate with Dopaya?",
      answer: (
        <span>
          Brands can offer rewards, product experiences, or exclusive perks for our donor community. They simply submit a form, and we'll get in touch to co-create impact campaigns. It's a unique way to connect with socially conscious, Gen Z and Millennial audiences.{" "}
          <a 
            href="https://tally.so/r/3lvVg5" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-orange-600 hover:text-orange-700 underline"
          >
            Partner with us
          </a>
        </span>
      )
    },
    {
      question: "Is there any cost for brands?",
      answer: "No, it's completely free. Dopaya helps purpose-driven brands reach a values-aligned audience — at no cost. You gain access to marketing exposure and impact storytelling while contributing to real change."
    },
    {
      question: "Is there any cost for social enterprises?",
      answer: "Never. We exist to support social enterprises and help them access funding streams without lifting a finger. There are no platform fees — just more reach, more donors, and more time to focus on your mission."
    },
    {
      question: "Can I choose where my donation goes?",
      answer: "Yes. You can explore our list of vetted social enterprises and choose who to support — or let Dopaya recommend projects based on your interests. Either way, your impact is real, transparent, and trackable."
    },
    {
      question: "What kind of rewards do donors receive?",
      answer: "Every donation earns you Impact Points — which unlock badges, perks, and access to curated brand experiences. The more you give or refer, the more rewarding your journey becomes."
    },
    {
      question: "Are donations tax-deductible?",
      answer: "In many cases, yes. We're working to expand this and provide tax-friendly options for more users globally."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
        {/* Header */}
        <section className="bg-gradient-to-r from-orange-50 to-orange-100 py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 font-heading">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to know about our platform, social enterprises, and making an impact
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
              Still have questions?
            </h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              We're here to help! Reach out to our team for personalized assistance with your impact journey.
            </p>
            <Link 
              href="/contact"
              className="inline-flex items-center px-6 py-3 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors"
            >
              Contact Support
            </Link>
          </div>
        </section>
      </div>
  );
}