import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { TYPOGRAPHY } from "@/constants/typography";
import { BRAND_COLORS } from "@/constants/colors";

export function FAQSection() {
  const faqs = [
    {
      question: "Why should I donate to social enterprises instead of NGOs?",
      answer: "Social enterprises use sustainable business models to create long-term impact. Unlike NGOs that often rely on recurring donations, social enterprises reinvest earnings into their mission — making your donation go further. Some even deliver a measurable social return on investment (SROI) of 2×, 3× or more."
    },
    {
      question: "How does Dopaya make money?",
      answer: "Currently, 100% of your investment goes directly to social enterprises. We're supported by small community contributions and brand partnership fees. Our goal is to keep platform costs minimal while maximizing impact."
    },
    {
      question: "How does Dopaya ensure donations are used correctly?",
      answer: "Every social enterprise on Dopaya goes through a careful vetting process. We assess their impact model, financials, and governance to ensure credibility. We also track how funds are used and offer donors clear visibility through updates and dashboards."
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
    <section className="py-24" style={{ backgroundColor: BRAND_COLORS.bgWhite }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className={`${TYPOGRAPHY.section} mb-4`} style={{ 
            color: BRAND_COLORS.textPrimary, 
            fontFamily: "'Satoshi', 'Inter', system-ui, sans-serif" 
          }}>
            Frequently Asked Questions
          </h2>
          <p className="text-xl max-w-2xl mx-auto" style={{ color: BRAND_COLORS.textSecondary }}>
            Answers to common questions about our platform and how it works
          </p>
        </div>
        
        <Accordion type="multiple" className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border-b" style={{ borderColor: BRAND_COLORS.borderSubtle }}>
              <AccordionTrigger className={`text-left font-medium py-6 hover:no-underline ${TYPOGRAPHY.subsection}`} style={{ color: BRAND_COLORS.textPrimary }}>
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className={`pb-6 ${TYPOGRAPHY.body}`} style={{ color: BRAND_COLORS.textSecondary }}>
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}