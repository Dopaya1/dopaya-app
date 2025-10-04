import { Button } from "@/components/ui/button";
import { Reward } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";

interface RewardCardProps {
  reward: Reward;
  onRedeem?: () => void;
}

export function RewardCard({ reward, onRedeem }: RewardCardProps) {
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
            alt={reward.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <CardContent className="p-5 flex flex-col flex-grow">
        <div className="flex items-center justify-between mb-2">
          <span className="bg-[#e94e35] bg-opacity-10 text-[#e94e35] font-medium text-[0.7rem] px-3 py-0 rounded-full">
            {companyName}
          </span>
          {discountDisplay && (
            <span className="text-gray-700 text-sm font-medium">{discountDisplay}</span>
          )}
        </div>
        
        <h3 className="text-lg font-bold mb-2">{reward.title}</h3>
        {reward.companyName && (
          <p className="text-sm text-gray-600 font-medium mb-3">{reward.companyName}</p>
        )}
        <p className="text-sm text-neutral mb-5 flex-grow">{reward.description}</p>
        
        <Button 
          className="w-full border border-[#e94e35] hover:bg-[#e94e35] hover:text-white transition-colors mt-auto"
          variant="ghost"
          style={{ color: '#e94e35' }}
          onClick={onRedeem}
        >
          Redeem Reward
        </Button>
      </CardContent>
    </Card>
  );
}
