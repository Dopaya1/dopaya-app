/**
 * Image utility functions matching main Dopaya site logic
 */

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
