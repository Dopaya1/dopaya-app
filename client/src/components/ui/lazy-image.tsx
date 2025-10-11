import { useState, useRef, useEffect, ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
// import { performanceMonitor } from '@/lib/performance-monitor';

interface LazyImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'onLoad' | 'onError'> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  placeholder?: string;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
  threshold?: number;
  rootMargin?: string;
  loading?: 'lazy' | 'eager';
}

export function LazyImage({
  src,
  alt,
  fallbackSrc = '/placeholder-image.png',
  placeholder,
  className,
  onLoad,
  onError,
  threshold,
  rootMargin,
  loading = 'lazy',
  ...props
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>(src);

  useEffect(() => {
    // Always load the real image source immediately
    setCurrentSrc(src);
  }, [src]);

  const handleLoad = () => {
    setIsLoaded(true);
    setHasError(false);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setIsLoaded(false); // Reset loaded state to try fallback
    }
    onError?.();
  };

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <img
        {...props}
        src={currentSrc}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          'w-full h-full object-cover transition-opacity duration-200',
          isLoaded ? 'opacity-100' : 'opacity-70',
          hasError && 'opacity-30',
          className
        )}
        loading={loading}
        decoding="async"
      />
      
      {/* Loading indicator - only show if not loaded and no error */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-80 pointer-events-none">
          <div className="text-gray-500 text-xs">Loading...</div>
        </div>
      )}
      
      {/* Error indicator */}
      {hasError && currentSrc === fallbackSrc && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 pointer-events-none">
          <div className="text-gray-400 text-xs text-center px-2">Image unavailable</div>
        </div>
      )}
    </div>
  );
}

// Hook for checking if Intersection Observer is supported
export function useIntersectionObserver() {
  return typeof IntersectionObserver !== 'undefined';
}

// Fallback component for browsers without Intersection Observer support
export function FallbackImage({
  src,
  alt,
  fallbackSrc = '/placeholder-image.png',
  className,
  onLoad,
  onError,
  ...props
}: Omit<LazyImageProps, 'loading' | 'threshold' | 'rootMargin'>) {
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  const handleError = () => {
    if (!hasError && fallbackSrc) {
      setHasError(true);
      setCurrentSrc(fallbackSrc);
    }
    onError?.();
  };

  return (
    <img
      {...props}
      src={currentSrc}
      alt={alt}
      onLoad={onLoad}
      onError={handleError}
      className={className}
      loading="lazy"
      decoding="async"
    />
  );
}
