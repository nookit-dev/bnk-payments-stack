import type { Stripe } from 'stripe';
import { Subscription } from '../../db/schema';
import { Plan, Price, User } from '../../db/schema.ts';
import type { PlanId } from './plans';
import { Interval } from './plans.ts';
import { stripe } from './stripe-config';
import { hostURL } from '../../config.ts';

type BillingPortalProducts = {
  product: PlanId;
  prices: string[];
};

export async function configureStripeCustomerPortal(
  products: BillingPortalProducts[],
) {
  if (!products)
    throw new Error(
      'Missing required parameters to configure Stripe Customer Portal.',
    );

  return stripe.billingPortal.configurations.create({
    business_profile: {
      headline: 'Organization Name - Customer Portal',
    },
    features: {
      customer_update: {
        enabled: true,
        allowed_updates: ['address', 'shipping', 'tax_id', 'email'],
      },
      invoice_history: { enabled: true },
      payment_method_update: { enabled: true },
      subscription_pause: { enabled: false },
      subscription_cancel: { enabled: true },
      subscription_update: {
        enabled: true,
        default_allowed_updates: ['price'],
        proration_behavior: 'always_invoice',
        products: products.filter(({ product }) => product !== 'free'),
      },
    },
  });
}

export async function retrieveStripeSubscription(
  id?: Subscription['id'],
  params?: Stripe.SubscriptionRetrieveParams,
) {
  if (!id)
    throw new Error(
      'Missing required parameters to retrieve Stripe Subscription.',
    );
  return stripe.subscriptions.retrieve(id, params);
}

export async function deleteStripeCustomer(customerId?: User['customerId']) {
  if (!customerId)
    throw new Error('Missing required parameters to delete Stripe Customer.');

  return stripe.customers.del(customerId);
}

export async function createStripeSubscription(
  customerId: User['customerId'],
  price: Price['id'],
  params?: Stripe.SubscriptionCreateParams,
) {
  if (!customerId || !price)
    throw new Error(
      'Missing required parameters to create Stripe Subscription.',
    );

  return stripe.subscriptions.create({
    ...params,
    customer: customerId,
    items: [{ price }],
  });
}

export async function createStripeProduct(
  product: Partial<Plan>,
  params?: Stripe.ProductCreateParams,
) {
  if (!product || !product.id || !product.name)
    throw new Error('Missing required parameters to create Stripe Product.');

  return stripe.products.create({
    ...params,
    id: product.id,
    name: product.name,
    description: product.description || undefined,
  });
}

export async function createStripePrice(
  id: Plan['id'],
  price: Partial<Price>,
  params?: Stripe.PriceCreateParams,
) {
  if (!id || !price)
    throw new Error('Missing required parameters to create Stripe Price.');

  return stripe.prices.create({
    ...params,
    product: id,
    currency: price.currency ?? 'usd',
    unit_amount: price.amount ?? 0,
    tax_behavior: 'inclusive',
    recurring: {
      interval: (price.interval as Interval) ?? 'month',
    },
  });
}

export async function createStripeCustomer(
  customer?: Stripe.CustomerCreateParams,
) {
  if (!customer) throw new Error('No customer data provided.');
  return stripe.customers.create(customer);
}

export async function createStripeCustomerPortalSession(
  customerId: User['customerId'],
) {
  if (!customerId)
    throw new Error(
      'Missing required parameters to create Stripe Customer Portal.',
    );

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${hostURL}/resources/stripe/create-customer-portal`,
  });
  if (!session?.url)
    throw new Error('Unable to create Stripe Customer Portal Session.');

  return session.url;
}

export async function createStripeCheckoutSession(
  customerId: User['customerId'],
  stripePriceId: Price['id'],
  params?: Stripe.Checkout.SessionCreateParams,
) {
  if (!customerId || !stripePriceId)
    throw new Error(
      'Missing required parameters to create Stripe Checkout Session.',
    );

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    line_items: [{ price: stripePriceId, quantity: 1 }],
    mode: 'subscription',
    payment_method_types: ['card'],
    success_url: `${hostURL}/checkout`,
    cancel_url: `${hostURL}/plans`,
    ...params,
  });
  if (!session?.url)
    throw new Error('Unable to create Stripe Checkout Session.');

  return session.url;
}
