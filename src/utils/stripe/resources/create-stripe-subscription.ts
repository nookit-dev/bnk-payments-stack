import type { Stripe } from 'stripe';
import {
  Price,
  User,
  price as priceSchema,
  subscription as subscriptionSchema,
} from '../../../db/schema.ts';
import { PlanId } from '../plans.ts';
import { stripe } from '../stripe-config';

export async function createStripeSubscription(
  customerId: User['stripeCustomerId'],
  price: Price['id'],
  params?: Stripe.SubscriptionCreateParams,
) {
  if (!customerId || !price)
    throw new Error(
      'Missing required parameters to create Stripe Subscription.',
    );

  return stripe.subscriptions.create({
    ...params,
    customer: customerId,
    items: [{ price }],
  });
}

export async function stripeCreateSubscriptionResource(
  user: Pick<User, 'id' | 'stripeCustomerId'>,
) {
  const subscription = subscriptionSchema.readItemsWhere({
    userId: user.id,
  })[0];

  if (!user.stripeCustomerId) throw new Error('Unable to find Customer ID.');

  const freePlanPrices = priceSchema.readItemsWhere({ planId: PlanId.FREE });
  const freePlanPrice = freePlanPrices.find(
    (price) => price.interval === 'year', // && price.currency === currency,
  );

  if (!freePlanPrice) throw new Error('Unable to find Free Plan price.');

  // Create Stripe Subscription.
  const newSubscription = await createStripeSubscription(
    user.stripeCustomerId,
    freePlanPrice.id,
  );
  if (!newSubscription)
    throw new Error('Unable to create Stripe Subscription.');

  // Store Subscription into database.
  const storedSubscription = subscriptionSchema.create({
    id: newSubscription.id,
    userId: user.id,
    planId: String(newSubscription.items.data[0].plan.product),
    priceId: String(newSubscription.items.data[0].price.id),
    interval: String(newSubscription.items.data[0].plan.interval),
    status: newSubscription.status,
    currentPeriodStart: newSubscription.current_period_start,
    currentPeriodEnd: newSubscription.current_period_end,
    cancelAtPeriodEnd: newSubscription.cancel_at_period_end ? 1 : 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  if (!storedSubscription) throw new Error('Unable to create Subscription.');

  return storedSubscription;
}
