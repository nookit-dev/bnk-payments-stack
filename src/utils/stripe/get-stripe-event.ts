
import type { Stripe } from 'stripe';
import { endpointSecret } from '../../config';
import { stripe } from './stripe-config';

/**
 * Gets Stripe event signature from request header.
 */
async function getStripeEvent(request: Request) {
  try {
    // Get header Stripe signature.
    const signature = request.headers.get('stripe-signature');
    if (!signature) throw new Error('Missing Stripe signature.');

    const payload = await request.text();
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      endpointSecret,
    ) ;

    return event;
  } catch (err: unknown) {
    console.error(err);
    throw err;
  }
}
