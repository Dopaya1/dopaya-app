import { ExternalLink } from "lucide-react";
import { ProjectPressMention } from "@shared/schema";
import { getLogoUrl } from "@/lib/image-utils";
import { BRAND_COLORS } from "@/constants/colors";

interface PressMentionCardProps {
  pressMention: ProjectPressMention;
}

export function PressMentionCard({ pressMention }: PressMentionCardProps) {
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

      {/* Institution Name (if no logo) */}
      {!logoUrl && institutionName && (
        <div className="text-xs font-medium mb-3" style={{ color: BRAND_COLORS.textSecondary }}>
          {institutionName}
        </div>
      )}

      {/* Summary - replaces headline, full text visible, no truncation, wrapped in quotes */}
      {summary && (
        <p className="text-[13px] font-semibold mb-2 flex-grow whitespace-pre-line" style={{ color: BRAND_COLORS.textPrimary }}>
          &ldquo;{summary}&rdquo;
        </p>
      )}

      {/* External Link - below summary text */}
      {hasValidLink && (
        <div className="mt-auto pt-1">
          <a
            href={link.trim().startsWith('//') ? `https:${link.trim()}` : link.trim()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs hover:underline transition-all font-medium"
            style={{ color: BRAND_COLORS.primaryOrange }}
          >
            <span>Read article</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}
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
