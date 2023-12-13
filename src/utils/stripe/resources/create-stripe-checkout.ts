import type { Stripe } from "stripe";
import { hostURL } from "~/config.ts";
import { users } from '~/db';
import { prices } from "~/db/schema.ts";
import { PlanInterval } from "../plans.ts";
import { stripe } from "../stripe-config";

type FormData = {
	planId: string;
	planInterval: string;
};

export async function processFormData(request: Request): Promise<FormData> {
	const formData = await request.formData();
	const planId = formData.get("planId") as string;

	const planInterval: PlanInterval = "month";

	if (!planId || !planInterval) {
		throw new Error(
			"Missing required parameters to create Stripe Checkout Session.",
		);
	}

	return {
		planId,
		planInterval,
	};
}

export async function createStripeCheckoutSession(
	customerId: string,
	stripePriceId: string,
	params?: Stripe.Checkout.SessionCreateParams,
) {
	if (!customerId || !stripePriceId)
		throw new Error(
			"Missing required parameters to create Stripe Checkout Session.",
		);

	const session = await stripe.checkout.sessions.create({
		customer: customerId,
		line_items: [{ price: stripePriceId, quantity: 1 }],
		mode: "subscription",
		payment_method_types: ["card"],
		success_url: `${hostURL}/checkout`,
		cancel_url: `${hostURL}/plans`,
		...params,
	});
	if (!session?.url)
		throw new Error("Unable to create Stripe Checkout Session.");

	return session.url;
}



export async function createStripeCheckoutUrl(user: ReturnType< typeof users['infer']>, request: Request) {
	if (!user.stripeCustomerId) throw new Error("Unable to get Customer ID.");

	// Get form values.
	// Get client's currency.
	// const defaultCurrency = getDefaultCurrency(request);
	const { planId, planInterval } = await processFormData(request);

	const pricesRes = prices.readWhere({ planId: planId });

	const planPrice = pricesRes.find(
		(price) => price.interval === planInterval, //  && price.currency === defaultCurrency,
	);

	if (!planPrice) throw new Error("Unable to find a Plan price.");

	// Redirect to Checkout.
	const checkoutUrl = await createStripeCheckoutSession(
		user.stripeCustomerId,
		planPrice.id,
	);

	return checkoutUrl;
}
