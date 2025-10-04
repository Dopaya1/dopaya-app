import { useQuery } from "@tanstack/react-query";

export interface DonationTier {
  tier: number;
  donation: number;
  impact: number;
  unit: string;
}

export interface DonationTiersResponse {
  projectId: number;
  projectTitle: string;
  impactUnit: string;
  tiers: DonationTier[];
  impactPointsMultiplier: number;
}

export function useDonationTiers(slug: string | null) {
  return useQuery<DonationTiersResponse>({
    queryKey: ["/api/projects", slug, "donation-tiers"],
    queryFn: async () => {
      if (!slug) {
        throw new Error("No project slug provided");
      }
      
      const response = await fetch(`/api/projects/${slug}/donation-tiers`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch donation tiers: ${response.statusText}`);
      }
      
      // Handle empty responses safely
      const text = await response.text();
      if (!text || text.trim() === '') {
        throw new Error('Empty response from donation tiers API');
      }
      
      try {
        return JSON.parse(text);
      } catch (error) {
        console.error('JSON parsing error in donation tiers:', error, 'Response text:', text);
        const message = error instanceof Error ? error.message : 'Unknown parsing error';
        throw new Error(`Invalid JSON response from donation tiers API: ${message}`);
      }
    },
    enabled: !!slug, // Only run query if slug is provided
  });
}