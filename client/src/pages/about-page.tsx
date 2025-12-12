import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Check } from "lucide-react";
import patrickWidmannImage from "@/assets/Patrick Widmann_1749545204060.png";
import abdulMujeebImage from "@/assets/Abdul Mujeeb_1749476510704.png";
import SESpectrumSlider from "@/components/ui/se-spectrum-slider";
import { TYPOGRAPHY } from "@/constants/typography";
import { SEOHead } from "@/components/seo/seo-head";
import { useTranslation } from "@/lib/i18n/use-translation";

export default function AboutPageV2() {
  const { t } = useTranslation();
  return (
    <>
      <SEOHead
        title={t("about.seoTitle")}
        description={t("about.seoDescription")}
        keywords={t("about.seoKeywords")}
        canonicalUrl="https://dopaya.com/about"
        ogType="website"
        ogImage="https://dopaya.com/og-about.jpg"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          "name": "About Dopaya",
          "description": t("about.seoDescription"),
          "url": "https://dopaya.com/about",
          "mainEntity": {
            "@type": "Organization",
            "name": "Dopaya",
            "description": "Social impact platform connecting supporters with verified social enterprises",
            "foundingDate": "2024",
            "founder": {
              "@type": "Person",
              "name": "Patrick Widmann"
            },
            "mission": t("about.visionTitle")
          }
        }}
      />
      
      <div className="min-h-screen bg-white">
      {/* SECTION 1 - Name Meaning - Hero Section with Light Beige Background */}
      <section className={`w-full py-24`} style={{ backgroundColor: '#f8f6f1' }}>
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-[#f2662d] mb-4">{t("about.nameMeaning")}</h1>
            <p className="text-gray-600 mb-8">{t("about.nameOrigin")}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
              <div className="bg-white rounded-lg p-8 shadow-sm border">
                <h2 className="text-xl font-bold text-center mb-2">{t("about.nameDo")}</h2>
                <p className="text-center">{t("about.nameDoDescription")}</p>
              </div>
              <div className="bg-white rounded-lg p-8 shadow-sm border">
                <h2 className="text-xl font-bold text-center mb-2">{t("about.nameUpaya")}</h2>
                <p className="text-center">{t("about.nameUpayaDescription")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 - The Problem / Why We Exist */}
      <section className="w-full bg-white py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="order-2 lg:order-1">
              <img 
                src="https://images.unsplash.com/photo-1593113598332-cd288d649433?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80" 
                alt={t("about.changemakersInAction")} 
                className="rounded-lg object-cover h-full w-full"
              />
            </div>
            <div className="order-1 lg:order-2 flex flex-col justify-center">
              <h2 className={`${TYPOGRAPHY.section} text-gray-900 mb-8`}>
                {t("about.problemTitle")}
              </h2>
              
              <div className={`${TYPOGRAPHY.body} text-gray-700`}>
                <p>
                  {t("about.problemText1")}<br/>
                  {t("about.problemText2")}<br/>
                  {t("about.problemText3")}<br/>
                  {t("about.problemText4")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2.6 - Why Social Enterprises */}
      <SESpectrumSlider />

      {/* SECTION 2.5 - Better Way Vision - Full Width Orange */}
      <section className="w-full bg-[#f2662d] py-24 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-left">
            <h2 className={`${TYPOGRAPHY.section} mb-12`}>
              {t("about.visionTitle")}
            </h2>
            
            <div className="text-xl leading-relaxed whitespace-pre-line">
              {t("about.visionText")}
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        {/* SECTION 3 - Why Dopaya Is Different */}
        <section className="w-full bg-white py-24">
          <div className="container mx-auto px-4">
            <h2 className={`${TYPOGRAPHY.section} text-gray-900 text-center mb-16`}>
              {t("about.approachTitle")}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
              {/* Transparent by Design */}
              <div className="text-center p-8 rounded-xl border border-gray-200 bg-white hover:shadow-lg hover:border-gray-300 transition-all duration-300 hover:scale-105">
                <div className="text-4xl mb-6">🔍</div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{t("about.transparentTitle")}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {t("about.transparentDescription")}
                </p>
              </div>
              
              {/* Built Around People */}
              <div className="text-center p-8 rounded-xl border border-gray-200 bg-white hover:shadow-lg hover:border-gray-300 transition-all duration-300 hover:scale-105">
                <div className="text-4xl mb-6">🤝</div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{t("about.builtAroundPeopleTitle")}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {t("about.builtAroundPeopleDescription")}
                </p>
              </div>
              
              {/* Giving = Earning */}
              <div className="text-center p-8 rounded-xl border border-gray-200 bg-white hover:shadow-lg hover:border-gray-300 transition-all duration-300 hover:scale-105">
                <div className="text-4xl mb-6">🎁</div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{t("about.givingEarningTitle")}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {t("about.givingEarningDescription")}
                </p>
              </div>
            </div>
          </div>
        </section>


        {/* SECTION 5 - Team */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8 md:mb-10">
              <h2 className={`${TYPOGRAPHY.section} mb-4`}>{t("about.teamTitle")}</h2>
              <p className={`${TYPOGRAPHY.body} text-gray-600`}>{t("about.teamSubtitle")}</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4 lg:gap-6">
              {[
                { 
                  name: "Patrick", 
                  role: "Impact Contributor & Platform Creator",
                  image: patrickWidmannImage,
                  quote: "Believes in impact at scale"
                },
                { 
                  name: "Abdul", 
                  role: "Impact Contributor", 
                  image: abdulMujeebImage,
                  quote: "Passionate about sustainable change"
                },
                { 
                  name: "Tarun", 
                  role: "Impact Partner", 
                  image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1374&q=80",
                  quote: "Technology for social good"
                },
                { 
                  name: "Cursor", 
                  role: "Tech Enabler", 
                  image: "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1374&q=80",
                  quote: "Responsible to make the platform work"
                },
                { 
                  name: "n8n", 
                  role: "Automation Partner", 
                  image: "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1374&q=80",
                  quote: "Streamlining operations and workflows"
                },
              ].map((member, index) => (
                <div key={index} className="bg-white rounded-lg overflow-hidden shadow-sm border">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-32 md:h-48 object-cover object-top"
                  />
                  <div className="p-4">
                    <h3 className="font-bold">{member.name}</h3>
                    <p className="text-[#f2662d] text-sm font-medium">{member.role}</p>
                    <p className="text-gray-600 text-xs mt-1 italic">"{member.quote}"</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 6 - Final CTA Block - REMOVED */}
      </div>
      </div>
    </>
  );
}