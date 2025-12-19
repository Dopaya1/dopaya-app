import { SEOHead } from "@/components/seo/seo-head";
import { Mail, Calendar, MessageSquare } from "lucide-react";
import { useTranslation } from "@/lib/i18n/use-translation";

export default function ContactPage() {
  const { t } = useTranslation();

  return (
    <>
      <SEOHead
        title={t("contact.seoTitle")}
        description={t("contact.seoDescription")}
        keywords={t("contact.seoKeywords")}
        canonicalUrl="https://dopaya.com/contact"
        ogType="website"
        ogImage="https://dopaya.com/og-contact.jpg"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "ContactPage",
          "name": t("contact.title"),
          "description": t("contact.subtitle"),
          "url": "https://dopaya.com/contact",
          "mainEntity": {
            "@type": "Organization",
            "name": "Dopaya",
            "contactPoint": {
              "@type": "ContactPoint",
              "contactType": "customer service",
              "email": "hello@dopaya.org",
              "availableLanguage": "English, German"
            }
          }
        }}
      />

      <div className={`container mx-auto py-24 px-4 md:px-6`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
          {/* Left column */}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-6">{t("contact.title")}</h1>
            <p className="text-muted-foreground mb-8">
              {t("contact.subtitle")}
            </p>

            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <Mail className="h-6 w-6 text-primary mt-0.5" />
                <div>
                  <h3 className="font-semibold uppercase text-sm tracking-wider mb-2">{t("contact.emailLabel")}</h3>
                  <a
                    href="mailto:hello@dopaya.com"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    hello@dopaya.com
                  </a>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <MessageSquare className="h-6 w-6 text-primary mt-0.5" />
                <div>
                  <h3 className="font-semibold uppercase text-sm tracking-wider mb-2">{t("contact.whatsappLabel")}</h3>
                  <a
                    href="https://wa.me/4917621140723"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    +4917621140723
                  </a>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <Calendar className="h-6 w-6 text-primary mt-0.5" />
                <div>
                  <h3 className="font-semibold uppercase text-sm tracking-wider mb-2">{t("contact.calendlyLabel")}</h3>
                  <button
                    onClick={() => window.open("https://www.calendly.com/dopaya/vc-30", "_blank")}
                    className="text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    {t("contact.calendlyButton")}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right column - Google Form iframe */}
          <div className="bg-card p-6 rounded-lg shadow-sm">
            <iframe 
              src="https://docs.google.com/forms/d/e/1FAIpQLSeyueWb3jtRUZ0d0UGYWfno0sRY-wRz5eOYGUGuri3L2K4ssA/viewform?embedded=true" 
              width="100%" 
              height="600" 
              frameBorder="0" 
              marginHeight={0} 
              marginWidth={0}
              className="w-full min-h-[600px] rounded-lg"
              title="Contact Form"
            >
              Loading…
            </iframe>
          </div>
        </div>
      </div>
    </>
  );
}
