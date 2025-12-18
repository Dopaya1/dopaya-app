/**
 * Tests for Impact Generator
 * 
 * Tests impact calculation, formatting, and text generation
 */

import { describe, it, expect } from '@jest/globals';
import { generateImpactSnapshot, hasImpact } from '../impact-generator';
import { Project } from '@shared/schema';

// Mock project data for testing
const createMockProject = (overrides?: Partial<Project>): Project => {
  return {
    id: 1,
    title: 'Test Project',
    slug: 'test-project',
    description: 'Test description',
    category: 'test',
    country: 'Test Country',
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

describe('hasImpact', () => {
  it('should return true for project with all required fields', () => {
    const project = createMockProject();
    expect(hasImpact(project)).toBe(true);
  });

  it('should return false if impactFactor is null', () => {
    const project = createMockProject({ impactFactor: null });
    expect(hasImpact(project)).toBe(false);
  });

  it('should return false if templates are missing', () => {
    const project = createMockProject({ ctaTemplateEn: null });
    expect(hasImpact(project)).toBe(false);
  });
});

describe('generateImpactSnapshot', () => {
  describe('Linear projects (impact_factor)', () => {
    it('should calculate impact correctly for $100 donation', () => {
      const project = createMockProject({ impactFactor: 0.1 });
      const snapshot = generateImpactSnapshot(project, 100, 'en');

      expect(snapshot.calculated_impact).toBe(10);
      expect(snapshot.impact_factor).toBe(0.1);
      expect(snapshot.unit).toBe('people'); // Plural because 10 !== 1
    });

    it('should use singular unit for impact = 1', () => {
      const project = createMockProject({ impactFactor: 0.1 });
      const snapshot = generateImpactSnapshot(project, 10, 'en');

      expect(snapshot.calculated_impact).toBe(1);
      expect(snapshot.unit).toBe('person'); // Singular because 1 === 1
    });

    it('should format impact correctly for people (whole number)', () => {
      const project = createMockProject({ impactFactor: 0.1 });
      const snapshot = generateImpactSnapshot(project, 100, 'en');

      expect(snapshot.generated_text_past).toContain('10 people');
      expect(snapshot.generated_text_past).toContain('provided with safe drinking water');
    });

    it('should format impact correctly for kg (1 decimal)', () => {
      const project = createMockProject({
        impactFactor: 0.2,
        impactUnitSingularEn: 'kg',
        impactUnitPluralEn: 'kg',
        ctaTemplateEn: 'of plastic be removed',
        pastTemplateEn: 'of plastic removed'
      });
      const snapshot = generateImpactSnapshot(project, 25, 'en');

      expect(snapshot.calculated_impact).toBe(5);
      expect(snapshot.generated_text_past).toContain('5 kg');
    });

    it('should generate correct CTA text', () => {
      const project = createMockProject({ impactFactor: 0.1 });
      const snapshot = generateImpactSnapshot(project, 100, 'en');

      expect(snapshot.generated_text_cta).toContain('Support Test Project');
      expect(snapshot.generated_text_cta).toContain('$100');
      expect(snapshot.generated_text_cta).toContain('10 people');
      expect(snapshot.generated_text_cta).toContain('access safe drinking water');
      expect(snapshot.generated_text_cta).toContain('1000 Impact Points');
    });

    it('should generate correct German texts', () => {
      const project = createMockProject({ impactFactor: 0.1 });
      const snapshot = generateImpactSnapshot(project, 100, 'de');

      expect(snapshot.unit).toBe('Personen');
      expect(snapshot.generated_text_past).toContain('10 Personen');
      expect(snapshot.generated_text_past).toContain('Zugang zu sauberem Trinkwasser gegeben');
      expect(snapshot.generated_text_cta).toContain('Unterstütze Test Project');
      expect(snapshot.generated_text_cta).toContain('Zugang zu sauberem Trinkwasser zu verschaffen');
    });
  });

  describe('Non-linear projects (impact_tiers)', () => {
    it('should use correct tier for amount in range', () => {
      const project = createMockProject({
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

      // Test Tier 1 (0-100)
      const snapshot1 = generateImpactSnapshot(project, 50, 'en');
      expect(snapshot1.calculated_impact).toBe(500); // 50 * 10
      expect(snapshot1.impact_factor).toBe(10.0);
      expect(snapshot1.generated_text_past).toContain('fresh air per day provided');

      // Test Tier 2 (100-1000)
      const snapshot2 = generateImpactSnapshot(project, 500, 'en');
      expect(snapshot2.calculated_impact).toBe(500); // 500 * 1
      expect(snapshot2.impact_factor).toBe(1.0);
      expect(snapshot2.generated_text_past).toContain('fresh air for a year provided');
    });

    it('should use last tier for amounts >= max', () => {
      const project = createMockProject({
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
          }
        ]
      });

      const snapshot = generateImpactSnapshot(project, 1000, 'en');
      expect(snapshot.impact_factor).toBe(10.0); // Uses last tier
    });
  });

  describe('Error handling', () => {
    it('should throw error if project has no impact data', () => {
      const project = createMockProject({ impactFactor: null, impactTiers: null });
      
      expect(() => {
        generateImpactSnapshot(project, 100, 'en');
      }).toThrow('does not have impact tracking data');
    });

    it('should throw error if templates are missing', () => {
      const project = createMockProject({ ctaTemplateEn: null });
      
      expect(() => {
        generateImpactSnapshot(project, 100, 'en');
      }).toThrow('does not have impact tracking data');
    });
  });

  describe('Edge cases', () => {
    it('should handle <1 person correctly', () => {
      const project = createMockProject({ impactFactor: 0.05 });
      const snapshot = generateImpactSnapshot(project, 10, 'en');

      expect(snapshot.calculated_impact).toBe(0.5);
      expect(snapshot.generated_text_past).toContain('0.50'); // Decimal format
    });

    it('should handle large donations correctly', () => {
      const project = createMockProject({ impactFactor: 0.1 });
      const snapshot = generateImpactSnapshot(project, 5000, 'en');

      expect(snapshot.calculated_impact).toBe(500);
      expect(snapshot.generated_text_past).toContain('500 people');
    });
  });
});






