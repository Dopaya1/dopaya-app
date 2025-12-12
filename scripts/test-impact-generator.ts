/**
 * Test Script for Impact Generator
 * 
 * Simple test script to verify impact generator functionality
 * Run with: npm run test:impact-generator
 */

import { generateImpactSnapshot, hasImpact } from '../server/impact-generator';
import { Project } from '@shared/schema';

// Mock project data
const createMockProject = (overrides?: Partial<Project>): Project => {
  return {
    id: 1,
    title: 'Openversum',
    slug: 'openversum',
    description: 'Test description',
    category: 'water',
    country: 'Switzerland',
    imageUrl: 'test.jpg',
    impactFactor: 0.1,
    impactUnitSingularEn: 'person',
    impactUnitPluralEn: 'people',
    impactUnitSingularDe: 'Person',
    impactUnitPluralDe: 'Personen',
    ctaTemplateEn: 'access safe drinking water',
    ctaTemplateDe: 'Zugang zu sauberem Trinkwasser zu verschaffen',
    pastTemplateEn: 'provided with safe drinking water',
    pastTemplateDe: 'Zugang zu sauberem Trinkwasser gegeben',
    impactPointsMultiplier: 10,
    ...overrides
  } as Project;
};

// Helper: map snake_case to camelCase (mirrors api/projects-donate.ts)
const mapProjectImpactFields = (project: any) => ({
  ...project,
  impactFactor: project.impactFactor ?? project.impact_factor,
  impactUnitSingularEn: project.impactUnitSingularEn ?? project.impact_unit_singular_en,
  impactUnitPluralEn: project.impactUnitPluralEn ?? project.impact_unit_plural_en,
  impactUnitSingularDe: project.impactUnitSingularDe ?? project.impact_unit_singular_de,
  impactUnitPluralDe: project.impactUnitPluralDe ?? project.impact_unit_plural_de,
  ctaTemplateEn: project.ctaTemplateEn ?? project.cta_template_en,
  ctaTemplateDe: project.ctaTemplateDe ?? project.cta_template_de,
  pastTemplateEn: project.pastTemplateEn ?? project.past_template_en,
  pastTemplateDe: project.pastTemplateDe ?? project.past_template_de,
  impactTiers: project.impactTiers ?? project.impact_tiers,
  impactPointsMultiplier: project.impactPointsMultiplier ?? project.impact_points_multiplier,
});

console.log('🧪 Testing Impact Generator...\n');

// Test 1: hasImpact function
console.log('Test 1: hasImpact function');
const project1 = createMockProject();
const project2 = createMockProject({ impactFactor: null });
console.log(`✅ Project with impact data: ${hasImpact(project1)} (expected: true)`);
console.log(`✅ Project without impact data: ${hasImpact(project2)} (expected: false)\n`);

// Test 2: Linear project - $100 donation
console.log('Test 2: Linear project - $100 donation');
try {
  const snapshot1 = generateImpactSnapshot(project1, 100, 'en');
  console.log(`✅ Calculated impact: ${snapshot1.calculated_impact} (expected: 10)`);
  console.log(`✅ Impact factor: ${snapshot1.impact_factor} (expected: 0.1)`);
  console.log(`✅ Unit: ${snapshot1.unit} (expected: people)`);
  console.log(`✅ Past text: "${snapshot1.generated_text_past}"`);
  console.log(`✅ CTA text: "${snapshot1.generated_text_cta.substring(0, 80)}..."\n`);
} catch (error) {
  console.error(`❌ Error: ${error}\n`);
}

// Test 3: Singular unit ($10 donation = 1 person)
console.log('Test 3: Singular unit - $10 donation');
try {
  const snapshot2 = generateImpactSnapshot(project1, 10, 'en');
  console.log(`✅ Calculated impact: ${snapshot2.calculated_impact} (expected: 1)`);
  console.log(`✅ Unit: ${snapshot2.unit} (expected: person)`);
  console.log(`✅ Past text: "${snapshot2.generated_text_past}"\n`);
} catch (error) {
  console.error(`❌ Error: ${error}\n`);
}

// Test 4: German texts
console.log('Test 4: German texts');
try {
  const snapshot3 = generateImpactSnapshot(project1, 100, 'de');
  console.log(`✅ Unit: ${snapshot3.unit} (expected: Personen)`);
  console.log(`✅ Past text: "${snapshot3.generated_text_past}"`);
  console.log(`✅ CTA text: "${snapshot3.generated_text_cta.substring(0, 80)}..."\n`);
} catch (error) {
  console.error(`❌ Error: ${error}\n`);
}

// Test 5: Non-linear project (impact_tiers)
console.log('Test 5: Non-linear project (impact_tiers)');
const tierProject = createMockProject({
  impactFactor: null,
  impactTiers: [
    {
      min_amount: 0,
      max_amount: 100,
      impact_factor: 10.0,
      cta_template_en: 'fresh air per day',
      cta_template_de: 'frische Luft pro Tag zu geben',
      past_template_en: 'fresh air per day provided',
      past_template_de: 'frische Luft pro Tag gegeben'
    },
    {
      min_amount: 100,
      max_amount: 1000,
      impact_factor: 1.0,
      cta_template_en: 'fresh air for a year',
      cta_template_de: 'frische Luft für ein Jahr zu geben',
      past_template_en: 'fresh air for a year provided',
      past_template_de: 'frische Luft für ein Jahr gegeben'
    }
  ]
});

try {
  // Tier 1 (0-100)
  const snapshot4 = generateImpactSnapshot(tierProject, 50, 'en');
  console.log(`✅ Tier 1 - Calculated impact: ${snapshot4.calculated_impact} (expected: 500)`);
  console.log(`✅ Tier 1 - Impact factor: ${snapshot4.impact_factor} (expected: 10.0)`);
  console.log(`✅ Tier 1 - Past text: "${snapshot4.generated_text_past}"`);
  
  // Tier 2 (100-1000)
  const snapshot5 = generateImpactSnapshot(tierProject, 500, 'en');
  console.log(`✅ Tier 2 - Calculated impact: ${snapshot5.calculated_impact} (expected: 500)`);
  console.log(`✅ Tier 2 - Impact factor: ${snapshot5.impact_factor} (expected: 1.0)`);
  console.log(`✅ Tier 2 - Past text: "${snapshot5.generated_text_past}"\n`);
} catch (error) {
  console.error(`❌ Error: ${error}\n`);
}

// Test 6: Error handling
console.log('Test 6: Error handling');
const invalidProject = createMockProject({ impactFactor: null, impactTiers: null });
try {
  generateImpactSnapshot(invalidProject, 100, 'en');
  console.error(`❌ Should have thrown error\n`);
} catch (error) {
  console.log(`✅ Correctly threw error: ${(error as Error).message.substring(0, 60)}...\n`);
}

// Test 7: Formatting (<1 person)
console.log('Test 7: Formatting - <1 person');
const smallProject = createMockProject({ impactFactor: 0.05 });
try {
  const snapshot6 = generateImpactSnapshot(smallProject, 10, 'en');
  console.log(`✅ Calculated impact: ${snapshot6.calculated_impact} (expected: 0.5)`);
  console.log(`✅ Past text: "${snapshot6.generated_text_past}"`);
  console.log(`✅ Contains decimal: ${snapshot6.generated_text_past.includes('0.50')} (expected: true)\n`);
} catch (error) {
  console.error(`❌ Error: ${error}\n`);
}

// Test 8: hasImpact with snake_case fields (Supabase style)
console.log('Test 8: hasImpact with snake_case fields');
const snakeProject = {
  id: 2,
  title: 'SnakeCase Project',
  slug: 'snake',
  impact_factor: 0.2,
  impact_unit_singular_en: 'unit',
  impact_unit_plural_en: 'units',
  impact_unit_singular_de: 'Einheit',
  impact_unit_plural_de: 'Einheiten',
  cta_template_en: 'cta en',
  cta_template_de: 'cta de',
  past_template_en: 'past en',
  past_template_de: 'past de',
};
const mappedSnake = mapProjectImpactFields(snakeProject);
console.log(`✅ hasImpact (snake_case) → ${hasImpact(mappedSnake as Project)} (expected: true)\n`);

// Test 9: Snapshot with snake_case project
console.log('Test 9: Snapshot with snake_case project');
try {
  const snapSnake = generateImpactSnapshot(mappedSnake as Project, 50, 'en');
  console.log(`✅ Calculated impact: ${snapSnake.calculated_impact} (expected: 10)`);
  console.log(`✅ Past text: "${snapSnake.generated_text_past}" (should contain "past en")\n`);
} catch (error) {
  console.error(`❌ Error: ${error}\n`);
}

console.log('✅ All tests completed!');

