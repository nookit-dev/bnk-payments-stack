// Required for an enhanced experience with Stripe Event Types.
// More info: https://bit.ly/3KlNXLs
/// <reference types="stripe-event-types" />

import { stripe } from './stripe-config';
import type { Stripe } from 'stripe';

/**
 * Gets Stripe event signature from request header.
 */
async function getStripeEvent(request: Request) {
  try {
    // Get header Stripe signature.
    const signature = request.headers.get('stripe-signature');
    if (!signature) throw new Error('Missing Stripe signature.');

    const ENDPOINT_SECRET =
      process.env.NODE_ENV === 'development'
        ? process.env.DEV_STRIPE_WEBHOOK_ENDPOINT
        : process.env.PROD_STRIPE_WEBHOOK_ENDPOINT;

    const payload = await request.text();
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      ENDPOINT_SECRET,
    ) as Stripe.DiscriminatedEvent;

    return event;
  } catch (err: unknown) {
    console.error(err);
    throw err;
    // return json({}, { status: 400 });
  }
}
