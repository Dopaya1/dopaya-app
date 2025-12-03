import { Link } from "wouter";
import { useTranslation } from "@/lib/i18n/use-translation";
import { LanguageLink } from "@/components/ui/language-link";

export default function ThankYouPage() {
  const { t } = useTranslation();
  // Images for the impact projects grid
  const impactImages = [
    "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=200&h=200", // Person speaking
    "https://images.unsplash.com/photo-1542058186993-84dcfc489c75?auto=format&fit=crop&q=80&w=200&h=200", // People working on tech
    "https://images.unsplash.com/photo-1559025560-42a19f69996f?auto=format&fit=crop&q=80&w=200&h=200", // Team of professionals
    "https://images.unsplash.com/photo-1606937295547-bc0f668595b3?auto=format&fit=crop&q=80&w=200&h=200", // Woman in field
    "https://images.unsplash.com/photo-1578474846511-04ba529f0b88?auto=format&fit=crop&q=80&w=200&h=200", // Woman with traditional clothing
    "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=200&h=200", // Person with fabrics
    "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&q=80&w=200&h=200", // Person in field
    "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=200&h=200", // Person with machinery
    "https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&q=80&w=200&h=200", // Person working in field
  ];

  return (
    <div className={`py-16 bg-[#fffcf9]`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left side - Image grid */}
          <div className="order-2 md:order-1">
            <div className="grid grid-cols-3 gap-2 max-w-[450px] mx-auto">
              {/* 9 project/impact images in a 3x3 grid */}
              {impactImages.map((src, index) => (
                <div key={index} className="aspect-square rounded-md overflow-hidden bg-gray-100 shadow-sm border border-gray-100">
                  <img 
                    src={src} 
                    alt={`${t("thankYou.impactProjectAlt")} ${index + 1}`} 
                    className="w-full h-full object-cover transition-transform hover:scale-105"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
          
          {/* Right side - Content */}
          <div className="flex flex-col space-y-5 order-1 md:order-2">
            <h1 className="text-3xl md:text-[2.5rem] leading-tight font-bold text-[#1a1a3a]">
              {t("thankYou.title")}
            </h1>
            
            <p className="text-gray-700 text-lg">
              {t("thankYou.thankYouMessage")} <span className="text-orange-500">🧡</span>
            </p>
            
            <div className="text-gray-700">
              <p className="mb-2">
                {t("thankYou.feedbackDescription")} <span className="font-bold">{t("thankYou.platformName")}</span>, {t("thankYou.platformDescription")}
              </p>
              <p className="font-bold text-[#1a1a3a]">
                {t("thankYou.givingDescription")}
              </p>
            </div>
            
            <p className="text-gray-700">
              {t("thankYou.seeYouMessage")} <span className="text-yellow-500">😊</span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-5">
              <a 
                href="https://tally.so/r/m6MqAe" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="px-6 py-3 text-white font-medium rounded-md text-center transition-colors"
                style={{ backgroundColor: '#f2662d' }}
              >
                {t("thankYou.joinWaitlist")}
              </a>
              <LanguageLink 
                href="/"
                className="px-6 py-3 border border-[#e0e0e0] text-[#1a1a3a] font-medium rounded-md text-center hover:bg-gray-50 transition-colors"
              >
                {t("thankYou.learnMore")}
              </LanguageLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}