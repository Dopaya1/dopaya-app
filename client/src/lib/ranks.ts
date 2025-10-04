import { Star, Trophy, Bell } from "lucide-react";

export interface ImpactRank {
  id: string;
  name: string;
  pointsRequired: number;
  icon: typeof Star;
  description: string;
  tagline: string;
  benefits: string;
  color: string;
  bgColor: string;
}

export const IMPACT_RANKS: ImpactRank[] = [
  {
    id: "supporter",
    name: "Supporter",
    pointsRequired: 100,
    icon: Star,
    description: "Start making ripples.",
    tagline: "Start making ripples.",
    benefits: "Access basic brand perks.",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    id: "advocate",
    name: "Advocate",
    pointsRequired: 500,
    icon: Star,
    description: "Your story inspires others.",
    tagline: "Your story inspires others.",
    benefits: "Get early access & curated rewards.",
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  {
    id: "changemaker",
    name: "Changemaker",
    pointsRequired: 1000,
    icon: Trophy,
    description: "You shape what comes next.",
    tagline: "You shape what comes next.",
    benefits: "Join founder AMAs & pilot access.",
    color: "text-orange-600",
    bgColor: "bg-orange-100",
  },
  {
    id: "impact-hero",
    name: "Impact Hero",
    pointsRequired: 2500,
    icon: Trophy,
    description: "You're powering real change.",
    tagline: "You're powering real change.",
    benefits: "Unlock exclusive gifts & showcases.",
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  {
    id: "impact-legend",
    name: "Impact Legend",
    pointsRequired: 5000,
    icon: Bell,
    description: "Your legacy grows stronger.",
    tagline: "Your legacy grows stronger.",
    benefits: "Exclusive impact showcases & recognition.",
    color: "text-amber-600",
    bgColor: "bg-amber-100",
  },
  {
    id: "hall-of-fame",
    name: "Hall of Fame",
    pointsRequired: 10000,
    icon: Bell,
    description: "Become part of Dopaya legacy.",
    tagline: "Become part of Dopaya legacy.",
    benefits: "Enjoy custom brand experiences.",
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
  },
];

export function getCurrentRank(impactPoints: number): ImpactRank {
  // Find the highest rank the user qualifies for
  const qualifiedRanks = IMPACT_RANKS.filter(rank => impactPoints >= rank.pointsRequired);
  return qualifiedRanks.length > 0 
    ? qualifiedRanks[qualifiedRanks.length - 1] 
    : IMPACT_RANKS[0];
}

export function getNextRank(impactPoints: number): ImpactRank | null {
  // Find the next rank the user can achieve
  const nextRank = IMPACT_RANKS.find(rank => impactPoints < rank.pointsRequired);
  return nextRank || null;
}

export function getProgressToNextRank(impactPoints: number, totalDonations: number): {
  nextRank: ImpactRank | null;
  pointsNeeded: number;
  donationsNeeded: number;
} {
  const nextRank = getNextRank(impactPoints);
  
  if (!nextRank) {
    return {
      nextRank: null,
      pointsNeeded: 0,
      donationsNeeded: 0,
    };
  }

  const pointsNeeded = nextRank.pointsRequired - impactPoints;
  // Assuming 1 point per $1 donated (adjust ratio as needed)
  const donationsNeeded = Math.max(0, pointsNeeded);

  return {
    nextRank,
    pointsNeeded,
    donationsNeeded,
  };
}