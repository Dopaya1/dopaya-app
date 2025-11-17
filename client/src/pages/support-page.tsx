import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Heart, Info, Trophy } from "lucide-react";
import { Project, UserImpact } from "@shared/schema";
import { supabase } from "@/lib/supabase";
import { SEOHead } from "@/components/seo/seo-head";
import { isOnboardingPreviewEnabled } from "@/lib/feature-flags";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import dopayaLogo from "@assets/Dopaya Logo.png";
import { ProcessingImpact } from "@/components/donation/processing-impact";
import { SupportMiniJourney } from "@/components/donation/support-mini-journey";

// Feature flag: controls whether the post-support mini-journey is shown.
// Set to false to fall back to the simple redirect-to-rewards behavior.
const USE_MINI_JOURNEY_PREVIEW = true;

export default function SupportPage() {
  const { slug } = useParams<{ slug: string }>();
  const [, navigate] = useLocation();

  const previewEnabled = isOnboardingPreviewEnabled();
  const { user } = useAuth();

  // Guard: only allow this page in onboarding preview mode for now
  useEffect(() => {
    if (!previewEnabled && slug) {
      navigate(`/project/${slug}`);
    }
  }, [previewEnabled, slug, navigate]);

  const { data: project, isLoading, error } = useQuery<Project | null>({
    queryKey: ["support-page-project", slug],
    queryFn: async () => {
      if (!slug) return null;

      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("slug", slug)
        .single();

      if (error) {
        if ((error as any).code === "PGRST116") {
          // No rows returned
          return null;
        }
        throw error;
      }
      return data;
    },
    enabled: !!slug,
  });

  // Fetch user impact to replicate existing routing logic (first support vs existing user)
  const { data: impact } = useQuery<UserImpact>({
    queryKey: ["/api/user/impact"],
    enabled: !!user,
  });

  // --- Local state for page-based checkout preview (no real payment yet) ---
  const [supportAmount, setSupportAmount] = useState<number | null>(null);
  const [isCustomAmount, setIsCustomAmount] = useState<boolean>(false);
  const [customAmount, setCustomAmount] = useState<number>(0);
  const [tipSliderValue, setTipSliderValue] = useState<number[]>([10]); // 10% default
  const [isCustomTip, setIsCustomTip] = useState<boolean>(false);
  const [customTipValue, setCustomTipValue] = useState<number>(0);
  const [hideNamePublicly, setHideNamePublicly] = useState<boolean>(false);
  const [signUpForUpdates, setSignUpForUpdates] = useState<boolean>(false);
  const [showProcessingImpact, setShowProcessingImpact] = useState<boolean>(false);
  const [showMiniJourney, setShowMiniJourney] = useState<boolean>(false);

  const predefinedAmounts = [50, 100, 200, 500, 1000];

  const currentSupportAmount = isCustomAmount ? customAmount : (supportAmount || 0);
  const hasSelectedAmount =
    supportAmount !== null || (isCustomAmount && customAmount > 0);
  const impactPoints = Math.max(0, Math.floor(currentSupportAmount * 10)); // 10 IP per $1

  const tipPercent = isCustomTip ? customTipValue : tipSliderValue[0];
  const tipAmount =
    currentSupportAmount > 0
      ? Math.round((currentSupportAmount * (tipPercent / 100)) * 100) / 100
      : 0;
  const totalAmount = Math.round((currentSupportAmount + tipAmount) * 100) / 100;

  // --- Early returns AFTER all hooks (keep hook order stable) ---
  if (!previewEnabled) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500 text-sm">
          Redirecting to project page...
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center py-12">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 text-red-500 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h1 className="text-2xl font-bold text-dark font-heading mb-2">
            Project Not Found
          </h1>
          <p className="text-neutral">
            The project you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  // Helper: check if a URL is likely a video (same logic as project detail)
  const isVideoUrl = (url: string | null | undefined): boolean => {
    if (!url) return false;
    const lower = url.toLowerCase();
    const videoExtensions = [".mp4", ".webm", ".mov", ".ogg", ".avi", ".mkv"];
    const videoDomains = ["youtube.com", "youtu.be", "vimeo.com", "vimeocdn.com"];
    if (videoExtensions.some((ext) => lower.endsWith(ext))) return true;
    if (videoDomains.some((domain) => lower.includes(domain))) return true;
    return false;
  };

  // Determine a small header image (project is guaranteed to be defined here)
  const candidateImages = [
    project.imageUrl,
    project.image1,
    project.image2,
    project.image3,
    project.image4,
    project.image5,
    project.image6,
  ] as (string | null | undefined)[];

  let headerImageUrl: string | null = null;
  for (const url of candidateImages) {
    if (url && !isVideoUrl(url)) {
      headerImageUrl = url;
      break;
    }
  }

  // Simple referral/share handler (mirrors donation flow behavior)
  const handleInviteFriendsShare = async () => {
    const shareText = `I just supported ${project.title} on Dopaya and earned ${impactPoints} Impact Points! Join me in creating real impact. 🌍✨`;
    const shareUrl = `${window.location.origin}/project/${project.slug}`;
    const fullMessage = `${shareText}\n${shareUrl}`;

    // 1) Try native share where available (best experience on mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Share Your Impact",
          text: shareText,
          url: shareUrl,
        });
        // After successful native share, we simply return and let caller navigate.
        return;
      } catch {
        // User cancelled or share failed; fall through to copy/alert fallback below.
      }
    }

    // 2) Fallback: copy text to clipboard with visible confirmation
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(fullMessage);
        alert("Invite text copied to your clipboard. You can paste it to friends.");
      } catch {
        // 3) Last resort: show message so user can copy manually
        alert(fullMessage);
      }
    } else {
      // 3) No clipboard API: show message so user can copy manually
      alert(fullMessage);
    }
  };

  const handleMiniJourneyOption = async (
    option: "rewards" | "impact" | "invite"
  ) => {
    if (option === "rewards") {
      // For rewards/impact we immediately navigate away, so we can hide the overlay.
      setShowMiniJourney(false);
      const url = `/rewards?unlock=1&maxPoints=100${
        previewEnabled ? "&previewOnboarding=1" : ""
      }`;
      window.location.href = url;
    } else if (option === "impact") {
      setShowMiniJourney(false);
      const url = `/dashboard${previewEnabled ? "?previewOnboarding=1" : ""}`;
      window.location.href = url;
    } else if (option === "invite") {
      // For Invite, keep the mini-journey visible while the native share / copy UI is shown.
      // We do NOT hide the overlay here; route change will unmount it.
      await handleInviteFriendsShare();
      const url = `/dashboard${previewEnabled ? "?previewOnboarding=1" : ""}`;
      window.location.href = url;
    }
  };

  // --- Main page render ---
  return (
    <>
      <SEOHead
        title={`Support ${project.title}`}
        description={
          project.description ||
          project.summary ||
          `Support ${project.title}, a social impact project making a difference in ${project.category}.`
        }
        canonicalUrl={`https://dopaya.com/support/${project.slug}`}
        ogType="article"
        ogImage={project.imageUrl || undefined}
      />

      <div className="min-h-screen bg-[#faf5ef] relative">
        {/* Processing overlay (preview only) */}
        {showProcessingImpact && (
          <ProcessingImpact
            impactPoints={impactPoints}
            duration={2000}
            skippable={false}
            onComplete={() => {
              setShowProcessingImpact(false);
              if (USE_MINI_JOURNEY_PREVIEW) {
                // Show the mini-journey overlay instead of redirecting immediately.
                setShowMiniJourney(true);
              } else {
                // Fallback: old behavior – go straight to rewards unlock view.
                setTimeout(() => {
                  navigate("/rewards?unlock=1&maxPoints=100");
                }, 2500);
              }
            }}
          />
        )}

        {/* Mini-journey overlay */}
        {showMiniJourney && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
            {/* Subtle confetti around the white card (outside content) */}
            <div className="pointer-events-none absolute inset-0">
              <span className="absolute top-6 left-10 text-lg opacity-80 animate-bounce">
                ✨
              </span>
              <span
                className="absolute top-8 right-8 text-base opacity-80 animate-bounce"
                style={{ animationDelay: "120ms" }}
              >
                🎉
              </span>
              <span
                className="absolute bottom-10 left-12 text-base opacity-80 animate-bounce"
                style={{ animationDelay: "220ms" }}
              >
                ⭐
              </span>
              <span
                className="absolute bottom-12 right-10 text-base opacity-80 animate-bounce"
                style={{ animationDelay: "320ms" }}
              >
                💫
              </span>
            </div>

            {/* External close / skip button */}
            <button
              type="button"
              onClick={() => setShowMiniJourney(false)}
              className="absolute top-5 right-5 text-sm text-gray-200 hover:text-white"
            >
              ✕
            </button>

            <SupportMiniJourney
              projectTitle={project.title}
              supportAmount={currentSupportAmount}
              impactPoints={impactPoints}
              userLevel={"Impact Aspirer"}
              onSelectOption={handleMiniJourneyOption}
              onClose={() => setShowMiniJourney(false)}
            />
          </div>
        )}
        {/* Custom header: back button left, Dopaya logo centered, no other elements */}
        <header className="bg-white border-b border-gray-100">
          <div className="max-w-5xl mx-auto flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => navigate(`/project/${project.slug}`)}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              ← Back to project
            </button>
            <div className="flex-1 flex justify-center">
              <img
                src={dopayaLogo}
                alt="Dopaya"
                className="h-6 w-auto"
              />
            </div>
            {/* Empty spacer to balance layout */}
            <div className="w-24" />
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Payment card styled similar to GoFundMe layout (preview) */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8 space-y-6">
            {/* Header row: project name left, small image right */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1 flex-1">
                <p className="text-xs font-semibold tracking-wide text-[#f2662d] uppercase">
                  Support Preview (Payment Page)
                </p>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {project.title}
                </h1>
                <p className="text-sm text-gray-600">
                  This is a preview of the dedicated payment page. The layout mirrors
                  the new Dopaya support modal, but runs directly on a full page.
                  Payment processing is not wired here yet.
                </p>
              </div>
              {headerImageUrl && (
                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200 bg-gray-50">
                  <img
                    src={headerImageUrl}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

          {/* Amount selection */}
          <div className="space-y-6">
            {/* Amount pills */}
            <div className="flex flex-wrap gap-3 justify-center">
              {predefinedAmounts.map((amount) => {
                const isSuggested = amount === 200;
                const isActive = supportAmount === amount && !isCustomAmount;
                return (
                  <div key={amount} className="relative">
                    <Button
                      variant="outline"
                      className={`h-10 px-5 rounded-full text-sm font-medium border-2 transition-all ${
                        isActive
                          ? "bg-[#f2662d] text-white border-[#f2662d] hover:bg-[#d9551f]"
                          : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                      }`}
                      style={
                        isActive
                          ? { backgroundColor: "#f2662d", borderColor: "#f2662d", color: "white" }
                          : {}
                      }
                      onClick={() => {
                        setSupportAmount(amount);
                        setIsCustomAmount(false);
                        setCustomAmount(amount);
                      }}
                    >
                      ${amount.toLocaleString()}
                    </Button>
                    {isSuggested && !isActive && (
                      <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-green-100 text-green-700 text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap">
                        <Heart className="w-3 h-3" />
                        SUGGESTED
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Custom amount input, styled like GoFundMe */}
            <div className="flex flex-col items-center space-y-2">
              <div className="relative w-full max-w-md">
                {/* Left: currency */}
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col items-start">
                  <span className="text-2xl font-bold text-gray-700">$</span>
                  <span className="text-[11px] text-gray-500 -mt-1">USD</span>
                </div>

                {/* Right: .00 */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <span className="text-3xl font-bold text-gray-700">.00</span>
                </div>

                <Input
                  type="text"
                  inputMode="numeric"
                  value={currentSupportAmount > 0 ? currentSupportAmount.toLocaleString() : ""}
                  onChange={(e) => {
                    const rawValue = e.target.value.replace(/[^0-9]/g, "");
                    const v = rawValue ? Number(rawValue) : 0;
                    if (v > 0) {
                      setCustomAmount(v);
                      setIsCustomAmount(true);
                      setSupportAmount(v);
                    } else {
                      setCustomAmount(0);
                      setIsCustomAmount(false);
                      setSupportAmount(null);
                    }
                  }}
                  className="w-full text-right text-3xl font-bold h-16 border-2 border-gray-300 rounded-lg pl-20 pr-24 focus:border-[#f2662d] focus:ring-2 focus:ring-[#f2662d]/20"
                  placeholder=""
                  style={{ fontSize: "1.875rem" }}
                />
              </div>

              {hasSelectedAmount && currentSupportAmount > 0 && currentSupportAmount < 10 && (
                <p className="text-xs text-red-600 font-medium">
                  Amount must be at least $10
                </p>
              )}
            </div>
          </div>

          {/* Impact banner */}
          {hasSelectedAmount && currentSupportAmount > 0 && (
            <div className="space-y-3 w-full max-w-md mx-auto">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      Congratulations! You will get{" "}
                      <span className="font-bold">{impactPoints.toLocaleString()}</span>{" "}
                      Impact Points and create real impact!
                    </p>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <div className="w-10 h-10 bg-[#8B7355] rounded-full flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 text-[11px] text-gray-600">
                <span>
                  100% goes to the project, minus unavoidable payment fees. Supported by our
                  nonprofit partner Impaktera.
                </span>
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="text-gray-500 hover:text-gray-700 flex-shrink-0">
                      <Info className="h-3 w-3" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 text-sm">
                    <div className="space-y-2">
                      <p className="font-semibold mb-2">About Impaktera</p>
                      <p>
                        Impaktera is a Suisse-based non-profit Association according to Art. 60 ff.
                        of the Swiss Civil Code, ZGB.
                      </p>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}

          {/* Tip section */}
          {hasSelectedAmount && currentSupportAmount > 0 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Tip Dopaya</h3>
                <p className="text-xs text-gray-500 mb-4">
                  We have 0% platform fee for Social Enterprises, because we believe in{" "}
                  <span className="font-semibold text-[#f2662d]">Impact First</span>. Dopaya can
                  keep the platform independent and ad-free thanks to people who leave an optional
                  amount here:
                </p>

                {!isCustomTip ? (
                  <>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">
                          {tipSliderValue[0]}%
                        </span>
                        <span className="text-sm font-medium text-gray-700">
                          ${tipAmount.toFixed(2)}
                        </span>
                      </div>
                      <Slider
                        value={tipSliderValue}
                        onValueChange={setTipSliderValue}
                        min={0}
                        max={20}
                        step={0.5}
                        className="w-full"
                      />
                    </div>
                    <button
                      onClick={() => {
                        setIsCustomTip(true);
                        setCustomTipValue(tipSliderValue[0]);
                      }}
                      className="text-xs text-gray-600 hover:text-gray-900 underline mt-2"
                    >
                      Enter custom tip
                    </button>
                  </>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min={0}
                        max={20}
                        step={0.5}
                        value={customTipValue}
                        onChange={(e) => {
                          const v = Number(e.target.value || 0);
                          setCustomTipValue(Math.min(20, Math.max(0, isNaN(v) ? 0 : v)));
                        }}
                        className="w-24"
                        placeholder="%"
                      />
                      <span className="text-sm text-gray-600">%</span>
                      <span className="text-sm font-medium text-gray-700 ml-auto">
                        ${((currentSupportAmount * customTipValue) / 100).toFixed(2)}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setIsCustomTip(false);
                        setTipSliderValue([customTipValue]);
                      }}
                      className="text-xs text-gray-600 hover:text-gray-900 underline"
                    >
                      Use slider instead
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Payment method */}
          {hasSelectedAmount && currentSupportAmount > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">Payment method</h3>
              <div className="flex items-center space-x-3 p-4 border-2 border-gray-300 rounded-lg bg-white">
                <div className="h-4 w-4 rounded-full border-2 border-[#f2662d] bg-[#f2662d] flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-white" />
                </div>
                <span className="text-sm font-medium text-gray-900">
                  Credit or debit card (Stripe)
                </span>
              </div>
            </div>
          )}

          {/* Privacy & updates */}
          {hasSelectedAmount && currentSupportAmount > 0 && (
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="hideName"
                  checked={hideNamePublicly}
                  onCheckedChange={(checked) => setHideNamePublicly(checked === true)}
                  className="mt-0.5"
                />
                <div className="flex-1 flex items-start gap-1">
                  <label
                    htmlFor="hideName"
                    className="text-sm text-gray-700 cursor-pointer leading-relaxed"
                  >
                    Don't display my name publicly on the Dopaya platform.
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="mt-0.5 text-gray-400 hover:text-gray-600"
                        aria-label="Why we show supporter names"
                      >
                        <Info className="h-3 w-3" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 text-sm">
                      <p>
                        We believe in &quot;Who does good should also talk about it and inspire others&quot;.
                        We want to highlight our first supporters on the platform to inspire more
                        people to follow your action.
                      </p>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="signUpUpdates"
                  checked={signUpForUpdates}
                  onCheckedChange={(checked) => setSignUpForUpdates(checked === true)}
                  className="mt-0.5"
                />
                <label
                  htmlFor="signUpUpdates"
                  className="text-sm text-gray-700 cursor-pointer leading-relaxed"
                >
                  Yes, sign me up to hear updates about new social innovators and exciting brand
                  rewards. You can unsubscribe anytime.
                </label>
              </div>
            </div>
          )}

          {/* Summary + CTA - preview only (with processing animation on click) */}
          {hasSelectedAmount && currentSupportAmount > 0 && (
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Your support amount</span>
                  <span className="font-medium text-gray-900">
                    ${currentSupportAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Tip to Dopaya</span>
                  <span className="font-medium text-gray-900">${tipAmount.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-lg font-bold pt-2 border-t border-gray-300">
                  <span>Total due today</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  disabled={!hasSelectedAmount || currentSupportAmount <= 0}
                  className="w-full h-14 text-base font-semibold bg-yellow-400 hover:bg-yellow-500 text-gray-900 disabled:opacity-60"
                  style={{ backgroundColor: "#FFC107", color: "#1a1a3a" }}
                  onClick={() => {
                    if (!hasSelectedAmount || currentSupportAmount <= 0) return;
                    setShowProcessingImpact(true);
                  }}
                >
                  Continue
                </Button>
                <p className="text-[11px] text-center text-gray-500">
                  By clicking 'Continue', you agree to Dopaya's Terms of Service and Privacy
                  Notice. (Preview – processing animation only, no real payment yet)
                </p>
              </div>
            </div>
          )}
          </div>
        </main>
      </div>
    </>
  );
}


