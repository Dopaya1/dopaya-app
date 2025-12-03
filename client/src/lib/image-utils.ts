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

// Helper function to check if URL is a video
function isVideoUrl(url: string): boolean {
  if (!url) return false;
  const videoExtensions = ['.mp4', '.webm', '.mov', '.ogg', '.avi', '.mkv'];
  const videoDomains = ['youtube.com', 'youtu.be', 'vimeo.com', 'vimeocdn.com'];
  
  // Check file extension
  if (videoExtensions.some(ext => url.toLowerCase().endsWith(ext))) {
    return true;
  }
  
  // Check video platform URLs
  if (videoDomains.some(domain => url.toLowerCase().includes(domain))) {
    return true;
  }
  
  return false;
}

// Helper function to check if a media field contains a video based on imageType
function isVideoByType(project: any, index: number): boolean {
  if (index === 0) return false; // imageUrl - check via URL
  const typeFields: string[] = ['imageType1', 'imageType2', 'imageType3', 'imageType4', 'imageType5', 'imageType6'];
  if (index > 0 && index <= 6) {
    const typeField = typeFields[index - 1];
    const type = project[typeField];
    if (type === 'video') return true;
    if (type === 'image') return false;
  }
  return false;
}

/**
 * Get the best image URL for a project, with fallback logic:
 * 1. coverImage (if available - explicit thumbnail for videos)
 * 2. imageUrl (if it's an image, not a video)
 * 3. First available image from image1-6 (checking imageType fields or URL)
 * 
 * This ensures that if imageUrl contains a video, we still have a proper image to display
 * in cards, hero sections, and other places where only images should be shown.
 * 
 * @param project - The project object
 * @returns The best image URL to use, or null if no image is available
 */
export function getProjectImageUrl(project: any): string | null {
  if (!project) return null;
  
  // Priority 1: coverImage (explicit thumbnail for videos)
  if (project.coverImage && project.coverImage.trim()) {
    return project.coverImage.trim();
  }
  
  // Priority 2: imageUrl if it's an image (not a video)
  if (project.imageUrl) {
    const imageUrlStr = project.imageUrl.trim();
    // Check if imageUrl is a video
    const isImageUrlVideo = isVideoUrl(imageUrlStr) || isVideoByType(project, 0);
    if (!isImageUrlVideo) {
      return imageUrlStr;
    }
  }
  
  // Priority 3: Search through image1-6 for first available image
  const imageFields = ['image1', 'image2', 'image3', 'image4', 'image5', 'image6'];
  for (let i = 0; i < imageFields.length; i++) {
    const fieldName = imageFields[i];
    const imageUrl = project[fieldName];
    
    if (imageUrl && imageUrl.trim()) {
      const imageUrlStr = imageUrl.trim();
      // Check if this is a video (by type or URL)
      const isVideo = isVideoByType(project, i + 1) || isVideoUrl(imageUrlStr);
      if (!isVideo) {
        return imageUrlStr;
      }
    }
  }
  
  // No image found
  return null;
}

/**
 * Get the logo URL for a backer, handling different URL formats:
 * 1. Supabase Storage URLs (https://[project].supabase.co/storage/v1/object/public/...)
 * 2. External URLs (http/https)
 * 3. Relative paths (fallback to local assets)
 * 
 * @param logoPath - The logo path from the database (can be full URL, storage path, or relative path)
 * @param fallbackAsset - Optional fallback asset path (e.g., from @assets import)
 * @returns The logo URL to use, or null if no valid logo is found
 */
export function getLogoUrl(logoPath: string | null | undefined, fallbackAsset?: string): string | null {
  if (!logoPath || logoPath.trim() === '') {
    // Return fallback if provided
    return fallbackAsset || null;
  }

  const trimmedPath = logoPath.trim();
  
  // If it's already a full URL (http/https), return as is
  if (trimmedPath.startsWith('http://') || trimmedPath.startsWith('https://')) {
    return trimmedPath;
  }

  // If it's a Supabase Storage URL pattern (without protocol), construct full URL
  // Pattern: storage/v1/object/public/[bucket]/[path]
  if (trimmedPath.startsWith('storage/v1/object/public/')) {
    // Extract Supabase URL from environment or use default
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl) {
      console.warn('[getLogoUrl] VITE_SUPABASE_URL not set, returning fallback');
      return fallbackAsset || null;
    }
    return `${supabaseUrl}/${trimmedPath}`;
  }

  // If it's a relative path starting with /, treat as absolute path
  if (trimmedPath.startsWith('/')) {
    return trimmedPath;
  }

  // If it's a relative path without /, assume it's a Supabase Storage path
  // Try to construct the full Supabase Storage URL
  // Common pattern: [bucket]/[path] or just [path]
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (!supabaseUrl) {
    console.warn('[getLogoUrl] VITE_SUPABASE_URL not set, returning fallback');
    return fallbackAsset || null;
  }
  
  // If path contains a slash, assume it's bucket/path
  if (trimmedPath.includes('/')) {
    return `${supabaseUrl}/storage/v1/object/public/${trimmedPath}`;
  }

  // If no slash, assume it's just a filename in a default bucket
  // Try to construct URL with a default bucket name (e.g., 'brand-logos')
  // If that doesn't work, return fallback or the path as-is
  if (trimmedPath.length > 0) {
    // Try with default bucket 'brand-logos'
    const defaultBucketUrl = `${supabaseUrl}/storage/v1/object/public/brand-logos/${trimmedPath}`;
    // Return the constructed URL (client will handle 404 if image doesn't exist)
    return defaultBucketUrl;
  }

  // Last resort: return fallback or null
  return fallbackAsset || null;
}




