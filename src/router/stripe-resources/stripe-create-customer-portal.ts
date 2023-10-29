import { db } from '../../db/db';
import { User, getUserById } from '../../db/schema';
import { createStripeCustomerPortalSession } from '../../utils/stripe/api/create-customer-portal';

export async function stripeCreateCustomerPortal(user: User) {
  // Redirect to Customer Portal.
  if (user.customerId) {
    const customerPortalUrl = await createStripeCustomerPortalSession(
      user.customerId,
    );
    return redirect(customerPortalUrl);
  }

  return json({}, { status: 400 });
}
