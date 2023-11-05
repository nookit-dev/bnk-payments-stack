import { jsonRes } from '@bnk/core/modules/server';
import { endpointSecret } from '../config';
import {
  subscription as subscriptionSchema,
  user as userSchema,
} from '../db/schema';
import { PlanId } from '../utils/stripe/plans';
import { retrieveStripeSubscription } from '../utils/stripe/resources/retrieve-stripe-subscription';
import { stripe } from '../utils/stripe/stripe-config';

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
    );

    return event;
  } catch (err: unknown) {
    console.error(err);
    return jsonRes({}, { status: 400 });
  }
}

export async function stripeWebhook(request: Request) {
  const event = await getStripeEvent(request);

  console.log({
    event,
  });

  try {
    switch (event.type) {
      // Occurs when a Checkout Session has been successfully completed.
      case 'checkout.session.completed': {
        const session = event.data.object;
        const customerId = String(session.customer);
        const subscriptionId = String(session.subscription);

        // Get user from database.
        // const user = await getUserByCustomerId(customerId);
        const user = await userSchema.readItemsWhere({
          stripeCustomerId: customerId,
        })[0];
        if (!user) throw new Error('User not found.');

        // Retrieve and update database subscription.
        const subscription = await retrieveStripeSubscription(subscriptionId);

        subscriptionSchema.update(subscription.id, {
          // id: subscription.id,
          userId: user.id,
          planId: String(subscription.items.data[0].plan.product),
          priceId: String(subscription.items.data[0].price.id),
          interval: String(subscription.items.data[0].plan.interval),
          status: subscription.status,
          currentPeriodStart: subscription.current_period_start,
          currentPeriodEnd: subscription.current_period_end,
          cancelAtPeriodEnd: subscription.cancel_at_period_end ? 1 : 0,
        });

        return jsonRes({}, { status: 200 });
      }

      // Occurs whenever a subscription changes (e.g. plan switch).
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customerId = String(subscription.customer);

        // Get user from database.
        // const user = await getUserByCustomerId(customerId);
        const user = await userSchema.readItemsWhere({
          stripeCustomerId: customerId,
        })[0];
        if (!user) throw new Error('User not found.');

        // Cancel free subscription if user has a paid one.
        const subscriptionsList = await stripe.subscriptions.list({
          customer: customerId,
        });
        const freeSubscriptions = subscriptionsList.data
          .map((subscription) => {
            return subscription.items.data.find(
              (item) => item.price.product === PlanId.FREE,
            );
          })
          .filter((item) => item !== undefined);

        if (freeSubscriptions[0]) {
          // await stripe.subscriptions.deleteDiscount(freeSubscriptions[0].subscription);
          await stripe.subscriptions.cancel(freeSubscriptions[0].subscription);
          //   await stripe.subscriptions.del(freeSubscriptions[0].subscription);
        }

        subscriptionSchema.update(subscription.id, {
          // id: subscription.id,
          userId: user.id,
          planId: String(subscription.items.data[0].plan.product),
          priceId: String(subscription.items.data[0].price.id),
          interval: String(subscription.items.data[0].plan.interval),
          status: subscription.status,
          currentPeriodStart: subscription.current_period_start,
          currentPeriodEnd: subscription.current_period_end,
          cancelAtPeriodEnd: subscription.cancel_at_period_end ? 1 : 0,
        });

        return jsonRes({}, { status: 200 });
      }

      // Occurs whenever a customer’s subscription ends.
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;

        // Get database subscription.
        // const dbSubscription = await getSubscriptionById(subscription.id);
        const dbSubscription = await subscriptionSchema.readById(
          subscription.id,
        );

        if (dbSubscription) {
          // Delete database subscription.
          await subscriptionSchema.deleteById(subscription.id);
        }

        return jsonRes({}, { status: 200 });
      }
    }
  } catch (err: unknown) {
    console.log(err);
    return jsonRes({}, { status: 400 });
  }

  // We'll return a 200 status code for all other events.
  // A `501 Not Implemented` or any other status code could be returned.
  return jsonRes({}, { status: 200 });
}
