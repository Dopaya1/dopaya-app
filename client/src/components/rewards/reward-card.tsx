import { Button } from "@/components/ui/button";
import { Reward } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n/i18n-context";
import { getRewardTitle } from "@/lib/i18n/project-content";

interface RewardCardProps {
  reward: Reward;
  onRedeem?: () => void;
}

export function RewardCard({ reward, onRedeem }: RewardCardProps) {
  const { language } = useI18n();
  // Use company name from database, fallback to category if not available
  const companyName = reward.companyName || reward.category || 'Partner';
  
  // Create discount display text
  const discountDisplay = reward.discount && reward.discountName 
    ? `${reward.discount} ${reward.discountName}`
    : reward.discount || reward.discountName || '';
  
  return (
    <Card className="overflow-hidden border shadow-sm flex flex-col h-full">
      {reward.imageUrl && (
        <div className="w-full h-40 overflow-hidden bg-gray-100">
          <img 
            src={reward.imageUrl}
            alt={getRewardTitle(reward, language)}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <CardContent className="p-5 flex flex-col flex-grow">
        <div className="flex items-center justify-between mb-2">
          <span className="bg-opacity-10 font-medium text-[0.7rem] px-3 py-0 rounded-full" style={{ backgroundColor: 'rgba(242, 102, 45, 0.1)', color: '#f2662d' }}>
            {companyName}
          </span>
          {discountDisplay && (
            <span className="text-gray-700 text-sm font-medium">{discountDisplay}</span>
          )}
        </div>
        
        <h3 className="text-lg font-bold mb-2">{getRewardTitle(reward, language)}</h3>
        {reward.companyName && (
          <p className="text-sm text-gray-600 font-medium mb-3">{reward.companyName}</p>
        )}
        <p className="text-sm text-neutral mb-5 flex-grow">{reward.description}</p>
      </CardContent>
    </Card>
  );
}
