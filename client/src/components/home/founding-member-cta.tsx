import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { TYPOGRAPHY } from "@/constants/typography";
import { BRAND_COLORS } from "@/constants/colors";
import { useTranslation } from "@/lib/i18n/use-translation";

export function FoundingMemberCTA() {
  const { t } = useTranslation();
  return (
    <section className="py-24" style={{ backgroundColor: BRAND_COLORS.primaryOrange }}>
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 
            className={`${TYPOGRAPHY.section} mb-4 text-white`}
            style={{ fontFamily: "'Satoshi', 'Inter', system-ui, sans-serif" }}
          >
            {t("homeSections.foundingMemberCTA.title")}
          </h2>
          
          <p className="text-lg md:text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            {t("homeSections.foundingMemberCTA.subtitle")}
          </p>
          
          
          {/* Benefits Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-8 max-w-4xl mx-auto">
            <div className="bg-white/10 p-4 rounded-lg">
              <h3 className="font-semibold mb-2 text-white">{t("homeSections.foundingMemberCTA.immediateBenefits")}</h3>
              <ul className="text-sm text-white/80 space-y-1">
                <li>{t("homeSections.foundingMemberCTA.benefit1")}</li>
                <li>{t("homeSections.foundingMemberCTA.benefit2")}</li>
                <li>{t("homeSections.foundingMemberCTA.benefit3")}</li>
              </ul>
            </div>
            
            <div className="bg-white/10 p-4 rounded-lg">
              <h3 className="font-semibold mb-2 text-white">{t("homeSections.foundingMemberCTA.communityAccess")}</h3>
              <ul className="text-sm text-white/80 space-y-1">
                <li>{t("homeSections.foundingMemberCTA.benefit4")}</li>
                <li>{t("homeSections.foundingMemberCTA.benefit5")}</li>
                <li>{t("homeSections.foundingMemberCTA.benefit6")}</li>
              </ul>
            </div>
          </div>
          
          <Button 
            size="lg" 
            className="bg-white text-orange-600 hover:bg-gray-50 px-8 py-4 text-lg font-medium"
            asChild
          >
            <a href="https://tally.so/r/m6MqAe" target="_blank" rel="noopener noreferrer">
              {t("homeSections.foundingMemberCTA.joinWaitlist")}
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </Button>
          
          <p className="text-sm text-white/70 mt-4">
            {t("homeSections.foundingMemberCTA.limitedAvailability")}
          </p>
        </div>
      </div>
    </section>
  );
}
