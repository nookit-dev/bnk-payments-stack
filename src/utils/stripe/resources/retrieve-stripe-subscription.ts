import type { Stripe } from "stripe";
import { stripe } from "../stripe-config.ts";

export async function retrieveStripeSubscription(
	id?: string,
	params?: Stripe.SubscriptionRetrieveParams,
) {
	if (!id)
		throw new Error(
			"Missing required parameters to retrieve Stripe Subscription.",
		);

	return stripe.subscriptions.retrieve(id, params);
}
