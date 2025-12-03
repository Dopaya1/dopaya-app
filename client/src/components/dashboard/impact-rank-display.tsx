import { Sparkles, Trophy } from "lucide-react";

interface ImpactRankDisplayProps {
  impactPoints: number;
  totalDonations: number;
}

export function ImpactRankDisplay({ impactPoints, totalDonations }: ImpactRankDisplayProps) {
  // Simple two-status system
  const isChangemaker = totalDonations > 0;
  const statusName = isChangemaker ? "Changemaker" : "Impact Aspirer";
  const statusTagline = isChangemaker 
    ? "Making real impact happen" 
    : "Ready to make your first impact";
  const StatusIcon = isChangemaker ? Trophy : Sparkles;
  const statusColor = isChangemaker ? "text-green-600" : "text-orange-600";
  const statusBgColor = isChangemaker ? "bg-green-100" : "bg-orange-100";

  return (
    <div className="space-y-3">
      {/* Current Status Display */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div
            className={`w-8 h-8 rounded-full ${statusBgColor} flex items-center justify-center`}
          >
            <StatusIcon className={`w-4 h-4 ${statusColor}`} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-gray-900">{statusName}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                  impactPoints === 50
                    ? "bg-orange-100 text-[#f2662d] animate-pulse"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {impactPoints.toLocaleString()} IP
              </span>
            </div>
            <p className="text-xs text-gray-500 italic">{statusTagline}</p>
          </div>
        </div>
      </div>

      {/* Progress Message - Only for Impact Aspirers */}
      {!isChangemaker && impactPoints === 50 && (
        <div className="text-sm text-gray-600">
          <span className="font-medium text-primary">
            Earn 50 more Impact Points by supporting your first social enterprise — unlock your first reward!
          </span>
        </div>
      )}
      
      {!isChangemaker && impactPoints < 50 && (
        <div className="text-sm text-gray-600">
          <span className="font-medium text-primary">
            {100 - impactPoints} more Impact Points to unlock rewards
          </span>
          {" "}— Support any project with ${Math.ceil((100 - impactPoints) / 10)} to unlock!
        </div>
      )}
    </div>
  );
}