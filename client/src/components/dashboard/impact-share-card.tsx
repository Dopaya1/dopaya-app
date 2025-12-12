import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useI18n } from "@/lib/i18n/i18n-context";
import { trackEvent } from "@/lib/simple-analytics";
import { toast } from "@/hooks/use-toast";
import { MessageCircle, Link2, Facebook, Mail } from "lucide-react";
import { useState, useEffect } from "react";
import { formatNumber } from "@/lib/i18n/formatters";

interface ImpactStat {
  id: string;
  emoji: string;
  value: number;
  label: string;
  unit?: string;
  format: (val: number) => string;
}

interface ImpactShareCardProps {
  isOpen: boolean;
  onClose: () => void;
  stat: ImpactStat | null;
}

export function ImpactShareCard({ isOpen, onClose, stat }: ImpactShareCardProps) {
  const { t } = useTranslation();
  const [shareText, setShareText] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [showShareOptions, setShowShareOptions] = useState(false);

  const { language } = useI18n();

  useEffect(() => {
    if (stat && isOpen) {
      // Always use dopaya.com for sharing (not localhost)
      const shareUrl = language === 'de' ? 'dopaya.com' : 'www.dopaya.com';
      setShareUrl(shareUrl);

      // Create share message with dynamic impact
      // Priority: Use stat.label if available (contains generated text from snapshot)
      let shareMessage = '';
      if (stat.label) {
        // Use the impact label from snapshot, add the number (ohne Unit-Duplikat)
        // Remove "impact" from label if present (clean up the text)
        const cleanLabel = stat.label.replace(/\bimpact\s+/gi, '').trim();
        const shareValue = formatNumber(stat.value);
        shareMessage = language === 'de'
          ? `Ich habe gerade echten Impact geschaffen:\n\n${shareValue} ${cleanLabel}\n\nAuf der ersten Plattform, die inspirierende Social Enterprises unterstützt und gleichzeitig Zugang zu nachhaltigen Marken bietet. Mach mit auf ${shareUrl}`
          : `I have just created real impact:\n\n${shareValue} ${cleanLabel}\n\nOn the first platform that supports inspiring social enterprises while providing access to sustainable brands. Join me on ${shareUrl}`;
      } else {
        // Fallback: Generic message
        shareMessage = language === 'de'
          ? `Ich habe gerade ein tolles Social Enterprise mit echtem Impact unterstützt. Auf der ersten Plattform, die Social Enterprises unterstützt und gleichzeitig Zugang zu nachhaltigen Marken bietet. Mach mit auf ${shareUrl}`
          : `I just supported an amazing social enterprise with real impact. On the first platform that supports social enterprises while providing access to sustainable brands. Join me on ${shareUrl}`;
      }
      
      setShareText(shareMessage);
      setShowShareOptions(true); // Show options immediately
    }
  }, [stat, isOpen, language]);

  const handleWebShare = async () => {
    if (!stat || !navigator.share) return;

    try {
      await navigator.share({
        title: t("impactShare.shareTitle"),
        text: shareText,
        url: shareUrl,
      });
      
      trackEvent('share_completed', 'conversion', 'web_share_api');
      toast({
        title: t("impactShare.successTitle"),
        description: t("impactShare.successDescription"),
      });
      onClose();
    } catch (error: any) {
      // User cancelled or error occurred
      if (error.name !== 'AbortError') {
        console.error('Error sharing:', error);
        trackEvent('share_cancelled', 'engagement', 'web_share_api');
      }
    }
  };

  const handleSocialShare = (platform: 'twitter' | 'facebook' | 'whatsapp' | 'email') => {
    if (!stat) return;

    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(`https://${shareUrl}`);
    
    let shareLink = '';
    
    switch (platform) {
      case 'twitter':
        // Twitter: text already includes URL, so just use text
        shareLink = `https://twitter.com/intent/tweet?text=${encodedText}`;
        trackEvent('click_share', 'engagement', 'twitter');
        break;
      case 'facebook':
        // Facebook: Use proper share dialog with URL
        // Note: Facebook's share dialog works best with just the URL
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        trackEvent('click_share', 'engagement', 'facebook');
        break;
      case 'whatsapp':
        // WhatsApp: text already includes URL
        shareLink = `https://wa.me/?text=${encodedText}`;
        trackEvent('click_share', 'engagement', 'whatsapp');
        break;
      case 'email':
        // Email: Use mailto: with subject and body
        const emailSubject = t("impactShare.emailSubject");
        // Priority: Use stat.label if available (contains generated text from snapshot)
        // Remove "impact" from label if present (clean up the text)
        const emailCleanLabel = stat?.label ? stat.label.replace(/\bimpact\s+/gi, '').trim() : '';
        const emailShareValue = formatNumber(stat.value);
        const emailBody = shareText || (stat?.label
          ? (language === 'de'
              ? `Ich habe gerade echten Impact geschaffen:\n\n${emailShareValue} ${emailCleanLabel}\n\nAuf der ersten Plattform, die inspirierende Social Enterprises unterstützt und gleichzeitig Zugang zu nachhaltigen Marken bietet. Mach mit auf ${shareUrl}`
              : `I have just created real impact:\n\n${emailShareValue} ${emailCleanLabel}\n\nOn the first platform that supports inspiring social enterprises while providing access to sustainable brands. Join me on ${shareUrl}`)
          : (language === 'de'
              ? `Ich habe gerade ein tolles Social Enterprise mit echtem Impact unterstützt. Auf der ersten Plattform, die Social Enterprises unterstützt und gleichzeitig Zugang zu nachhaltigen Marken bietet. Mach mit auf ${shareUrl}`
              : `I just supported an amazing social enterprise with real impact. On the first platform that supports social enterprises while providing access to sustainable brands. Join me on ${shareUrl}`));
        
        shareLink = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
        trackEvent('click_share', 'engagement', 'email');
        
        // Open email client
        window.location.href = shareLink;
        toast({
          title: t("impactShare.emailOpeningTitle"),
          description: t("impactShare.emailOpeningDescription"),
        });
        return;
    }

    if (shareLink) {
      window.open(shareLink, '_blank', 'width=600,height=400');
      trackEvent('share_completed', 'conversion', platform);
    }
  };

  const handleCopyText = async () => {
    if (!stat) {
      console.error('No stat available');
      toast({
        title: language === 'de' ? 'Fehler' : 'Error',
        description: language === 'de'
          ? 'Kein Impact verfügbar'
          : 'No impact available',
        variant: "destructive",
      });
      return;
    }

    // Always generate the text fresh to ensure it's up to date
    const shareUrl = language === 'de' ? 'dopaya.com' : 'www.dopaya.com';
    // Priority: Use stat.label if available (contains generated text from snapshot)
    // When stat.label exists, use formatNumber directly (not stat.format which adds noun)
    // Remove "impact" from label if present (clean up the text)
    const cleanLabel = stat.label ? stat.label.replace(/\bimpact\s+/gi, '').trim() : '';
    const shareValue = stat.label ? formatNumber(stat.value) : (stat.format ? stat.format(stat.value) : formatNumber(stat.value));
    const textToCopy = stat.label
      ? (language === 'de'
          ? `Ich habe gerade echten Impact geschaffen:\n\n${shareValue} ${cleanLabel}\n\nAuf der ersten Plattform, die inspirierende Social Enterprises unterstützt und gleichzeitig Zugang zu nachhaltigen Marken bietet. Mach mit auf ${shareUrl}`
          : `I have just created real impact:\n\n${shareValue} ${cleanLabel}\n\nOn the first platform that supports inspiring social enterprises while providing access to sustainable brands. Join me on ${shareUrl}`)
      : (language === 'de'
          ? `Ich habe gerade ein tolles Social Enterprise mit echtem Impact unterstützt. Auf der ersten Plattform, die Social Enterprises unterstützt und gleichzeitig Zugang zu nachhaltigen Marken bietet. Mach mit auf ${shareUrl}`
          : `I just supported an amazing social enterprise with real impact. On the first platform that supports social enterprises while providing access to sustainable brands. Join me on ${shareUrl}`);
    
    console.log('Copying text:', textToCopy);
    
    try {
      // Try modern Clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textToCopy);
        trackEvent('copy_link', 'engagement', 'clipboard');
        toast({
          title: language === 'de' ? 'Text kopiert!' : 'Text copied!',
          description: language === 'de' 
            ? 'Der Text wurde in deine Zwischenablage kopiert'
            : 'The text has been copied to your clipboard',
        });
        return;
      }
      
      // Fallback: create a temporary textarea
      const textarea = document.createElement('textarea');
      textarea.value = textToCopy;
      textarea.style.position = 'fixed';
      textarea.style.top = '0';
      textarea.style.left = '0';
      textarea.style.width = '2em';
      textarea.style.height = '2em';
      textarea.style.padding = '0';
      textarea.style.border = 'none';
      textarea.style.outline = 'none';
      textarea.style.boxShadow = 'none';
      textarea.style.background = 'transparent';
      textarea.style.opacity = '0';
      textarea.style.zIndex = '-1';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textarea);
      
      if (successful) {
        trackEvent('copy_link', 'engagement', 'clipboard_fallback');
        toast({
          title: language === 'de' ? 'Text kopiert!' : 'Text copied!',
          description: language === 'de' 
            ? 'Der Text wurde in deine Zwischenablage kopiert'
            : 'The text has been copied to your clipboard',
        });
      } else {
        throw new Error('execCommand copy failed');
      }
    } catch (error) {
      console.error('Failed to copy:', error);
      toast({
        title: language === 'de' ? 'Kopieren fehlgeschlagen' : 'Copy failed',
        description: language === 'de'
          ? 'Bitte kopiere den Text manuell'
          : 'Please copy the text manually',
        variant: "destructive",
      });
    }
  };

  if (!stat) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        trackEvent('share_cancelled', 'engagement', 'close_button');
        setShowShareOptions(false);
        onClose();
      }
    }}>
      <DialogContent 
        className="max-w-md high-z" 
        style={{ zIndex: 10000 }}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {t("impactShare.shareTitle")}
          </DialogTitle>
        </DialogHeader>

        {/* Share Options - Show immediately */}
        <div className="mt-4 space-y-3">
          {/* WhatsApp Button - Full width, placed first */}
          <Button
            onClick={() => handleSocialShare('whatsapp')}
            className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20BA5A] text-white"
            aria-label={t("impactShare.shareOnWhatsApp")}
          >
            <MessageCircle className="w-5 h-5" />
            <span>WhatsApp</span>
          </Button>

          {/* Social Share Buttons - Facebook and Email side by side */}
          <div className="flex gap-2">
            <Button
              onClick={() => handleSocialShare('facebook')}
              className="flex-1 flex items-center justify-center gap-2 bg-[#1877F2] hover:bg-[#166FE5] text-white"
              aria-label={t("impactShare.shareOnFacebook")}
            >
              <Facebook className="w-5 h-5" />
              <span>Facebook</span>
            </Button>
            <Button
              onClick={() => handleSocialShare('email')}
              className="flex-1 flex items-center justify-center gap-2 bg-[#f2662d] hover:bg-[#d9551f] text-white"
              aria-label={t("impactShare.shareOnEmail")}
            >
              <Mail className="w-5 h-5" />
              <span>{t("impactShare.shareOnEmail")}</span>
            </Button>
          </div>

          {/* Copy Text Button */}
          <Button
            variant="outline"
            onClick={handleCopyText}
            className="w-full flex items-center justify-center gap-2"
            aria-label={language === 'de' ? 'Text kopieren' : 'Copy text'}
          >
            <Link2 className="w-4 h-4" />
            {language === 'de' ? 'Text kopieren' : 'Copy text'}
          </Button>

          {/* Close Button */}
          <Button
            variant="ghost"
            onClick={() => {
              setShowShareOptions(false);
              onClose();
            }}
            className="w-full"
          >
            {t("common.cancel") || t("rewards.cancel")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

