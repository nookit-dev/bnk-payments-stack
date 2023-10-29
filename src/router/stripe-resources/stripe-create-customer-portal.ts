import { User } from '../../db/schema';
import { createStripeCustomerPortalSession } from '../../utils/stripe/api';

export async function stripeCreateCustomerPortalResource(
  user: User,
): Promise<string | null> {
  // Redirect to Customer Portal.
  if (user.customerId) {
    const customerPortalUrl = await createStripeCustomerPortalSession(
      user.customerId,
    );
    return customerPortalUrl;
  }

  return null;
}
