import { ExternalLink } from "lucide-react";
import { ProjectPressMention } from "@shared/schema";
import { getLogoUrl } from "@/lib/image-utils";
import { BRAND_COLORS } from "@/constants/colors";
import { useTranslation } from "@/lib/i18n/use-translation";

interface PressMentionCardProps {
  pressMention: ProjectPressMention;
}

export function PressMentionCard({ pressMention }: PressMentionCardProps) {
  const { t } = useTranslation();
  // Try multiple possible field names
  const institutionName = (pressMention as any).institutionName || (pressMention as any).institution_name || '';
  const institutionLogo = (pressMention as any).institutionLogo || (pressMention as any).institution_logo || '';
  const headline = (pressMention as any).headline || '';
  // Prioritize summary field from database, fallback to shortDescription
  const summary = (pressMention as any).summary 
    || (pressMention as any).Summary
    || (pressMention as any).shortDescription 
    || (pressMention as any).short_description 
    || '';
  
  // Try multiple possible field names for link (prioritize link_url from Supabase)
  const link = (pressMention as any).link_url 
    || (pressMention as any).linkUrl
    || (pressMention as any).link 
    || (pressMention as any).url 
    || (pressMention as any).article_url 
    || (pressMention as any).articleUrl
    || (pressMention as any).article_link
    || (pressMention as any).articleLink
    || (pressMention as any).press_link
    || (pressMention as any).pressLink
    || '';

  const logoUrl = getLogoUrl(institutionLogo);
  const hasValidLink = link && link.trim() !== '' && (link.trim().startsWith('http') || link.trim().startsWith('//'));

  // Get press source name from joined table (priority 1)
  const pressSourceName = (pressMention as any).press_sources?.name || '';
  
  // Extract domain name from URL as fallback for source name
  const getSourceNameFromUrl = (url: string): string => {
    try {
      const urlObj = new URL(url.startsWith('//') ? `https:${url}` : url);
      const hostname = urlObj.hostname.replace('www.', '');
      // Capitalize first letter of domain
      return hostname.split('.')[0].charAt(0).toUpperCase() + hostname.split('.')[0].slice(1);
    } catch {
      return '';
    }
  };

  // Priority: press_sources.name > institutionName > extracted from URL
  const displaySourceName = pressSourceName || institutionName || (hasValidLink ? getSourceNameFromUrl(link) : '');

  const cardContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      {logoUrl && (
        <div className="flex items-center justify-start mb-3 h-8">
          <img 
            src={logoUrl}
            alt={institutionName || 'Institution logo'}
            className="max-h-8 max-w-full object-contain"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Summary - replaces headline, full text visible, no truncation, wrapped in quotes */}
      {summary && (
        <p className="text-[13px] font-semibold mb-3 flex-grow whitespace-pre-line" style={{ color: BRAND_COLORS.textPrimary }}>
          &ldquo;{summary}&rdquo;
        </p>
      )}

      {/* Institution Name and Link - side by side */}
      <div className="flex items-center justify-between gap-2 mt-auto pt-1">
        {/* Institution Name */}
        {displaySourceName && (
          <div className="text-xs font-medium" style={{ color: BRAND_COLORS.textSecondary }}>
            {displaySourceName}
          </div>
        )}
        
        {/* External Link */}
        {hasValidLink && (
          <a
            href={link.trim().startsWith('//') ? `https:${link.trim()}` : link.trim()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs hover:underline transition-all font-medium flex-shrink-0"
            style={{ color: BRAND_COLORS.primaryOrange }}
          >
            <span>{t("projectDetail.readArticle")}</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    </div>
  );

  // Always render as div, with link inside if available
  return (
    <div
      className="block bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-300 p-4 h-full"
      style={{ 
        borderColor: BRAND_COLORS.borderSubtle,
      }}
    >
      {cardContent}
    </div>
  );
}
