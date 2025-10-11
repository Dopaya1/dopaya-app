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
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxvYWRpbmcuLi48L3RleHQ+PC9zdmc+',
  className,
  onLoad,
  onError,
  threshold = 0.1,
  rootMargin = '50px',
  loading = 'lazy',
  ...props
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>(placeholder);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Check if Intersection Observer is supported
  const isIntersectionObserverSupported = typeof IntersectionObserver !== 'undefined';

  useEffect(() => {
    // If Intersection Observer is not supported, load image immediately
    if (!isIntersectionObserverSupported) {
      setIsInView(true);
      return;
    }

    // If loading is set to eager, load immediately
    if (loading === 'eager') {
      setIsInView(true);
      return;
    }

    const imgElement = imgRef.current;
    if (!imgElement) return;

    // Create intersection observer
    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observerRef.current?.disconnect();
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observerRef.current.observe(imgElement);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [threshold, rootMargin, loading, isIntersectionObserverSupported]);

  useEffect(() => {
    if (isInView && !isLoaded && !hasError) {
      // performanceMonitor.startImageLoad();
      setCurrentSrc(src);
    }
  }, [isInView, isLoaded, hasError, src]);

  const handleLoad = () => {
    // performanceMonitor.endImageLoad(true);
    setIsLoaded(true);
    setHasError(false);
    onLoad?.();
  };

  const handleError = () => {
    // performanceMonitor.endImageLoad(false);
    setHasError(true);
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
    } else {
      // If fallback also fails, keep the placeholder
      setCurrentSrc(placeholder);
    }
    onError?.();
  };

  return (
    <div ref={imgRef} className={cn('relative overflow-hidden', className)}>
      <img
        {...props}
        src={currentSrc}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          'w-full h-full object-cover transition-opacity duration-300',
          isLoaded ? 'opacity-100' : 'opacity-50',
          className
        )}
        loading={loading}
        decoding="async"
      />
      
      {/* Loading indicator */}
      {!isLoaded && !hasError && currentSrc !== placeholder && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50">
          <div className="animate-pulse text-gray-600 text-sm font-medium">Loading...</div>
        </div>
      )}
      
      {/* Error indicator */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-gray-400 text-sm">Image unavailable</div>
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
