import type { Stripe } from "stripe";
import { prices } from '~/db';
import { PlanInterval } from "../plans.ts";
import { stripe } from "../stripe-config";

export async function createStripePrice(
	id: string,
	price: Partial<ReturnType<typeof prices['infer']>>,
	params?: Stripe.PriceCreateParams,
) {
	if (!id || !price)
		throw new Error("Missing required parameters to create Stripe Price.");

	return stripe.prices.create({
		...params,
		product: id,
		currency: price.currency ?? "usd",
		unit_amount: price.amount ?? 0,
		tax_behavior: "inclusive",
		recurring: {
			interval: (price.interval as PlanInterval) ?? "month",
		},
	});
}
