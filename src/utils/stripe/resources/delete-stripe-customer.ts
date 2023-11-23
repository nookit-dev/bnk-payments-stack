import { User, user as userSchema } from '../../../db/schema';
import { stripe } from '../stripe-config';

export async function deleteStripeCustomer(
  customerId?: User['stripeCustomerId']
) {
  if (!customerId)
    throw new Error('Missing required parameters to delete Stripe Customer.');

  return stripe.customers.del(customerId);
}

export const deleteUserResource = async (user: User) => {
  await userSchema.deleteById(user.id);

  if (user.stripeCustomerId) await deleteStripeCustomer(user.stripeCustomerId);
};
