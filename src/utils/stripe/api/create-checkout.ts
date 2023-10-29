import { stripe } from '../stripe-config';
import type Stripe from 'stripe';

import { Price, User } from '../../../db/schema';
import { hostURL } from '../../../config';

export async function createStripeCheckoutSession(
  customerId: User['customerId'],
  stripePriceId: Price['id'],
  params?: Stripe.Checkout.SessionCreateParams,
) {
  if (!customerId || !stripePriceId)
    throw new Error(
      'Missing required parameters to create Stripe Checkout Session.',
    );

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    line_items: [{ price: stripePriceId, quantity: 1 }],
    mode: 'subscription',
    payment_method_types: ['card'],
    success_url: `${hostURL}/checkout`,
    cancel_url: `${hostURL}/plans`,
    ...params,
  });
  if (!session?.url)
    throw new Error('Unable to create Stripe Checkout Session.');

  return session.url;
}
