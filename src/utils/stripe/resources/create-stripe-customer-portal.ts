import { hostURL } from "~/config.ts";
import { users } from "~/db";
import { PricingPlanKeys } from "../plans.ts";
import { stripe } from "../stripe-config";

export async function stripeCreateCustomerPortalResource(
	user: ReturnType<typeof users.infer>,
): Promise<string | null> {
	// Redirect to Customer Portal.
	if (user.stripeCustomerId) {
		const customerPortalUrl = await createStripeCustomerPortalSession(
			user.stripeCustomerId,
		);
		return customerPortalUrl;
	}

	return null;
}

type BillingPortalProducts = {
	product: PricingPlanKeys;
	prices: string[];
};

export async function configureStripeCustomerPortal(
	products: BillingPortalProducts[],
) {
	if (!products)
		throw new Error(
			"Missing required parameters to configure Stripe Customer Portal.",
		);

	return stripe.billingPortal.configurations.create({
		business_profile: {
			headline: "Organization Name - Customer Portal",
		},
		features: {
			customer_update: {
				enabled: true,
				allowed_updates: ["address", "shipping", "tax_id", "email"],
			},
			invoice_history: { enabled: true },
			payment_method_update: { enabled: true },
			subscription_pause: { enabled: false },
			subscription_cancel: { enabled: true },
			subscription_update: {
				enabled: true,
				default_allowed_updates: ["price"],
				proration_behavior: "always_invoice",
				products: products.filter(({ product }) => product !== "free"),
			},
		},
	});
}

export async function createStripeCustomerPortalSession(customerId: string) {
	if (!customerId)
		throw new Error(
			"Missing required parameters to create Stripe Customer Portal.",
		);

	const session = await stripe.billingPortal.sessions.create({
		customer: customerId,
		return_url: `${hostURL}/resources/stripe/create-customer-portal`,
	});
	if (!session?.url)
		throw new Error("Unable to create Stripe Customer Portal Session.");

	return session.url;
}
