import {
  User,
  getPlanByIdWithPrices
} from '../../db/schema';
import { createStripeCheckoutSession } from '../../utils/stripe/api';

type FormData = {
  planId: string;
  planInterval: string;
};

export async function processFormData(request: Request): Promise<FormData> {
  const formData = Object.fromEntries(await request.formData());
  const formDataParsed = JSON.parse(formData.plan as string);
  const planId = String(formDataParsed.planId);
  const planInterval = String(formDataParsed.planInterval);

  if (!planId || !planInterval) {
    throw new Error(
      'Missing required parameters to create Stripe Checkout Session.',
    );
  }

  return {
    planId,
    planInterval,
  };
}

export async function stripeCreateCheckoutResource(user: User, request: Request) {
  if (!user.customerId) throw new Error('Unable to get Customer ID.');

  // Get form values.
  // Get client's currency.
  // const defaultCurrency = getDefaultCurrency(request);
  const { planId, planInterval } = await processFormData(request);

  // Get price ID for the requested plan.
  const plan = await getPlanByIdWithPrices(planId);
  const planPrice = plan?.prices.find(
    (price) => price.interval === planInterval, //  && price.currency === defaultCurrency,
  );
  if (!planPrice) throw new Error('Unable to find a Plan price.');

  // Redirect to Checkout.
  const checkoutUrl = await createStripeCheckoutSession(
    user.customerId,
    planPrice.id,
  );

  return checkoutUrl;
}
