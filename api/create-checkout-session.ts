import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

/**
 * Stripe Checkout Session endpoint
 * Creates a Stripe checkout session for donations
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
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
  if (!STRIPE_SECRET_KEY) {
    return res.status(503).json({ error: 'Payment processing is currently unavailable' });
  }

  const stripe = new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: '2025-08-27.basil',
  });

  try {
    const { amount, projectId, projectTitle, userEmail, userId } = req.body;

    if (!amount || amount < 5) {
      return res.status(400).json({ error: 'Minimum donation amount is $5' });
    }

    // Get host from request headers
    const host = req.headers.host || 'dopaya.com';
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const baseUrl = `${protocol}://${host}`;

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer_email: userEmail || 'donor@dopaya.com',
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
      success_url: `${baseUrl}/dashboard?status=success&amount=${amount}`,
      cancel_url: `${baseUrl}/`,
      metadata: {
        userId: userId || 'anonymous',
        projectId: projectId || '',
        amount: amount.toString(),
      },
    });

    res.json({
      sessionId: session.id,
      sessionUrl: session.url,
    });
  } catch (error: any) {
    console.error('[create-checkout-session] Error:', error);
    res.status(500).json({
      error: 'Failed to create checkout session',
      message: error.message,
    });
  }
}

