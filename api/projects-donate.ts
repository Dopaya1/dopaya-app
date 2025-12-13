import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

/**
 * ============================================================================
 * IMPACT SNAPSHOT GENERATION - INLINED FUNCTIONS
 * ============================================================================
 * 
 * These functions were inlined from server/impact-generator.ts to avoid
 * module resolution issues in Vercel serverless functions.
 * 
 * IMPORTANT: This file does NOT import from ../server/ or @shared/ to ensure
 * compatibility with Vercel's build system. All dependencies are self-contained.
 * 
 * FALLBACK GUARANTEE: Impact snapshot generation is wrapped in try-catch.
 * If generation fails, donations still proceed without impact data.
 * 
 * ============================================================================
 */

/**
 * Impact Tier structure (for non-linear projects)
 */
interface ImpactTier {
  min_amount: number;
  max_amount: number;
  impact_factor: number;
  cta_template_en: string;
  cta_template_de: string;
  past_template_en: string;
  past_template_de: string;
}

/**
 * Impact Snapshot structure
 */
interface ImpactSnapshot {
  calculated_impact: number;
  impact_factor: number;
  impact_unit_singular: string;
  impact_unit_plural: string;
  unit: string; // Singular or Plural based on calculated_impact
  generated_text_cta: string;
  generated_text_past: string;
  timestamp: string;
}

/**
 * Normalize Supabase snake_case fields to camelCase for impact functions
 */
function mapProjectImpactFields(project: any) {
  return {
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
  };
}

/**
 * Checks if project has new impact tracking data
 * Supports both linear (impact_factor) and non-linear (impact_tiers) projects
 * 
 * FALLBACK: Returns false if data is missing (donation proceeds without impact snapshot)
 */
function hasImpact(project: any): boolean {
  // Check if project has impact_tiers (non-linear)
  if (project.impactTiers && Array.isArray(project.impactTiers) && project.impactTiers.length > 0) {
    // For impact_tiers, we need units and templates from project
    return !!(
      project.impactUnitSingularEn &&
      project.impactUnitPluralEn &&
      project.pastTemplateEn &&
      project.ctaTemplateEn
    );
  }
  
  // Check if project has impact_factor (linear)
  return !!(
    project.impactFactor != null &&
    project.impactUnitSingularEn &&
    project.impactUnitPluralEn &&
    project.pastTemplateEn &&
    project.ctaTemplateEn
  );
}

/**
 * Formats impact value according to rules:
 * - People: Whole number if ≥1, else decimal with tooltip
 * - kg/Liter: 1 decimal place
 * - <1 Person: Show decimal value in tooltip
 */
function formatImpact(calculatedImpact: number, unitType: string): string {
  // Check if unit is person/people type
  const isPersonType = unitType.toLowerCase().includes('person') || 
                       unitType.toLowerCase().includes('people') ||
                       unitType.toLowerCase().includes('child') ||
                       unitType.toLowerCase().includes('children');
  
  if (isPersonType) {
    // People: Whole number if ≥1, else decimal
    if (calculatedImpact >= 1) {
      return Math.floor(calculatedImpact).toString();
    } else {
      return calculatedImpact.toFixed(2); // For tooltip
    }
  } else if (unitType.toLowerCase() === 'kg' || 
             unitType.toLowerCase() === 'liter' || 
             unitType.toLowerCase() === 'l') {
    // kg/Liter: 1 decimal place
    return calculatedImpact.toFixed(1);
  } else {
    // Other: Whole number if possible, else 1 decimal
    return calculatedImpact % 1 === 0 
      ? calculatedImpact.toString() 
      : calculatedImpact.toFixed(1);
  }
}

/**
 * Gets unit (Singular or Plural) based on calculated impact
 */
function getUnit(
  calculatedImpact: number,
  singular: string,
  plural: string
): string {
  return calculatedImpact === 1 ? singular : plural;
}

/**
 * Renders Past template: "{impact} {unit} {freitext_past}"
 */
function renderPastTemplate(
  template: string, // Only free-text part
  formattedImpact: string,
  unit: string
): string {
  return `${formattedImpact} ${unit} ${template}`;
}

/**
 * Renders CTA template: "Support {project} with ${amount} and help {impact} {unit} {freitext_cta} — earn {points} Impact Points"
 */
function renderCtaTemplate(
  template: string, // Only free-text part
  projectTitle: string,
  amount: number,
  formattedImpact: string,
  unit: string,
  points: number
): string {
  return `Support ${projectTitle} with $${amount} and help ${formattedImpact} ${unit} ${template} — earn ${points} Impact Points`;
}

/**
 * Generates impact snapshot for a donation
 * 
 * @param project - Project object with impact tracking data (any type - no @shared/schema dependency)
 * @param amount - Donation amount in USD
 * @param language - Language ('en' | 'de')
 * @returns Impact snapshot with calculated impact and generated texts
 * @throws Error if project doesn't have impact tracking data
 * 
 * FALLBACK: This function throws errors which are caught by the caller.
 * Donations proceed even if impact generation fails.
 */
function generateImpactSnapshot(
  project: any,
  amount: number,
  language: 'en' | 'de'
): ImpactSnapshot {
  // Validate that project has impact tracking data
  if (!hasImpact(project)) {
    const hasTiers = project.impactTiers && Array.isArray(project.impactTiers) && project.impactTiers.length > 0;
    const hasFactor = project.impactFactor != null;
    throw new Error(
      `Project ${project.id} (${project.title}) does not have impact tracking data. ` +
      `Required: (impactFactor OR impactTiers) AND impactUnitSingularEn, impactUnitPluralEn, pastTemplateEn, ctaTemplateEn. ` +
      `Found: impactFactor=${hasFactor}, impactTiers=${hasTiers}`
    );
  }

  let calculatedImpact: number;
  let impactFactor: number;
  let ctaTemplate: string;
  let pastTemplate: string;
  let unitSingular: string;
  let unitPlural: string;

  // 1. Check Impact-Tiers (for non-linear projects)
  if (project.impactTiers && Array.isArray(project.impactTiers) && project.impactTiers.length > 0) {
    const tiers = project.impactTiers as ImpactTier[];
    
    // Find matching tier based on amount
    const tier = tiers.find(t => 
      amount >= t.min_amount && amount < t.max_amount
    ) || tiers[tiers.length - 1]; // Fallback: last tier (for amounts >= max)
    
    calculatedImpact = amount * tier.impact_factor;
    impactFactor = tier.impact_factor;
    
    // Use templates from tier
    ctaTemplate = language === 'de' ? tier.cta_template_de : tier.cta_template_en;
    pastTemplate = language === 'de' ? tier.past_template_de : tier.past_template_en;
    
    // Use units from project (tiers don't have separate units)
    unitSingular = language === 'de' 
      ? (project.impactUnitSingularDe || project.impactUnitSingularEn || 'Einheit')
      : (project.impactUnitSingularEn || 'unit');
    unitPlural = language === 'de'
      ? (project.impactUnitPluralDe || project.impactUnitPluralEn || 'Einheiten')
      : (project.impactUnitPluralEn || 'units');
  } 
  // 2. Fallback: Linear calculation (Standard)
  else if (project.impactFactor != null) {
    impactFactor = Number(project.impactFactor);
    calculatedImpact = amount * impactFactor;
    
    // Use standard templates from project
    ctaTemplate = language === 'de' 
      ? (project.ctaTemplateDe || project.ctaTemplateEn || '')
      : (project.ctaTemplateEn || '');
    pastTemplate = language === 'de'
      ? (project.pastTemplateDe || project.pastTemplateEn || '')
      : (project.pastTemplateEn || '');
    
    unitSingular = language === 'de'
      ? (project.impactUnitSingularDe || project.impactUnitSingularEn || 'Einheit')
      : (project.impactUnitSingularEn || 'unit');
    unitPlural = language === 'de'
      ? (project.impactUnitPluralDe || project.impactUnitPluralEn || 'Einheiten')
      : (project.impactUnitPluralEn || 'units');
  } 
  // 3. This should not happen if hasImpact() check passed, but safety fallback
  else {
    throw new Error(
      `Project ${project.id} (${project.title}) has no impact_factor or impact_tiers`
    );
  }

  // Validate templates exist
  if (!ctaTemplate || !pastTemplate) {
    throw new Error(
      `Project ${project.id} (${project.title}) is missing templates for language ${language}`
    );
  }

  // Format impact value
  const formattedImpact = formatImpact(calculatedImpact, unitSingular);

  // Choose unit (Singular or Plural)
  const unit = getUnit(calculatedImpact, unitSingular, unitPlural);

  // Calculate impact points (default multiplier: 10)
  const points = amount * (project.impactPointsMultiplier || 10);

  // Generate texts
  const generatedTextPast = renderPastTemplate(pastTemplate, formattedImpact, unit);
  const generatedTextCta = renderCtaTemplate(
    ctaTemplate,
    project.title,
    amount,
    formattedImpact,
    unit,
    points
  );

  return {
    calculated_impact: calculatedImpact,
    impact_factor: impactFactor,
    impact_unit_singular: unitSingular,
    impact_unit_plural: unitPlural,
    unit,
    generated_text_cta: generatedTextCta,
    generated_text_past: generatedTextPast,
    timestamp: new Date().toISOString()
  };
}

/**
 * Donation endpoint (flat route) to avoid nested dynamic routing issues.
 * Mirrors Express /api/projects/:id/donate logic.
 * Expects projectId in req.body (number) and optional slug for fallback.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS handling
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ message: 'Supabase credentials not configured' });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    // Auth
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Missing bearer token' });
    }
    const token = authHeader.substring(7);
    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authData?.user) {
      return res.status(401).json({ message: 'Invalid or missing user' });
    }
    const supaUser = authData.user;

    // Resolve DB user
    let dbUser;
    const { data: byAuth } = await supabase.from('users').select('*').eq('auth_user_id', supaUser.id).maybeSingle();
    dbUser = byAuth || null;
    if (!dbUser && supaUser.email) {
      const { data: byEmail } = await supabase.from('users').select('*').eq('email', supaUser.email).maybeSingle();
      dbUser = byEmail || null;
    }
    if (!dbUser) {
      // Create user on-the-fly (same as Express route Step 3)
      // CRITICAL: Set impactPoints to 50 (Welcome Bonus) to match createUserMinimal behavior
      const username = (supaUser.email || `user_${Date.now()}`).split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
      const firstName = (supaUser.user_metadata?.full_name || '').split(' ')[0] || '';
      const lastName = (supaUser.user_metadata?.full_name || '').split(' ').slice(1).join(' ') || '';
      const { data: created, error: createErr } = await supabase
        .from('users')
        .insert({
          username,
          email: supaUser.email,
          firstName,
          lastName,
          auth_user_id: supaUser.id,
          impactPoints: 50, // Welcome Bonus - matches createUserMinimal and welcome-bonus.ts
        })
        .select()
        .maybeSingle();
      if (createErr || !created) {
        return res.status(500).json({ message: 'Failed to resolve user' });
      }
      dbUser = created;
    }
    const userId = dbUser.id;

    // Validate amount
    const amount = typeof req.body?.amount === 'number' ? req.body.amount : Number(req.body?.amount);
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ message: 'Invalid donation amount' });
    }

    // Project lookup: projectId from body, fallback slug
    const bodyProjectId = typeof req.body?.projectId === 'number' ? req.body.projectId : Number(req.body?.projectId);
    let project = null;
    if (!isNaN(bodyProjectId)) {
      const { data: proj } = await supabase.from('projects').select('*').eq('id', bodyProjectId).maybeSingle();
      project = proj || null;
    }
    if (!project && req.body?.slug) {
      const { data: projBySlug } = await supabase.from('projects').select('*').eq('slug', req.body.slug).maybeSingle();
      project = projBySlug || null;
    }
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // TypeScript: project is guaranteed to be non-null after the check above
    const actualProjectId = (project as any).id;
    const mappedProject = mapProjectImpactFields(project);
    const impactMultiplier = (mappedProject.impactPointsMultiplier ?? 10) || 10;
    const impactPoints = Math.floor(amount * impactMultiplier);

    // ============================================================================
    // IMPACT SNAPSHOT GENERATION (OPTIONAL - WITH FALLBACK GUARANTEE)
    // ============================================================================
    // 
    // This section generates impact snapshots for donations IF the project has
    // impact tracking data. If generation fails for ANY reason, the donation
    // still proceeds successfully without impact data.
    //
    // FALLBACK GUARANTEE:
    // - If project has no impact data → donation proceeds without snapshot
    // - If impact generation throws error → caught and logged, donation proceeds
    // - If templates are missing → caught and logged, donation proceeds
    // - Donation is NEVER blocked by impact generation failures
    //
    // ============================================================================
    let calculatedImpact: number | undefined;
    let impactSnapshot: any = null;
    let generatedPastEn: string | undefined;
    let generatedPastDe: string | undefined;
    try {
      // Only attempt generation if project has impact data
      if (hasImpact(mappedProject as any)) {
        const snapshotEn = generateImpactSnapshot(mappedProject as any, amount, 'en');
        const snapshotDe = generateImpactSnapshot(mappedProject as any, amount, 'de');

        calculatedImpact = snapshotEn.calculated_impact;
        generatedPastEn = snapshotEn.generated_text_past;
        generatedPastDe = snapshotDe.generated_text_past;

        impactSnapshot = {
          en: snapshotEn,
          de: snapshotDe,
          amount,
          projectId: actualProjectId,
        };
      }
    } catch (impactError) {
      // FALLBACK: Log warning but continue with donation
      // Impact snapshot generation is optional - donation proceeds without it
      console.warn('[donate] Impact snapshot generation skipped (donation will proceed):', impactError);
    }

    // Update project stats (raised, donors)
    try {
      const { data: projectData } = await supabase
        .from('projects')
        .select('raised, donors')
        .eq('id', actualProjectId)
        .single();

      if (projectData) {
        await supabase
          .from('projects')
          .update({
            raised: (projectData.raised || 0) + amount,
            donors: (projectData.donors || 0) + 1
          })
          .eq('id', actualProjectId);
      }
    } catch (projectError) {
      console.error('[donate] Error updating project stats:', projectError);
    }

    // Insert donation (include impact data if available)
    const donationPayload: Record<string, any> = {
      userId,
      projectId: actualProjectId,
      amount,
      impactPoints,
      status: 'pending',
    };
    if (calculatedImpact !== undefined) {
      donationPayload.calculated_impact = calculatedImpact;
    }
    if (impactSnapshot) {
      donationPayload.impact_snapshot = impactSnapshot;
    }
    if (generatedPastEn) {
      donationPayload.generated_text_past_en = generatedPastEn;
    }
    if (generatedPastDe) {
      donationPayload.generated_text_past_de = generatedPastDe;
    }

    const { data: donation, error: donationErr } = await supabase
      .from('donations')
      .insert(donationPayload)
      .select()
      .maybeSingle();

    if (donationErr || !donation) {
      return res.status(500).json({ message: 'Failed to create donation', error: donationErr?.message });
    }

    // Apply points change: update balance then create transaction
    if (impactPoints > 0) {
      try {
        const { data: user, error: userError } = await supabase
          .from('users')
          .select('impactPoints')
          .eq('id', userId)
          .single();

        if (userError || !user) {
          throw new Error(`User ${userId} not found: ${userError?.message}`);
        }

        const currentBalance = (user as any).impactPoints ?? 0;
        const newBalance = currentBalance + impactPoints;

        const { error: updateError } = await supabase
          .from('users')
          .update({ impactPoints: newBalance })
          .eq('id', userId);
        if (updateError) {
          throw new Error(`Failed to update balance: ${updateError.message}`);
        }

        const { error: transactionError } = await supabase
          .from('user_transactions')
          .insert([{
            user_id: userId,
            transaction_type: 'donation',
            project_id: actualProjectId,
            donation_id: donation.id,
            support_amount: amount,
            points_change: impactPoints,
            points_balance_after: newBalance,
            description: `Support: $${amount} for project ${actualProjectId}`,
          }]);

        if (transactionError) {
          // rollback balance
          await supabase.from('users').update({ impactPoints: currentBalance }).eq('id', userId);
          throw new Error(`Failed to create transaction: ${transactionError.message}`);
        }
      } catch (pointsError) {
        console.error('[donate] Failed to apply points change:', pointsError);
      }
    }

    return res.status(201).json(donation);
  } catch (error) {
    console.error('[donate] Error:', error);
    return res.status(500).json({
      message: 'Failed to process donation',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

