/**
 * Stripe Webhook Handler (Serverless Function for Vercel)
 * 
 * Handles payment_intent.succeeded events from Stripe to create donations.
 * IMPORTANT: This function requires raw body for signature verification.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Disable body parsing - we need raw body for Stripe
export const config = {
  api: {
    bodyParser: false,
  },
};

// ========== INLINE UTILITY FUNCTIONS ==========
// These are copied from server/project-mapper.ts and server/impact-generator.ts
// to avoid import issues in Vercel serverless functions

/**
 * Maps Supabase snake_case fields to camelCase for impact generator
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
 * Checks if project has impact tracking data
 */
function hasImpact(project: any): boolean {
  // Check if project has impact_tiers (non-linear)
  if (project.impactTiers && Array.isArray(project.impactTiers) && project.impactTiers.length > 0) {
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
 * Formats impact value
 */
function formatImpact(calculatedImpact: number, unitType: string): string {
  const isPersonType = unitType.toLowerCase().includes('person') || 
                       unitType.toLowerCase().includes('people') ||
                       unitType.toLowerCase().includes('child') ||
                       unitType.toLowerCase().includes('children');
  
  if (isPersonType) {
    if (calculatedImpact >= 1) {
      return Math.floor(calculatedImpact).toString();
    } else {
      return calculatedImpact.toFixed(2);
    }
  } else if (unitType.toLowerCase() === 'kg' || 
             unitType.toLowerCase() === 'liter' || 
             unitType.toLowerCase() === 'l') {
    return calculatedImpact.toFixed(1);
  } else {
    return calculatedImpact % 1 === 0 
      ? calculatedImpact.toString() 
      : calculatedImpact.toFixed(1);
  }
}

/**
 * Gets unit (Singular or Plural)
 */
function getUnit(calculatedImpact: number, singular: string, plural: string): string {
  return calculatedImpact === 1 ? singular : plural;
}

/**
 * Generates impact snapshot for a donation
 */
function generateImpactSnapshot(project: any, amount: number, language: 'en' | 'de'): any {
  let calculatedImpact: number;
  let impactFactor: number;
  let unitSingular: string;
  let unitPlural: string;
  let pastTemplate: string;

  // Simple linear impact (most common)
  if (project.impactFactor != null) {
    impactFactor = parseFloat(project.impactFactor);
    calculatedImpact = amount * impactFactor;
    
    if (language === 'de') {
      unitSingular = project.impactUnitSingularDe || project.impactUnitSingularEn;
      unitPlural = project.impactUnitPluralDe || project.impactUnitPluralEn;
      pastTemplate = project.pastTemplateDe || project.pastTemplateEn;
    } else {
      unitSingular = project.impactUnitSingularEn;
      unitPlural = project.impactUnitPluralEn;
      pastTemplate = project.pastTemplateEn;
    }
  } else {
    throw new Error('Project has no impact tracking data');
  }

  const unit = getUnit(calculatedImpact, unitSingular, unitPlural);
  const formattedImpact = formatImpact(calculatedImpact, unit);
  const generatedTextPast = `${formattedImpact} ${unit} ${pastTemplate}`;

  return {
    calculated_impact: calculatedImpact,
    impact_factor: impactFactor,
    impact_unit_singular: unitSingular,
    impact_unit_plural: unitPlural,
    unit,
    generated_text_past: generatedTextPast,
    timestamp: new Date().toISOString()
  };
}

// ========== END INLINE UTILITY FUNCTIONS ==========

// Read raw body buffer
async function getRawBody(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check configuration
  const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
  const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
  const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!STRIPE_WEBHOOK_SECRET) {
    console.warn('[Stripe Webhook] ⚠️ STRIPE_WEBHOOK_SECRET not configured');
    return res.status(400).send('Webhook secret not configured');
  }

  if (!STRIPE_SECRET_KEY) {
    console.error('[Stripe Webhook] STRIPE_SECRET_KEY not configured');
    return res.status(503).json({ error: "Payment processing is currently unavailable" });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('[Stripe Webhook] Supabase not configured');
    return res.status(503).json({ error: "Database is currently unavailable" });
  }

  // Initialize Stripe and Supabase INSIDE handler function
  const stripe = new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: "2025-07-30.basil",
  });
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  try {
    // Get raw body and signature
    const rawBody = await getRawBody(req);
    const sig = req.headers['stripe-signature'] as string;

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, sig, STRIPE_WEBHOOK_SECRET);
      console.log(`[Stripe Webhook] ✅ Event verified: ${event.type} (ID: ${event.id})`);
    } catch (err: any) {
      console.error('[Stripe Webhook] ❌ Signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle payment_intent.succeeded event
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      
      try {
        const { 
          userId, 
          projectId, 
          supportAmount,
          tipAmount,
          impactPoints 
        } = paymentIntent.metadata || {};
        
        console.log(`[Stripe Webhook] 💳 Payment Intent succeeded:`, {
          paymentIntentId: paymentIntent.id,
          userId,
          projectId,
          supportAmount,
          tipAmount,
          impactPoints
        });
        
        if (userId && projectId && supportAmount) {
          // Convert userId - handle both UUID and numeric ID
          let numericUserId: number;
          const parsedNumeric = parseInt(userId, 10);
          
          // Check if userId is a UUID (contains dashes)
          if (userId.includes('-') || isNaN(parsedNumeric) || parsedNumeric.toString() !== userId) {
            // userId is a UUID (auth_user_id) - need to look up numeric ID
            console.log(`[Stripe Webhook] Converting auth_user_id ${userId} to numeric ID...`);
            const { data: user } = await supabase
              .from('users')
              .select('id')
              .eq('auth_user_id', userId)
              .single();
            
            if (!user) {
              throw new Error(`User not found for auth_user_id: ${userId}`);
            }
            numericUserId = user.id;
            console.log(`[Stripe Webhook] ✅ Converted to numeric user ID: ${numericUserId}`);
          } else {
            numericUserId = parsedNumeric;
          }
          
          const parsedProjectId = parseInt(projectId, 10);
          const parsedSupportAmount = parseFloat(supportAmount);
          const parsedTipAmount = parseFloat(tipAmount || '0');
          const parsedImpactPoints = parseInt(impactPoints || '0', 10);
          
          if (isNaN(parsedProjectId) || isNaN(parsedSupportAmount)) {
            throw new Error('Invalid projectId or amount');
          }
          
          // Get project for impact calculation
          const { data: project } = await supabase
            .from('projects')
            .select('*')
            .eq('id', parsedProjectId)
            .single();
          
          let finalImpactPoints = parsedImpactPoints;
          
          if (!finalImpactPoints && project) {
            finalImpactPoints = Math.floor(parsedSupportAmount * (project.impact_points_multiplier || project.impactPointsMultiplier || 10));
          }
          
          // Universal Fund is treated like a normal project - no split logic
          // Donation is created for the Universal Fund project itself
          
          // Generate impact snapshot (if project has impact data)
          let calculatedImpact: number | undefined;
          let impactSnapshot: any = null;
          let generatedPastEn: string | undefined;
          let generatedPastDe: string | undefined;
          
          try {
            if (project) {
              // Map Supabase snake_case fields to camelCase
              const mappedProject = mapProjectImpactFields(project);
              
              if (hasImpact(mappedProject)) {
                console.log(`[Stripe Webhook] Generating impact snapshot for project ${project.id}...`);
                const snapshotEn = generateImpactSnapshot(mappedProject, parsedSupportAmount, 'en');
                const snapshotDe = generateImpactSnapshot(mappedProject, parsedSupportAmount, 'de');
                
                calculatedImpact = snapshotEn.calculated_impact;
                generatedPastEn = snapshotEn.generated_text_past;
                generatedPastDe = snapshotDe.generated_text_past;
                
                impactSnapshot = {
                  en: snapshotEn,
                  de: snapshotDe,
                  amount: parsedSupportAmount,
                  projectId: parsedProjectId,
                  timestamp: new Date().toISOString()
                };
                
                console.log(`[Stripe Webhook] ✅ Impact snapshot generated: ${calculatedImpact} impact`);
              } else {
                console.log(`[Stripe Webhook] ⚠️ Project ${parsedProjectId} has no impact data`);
              }
            }
          } catch (impactError: any) {
            console.warn(`[Stripe Webhook] ⚠️ Impact generation failed:`, impactError.message);
          }
          
          // Create donation
          const donationData: any = {
            userId: numericUserId,
            projectId: parsedProjectId,
            amount: Math.round(parsedSupportAmount),
            tipAmount: Math.round(parsedTipAmount),
            impactPoints: finalImpactPoints,
            status: 'completed'
          };
          
          // Add impact fields if available
          if (calculatedImpact !== undefined) {
            donationData.calculated_impact = calculatedImpact;
          }
          if (impactSnapshot) {
            donationData.impact_snapshot = impactSnapshot;
          }
          if (generatedPastEn) {
            donationData.generated_text_past_en = generatedPastEn;
          }
          if (generatedPastDe) {
            donationData.generated_text_past_de = generatedPastDe;
          }
          
          const { data: donation, error: donationError } = await supabase
            .from('donations')
            .insert([donationData])
            .select()
            .single();
          
          if (donationError) {
            throw new Error(`Failed to create donation: ${donationError.message}`);
          }
          
          console.log(`[Stripe Webhook] ✅ Donation created: ID ${donation.id}, +${finalImpactPoints} Impact Points`);
          
          // Update user impact points
          const { data: currentUser } = await supabase
            .from('users')
            .select('impactPoints')
            .eq('id', numericUserId)
            .single();
          
          const currentBalance = (currentUser?.impactPoints || 0);
          const newBalance = currentBalance + finalImpactPoints;
          
          if (currentUser) {
            await supabase
              .from('users')
              .update({ 
                impactPoints: newBalance
              })
              .eq('id', numericUserId);
          }
          
          // Create transaction record (matches localhost behavior with CORRECT field names)
          if (finalImpactPoints > 0) {
            try {
              await supabase
                .from('user_transactions')
                .insert([{
                  user_id: numericUserId,
                  transaction_type: 'donation',
                  points_change: finalImpactPoints,
                  points_balance_after: newBalance,
                  support_amount: Math.round(parsedSupportAmount),
                  donation_id: donation.id,
                  project_id: parsedProjectId,
                  reward_id: null,
                  redemption_id: null,
                  description: `Support: $${Math.round(parsedSupportAmount)} for project ${parsedProjectId}`,
                  metadata: null
                }]);
              console.log(`[Stripe Webhook] ✅ Transaction created for donation ${donation.id}, user ${numericUserId}, +${finalImpactPoints} points`);
            } catch (txError: any) {
              console.warn(`[Stripe Webhook] ⚠️ Failed to create transaction for donation ${donation.id}:`, txError.message);
              // Non-critical: continue even if transaction creation fails
            }
          }
          
          // Update project stats
          if (project) {
            await supabase
              .from('projects')
              .update({
                raised: (project.raised || 0) + Math.round(parsedSupportAmount),
                donors: (project.donors || 0) + 1
              })
              .eq('id', parsedProjectId);
          }
          
        } else {
          console.warn('[Stripe Webhook] ⚠️ Missing required metadata:', paymentIntent.metadata);
        }
      } catch (error: any) {
        console.error('[Stripe Webhook] ❌ Error processing payment:', error.message);
        // Don't throw - return success to prevent Stripe retries
      }
    }

    res.json({ received: true });
  } catch (error: any) {
    console.error('[Stripe Webhook] ❌ Unexpected error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}
