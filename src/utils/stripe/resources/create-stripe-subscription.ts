import type { Stripe } from "stripe";
import { prices, subscriptions, users } from "~/db";
import { stripe } from "../stripe-config";

export async function createStripeSubscription(
	customerId: string,
	price: string,
	params?: Stripe.SubscriptionCreateParams,
) {
	if (!customerId || !price)
		throw new Error(
			"Missing required parameters to create Stripe Subscription.",
		);

	return stripe.subscriptions.create({
		...params,
		customer: customerId,
		items: [{ price }],
	});
}

export async function stripeCreateSubscriptionResource(
	user: Pick<ReturnType<typeof users.infer>, "id" | "stripeCustomerId">,
) {
	const subscription = subscriptions.readWhere({
		userId: user.id,
	})[0];

	if (!user.stripeCustomerId) throw new Error("Unable to find Customer ID.");

	const freePlanPrices = prices.readWhere({ planId: "free" });
	const freePlanPrice = freePlanPrices.find(
		(price) => price.interval === "year", // && price.currency === currency,
	);

	if (!freePlanPrice) throw new Error("Unable to find Free Plan price.");

	// Create Stripe Subscription.
	const newSubscription = await createStripeSubscription(
		user.stripeCustomerId,
		freePlanPrice.id,
	);
	if (!newSubscription)
		throw new Error("Unable to create Stripe Subscription.");

	// Store Subscription into database.
	const storedSubscription = subscriptions.create({
		id: newSubscription.id,
		userId: user.id,
		planId: String(newSubscription.items.data[0].plan.product),
		priceId: String(newSubscription.items.data[0].price.id),
		interval: String(newSubscription.items.data[0].plan.interval),
		status: newSubscription.status,
		currentPeriodStart: newSubscription.current_period_start,
		currentPeriodEnd: newSubscription.current_period_end,
		cancelAtPeriodEnd: newSubscription.cancel_at_period_end ? 1 : 0,
		createdAt: new Date(),
		updatedAt: new Date(),
	});
	if (!storedSubscription) throw new Error("Unable to create Subscription.");

	return storedSubscription;
}
