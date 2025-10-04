import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function FAQSection() {
  const faqs = [
    {
      question: "Why should I donate to social enterprises instead of NGOs?",
      answer: "Social enterprises use sustainable business models to create long-term impact. Unlike NGOs that often rely on recurring donations, social enterprises reinvest earnings into their mission — making your donation go further. Some even deliver a measurable social return on investment (SROI) of 2×, 3× or more."
    },
    {
      question: "How much does Dopaya take from donations?",
      answer: "Dopaya charges a small 10% fee to operate the platform and grow impact. This covers tech infrastructure, partner support, and verification. Our long-term goal is to reduce this fee even further as we scale with the help of brands and other partners."
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
    <section className="py-16 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#1a1a3a] mb-4">Frequently Asked Questions</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Answers to common questions about our platform and how it works
          </p>
        </div>
        
        <Accordion type="multiple" defaultValue={["item-0", "item-1"]} className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border-b border-gray-200">
              <AccordionTrigger className="text-left font-medium py-4">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pb-4">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}