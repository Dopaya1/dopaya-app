import { useEffect, useState } from "react";
import { Loader2, Sparkles, Heart } from "lucide-react";

/**
 * Z-index hierarchy in the application:
 * - Navbar: z-50
 * - Dialogs/Modals: z-50
 * - Sliders/Carousels: z-10
 * - Processing Modal: z-9999 (default) - Must be above everything
 * 
 * Fallback: If z-index conflicts occur, you can override by passing a custom zIndex prop
 * or by adjusting the PROCESSING_MODAL_Z_INDEX constant below.
 */
const PROCESSING_MODAL_Z_INDEX = 9999;

interface ProcessingImpactProps {
  onComplete: () => void;
  impactPoints: number;
  duration?: number; // Duration in milliseconds, default 2000ms
  skippable?: boolean; // Allow skipping in dev mode
  zIndex?: number; // Custom z-index override (fallback option) - use if conflicts occur
}

export function ProcessingImpact({ 
  onComplete, 
  impactPoints, 
  duration = 2000,
  skippable = false,
  zIndex 
}: ProcessingImpactProps) {
  // Use custom z-index if provided, otherwise use very high default to ensure it's above everything
  // This ensures the modal appears above navbar (z-50), dialogs (z-50), and sliders (z-10)
  const modalZIndex = zIndex ?? PROCESSING_MODAL_Z_INDEX;
  const [progress, setProgress] = useState(0);
  const [showSparkles, setShowSparkles] = useState(false);

  useEffect(() => {
    // Start animation - progress only once
    const startTime = Date.now();
    let animationFrameId: number;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min(100, (elapsed / duration) * 100);
      setProgress(newProgress);

      // Show sparkles at 50% progress
      if (newProgress >= 50 && !showSparkles) {
        setShowSparkles(true);
      }

      // Continue animation if not complete
      if (elapsed < duration) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        // Complete when duration is reached
        setProgress(100);
        onComplete();
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [duration, onComplete, showSparkles]);

  const handleSkip = () => {
    if (skippable) {
      onComplete();
    }
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center bg-white/95 backdrop-blur-sm"
      style={{ zIndex: modalZIndex }}
    >
      <div className="text-center space-y-6 max-w-md px-6">
        {/* Animated Icon */}
        <div className="relative mx-auto w-24 h-24">
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-16 h-16 text-[#f2662d] animate-spin" />
          </div>
          {showSparkles && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-12 h-12 text-yellow-400 animate-pulse" />
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center">
            <Heart className="w-8 h-8 text-[#f2662d] fill-[#f2662d] animate-pulse" />
          </div>
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-gray-900">
            Processing your impact...
          </h3>
          <p className="text-lg text-gray-600">
            Earning {impactPoints} Impact Points
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-xs mx-auto">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#f2662d] rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Skip button (dev only) */}
        {skippable && (
          <button
            onClick={handleSkip}
            className="text-xs text-gray-400 hover:text-gray-600 underline"
          >
            Skip (dev mode)
          </button>
        )}
      </div>
    </div>
  );
}

