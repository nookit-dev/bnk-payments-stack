import {
  User,
  price as priceSchema,
  subscription as subscriptionSchema
} from '../../db/schema';
import { createStripeSubscription } from '../../utils/stripe/api';
import { PlanId } from '../../utils/stripe/plans';

export async function stripeCreateSubscriptionResource(user: User) {
  const subscription = subscriptionSchema.readItemsWhere({
    userId: user.id,
  })[0];

  if (!user.customerId) throw new Error('Unable to find Customer ID.');

  const freePlanPrices = priceSchema.readItemsWhere({ planId: PlanId.FREE });
  const freePlanPrice = freePlanPrices.find(
    (price) => price.interval === 'year', // && price.currency === currency,
  );

  if (!freePlanPrice) throw new Error('Unable to find Free Plan price.');

  // Create Stripe Subscription.
  const newSubscription = await createStripeSubscription(
    user.customerId,
    freePlanPrice.id,
  );
  if (!newSubscription)
    throw new Error('Unable to create Stripe Subscription.');

  // Store Subscription into database.
  const storedSubscription = await subscriptionSchema.create({
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

  // return redirect('/account');
}
