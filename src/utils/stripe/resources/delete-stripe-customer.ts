import { users } from "~/db";
import { stripe } from "../stripe-config";

export async function deleteStripeCustomer(customerId?: string) {
	if (!customerId)
		throw new Error("Missing required parameters to delete Stripe Customer.");

	return stripe.customers.del(customerId);
}

export const deleteUserResource = async (
	user: ReturnType<typeof users.infer>,
) => {
	// Delete user from database.
	await users.delById(user.id);

	// Delete Stripe Customer.
	if (user.stripeCustomerId) await deleteStripeCustomer(user.stripeCustomerId);

	// Destroy session. (log user out)
	// let session = await getSession(request.headers.get('Cookie'));
	// return redirect('/', {
	//   headers: {
	//     'Set-Cookie': await destroySession(session),
	//   },
	// });
};
