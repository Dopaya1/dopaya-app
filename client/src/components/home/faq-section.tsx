import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { TYPOGRAPHY } from "@/constants/typography";
import { BRAND_COLORS } from "@/constants/colors";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useI18n } from "@/lib/i18n/i18n-context";
import { translations } from "@/lib/i18n/translations";

export function FAQSection() {
  const { t } = useTranslation();
  const { language } = useI18n();
  // Direkt auf das Array zugreifen, da t() nur Strings zurückgibt
  const faqs = translations[language].homeSections.faq.questions;

  return (
    <section className="py-24" style={{ backgroundColor: BRAND_COLORS.bgWhite }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className={`${TYPOGRAPHY.section} mb-4`} style={{ 
            color: BRAND_COLORS.textPrimary, 
            fontFamily: "'Satoshi', 'Inter', system-ui, sans-serif" 
          }}>
            {t("homeSections.faq.title")}
          </h2>
          <p className="text-xl max-w-2xl mx-auto" style={{ color: BRAND_COLORS.textSecondary }}>
            {t("homeSections.faq.subtitle")}
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