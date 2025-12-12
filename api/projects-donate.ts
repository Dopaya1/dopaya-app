import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { generateImpactSnapshot, hasImpact } from '../server/impact-generator';

// Normalize Supabase snake_case fields to the camelCase shape expected by impact-generator
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

    const actualProjectId = project.id;
    const mappedProject = mapProjectImpactFields(project);
    const impactMultiplier = (mappedProject.impactPointsMultiplier ?? 10) || 10;
    const impactPoints = Math.floor(amount * impactMultiplier);

    // Impact snapshot generation (optional, safe fallback if data missing)
    let calculatedImpact: number | undefined;
    let impactSnapshot: any = null;
    let generatedPastEn: string | undefined;
    let generatedPastDe: string | undefined;
    try {
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
      console.warn('[donate] Impact snapshot generation skipped:', impactError);
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

