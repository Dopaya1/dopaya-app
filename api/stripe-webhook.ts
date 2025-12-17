/**
 * Stripe Webhook Handler (Serverless Function for Vercel)
 * 
 * Handles payment_intent.succeeded events from Stripe to create donations.
 * IMPORTANT: This function requires raw body for signature verification.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-07-30.basil",
});

// Initialize Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Import impact generator utilities
import { generateImpactSnapshot, hasImpact } from '../server/impact-generator';
import { mapProjectImpactFields } from '../server/project-mapper';

// Disable body parsing - we need raw body for Stripe
export const config = {
  api: {
    bodyParser: false,
  },
};

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
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.warn('[Stripe Webhook] ⚠️ STRIPE_WEBHOOK_SECRET not configured');
    return res.status(400).send('Webhook secret not configured');
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('[Stripe Webhook] STRIPE_SECRET_KEY not configured');
    return res.status(503).json({ error: "Payment processing is currently unavailable" });
  }

  try {
    // Get raw body and signature
    const rawBody = await getRawBody(req);
    const sig = req.headers['stripe-signature'] as string;

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
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
            finalImpactPoints = Math.floor(parsedSupportAmount * (project.impactPointsMultiplier || 10));
          }
          
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
          
          if (currentUser) {
            await supabase
              .from('users')
              .update({ 
                impactPoints: (currentUser.impactPoints || 0) + finalImpactPoints 
              })
              .eq('id', numericUserId);
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

