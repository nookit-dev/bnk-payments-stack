import type { Stripe } from 'stripe';
import { Plan } from '../../../db/schema.ts';
import { stripe } from '../stripe-config';

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
