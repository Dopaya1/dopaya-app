import type { Express, Request, Response } from "express";
import express from "express";
import Stripe from "stripe";
import { storage } from "./storage";
import { generateImpactSnapshot, hasImpact } from "./impact-generator";
import { mapProjectImpactFields } from "./project-mapper";

let stripe: Stripe | null = null;

// Initialize Stripe lazily (after env vars are loaded)
function getStripe(): Stripe | null {
  if (stripe) return stripe;
  
  if (process.env.STRIPE_SECRET_KEY) {
    console.log('[Stripe] ✅ Initializing with API key:', process.env.STRIPE_SECRET_KEY.substring(0, 12) + '...');
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-07-30.basil",
    });
  } else {
    console.warn('[Stripe] ❌ STRIPE_SECRET_KEY not found - Payment processing disabled');
  }
  
  return stripe;
}

export function setupStripeRoutes(app: Express) {
  // Create Stripe checkout session for donations
  app.post("/api/create-checkout-session", async (req: Request, res: Response) => {
    const stripe = getStripe();
    if (!stripe) {
      return res.status(503).json({ error: "Payment processing is currently unavailable" });
    }

    // For now, we'll accept the donation request if it has a valid amount
    // TODO: Implement proper Supabase auth verification
    console.log('Donation request received:', req.body);
    console.log('User auth status:', !!req.user);
    console.log('Session:', req.session);
    
    // Skip auth check for now to test Stripe functionality
    // if (!req.isAuthenticated()) {
    //   return res.status(401).json({ error: "Authentication required" });
    // }

    try {
      const { amount, projectId, projectTitle } = req.body;

      if (!amount || amount < 5) {
        return res.status(400).json({ error: "Minimum donation amount is $5" });
      }

      // Use a default email for testing, or extract from request
      const userEmail = req.body.userEmail || 'donor@dopaya.com';
      const userId = req.body.userId || 'anonymous';

      // Create checkout session
      const session = await stripe.checkout.sessions.create({
        customer_email: userEmail,
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: projectTitle || 'Dopaya Donation',
                description: projectId 
                  ? `Donation to support ${projectTitle}` 
                  : 'General donation to Dopaya',
              },
              unit_amount: Math.round(amount * 100), // Convert to cents
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${req.protocol}://${req.get('host')}/dashboard?status=success&amount=${amount}`,
        cancel_url: `${req.protocol}://${req.get('host')}/`,
        metadata: {
          userId: userId,
          projectId: projectId || '',
          amount: amount.toString(),
        },
      });

      res.json({ 
        sessionId: session.id,
        sessionUrl: session.url 
      });
    } catch (error: any) {
      console.error('Stripe checkout session creation error:', error);
      res.status(500).json({ 
        error: "Failed to create checkout session",
        message: error.message 
      });
    }
  });

  /**
   * Create Payment Intent for embedded checkout
   * Used by support page for real payment processing
   */
  app.post("/api/create-payment-intent", async (req: Request, res: Response) => {
    const stripe = getStripe();
    if (!stripe) {
      return res.status(503).json({ error: "Payment processing is currently unavailable" });
    }

    try {
      console.log('[Payment Intent] Request received:', req.body);

      // Extract data from request
      const { 
        amount,           // Support amount (without tip)
        tipAmount,        // Tip amount
        totalAmount,      // Total to charge
        projectId, 
        projectTitle, 
        projectSlug,
        impactPoints,
        userEmail,
        userId 
      } = req.body;

      // Validation
      if (!totalAmount || totalAmount < 5) {
        return res.status(400).json({ error: "Minimum payment amount is $5" });
      }

      if (!projectId || !userId) {
        return res.status(400).json({ error: "Missing required parameters" });
      }

      // Create Payment Intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(totalAmount * 100), // Convert to cents
        currency: 'usd',
        automatic_payment_methods: {
          enabled: true, // Enable all payment methods (Card, Apple Pay, Google Pay)
        },
        metadata: {
          // Store all donation data in metadata for webhook
          userId: userId.toString(),
          projectId: projectId.toString(),
          projectSlug: projectSlug || '',
          projectTitle: projectTitle || '',
          supportAmount: amount.toString(),
          tipAmount: tipAmount.toString(),
          totalAmount: totalAmount.toString(),
          impactPoints: impactPoints.toString(),
          userEmail: userEmail || '',
        },
        description: `Support ${projectTitle} on Dopaya`,
        receipt_email: userEmail || undefined,
      });

      console.log('[Payment Intent] ✅ Created:', paymentIntent.id);

      res.json({ 
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      });
    } catch (error: any) {
      console.error('[Payment Intent] ❌ Error:', error);
      res.status(500).json({ 
        error: "Failed to create payment intent",
        message: error.message 
      });
    }
  });

  // Note: Webhook endpoint is registered in index.ts BEFORE express.json()
  // This is required because Stripe needs raw body for signature verification
}

/**
 * Handle Stripe webhook - must be called BEFORE express.json() middleware
 * This is exported separately because it needs raw body access for signature verification
 */
export async function handleStripeWebhook(req: Request, res: Response) {
  const stripe = getStripe();
  if (!stripe) {
    return res.status(503).json({ error: "Payment processing is currently unavailable" });
  }

  const sig = req.headers['stripe-signature'] as string;
  
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.warn('[Stripe Webhook] ⚠️ STRIPE_WEBHOOK_SECRET not configured');
    return res.status(400).send('Webhook secret not configured');
  }

  let event: Stripe.Event;

  try {
    // req.body is raw buffer here (express.raw middleware)
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    console.log(`[Stripe Webhook] ✅ Event verified: ${event.type} (ID: ${event.id})`);
  } catch (err: any) {
    console.error('[Stripe Webhook] ❌ Signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle Payment Intent succeeded (embedded payment form)
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
        
        // Check if userId is a UUID (contains dashes) or if parseInt gives wrong result
        if (userId.includes('-') || isNaN(parsedNumeric) || parsedNumeric.toString() !== userId) {
          // userId is a UUID (auth_user_id) - need to look up numeric ID
          console.log(`[Stripe Webhook] Converting auth_user_id ${userId} to numeric ID...`);
          const user = await storage.getUserByAuthId(userId);
          if (!user) {
            throw new Error(`User not found for auth_user_id: ${userId}`);
          }
          numericUserId = user.id;
          console.log(`[Stripe Webhook] ✅ Converted to numeric user ID: ${numericUserId}`);
        } else {
          // userId is already numeric
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
        const project = await storage.getProject(parsedProjectId);
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
            // Map Supabase snake_case fields to camelCase for impact generator
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
              console.log(`[Stripe Webhook] ⚠️ Project ${parsedProjectId} has no impact data - skipping snapshot generation`);
            }
          }
        } catch (impactError: any) {
          console.warn(`[Stripe Webhook] ⚠️ Impact snapshot generation failed (donation will proceed):`, impactError.message);
        }
        
        // Create donation (this also creates transaction and awards points)
        const donation = await storage.createDonation({
          userId: numericUserId,
          projectId: parsedProjectId,
          amount: Math.round(parsedSupportAmount), // Support amount
          tipAmount: Math.round(parsedTipAmount),   // Tip amount
          impactPoints: finalImpactPoints,
          status: 'completed',
          ...(calculatedImpact !== undefined && { calculatedImpact }),
          ...(impactSnapshot && { impactSnapshot }),
          ...(generatedPastEn && { generatedTextPastEn: generatedPastEn }),
          ...(generatedPastDe && { generatedTextPastDe: generatedPastDe })
        });
        
        console.log(`[Stripe Webhook] ✅ Donation created: ID ${donation.id}, User ${numericUserId}, +${finalImpactPoints} Impact Points`);
      } else {
        console.warn('[Stripe Webhook] ⚠️ Missing required metadata:', paymentIntent.metadata);
      }
    } catch (error: any) {
      console.error('[Stripe Webhook] ❌ Error processing payment:', error.message);
      // Don't throw - return success to Stripe to prevent retries
    }
  }

  // Handle Checkout Session completed (hosted payment page)
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    try {
      const { userId, projectId, amount } = session.metadata || {};
      
      if (userId && amount) {
        console.log(`[Stripe Webhook] 🛒 Checkout session completed: User ${userId}, Amount $${amount}, Project ${projectId || 'General'}`);
        
        // Convert userId from metadata (might be UUID string or numeric string)
        let numericUserId: number;
        
        if (typeof userId === 'string') {
          // Try to parse as number first (if it's already numeric ID)
          const parsed = parseInt(userId, 10);
          if (!isNaN(parsed)) {
            numericUserId = parsed;
          } else {
            // userId is UUID from Supabase Auth - need to get numeric ID from users table
            const userEmail = session.customer_email;
            if (userEmail) {
              const dbUser = await storage.getUserByEmail(userEmail);
              if (dbUser) {
                numericUserId = dbUser.id;
                console.log(`[Stripe Webhook] Converted UUID ${userId} to numeric ID ${numericUserId} via email ${userEmail}`);
              } else {
                console.error(`[Stripe Webhook] User not found in database for email: ${userEmail}`);
                throw new Error(`User not found for email: ${userEmail}`);
              }
            } else {
              throw new Error('Cannot determine user ID: userId is UUID and no email available');
            }
          }
        } else {
          numericUserId = userId as number;
        }
        
        // Parse projectId and amount
        const parsedProjectId = projectId ? parseInt(projectId, 10) : null;
        const parsedAmount = parseFloat(amount);
        
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
          throw new Error(`Invalid donation amount: ${amount}`);
        }
        
        const amountInDollars = Math.round(parsedAmount);
        
        // Get project to calculate impact points
        let impactPoints = 0;
        let finalProjectId: number;
        
        if (parsedProjectId && !isNaN(parsedProjectId)) {
          finalProjectId = parsedProjectId;
          const project = await storage.getProject(parsedProjectId);
          if (project) {
            impactPoints = Math.floor(amountInDollars * (project.impactPointsMultiplier || 10));
          } else {
            console.warn(`[Stripe Webhook] Project ${parsedProjectId} not found, using default multiplier`);
            impactPoints = Math.floor(amountInDollars * 10);
          }
        } else {
          console.warn('[Stripe Webhook] No projectId provided - general donations not fully supported yet');
          impactPoints = Math.floor(amountInDollars * 10);
          const projects = await storage.getProjects();
          if (projects.length > 0) {
            finalProjectId = projects[0].id;
            console.log(`[Stripe Webhook] Using first project (${finalProjectId}) as fallback for general donation`);
          } else {
            throw new Error('Cannot create general donation: no projects available and projectId is required');
          }
        }
        
        // Create donation record
        const donation = await storage.createDonation({
          userId: numericUserId,
          projectId: finalProjectId,
          amount: amountInDollars,
          impactPoints: impactPoints,
          status: 'completed'
        });
        
        console.log(`[Stripe Webhook] ✅ Donation created: ID ${donation.id}, User ${numericUserId}, +${impactPoints} Impact Points`);
      } else {
        console.warn('[Stripe Webhook] Missing required metadata: userId or amount');
      }
    } catch (error: any) {
      console.error('[Stripe Webhook] Error processing checkout session:', error.message);
      // Don't throw - return success to Stripe to prevent retries
    }
  }

  res.json({ received: true });
}