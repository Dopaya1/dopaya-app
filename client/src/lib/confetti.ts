/**
 * CONFETTI ANIMATION UTILITY
 * 
 * ⚠️ EASY REMOVAL: To remove confetti, simply:
 * 1. Delete this file (client/src/lib/confetti.ts)
 * 2. Remove the import and triggerConfetti() call from dashboard-page.tsx
 * 3. Remove the canvas-confetti script from index.html
 * 
 * This file handles the confetti animation that plays after signup success.
 */

// Declare canvas-confetti types (loaded from CDN)
declare global {
  interface Window {
    confetti: any;
  }
}

interface ConfettiOptions {
  particleCount?: number;
  spread?: number;
  origin?: { x: number; y: number };
  colors?: string[];
  gravity?: number;
  scalar?: number;
  ticks?: number;
}

/**
 * Check if user prefers reduced motion
 */
function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Trigger confetti animation
 * 
 * @param onComplete - Callback when animation completes
 */
export function triggerConfetti(onComplete?: () => void): void {
  // Skip confetti if user prefers reduced motion
  if (prefersReducedMotion()) {
    console.log('[Confetti] Skipping confetti - user prefers reduced motion');
    if (onComplete) {
      // Call completion immediately for reduced motion users
      setTimeout(onComplete, 100);
    }
    return;
  }

  // Check if confetti library is loaded
  if (!window.confetti) {
    console.warn('[Confetti] canvas-confetti library not loaded');
    if (onComplete) {
      setTimeout(onComplete, 100);
    }
    return;
  }

  // Create full-screen canvas
  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '9999';
  document.body.appendChild(canvas);

  // Initialize confetti with canvas
  const confettiInstance = window.confetti.create(canvas, {
    resize: true,
    useWorker: true,
  });

  // Dopaya brand colors
  const colors = ['#E87B4A', '#1E5B3D', '#F6E6D9', '#2C7BE5'];

  // Detect mobile (reduce particle count)
  const isMobile = window.innerWidth < 768;
  const burstParticleCount = isMobile ? 120 : 180;
  const drizzleParticleCount = isMobile ? 15 : 25;

  // Phase 1: Burst (0-0.4s)
  confettiInstance({
    particleCount: burstParticleCount,
    spread: 70,
    origin: { x: 0.5, y: 0.5 },
    colors: colors,
    gravity: 0.6,
    scalar: 1.2,
    ticks: 100,
  });

  // Phase 2: Drizzle (0.4s - 3s) - small bursts every ~400ms
  let drizzleCount = 0;
  const maxDrizzleBursts = 7; // (3000ms - 400ms) / 400ms ≈ 6.5, round to 7
  const drizzleInterval = setInterval(() => {
    drizzleCount++;
    
    // Random position for each burst
    const x = 0.3 + Math.random() * 0.4; // Between 0.3 and 0.7
    const y = 0.2 + Math.random() * 0.2; // Between 0.2 and 0.4
    
    confettiInstance({
      particleCount: drizzleParticleCount,
      spread: 40,
      origin: { x, y },
      colors: colors,
      gravity: 0.3,
      scalar: 0.85,
      ticks: 60,
    });

    // Stop after max bursts
    if (drizzleCount >= maxDrizzleBursts) {
      clearInterval(drizzleInterval);
      
      // Clean up canvas after animation ends
      setTimeout(() => {
        canvas.remove();
        if (onComplete) {
          onComplete();
        }
      }, 500); // Small delay to ensure last particles are visible
    }
  }, 400); // Every 400ms

  // Fallback cleanup (in case interval doesn't fire)
  setTimeout(() => {
    clearInterval(drizzleInterval);
    canvas.remove();
    if (onComplete) {
      onComplete();
    }
  }, 3500); // 3.5 seconds total
}

/**
 * Pulse animation for reduced motion users
 * Animates the impact points badge instead of confetti
 */
export function pulseImpactPointsBadge(element: HTMLElement | null): void {
  if (!element) return;
  
  // Add pulse animation class
  element.style.animation = 'pulse 1s ease-in-out';
  
  // Remove animation after completion
  setTimeout(() => {
    element.style.animation = '';
  }, 1000);
}


