import { LazyImage } from './lazy-image';
import { 
  getOptimizedImageUrl, 
  getResponsiveImageSrcSet, 
  getImageSizes, 
  getOptimalImageFormat 
} from '@/lib/image-utils';
import { ImgHTMLAttributes } from 'react';

interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'sizes'> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png' | 'avif';
  blur?: number;
  responsive?: boolean;
  sizes?: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: () => void;
}

export function OptimizedImage({
  src,
  alt,
  fallbackSrc,
  width,
  height,
  quality = 80,
  format,
  blur,
  responsive = true,
  sizes,
  className,
  loading = 'lazy',
  onLoad,
  onError,
  ...props
}: OptimizedImageProps) {
  // Get optimal format if not specified
  const optimalFormat = format || getOptimalImageFormat();
  
  // Generate optimized URL
  const optimizedSrc = getOptimizedImageUrl(src, {
    width,
    height,
    quality,
    format: optimalFormat,
    blur
  });

  // Generate responsive srcSet if responsive is enabled
  const srcSet = responsive ? getResponsiveImageSrcSet(src) : undefined;
  const defaultSizes = responsive ? getImageSizes() : undefined;

  return (
    <LazyImage
      src={optimizedSrc}
      alt={alt}
      fallbackSrc={fallbackSrc}
      className={className}
      loading={loading}
      onLoad={onLoad}
      onError={onError}
      {...props}
    />
  );
}

// Simple optimized image without lazy loading for above-the-fold content
export function EagerOptimizedImage({
  src,
  alt,
  fallbackSrc,
  width,
  height,
  quality = 80,
  format,
  blur,
  responsive = true,
  sizes,
  className,
  onLoad,
  onError,
  ...props
}: OptimizedImageProps) {
  const optimalFormat = format || getOptimalImageFormat();
  
  const optimizedSrc = getOptimizedImageUrl(src, {
    width,
    height,
    quality,
    format: optimalFormat,
    blur
  });

  const srcSet = responsive ? getResponsiveImageSrcSet(src) : undefined;
  const defaultSizes = responsive ? getImageSizes() : undefined;

  return (
    <LazyImage
      src={optimizedSrc}
      alt={alt}
      fallbackSrc={fallbackSrc}
      className={className}
      loading="eager"
      onLoad={onLoad}
      onError={onError}
      {...props}
    />
  );
}

