import { PlanLimit, Price } from '../../db/schema';

export const currency = {
  default: 'usd',
  usd: 'usd',
  eur: 'eur',
} satisfies Record<string, string>;

export const interval = {
  month: 'month',
  year: 'year',
} satisfies Record<string, string>;

export type PlanInterval = keyof typeof interval;
export type PlanCurrency = keyof typeof currency;

//Defines our plans structure.
export const PRICING_PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    description: 'Free Plan Description',
    features: ['1 Star per Minute', 'Limited to 9 Stars'],
    limits: { maxItems: 9 },
    prices: {
      month: {
        default: 0,
        eur: 0,
        usd: 0,
      },
      year: {
        default: 0,
        eur: 0,
        usd: 0,
      },
    },
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    description: 'Starter Plan Description',
    features: ['4 Stars per Minute', 'Limited to 99 Stars'],
    limits: { maxItems: 99 },
    prices: {
      month: {
        default: 990,
        eur: 990,
        usd: 990,
      },
      year: {
        default: 990,
        eur: 990,
        usd: 990,
      },
    },
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    description: 'Pro Plan Description',
    features: ['8 Stars per Minute', 'Limited to 999 Stars'],
    limits: { maxItems: 999 },
    prices: {
      month: {
        usd: 1990,
        eur: 1990,
        default: 1990,
      },
      year: {
        usd: 19990,
        eur: 19990,
        default: 19990,
      },
    },
  },
} satisfies PricingPlan;

// A helper type that defines our price by interval.
export type PriceInterval = Record<
  PlanInterval,
  Record<PlanCurrency, Price['amount']>
>;

// A helper type that defines our pricing plans structure by Interval.
export type PricingPlan = Record<
  string,
  {
    id: string;
    name: string;
    description: string;
    features: string[];
    limits: Pick<PlanLimit, 'maxItems'>;
    prices: PriceInterval;
  }
>;


export type PricingPlanKeys = keyof typeof PRICING_PLANS;