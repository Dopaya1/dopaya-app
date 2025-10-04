import { useState } from "react";
import { Info } from "lucide-react";
import { getCurrentRank, getProgressToNextRank, IMPACT_RANKS } from "@/lib/ranks";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface ImpactRankDisplayProps {
  impactPoints: number;
  totalDonations: number;
}

export function ImpactRankDisplay({ impactPoints, totalDonations }: ImpactRankDisplayProps) {
  const currentRank = getCurrentRank(impactPoints);
  const { nextRank, donationsNeeded } = getProgressToNextRank(impactPoints, totalDonations);
  const Icon = currentRank.icon;

  return (
    <div className="space-y-3">
      {/* Current Rank Display */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`w-8 h-8 rounded-full ${currentRank.bgColor} flex items-center justify-center`}>
            <Icon className={`w-4 h-4 ${currentRank.color}`} />
          </div>
          <div>
            <span className="font-semibold text-gray-900">{currentRank.name}</span>
            <p className="text-xs text-gray-500 italic">{currentRank.tagline}</p>
          </div>
        </div>
        
        {/* Info Button */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Info className="h-3 w-3 text-gray-400 hover:text-gray-600" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Impact Rank System</DialogTitle>
              <DialogDescription>
                Your Impact Rank reflects your contribution to positive change. Each donation earns you Impact Points, unlocking new levels and exclusive benefits.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 mt-6">
              {IMPACT_RANKS.map((rank) => {
                const RankIcon = rank.icon;
                const isCurrentRank = rank.id === currentRank.id;
                const isUnlocked = impactPoints >= rank.pointsRequired;
                
                return (
                  <div
                    key={rank.id}
                    className={`p-4 rounded-lg border-2 ${
                      isCurrentRank 
                        ? 'border-primary bg-blue-50' 
                        : isUnlocked 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`w-10 h-10 rounded-full ${rank.bgColor} flex items-center justify-center`}>
                        <RankIcon className={`w-5 h-5 ${rank.color}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{rank.name}</h3>
                          <Badge variant="outline" className="text-xs">
                            {rank.pointsRequired.toLocaleString()} pts
                          </Badge>
                          {isCurrentRank && (
                            <Badge className="text-xs bg-primary text-white">Current</Badge>
                          )}
                          {isUnlocked && !isCurrentRank && (
                            <Badge variant="secondary" className="text-xs">Unlocked</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 italic mb-2">"{rank.tagline}"</p>
                        <p className="text-sm text-gray-700">{rank.benefits}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Progress to Next Rank */}
      {nextRank && (
        <div className="text-sm text-gray-600">
          <span className="font-medium text-primary">
            ${donationsNeeded.toLocaleString()} more donation needed
          </span>
          {" "}to reach the next rank ({nextRank.name})
        </div>
      )}
      
      {!nextRank && (
        <div className="text-sm text-amber-600 font-medium">
          🎉 You've reached the highest rank!
        </div>
      )}
    </div>
  );
}