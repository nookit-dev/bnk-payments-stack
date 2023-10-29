import type { Stripe } from 'stripe'
import { stripe } from '../stripe-config.ts';

export async function createStripeCustomer(customer?: Stripe.CustomerCreateParams) {
  if (!customer) throw new Error('No customer data provided.')
  return stripe.customers.create(customer)
}
