import type { Stripe } from 'stripe'
import { stripe } from '../stripe-config.ts';
import { Price, User } from '../../../db/schema.ts';

export async function createStripeSubscription(
  customerId: User['customerId'],
  price: Price['id'],
  params?: Stripe.SubscriptionCreateParams,
) {
  if (!customerId || !price)
    throw new Error('Missing required parameters to create Stripe Subscription.')

  return stripe.subscriptions.create({
    ...params,
    customer: customerId,
    items: [{ price }],
  })
}
