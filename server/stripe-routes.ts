import type { Express, Request, Response } from "express";
import express from "express";
import Stripe from "stripe";

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
          // Here you would typically:
          // 1. Record the donation in your database
          // 2. Update user's impact points
          // 3. Send confirmation email
          // 4. Update project funding totals
          
          console.log(`Processing donation: User ${userId}, Amount $${amount}, Project ${projectId || 'General'}`);
          
          // For now, we'll just log the successful payment
          // In a real implementation, you'd use your storage layer to:
          // - Create a donation record
          // - Update user impact points 
          // - Update project funding if applicable
        }
      } catch (error) {
        console.error('Error processing successful payment:', error);
      }
    }

    res.json({ received: true });
  });
}