import { User, user as userSchema } from '../../db/schema';
import { createStripeCustomer } from '../../utils/stripe/api';

export async function stripeCreateCustomerRouteResource(user: User) {
  // Create Stripe Customer.
  const email = user.email ? user.email : undefined;
  const name = `${user.firstName} ${user.lastName}`;

  const customer = await createStripeCustomer({ email, name });
  if (!customer) throw new Error('Unable to create Stripe Customer.');

  // Update user.

  userSchema.update(user.id, {
    customerId: customer.id,
  });

  // return redirect('/account');
}
