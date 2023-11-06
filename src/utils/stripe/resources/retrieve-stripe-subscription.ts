import type { Stripe } from 'stripe';
import { Subscription } from '../../../db/schema.ts';
import { stripe } from '../stripe-config.ts';

export async function retrieveStripeSubscription(
  id?: Subscription['id'],
  params?: Stripe.SubscriptionRetrieveParams,
) {
  if (!id)
    throw new Error(
      'Missing required parameters to retrieve Stripe Subscription.',
    );
  return stripe.subscriptions.retrieve(id, params);
}
