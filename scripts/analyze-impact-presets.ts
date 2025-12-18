/**
 * Phase 0.2: Analyse Preset-Konsistenz
 * 
 * Prüft ob Presets linear sind und berechnet impact_factor
 * Führt die SQL-Analyse aus und exportiert Ergebnisse
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Lade Environment Variables
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface PresetRatio {
  donation: number;
  impact: number;
  ratio: number;
}

interface ProjectAnalysis {
  id: number;
  title: string;
  slug: string;
  presets: PresetRatio[];
  medianRatio: number;
  meanRatio: number;
  stddev: number;
  variancePercent: number;
  status: 'consistent' | 'needs_review' | 'no_data';
  recommendation: string;
}

async function analyzeProjectPresets(project: any): Promise<ProjectAnalysis | null> {
  const presets: PresetRatio[] = [];
  
  // Sammle alle gültigen Presets
  for (let i = 1; i <= 7; i++) {
    const donation = (project as any)[`donation${i}`];
    const impact = (project as any)[`impact${i}`];
    
    if (donation && donation > 0 && impact !== null && impact !== undefined) {
      presets.push({
        donation,
        impact,
        ratio: impact / donation
      });
    }
  }
  
  if (presets.length < 2) {
    return {
      id: project.id,
      title: project.title,
      slug: project.slug,
      presets: [],
      medianRatio: 0,
      meanRatio: 0,
      stddev: 0,
      variancePercent: 0,
      status: 'no_data',
      recommendation: 'Insufficient presets - need at least 2'
    };
  }
  
  // Berechne Statistiken
  const ratios = presets.map(p => p.ratio);
  ratios.sort((a, b) => a - b);
  
  const meanRatio = ratios.reduce((sum, r) => sum + r, 0) / ratios.length;
  const medianRatio = ratios.length % 2 === 0
    ? (ratios[ratios.length / 2 - 1] + ratios[ratios.length / 2]) / 2
    : ratios[Math.floor(ratios.length / 2)];
  
  const variance = ratios.reduce((sum, r) => sum + Math.pow(r - meanRatio, 2), 0) / ratios.length;
  const stddev = Math.sqrt(variance);
  const variancePercent = medianRatio > 0 ? (stddev / medianRatio) * 100 : 0;
  
  const status: 'consistent' | 'needs_review' | 'no_data' = 
    variancePercent < 10 ? 'consistent' : 'needs_review';
  
  const recommendation = status === 'consistent'
    ? `Can use ${medianRatio.toFixed(6)} as impact_factor`
    : `High variance (${variancePercent.toFixed(2)}%) - manual review recommended`;
  
  return {
    id: project.id,
    title: project.title,
    slug: project.slug,
    presets,
    medianRatio,
    meanRatio,
    stddev,
    variancePercent,
    status,
    recommendation
  };
}

async function main() {
  console.log('🔍 Starting Impact Preset Analysis...\n');
  
  // Lade alle aktiven Projekte
  const { data: projects, error } = await supabase
    .from('projects')
    .select('id, title, slug, donation_1, donation_2, donation_3, donation_4, donation_5, donation_6, donation_7, impact_1, impact_2, impact_3, impact_4, impact_5, impact_6, impact_7')
    .or('status.eq.active,status.is.null');
  
  if (error) {
    console.error('❌ Error fetching projects:', error);
    process.exit(1);
  }
  
  if (!projects || projects.length === 0) {
    console.log('⚠️ No projects found');
    return;
  }
  
  console.log(`📊 Analyzing ${projects.length} projects...\n`);
  
  // Analysiere jedes Projekt
  const analyses: ProjectAnalysis[] = [];
  const consistent: ProjectAnalysis[] = [];
  const needsReview: ProjectAnalysis[] = [];
  const noData: ProjectAnalysis[] = [];
  
  for (const project of projects) {
    const analysis = await analyzeProjectPresets(project);
    if (analysis) {
      analyses.push(analysis);
      
      if (analysis.status === 'consistent') {
        consistent.push(analysis);
      } else if (analysis.status === 'needs_review') {
        needsReview.push(analysis);
      } else {
        noData.push(analysis);
      }
    }
  }
  
  // Ausgabe
  console.log('📈 ANALYSIS RESULTS\n');
  console.log(`✅ Consistent: ${consistent.length}`);
  console.log(`⚠️  Needs Review: ${needsReview.length}`);
  console.log(`❌ No Data: ${noData.length}\n`);
  
  // Detaillierte Ausgabe
  if (consistent.length > 0) {
    console.log('✅ CONSISTENT PROJECTS (can use median as impact_factor):\n');
    consistent.forEach(a => {
      console.log(`  ${a.title} (${a.slug})`);
      console.log(`    Impact Factor: ${a.medianRatio.toFixed(6)}`);
      console.log(`    Variance: ${a.variancePercent.toFixed(2)}%`);
      console.log(`    Presets: ${a.presets.length}`);
      console.log('');
    });
  }
  
  if (needsReview.length > 0) {
    console.log('⚠️  PROJECTS NEEDING REVIEW:\n');
    needsReview.forEach(a => {
      console.log(`  ${a.title} (${a.slug})`);
      console.log(`    Median Ratio: ${a.medianRatio.toFixed(6)}`);
      console.log(`    Variance: ${a.variancePercent.toFixed(2)}%`);
      console.log(`    Presets: ${a.presets.length}`);
      console.log(`    Recommendation: ${a.recommendation}`);
      console.log('');
    });
  }
  
  if (noData.length > 0) {
    console.log('❌ PROJECTS WITHOUT IMPACT DATA:\n');
    noData.forEach(a => {
      console.log(`  ${a.title} (${a.slug})`);
      console.log(`    Recommendation: ${a.recommendation}`);
      console.log('');
    });
  }
  
  // Export als JSON
  const outputPath = path.join(__dirname, 'impact-analysis-results.json');
  fs.writeFileSync(outputPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: {
      total: analyses.length,
      consistent: consistent.length,
      needsReview: needsReview.length,
      noData: noData.length
    },
    consistent,
    needsReview,
    noData
  }, null, 2));
  
  console.log(`\n💾 Results exported to: ${outputPath}`);
  console.log('\n✅ Analysis complete!');
}

main().catch(console.error);






