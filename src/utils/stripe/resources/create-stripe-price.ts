

import type { Stripe } from 'stripe';
import { Plan, Price,  } from '../../../db/schema.ts';
import { Interval } from '../plans.ts';
import { stripe } from '../stripe-config';

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