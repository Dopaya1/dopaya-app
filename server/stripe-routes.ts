import type { Express, Request, Response } from "express";
import express from "express";
import Stripe from "stripe";
import { storage } from "./storage";

let stripe: Stripe | null = null;

if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-07-30.basil",
  });
} else {
  console.warn('STRIPE_SECRET_KEY not found - Stripe functionality will be disabled');
}

export function setupStripeRoutes(app: Express) {
  // Create Stripe checkout session for donations
  app.post("/api/create-checkout-session", async (req: Request, res: Response) => {
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

  // Stripe webhook to handle successful payments
  app.post("/api/stripe/webhook", express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
    if (!stripe) {
      return res.status(503).json({ error: "Payment processing is currently unavailable" });
    }

    const sig = req.headers['stripe-signature'] as string;
    
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.warn('STRIPE_WEBHOOK_SECRET not configured, skipping webhook verification');
      return res.status(400).send('Webhook secret not configured');
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      try {
        const { userId, projectId, amount } = session.metadata || {};
        
        if (userId && amount) {
          console.log(`[Stripe Webhook] Processing donation: User ${userId}, Amount $${amount}, Project ${projectId || 'General'}`);
          
          // ============================================
          // DONATION CREATION (Step 3 Integration)
          // ============================================
          // This creates the donation record and automatically creates a transaction
          // via createDonation() -> applyPointsChange()
          //
          // TO REVERT: Comment out the donation creation block below and uncomment
          // the simple logging block at the end of this section
          // ============================================
          
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
          
          // Convert amount to integer (dollars, rounded to nearest dollar)
          // Schema expects integer for amount field
          const amountInDollars = Math.round(parsedAmount);
          
          // Get project to calculate impact points (need multiplier)
          let impactPoints = 0;
          let finalProjectId: number;
          
          if (parsedProjectId && !isNaN(parsedProjectId)) {
            finalProjectId = parsedProjectId;
            const project = await storage.getProject(parsedProjectId);
            if (project) {
              impactPoints = Math.floor(amountInDollars * (project.impactPointsMultiplier || 10));
            } else {
              console.warn(`[Stripe Webhook] Project ${parsedProjectId} not found, using default multiplier`);
              impactPoints = Math.floor(amountInDollars * 10); // Default multiplier
            }
          } else {
            // General donation - need a project ID (schema requires it)
            // For now, use projectId = 0 or find a default project
            // TODO: Handle general donations properly (may need schema change)
            console.warn('[Stripe Webhook] No projectId provided - general donations not fully supported yet');
            // Use default multiplier for general donations
            impactPoints = Math.floor(amountInDollars * 10);
            // Try to find first project as fallback (temporary solution)
            const projects = await storage.getProjects();
            if (projects.length > 0) {
              finalProjectId = projects[0].id;
              console.log(`[Stripe Webhook] Using first project (${finalProjectId}) as fallback for general donation`);
            } else {
              throw new Error('Cannot create general donation: no projects available and projectId is required');
            }
          }
          
          // Create donation record
          // This automatically creates a transaction via createDonation() -> applyPointsChange()
          const donation = await storage.createDonation({
            userId: numericUserId,
            projectId: finalProjectId, // Required by schema
            amount: amountInDollars, // Integer (dollars)
            impactPoints: impactPoints,
            status: 'completed' // Payment succeeded via Stripe
            // stripeSessionId removed - column doesn't exist in database
          });
          
          console.log(`[Stripe Webhook] ✅ Donation created: ID ${donation.id}, User ${numericUserId}, +${impactPoints} Impact Points`);
          // Transaction is automatically created by createDonation() method (Step 3)
          
          // ============================================
          // FUTURE STRIPE INTEGRATION NOTES:
          // ============================================
          // When implementing full Stripe integration, you may want to:
          // 1. Verify payment_status: session.payment_status === 'paid'
          // 2. Handle refunds: event.type === 'charge.refunded'
          // 3. Add retry logic for failed donation creation
          // 4. Send confirmation emails
          // 5. Update project funding totals (already done in createDonation)
          // 6. Handle partial payments or subscriptions
          // ============================================
          
          // ============================================
          // ROLLBACK: Simple logging (uncomment to revert)
          // ============================================
          // console.log(`Processing donation: User ${userId}, Amount $${amount}, Project ${projectId || 'General'}`);
          // // For now, we'll just log the successful payment
          // // In a real implementation, you'd use your storage layer to:
          // // - Create a donation record
          // // - Update user impact points 
          // // - Update project funding if applicable
          // ============================================
          
        } else {
          console.warn('[Stripe Webhook] Missing required metadata: userId or amount');
        }
      } catch (error) {
        console.error('[Stripe Webhook] Error processing successful payment:', error);
        // Don't throw - return success to Stripe to prevent retries
        // Log error for manual investigation
        // TODO: Consider adding error tracking/alerting for production
      }
    }

    res.json({ received: true });
  });
}