"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Project } from "@shared/schema";

interface CalculatorProps {
  className?: string;
  projectId?: string; // Optional project ID to use specific project data
}

interface DonationTier {
  donation: number;
  impact: string;
  unit: string;
  points: number;
}

export function InteractiveValueCalculator({ className, projectId }: CalculatorProps) {
  const [selectedTierIndex, setSelectedTierIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Fallback data for when database is not available
  const fallbackProjects = [
    {
      id: "ignis-careers",
      name: "Ignis Careers",
      donation_1: 10, impact_1: "1", donation_2: 25, impact_2: "2", 
      donation_3: 50, impact_3: "5", donation_4: 100, impact_4: "10",
      donation_5: 200, impact_5: "20", donation_6: 500, impact_6: "50",
      donation_7: 1000, impact_7: "100",
      impact_unit: "children get education",
      featured: true
    }
  ];

  // Fetch featured projects to get real donation tiers
  const { data: projects = fallbackProjects, isError } = useQuery<Project[]>({
    queryKey: ["projects-calculator"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("featured", true)
        .order("created_at", { ascending: true });
      
      if (error) throw error;
      return data || fallbackProjects;
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Get available tiers from the first project (Ignis Careers)
  const getAvailableTiers = (project: Project | null): DonationTier[] => {
    if (!project) return [];
    
    const tiers: DonationTier[] = [];
    for (let i = 1; i <= 7; i++) {
      const donation = project[`donation_${i}` as keyof Project] as number;
      const impact = project[`impact_${i}` as keyof Project] as string;
      const impactUnit = project.impact_unit as string;
      
      if (donation && impact) {
        tiers.push({
          donation,
          impact,
          unit: impactUnit || "impact created",
          points: donation * 10 // Calculate points based on donation amount
        });
      }
    }
    return tiers;
  };

  // Use specific project if provided, otherwise use first project
  const selectedProject = projectId 
    ? projects.find(p => p.id === projectId) || projects[0]
    : projects[0];
    
  const availableTiers = getAvailableTiers(selectedProject || null);
  const currentTier = availableTiers[selectedTierIndex] || availableTiers[0];

  // Reset selectedTierIndex if it's out of bounds
  useEffect(() => {
    if (selectedTierIndex >= availableTiers.length && availableTiers.length > 0) {
      setSelectedTierIndex(0);
    }
  }, [availableTiers.length, selectedTierIndex]);

  // Animation effect when values change
  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 300);
    return () => clearTimeout(timer);
  }, [selectedTierIndex]);

  const handleTierChange = (tierIndex: number) => {
    setSelectedTierIndex(tierIndex);
  };

  // Show loading state if no data yet
  if (!currentTier || availableTiers.length === 0) {
    return (
      <div className={`rounded-xl p-4 ${className}`} style={{ backgroundColor: '#F9FAFB' }}>
        <div className="text-center text-gray-500">
          {projects.length === 0 ? 'Loading projects...' : 'Loading tiers...'}
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-xl p-4 ${className}`} style={{ backgroundColor: '#F9FAFB' }}>
      {/* Support Amount Slider */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium" style={{ color: '#6b7280' }}>
            Support with
          </span>
          <span 
            className={`text-xl font-bold transition-all duration-300 ${isAnimating ? 'scale-110' : 'scale-100'}`}
            style={{ color: '#1a1a3a' }}
          >
            ${currentTier.donation}
          </span>
        </div>
        
        {/* Custom Slider */}
        <div className="relative">
          <input
            type="range"
            min="0"
            max={availableTiers.length - 1}
            step="1"
            value={selectedTierIndex}
            onChange={(e) => handleTierChange(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #f2662d 0%, #f2662d ${(selectedTierIndex / (availableTiers.length - 1)) * 100}%, #e5e7eb ${(selectedTierIndex / (availableTiers.length - 1)) * 100}%, #e5e7eb 100%)`
            }}
          />
        </div>
      </div>

      {/* Three Column Layout */}
      <div className="flex items-center justify-between gap-2">
        {/* We ensure */}
        <div className="text-center flex-1">
          <div className="text-xs mb-1" style={{ color: '#6b7280' }}>We ensure</div>
          <div 
            className={`text-lg font-bold mb-1 transition-all duration-300 ${isAnimating ? 'scale-110' : 'scale-100'}`}
            style={{ color: '#f2662d' }}
          >
            {currentTier.impact}
          </div>
          <div className="text-xs" style={{ color: '#9ca3af' }}>{currentTier.unit}</div>
        </div>
        
        {/* Arrow */}
        <div className="text-gray-400 text-xl pb-3">⟶</div>
        
        {/* You get */}
        <div className="text-center flex-1">
          <div className="text-xs mb-1" style={{ color: '#6b7280' }}>You get</div>
          <div 
            className={`text-lg font-bold mb-1 transition-all duration-300 ${isAnimating ? 'scale-110' : 'scale-100'}`}
            style={{ color: '#1a1a3a' }}
          >
            {currentTier.points.toLocaleString()}
          </div>
          <div className="text-xs" style={{ color: '#9ca3af' }}>impact points</div>
        </div>
        
        {/* Plus */}
        <div className="text-gray-400 text-xl pb-3">⊕</div>
        
        {/* You can spend up to */}
        <div className="text-center flex-1">
          <div className="text-xs mb-1" style={{ color: '#6b7280' }}>You can spend up to</div>
          <div 
            className={`text-lg font-bold mb-1 transition-all duration-300 ${isAnimating ? 'scale-110' : 'scale-100'}`}
            style={{ color: '#1a1a3a' }}
          >
            ${Math.round(currentTier.donation * 1.5)}
          </div>
          <div className="text-xs" style={{ color: '#9ca3af' }}>in rewards</div>
        </div>
      </div>
    </div>
  );
}
