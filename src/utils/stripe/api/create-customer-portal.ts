
import { hostURL } from '../../../config.ts';
import { User } from '../../../db/schema.ts';
import { stripe } from '../stripe-config.ts';

export async function createStripeCustomerPortalSession(customerId: User['customerId']) {
  if (!customerId)
    throw new Error('Missing required parameters to create Stripe Customer Portal.')

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${hostURL}/resources/stripe/create-customer-portal`,
  })
  if (!session?.url) throw new Error('Unable to create Stripe Customer Portal Session.')

  return session.url
}
