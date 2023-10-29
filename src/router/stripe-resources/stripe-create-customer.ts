import { db } from '../../db/db';
import { User, getUserById, updateUserById } from '../../db/schema';
import { createStripeCustomer } from '../../utils/stripe/api/create-customer';

export async function stripeCreateCustomerRoute(user: User) {
  // if (!user) return redirect('/login');
  if (user.customerId) return redirect('/account');

  // Create Stripe Customer.
  const email = user.email ? user.email : undefined;
  const name = `${user.firstName} ${user.lastName}`

  const customer = await createStripeCustomer({ email, name, });
  if (!customer) throw new Error('Unable to create Stripe Customer.');

  // Update user.
  await updateUserById(user.id, { customerId: customer.id });

  return redirect('/account');
}
