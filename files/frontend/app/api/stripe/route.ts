import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/stripe
 * Creates a Stripe PaymentIntent (or a dev-mock response when no real key is configured).
 */
export async function POST(request: NextRequest) {
  try {
    const { amount, currency = 'thb', metadata } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    // ── Real Stripe mode ────────────────────────────────────────────────────
    if (stripeSecretKey && !stripeSecretKey.startsWith('sk_test_...')) {
      const stripe = require('stripe')(stripeSecretKey);
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Stripe uses smallest currency unit (satang for THB)
        currency,
        metadata: metadata ?? {},
        automatic_payment_methods: { enabled: true },
      });

      return NextResponse.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      });
    }

    // ── Dev mock mode ───────────────────────────────────────────────────────
    // Simulates a successful PaymentIntent for local dev without Stripe keys
    const mockId = `pi_mock_${Date.now()}`;
    return NextResponse.json({
      clientSecret: `${mockId}_secret_mock`,
      paymentIntentId: mockId,
      _dev: true,
    });
  } catch (err: any) {
    console.error('Stripe API error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}
