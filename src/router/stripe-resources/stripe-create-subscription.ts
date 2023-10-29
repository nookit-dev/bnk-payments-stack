import {
  User,
  createSubscription,
  getPlanById,
  getPlanByIdWithPrices,
  getSubscriptionByUserId,
} from '../../db/schema';
import { createStripeSubscription } from '../../utils/stripe/api';
import { PlanId } from '../../utils/stripe/plans';

export async function stripeCreateSubscriptionResource(user: User) {
  const subscription = await getSubscriptionByUserId(user.id);

  // if (subscription?.id) return redirect('/account');

  if (!user.customerId) throw new Error('Unable to find Customer ID.');

  // Get client's currency and Free Plan price ID.
  // const currency = getDefaultCurrency(request);
  const freePlan = await getPlanByIdWithPrices(PlanId.FREE);

  const freePlanPrice = freePlan?.prices.find(
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
  const storedSubscription = await createSubscription({
    id: newSubscription.id,
    userId: user.id,
    planId: String(newSubscription.items.data[0].plan.product),
    priceId: String(newSubscription.items.data[0].price.id),
    interval: String(newSubscription.items.data[0].plan.interval),
    status: newSubscription.status,
    currentPeriodStart: newSubscription.current_period_start,
    currentPeriodEnd: newSubscription.current_period_end,
    cancelAtPeriodEnd: newSubscription.cancel_at_period_end,
  });
  if (!storedSubscription) throw new Error('Unable to create Subscription.');

  return storedSubscription;

  // return redirect('/account');
}
