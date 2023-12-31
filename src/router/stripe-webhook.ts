import { jsonRes } from "bnkit/server";
import { endpointSecret } from "../config";
import { subscriptions, users } from "../db/schema";
import { retrieveStripeSubscription } from "../utils/stripe/resources/retrieve-stripe-subscription";
import { stripe } from "../utils/stripe/stripe-config";

/**
 * Gets Stripe event signature from request header.
 */
async function getStripeEvent(request: Request) {
	try {
		// Get header Stripe signature.
		const signature = request.headers.get("stripe-signature");
		if (!signature) throw new Error("Missing Stripe signature.");

		const payload = await request.text();

		return stripe.webhooks.constructEventAsync(
			payload,
			signature,
			endpointSecret,
		);
	} catch (err: unknown) {
		console.error(err);
		return jsonRes({}, { status: 400 });
	}
}

export async function stripeWebhook(request: Request) {
	const event = await getStripeEvent(request);

	try {
		switch (event.type) {
			// Occurs when a Checkout Session has been successfully completed.
			case "checkout.session.completed": {
				const session = event.data.object;
				const customerId = String(session.customer);
				const subscriptionId = String(session.subscription);

				// Get user from database.
				// const user = await getUserByCustomerId(customerId);
				const user = await users.readWhere({
					stripeCustomerId: customerId,
				})[0];
				if (!user) throw new Error("User not found.");

				// Retrieve and update database subscription.
				const subscription = await retrieveStripeSubscription(subscriptionId);

				const dbSubscription = await subscriptions.getById(subscription.id);

				const params: Omit<
					ReturnType<(typeof subscriptions)["infer"]>,
					"createdAt" | "updatedAt" | "id"
				> = {
					userId: user.id,
					planId: String(subscription.items.data[0].plan.product),
					priceId: String(subscription.items.data[0].price.id),
					interval: String(subscription.items.data[0].plan.interval),
					status: subscription.status,
					currentPeriodStart: subscription.current_period_start,
					currentPeriodEnd: subscription.current_period_end,
					cancelAtPeriodEnd: subscription.cancel_at_period_end ? 1 : 0,
				};

				if (!dbSubscription) {
					// createe
					subscriptions.create({
						...params,
						id: subscription.id,
						createdAt: new Date(),
						updatedAt: new Date(),
					});
				} else {
					subscriptions.update(subscription.id, {
						userId: user.id,
						planId: String(subscription.items.data[0].plan.product),
						priceId: String(subscription.items.data[0].price.id),
						interval: String(subscription.items.data[0].plan.interval),
						status: subscription.status,
						currentPeriodStart: subscription.current_period_start,
						currentPeriodEnd: subscription.current_period_end,
						cancelAtPeriodEnd: subscription.cancel_at_period_end ? 1 : 0,
					});
				}

				return jsonRes({}, { status: 200 });
			}

			// Occurs whenever a subscription changes (e.g. plan switch).
			case "customer.subscription.updated": {
				const subscription = event.data.object;
				const customerId = String(subscription.customer);

				// Get user from database.
				// const user = await getUserByCustomerId(customerId);
				const user = users.readWhere({
					stripeCustomerId: customerId,
				})[0];
				if (!user) throw new Error("User not found.");

				// Cancel free subscription if user has a paid one.
				const subscriptionsList = await stripe.subscriptions.list({
					customer: customerId,
				});
				const freeSubscriptions = subscriptionsList.data
					.map((subscription) => {
						return subscription.items.data.find(
							(item) => item.price.product === "free",
						);
					})
					.filter((item) => item !== undefined);

				if (freeSubscriptions[0]) {
					// await stripe.subscriptions.deleteDiscount(freeSubscriptions[0].subscription);
					await stripe.subscriptions.cancel(freeSubscriptions[0].subscription);
					//   await stripe.subscriptions.del(freeSubscriptions[0].subscription);
				}

				subscriptions.update(subscription.id, {
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
			case "customer.subscription.deleted": {
				const subscription = event.data.object;

				// Get database subscription.
				// const dbSubscription = await getSubscriptionById(subscription.id);
				const dbSubscription = await subscriptions.getById(
					subscription.id,
				);

				if (dbSubscription) {
					// Delete database subscription.
					await subscriptions.delById(subscription.id);
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
