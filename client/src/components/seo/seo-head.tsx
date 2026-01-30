import { Helmet } from "react-helmet";
import { useI18n } from "@/lib/i18n/i18n-context";
import { addLanguagePrefix, removeLanguagePrefix } from "@/lib/i18n/utils";

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
  alternateUrls?: {
    en?: string;
    de?: string;
  };
}

export function SEOHead({
  title,
  description,
  keywords,
  ogImage = "https://dopaya.com/og-image.png", // Updated to use actual OG image
  ogImageWidth = 1200, // Standard OG image width
  ogImageHeight = 630, // Standard OG image height (1.91:1 aspect ratio)
  ogType = "website",
  canonicalUrl,
  structuredData,
  alternateUrls
}: SEOHeadProps) {
  const { language } = useI18n();
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
  
  // Generate alternate language URLs for hreflang
  const getAlternateUrls = () => {
    if (alternateUrls) {
      return {
        en: alternateUrls.en || 'https://dopaya.com',
        de: alternateUrls.de || 'https://dopaya.com/de',
      };
    }
    
    // Auto-generate alternate URLs from current URL
    if (typeof window !== 'undefined') {
      const currentPath = removeLanguagePrefix(window.location.pathname);
      const baseUrl = 'https://dopaya.com';
      
      return {
        en: `${baseUrl}${currentPath}`,
        de: `${baseUrl}${addLanguagePrefix(currentPath, 'de')}`,
      };
    }
    
    return {
      en: 'https://dopaya.com',
      de: 'https://dopaya.com/de',
    };
  };
  
  const alternates = getAlternateUrls();
  
  // Get locale for og:locale
  const ogLocale = language === 'de' ? 'de_CH' : 'en_US';

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="robots" content="index, follow" />
      <meta name="author" content="Dopaya" />
      
      {/* Language and Locale */}
      <html lang={language} />
      
      {/* Canonical URL */}
      {normalizedCanonicalUrl && <link rel="canonical" href={normalizedCanonicalUrl} />}
      
      {/* Hreflang Tags - Only add if alternate URLs are available */}
      {alternates.en && <link rel="alternate" hreflang="en" href={alternates.en} />}
      {alternates.de && <link rel="alternate" hreflang="de" href={alternates.de} />}
      <link rel="alternate" hreflang="x-default" href={alternates.en || 'https://dopaya.com'} />
      
      {/* Open Graph Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={currentUrl.replace('dopaya.org', 'dopaya.com')} />
      <meta property="og:image" content={normalizedOgImage} />
      <meta property="og:image:width" content={ogImageWidth.toString()} />
      <meta property="og:image:height" content={ogImageHeight.toString()} />
      <meta property="og:site_name" content="Dopaya" />
      <meta property="og:locale" content={ogLocale} />
      
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