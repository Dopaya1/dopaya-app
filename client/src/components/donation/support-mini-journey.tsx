import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Sparkles, Trophy, ArrowRight } from "lucide-react";

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
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [displayPoints, setDisplayPoints] = useState(0);

  // Simple animated counter for Impact Points on step 2
  useEffect(() => {
    if (step !== 2) return;
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

    return () => clearInterval(interval);
  }, [step, impactPoints]);

  const handleNext = () => {
    setStep((prev) => (prev === 3 ? 3 : ((prev + 1) as 1 | 2 | 3)));
  };

  const handleBack = () => {
    if (step === 1) {
      // On first step, back closes the mini-journey if possible
      if (onClose) onClose();
      return;
    }
    setStep((prev) => (prev > 1 ? ((prev - 1) as 1 | 2 | 3) : prev));
  };

  const handleOptionClick = (option: JourneyOption) => {
    if (onSelectOption) {
      onSelectOption(option);
    }
  };

  const progressLabel = `${step}/3`;

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
        <span className="flex-1 text-center">Step {progressLabel}</span>
        <span className="w-10" />
      </div>

      {step === 1 && (
        <div className="space-y-5">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-2">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              You made real impact!
            </h2>
            <p className="text-sm text-gray-700">
              You just supported <span className="font-semibold">{projectTitle}</span>!
            </p>
            <p className="text-sm text-gray-600">
              Your{" "}
              <span className="font-semibold">
                ${supportAmount.toFixed(2)}
              </span>{" "}
              will help provide real impact on the ground.
            </p>
          </div>

          <div className="border border-gray-200 rounded-lg p-3 bg-gray-50 text-[11px] text-gray-600 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-[#f2662d] mt-0.5" />
            <p>
              100% goes to the project, supported by our nonprofit partner
              Impaktera (minus unavoidable payment fees).
            </p>
          </div>

          <div className="pt-2">
            <Button
              className="w-full h-11 text-sm font-semibold bg-[#f2662d] hover:bg-[#d9551f] text-white"
              onClick={handleNext}
            >
              Next
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full bg-orange-50 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-[#f2662d]" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-yellow-300 flex items-center justify-center border border-white">
                <Trophy className="w-4 h-4 text-yellow-800" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              You earned {impactPoints.toLocaleString()} Impact Points!
            </h2>
            <p className="text-sm text-gray-600">
              Counter:&nbsp;
              <span className="font-mono font-semibold text-gray-900">
                {displayPoints.toLocaleString()}
              </span>
            </p>
            <p className="text-sm text-gray-700">
              You’re now a{" "}
              <span className="font-semibold">{userLevel}</span>.
            </p>
            <p className="text-sm text-gray-600">
              That’s enough to unlock your first reward!
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center text-[11px] text-gray-600">
            <div className="flex flex-col items-center gap-1">
              <span className="text-lg">🌱</span>
              <span>Support projects</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-lg">🎁</span>
              <span>Earn points</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-lg">🛍️</span>
              <span>Redeem rewards</span>
            </div>
          </div>

          <p className="text-[11px] text-center text-gray-500">
            500 points ≈ up to $7.50+ in rewards.
          </p>

          <div className="pt-2">
            <Button
              className="w-full h-11 text-sm font-semibold bg-[#f2662d] hover:bg-[#d9551f] text-white"
              onClick={handleNext}
            >
              Next
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-5">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold text-gray-900">
              Choose your next move
            </h2>
            <p className="text-sm text-gray-600">
              You’ve completed 3/3 steps. Where do you want to go next?
            </p>
          </div>

          <div className="space-y-3">
            {/* Option A: Rewards */}
            <button
              type="button"
              onClick={() => handleOptionClick("rewards")}
              className="w-full text-left p-4 rounded-xl border border-gray-200 bg-white hover:bg-orange-50 transition-colors active:scale-[0.99]"
            >
              <p className="text-sm font-semibold text-gray-900">
                Find a Reward
              </p>
              <p className="text-xs text-gray-700 mt-1">
                See what you can already unlock with your points. You already
                qualify for your first reward.
              </p>
            </button>

            {/* Option B: Impact */}
            <button
              type="button"
              onClick={() => handleOptionClick("impact")}
              className="w-full text-left p-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors active:scale-[0.99]"
            >
              <p className="text-sm font-semibold text-gray-900">
                See My Impact
              </p>
              <p className="text-xs text-gray-700 mt-1">
                View your timeline & track your impact story in one place.
              </p>
            </button>

            {/* Option C: Invite */}
            <button
              type="button"
              onClick={() => handleOptionClick("invite")}
              className="w-full text-left p-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors active:scale-[0.99]"
            >
              <p className="text-sm font-semibold text-gray-900">
                Invite Friends <span className="text-[10px] text-gray-500">(soon)</span>
              </p>
              <p className="text-xs text-gray-700 mt-1">
                Help others discover impact and soon earn bonus points together.
              </p>
            </button>
          </div>

          <p className="text-[11px] text-center text-gray-500 mt-1">
            Most people start with <span className="font-semibold">Rewards</span> →
          </p>
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
            Skip for now →
          </button>
        </div>
      )}
    </div>
  );
}


