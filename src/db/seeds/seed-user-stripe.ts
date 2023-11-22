import { Stripe } from 'stripe';
import { createUser } from '../../utils/stripe/auth';
import { PRICING_PLANS, PricingPlanKeys } from '../../utils/stripe/plans';
import { createStripeCustomer } from '../../utils/stripe/resources/create-stripe-customer';
import { configureStripeCustomerPortal } from '../../utils/stripe/resources/create-stripe-customer-portal';
import { createStripePrice } from '../../utils/stripe/resources/create-stripe-price';
import { createStripeProduct } from '../../utils/stripe/resources/create-stripe-product';
import { db } from '../db';
import { plan, price as priceSchema } from '../schema';

// seed customer
const userEmail = 'test@test.com';
const username = 'test';
const userFirstName = 'test';
const userLastName = 'test';
const fullName = `${userFirstName} ${userLastName}`;

const createSeedCustomer = async () => {
  let stripeCustomer: Stripe.Customer | null = null;

  // try to create the stripe customer first
  try {
    stripeCustomer = await createStripeCustomer({
      email: userEmail,
      name: fullName,
    });
  } catch (e) {
    console.error(e);
    console.log(
      'Stripe customer ' +
        userEmail +
        ' likely already exists, please check stripe dashboard.',
    );
  }

  return await createUser(db, {
    password: 'test',
    username,
    email: userEmail,
    customerId: stripeCustomer?.id,
    firstName: userFirstName,
    lastName: userLastName,
  });
};

async function seed() {
  await createSeedCustomer();
  const plans = await plan.readAll();

  if (plans.length > 0) {
    console.log('🎉 Plans has already been seeded.');
    return true;
  }

  const seedProducts = Object.values(PRICING_PLANS).map(
    async ({ id, name, description, features, limits, prices }) => {
      // Format prices to match Stripe's API.
      const pricesByInterval = Object.entries(prices).flatMap(
        ([interval, price]) => {
          return Object.entries(price).map(([currency, amount]) => ({
            interval,
            currency,
            amount,
          }));
        },
      );

      // Create Stripe product.
      await createStripeProduct({
        id,
        name,
        description: description || undefined,
      });

      // Create Stripe price for the current product.
      const stripePrices = await Promise.all(
        pricesByInterval.map((price) => {
          return createStripePrice(id, price);
        }),
      );

      // Store product into database.
      await plan.create({
        // data: {
        id,
        name,
        description,
        active: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),

        // limits: {
        //   create: {
        //     maxItems: limits.maxItems,
        //   },
        // },
        // prices: {
        //   create: stripePrices.map((price) => ({
        //     id: price.id,
        //     amount: price.unit_amount ?? 0,
        //     currency: price.currency,
        //     interval: price.recurring?.interval ?? 'month',
        //   })),
        // },
        // },
      });

      stripePrices.forEach((price) => {
        priceSchema.create({
          id: price.id,
          amount: price.unit_amount ?? 0,
          currency: price.currency,
          interval: price.recurring?.interval ?? 'month',
          active: price.active ? 1 : 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          planId: id,
        });
      });

      //   strip

      //   price.

      // Return product ID and prices.
      // Used to configure the Customer Portal.
      return {
        product: id,
        prices: stripePrices.map((price) => price.id) as PricingPlanKeys[],
      };
    },
  );

  // Create Stripe products and stores them into database.
  const seededProducts = await Promise.all(seedProducts);
  console.log(`📦 Stripe Products has been successfully created.`);

  // Configure Customer Portal.

  try {
    await configureStripeCustomerPortal(seededProducts);
    console.log(`👒 Stripe Customer Portal has been successfully configured.`);
  } catch (e) {
    console.error(e);
  }

  console.log(
    '🎉 Visit: https://dashboard.stripe.com/test/products to see your products.',
  );
}

seed().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
