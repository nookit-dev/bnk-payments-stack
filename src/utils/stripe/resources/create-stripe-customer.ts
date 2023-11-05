import type { Stripe } from 'stripe';
import { User, user as userSchema } from '../../../db/schema.ts';
import { stripe } from '../stripe-config';

export async function createStripeCustomer(
  customer?: Stripe.CustomerCreateParams,
) {
  if (!customer) throw new Error('No customer data provided.');
  return stripe.customers.create(customer);
}

export async function stripeCreateCustomerRouteResource(
  user: Pick<User, 'firstName' | 'lastName' | 'email' | 'id'>,
) {
  // Create Stripe Customer.
  const email = user.email ? user.email : undefined;
  const name = `${user.firstName} ${user.lastName}`;

  const customer = await createStripeCustomer({ email, name });
  if (!customer) throw new Error('Unable to create Stripe Customer.');

  userSchema.update(user.id, {
    stripeCustomerId: customer.id,
  });
}
