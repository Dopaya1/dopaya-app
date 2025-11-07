import { Helmet } from "react-helmet";

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  ogImageWidth?: number; // Optional: OG image width in pixels (default: 1200)
  ogImageHeight?: number; // Optional: OG image height in pixels (default: 630)
  ogType?: string;
  canonicalUrl?: string;
  structuredData?: any;
}

export function SEOHead({
  title,
  description,
  keywords,
  ogImage = "https://dopaya.com/og-default.jpg", // Updated to dopaya.com
  ogImageWidth = 1200, // Standard OG image width
  ogImageHeight = 630, // Standard OG image height (1.91:1 aspect ratio)
  ogType = "website",
  canonicalUrl,
  structuredData
}: SEOHeadProps) {
  const fullTitle = title.includes("Dopaya") ? title : `${title} | Dopaya`;
  
  // Fallback: Use canonicalUrl if provided, otherwise try to construct from window.location
  // If window is not available (SSR), use a safe fallback
  let currentUrl = canonicalUrl;
  if (!currentUrl && typeof window !== 'undefined') {
    try {
      currentUrl = window.location.href;
    } catch (e) {
      // Fallback if window.location fails
      currentUrl = 'https://dopaya.com';
    }
  }
  if (!currentUrl) {
    currentUrl = 'https://dopaya.com'; // Final fallback
  }
  
  // Ensure canonicalUrl uses dopaya.com (normalize any dopaya.org references)
  const normalizedCanonicalUrl = canonicalUrl ? canonicalUrl.replace('dopaya.org', 'dopaya.com') : undefined;
  
  // Normalize OG image URL to use dopaya.com
  const normalizedOgImage = ogImage.replace('dopaya.org', 'dopaya.com');

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="robots" content="index, follow" />
      <meta name="author" content="Dopaya" />
      
      {/* Canonical URL */}
      {normalizedCanonicalUrl && <link rel="canonical" href={normalizedCanonicalUrl} />}
      
      {/* Open Graph Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={currentUrl.replace('dopaya.org', 'dopaya.com')} />
      <meta property="og:image" content={normalizedOgImage} />
      <meta property="og:image:width" content={ogImageWidth.toString()} />
      <meta property="og:image:height" content={ogImageHeight.toString()} />
      <meta property="og:site_name" content="Dopaya" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={normalizedOgImage} />
      <meta name="twitter:site" content="@dopaya" />
      <meta name="twitter:creator" content="@dopaya" />
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
}