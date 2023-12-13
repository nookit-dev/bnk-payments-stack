import type { Stripe } from "stripe";
import { users } from "~/db";
import { stripe } from "../stripe-config";

export async function createStripeCustomer(
	customer?: Stripe.CustomerCreateParams,
) {
	if (!customer) throw new Error("No customer data provided.");
	return stripe.customers.create(customer);
}

export async function stripeCreateCustomerRouteResource(
	user: Pick<
		ReturnType<typeof users.infer>,
		"firstName" | "lastName" | "email" | "id"
	>,
) {
	// Create Stripe Customer.
	const email = user.email ? user.email : undefined;
	const name = `${user.firstName} ${user.lastName}`;

	const customer = await createStripeCustomer({ email, name });
	if (!customer) throw new Error("Unable to create Stripe Customer.");

	users.update(user.id, {
		stripeCustomerId: customer.id,
	});
}
