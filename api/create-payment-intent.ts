/**
 * Create Stripe Payment Intent (Serverless Function for Vercel)
 * 
 * This endpoint creates a Payment Intent for embedded Stripe checkout.
 * Used by the support page for real payment processing.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-07-30.basil",
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check Stripe API key
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('[Payment Intent] STRIPE_SECRET_KEY not configured');
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
      receipt_email: userEmail || undefined, // Automatic Stripe receipt
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
}

