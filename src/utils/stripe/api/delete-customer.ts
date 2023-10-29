import { stripe } from '../stripe-config'
import { User } from '../../../db/schema.ts';

export async function deleteStripeCustomer(customerId?: User['customerId']) {
  if (!customerId)
    throw new Error('Missing required parameters to delete Stripe Customer.')

  return stripe.customers.del(customerId)
}
