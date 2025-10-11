// Image optimization utilities
export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png' | 'avif';
  blur?: number;
}

export function getOptimizedImageUrl(
  originalUrl: string,
  options: ImageOptimizationOptions = {}
): string {
  const {
    width,
    height,
    quality = 80,
    format = 'webp',
    blur
  } = options;

  // If it's already an external URL or data URL, return as is
  if (originalUrl.startsWith('http') || originalUrl.startsWith('data:')) {
    return originalUrl;
  }

  // For local images, we can add optimization parameters
  const params = new URLSearchParams();
  
  if (width) params.set('w', width.toString());
  if (height) params.set('h', height.toString());
  if (quality !== 80) params.set('q', quality.toString());
  if (format !== 'webp') params.set('f', format);
  if (blur) params.set('blur', blur.toString());

  const queryString = params.toString();
  return queryString ? `${originalUrl}?${queryString}` : originalUrl;
}

export function getResponsiveImageSrcSet(
  baseUrl: string,
  sizes: number[] = [320, 640, 768, 1024, 1280, 1536]
): string {
  return sizes
    .map(size => `${getOptimizedImageUrl(baseUrl, { width: size })} ${size}w`)
    .join(', ');
}

export function getImageSizes(breakpoints: string[] = [
  '(max-width: 320px) 320px',
  '(max-width: 640px) 640px',
  '(max-width: 768px) 768px',
  '(max-width: 1024px) 1024px',
  '(max-width: 1280px) 1280px',
  '1536px'
]): string {
  return breakpoints.join(', ');
}

// Check if WebP is supported
export function isWebPSupported(): boolean {
  if (typeof window === 'undefined') return false;
  
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
}

// Get optimal image format based on browser support
export function getOptimalImageFormat(): 'webp' | 'jpeg' | 'png' {
  if (typeof window === 'undefined') return 'jpeg';
  
  if (isWebPSupported()) {
    return 'webp';
  }
  
  return 'jpeg';
}

