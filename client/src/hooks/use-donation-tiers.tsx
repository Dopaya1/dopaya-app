import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

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
    queryKey: ["donation-tiers", slug],
    queryFn: async () => {
      if (!slug) {
        throw new Error("No project slug provided");
      }
      
      // Get project data from Supabase
      const { data: project, error } = await supabase
        .from('projects')
        .select('*')
        .eq('slug', slug)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Project not found');
        }
        throw error;
      }
      
      if (!project) {
        throw new Error('Project not found');
      }
      
      // Build donation tiers from project data
      const tiers: DonationTier[] = [];
      
      // Check for donation/impact pairs in the project
      for (let i = 1; i <= 7; i++) {
        const donation = project[`donation_${i}`];
        const impact = project[`impact_${i}`];
        
        if (donation && impact) {
          tiers.push({
            tier: i,
            donation: donation,
            impact: impact,
            unit: project.impact_unit || 'impact units'
          });
        }
      }
      
      // If no tiers defined, create default ones
      if (tiers.length === 0) {
        tiers.push(
          { tier: 1, donation: 50, impact: 1, unit: project.impact_unit || 'impact units' },
          { tier: 2, donation: 100, impact: 2, unit: project.impact_unit || 'impact units' },
          { tier: 3, donation: 250, impact: 5, unit: project.impact_unit || 'impact units' },
          { tier: 4, donation: 500, impact: 10, unit: project.impact_unit || 'impact units' }
        );
      }
      
      return {
        projectId: project.id,
        projectTitle: project.title,
        impactUnit: project.impact_unit || 'impact units',
        tiers: tiers.sort((a, b) => a.donation - b.donation),
        impactPointsMultiplier: project.impactPointsMultiplier || 1
      };
    },
    enabled: !!slug, // Only run query if slug is provided
  });
}