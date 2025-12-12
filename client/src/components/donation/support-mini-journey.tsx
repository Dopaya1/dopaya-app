import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShoppingBag, Leaf, Heart } from "lucide-react";
import { useTranslation } from "@/lib/i18n/use-translation";
import { ImpactShareCard } from "@/components/dashboard/impact-share-card";

interface ImpactStat {
  id: string;
  emoji: string;
  value: number;
  label: string;
  unit?: string;
  format: (val: number) => string;
}

type JourneyOption = "rewards" | "impact" | "invite";

interface SupportMiniJourneyProps {
  projectTitle: string;
  supportAmount: number;
  impactPoints: number;
  userLevel?: string;
  onSelectOption?: (option: JourneyOption) => void;
  onClose?: () => void;
}

/**
 * SupportMiniJourney
 *
 * A 3-step, lightweight, gamified mini-journey shown after successful support.
 * This component is intentionally self-contained and does not perform any routing
 * by itself. Navigation is delegated to the parent via onSelectOption.
 *
 * Steps:
 * 1) You made real impact
 * 2) You earned Impact Points
 * 3) Choose your next move (Rewards / Impact / Invite)
 */
export function SupportMiniJourney({
  projectTitle,
  supportAmount,
  impactPoints,
  userLevel = "Impact Aspirer",
  onSelectOption,
  onClose,
}: SupportMiniJourneyProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState<1 | 2>(1);
  const [displayPoints, setDisplayPoints] = useState(0);
  const [showShareCard, setShowShareCard] = useState(false);
  const [selectedStat, setSelectedStat] = useState<ImpactStat | null>(null);

  // Simple animated counter for Impact Points on step 1 (combined modal)
  useEffect(() => {
    if (step !== 1) return;
    setDisplayPoints(0);

    const duration = 800; // ms
    const frameRate = 30;
    const totalFrames = Math.round((duration / 1000) * frameRate);
    let frame = 0;

    const interval = setInterval(() => {
      frame += 1;
      const progress = Math.min(frame / totalFrames, 1);
      const value = Math.round(impactPoints * progress);
      setDisplayPoints(value);

      if (progress >= 1) {
        clearInterval(interval);
      }
    }, 1000 / frameRate);

    // Fallback: Nach 1 Sekunde sicherstellen dass displayPoints gesetzt ist
    const timeout = setTimeout(() => {
      if (displayPoints === 0 && impactPoints > 0) {
        setDisplayPoints(impactPoints);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [step, impactPoints]);

  const handleNext = () => {
    setStep((prev) => (prev === 2 ? 2 : ((prev + 1) as 1 | 2)));
  };

  const handleBack = () => {
    if (step === 1) {
      // On first step, back closes the mini-journey if possible
      if (onClose) onClose();
      return;
    }
    setStep((prev) => (prev > 1 ? ((prev - 1) as 1 | 2) : prev));
  };

  const handleOptionClick = (option: JourneyOption) => {
    if (option === "invite") {
      // Create a simple impact stat for sharing
      const shareStat: ImpactStat = {
        id: "donation-impact",
        emoji: "🎉",
        value: supportAmount,
        label: t("support.supportMiniJourney.helpedAndEarned", {
          projectTitle: projectTitle,
          points: impactPoints.toLocaleString()
        }),
        format: (val: number) => `$${val.toFixed(2)}`
      };
      setSelectedStat(shareStat);
      setShowShareCard(true);
    } else if (onSelectOption) {
      onSelectOption(option);
    }
  };

  const progressLabel = `${step}/2`;

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 sm:p-8 space-y-6">
      {/* Back + progress indicator */}
      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
        {step === 1 ? (
          <span className="w-10" />
        ) : (
          <button
            type="button"
            onClick={handleBack}
            className="text-[11px] text-gray-400 hover:text-gray-700"
          >
            ← Back
          </button>
        )}
        <span className="flex-1 text-center">{t("support.supportMiniJourney.step", { current: step, total: 2 })}</span>
        <span className="w-10" />
      </div>

      {step === 1 && (
        <div className="space-y-5">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mb-2">
              <span className="text-4xl">🎉</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              {t("support.supportMiniJourney.madeRealImpact")}
            </h2>
            <p className="text-base text-gray-700">
              {t("support.supportMiniJourney.helpedAndEarned", {
                projectTitle: projectTitle,
                points: (displayPoints || impactPoints).toLocaleString()
              }).split(projectTitle).map((part, i) => {
                if (i === 0) {
                  return <span key={i}>{part}</span>;
                } else {
                  const pointsStr = (displayPoints || impactPoints).toLocaleString();
                  const pointsParts = part.split(pointsStr);
                  return (
                    <span key={i}>
                      <span className="font-semibold">{projectTitle}</span>
                      {pointsParts[0]}
                      <span className="font-semibold font-mono">{pointsStr}</span>
                      {pointsParts[1]}
                    </span>
                  );
                }
              })}
            </p>
            <p className="text-base text-gray-600">
              {(() => {
                const amountStr = `$${supportAmount.toFixed(2)}`;
                const text = t("support.supportMiniJourney.willHelpChange", {
                  amount: amountStr
                });
                const parts = text.split(amountStr);
                return (
                  <>
                    {parts[0]}
                    <span className="font-semibold">{amountStr}</span>
                    {parts[1]}
                  </>
                );
              })()}
            </p>
          </div>

          <div className="pt-4">
            <Button
              className="w-full h-11 text-base font-semibold bg-[#f2662d] hover:bg-[#d9551f] text-white"
              onClick={handleNext}
            >
              {t("support.continue")}
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">
              {t("support.supportMiniJourney.keepMomentum")}
            </h2>
            <p className="text-base text-gray-600">
              {t("support.supportMiniJourney.chooseNextStep")}
            </p>
          </div>

          <div className="space-y-3">
            {/* Option A: Rewards */}
            <button
              type="button"
              onClick={() => handleOptionClick("rewards")}
              className="w-full text-left p-4 rounded-xl border border-gray-200 bg-white hover:bg-orange-50 transition-colors active:scale-[0.99] flex items-start gap-3"
            >
              <div className="flex-shrink-0 mt-0.5">
                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-[#f2662d]" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">
                  {t("support.supportMiniJourney.findReward")}
                </p>
                <p className="text-xs text-gray-700 mt-1">
                  {t("support.supportMiniJourney.findRewardDescription")}
                </p>
              </div>
            </button>

            {/* Option B: Impact */}
            <button
              type="button"
              onClick={() => handleOptionClick("impact")}
              className="w-full text-left p-4 rounded-xl border border-gray-200 bg-white hover:bg-blue-50 transition-colors active:scale-[0.99] flex items-start gap-3"
            >
              <div className="flex-shrink-0 mt-0.5">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">
                  {t("support.supportMiniJourney.seeMyImpact")}
                </p>
                <p className="text-xs text-gray-700 mt-1">
                  {t("support.supportMiniJourney.seeMyImpactDescription")}
                </p>
              </div>
            </button>

            {/* Option C: Share Impact */}
            <button
              type="button"
              onClick={() => handleOptionClick("invite")}
              className="w-full text-left p-4 rounded-xl border border-gray-200 bg-white hover:bg-yellow-50 transition-colors active:scale-[0.99] flex items-start gap-3 relative"
            >
              {/* Label on top right */}
              <span className="absolute top-2 right-1 text-[10px] px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 font-medium text-right leading-tight">
                {t("support.supportMiniJourney.doGoodAndInspire").split(' & ').map((part, i, arr) => (
                  <span key={i}>
                    {part}
                    {i < arr.length - 1 && <><br className="block" />& </>}
                  </span>
                ))}
              </span>
              <div className="flex-shrink-0 mt-0.5">
                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-red-600" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">
                  {t("support.supportMiniJourney.shareYourImpact")}
                </p>
                <p className="text-xs text-gray-700 mt-1">
                  {t("support.supportMiniJourney.shareYourImpactDescription")}
                </p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Global skip link, bottom-right */}
      {onSelectOption && (
        <div className="flex justify-end mt-2">
          <button
            type="button"
            onClick={() => handleOptionClick("impact")}
            className="text-[11px] text-gray-400 hover:text-gray-600"
          >
            {t("support.supportMiniJourney.skipForNow")}
          </button>
        </div>
      )}

      {/* Impact Share Card */}
      <ImpactShareCard
        isOpen={showShareCard}
        onClose={() => {
          setShowShareCard(false);
          setSelectedStat(null);
        }}
        stat={selectedStat}
      />
    </div>
  );
}


