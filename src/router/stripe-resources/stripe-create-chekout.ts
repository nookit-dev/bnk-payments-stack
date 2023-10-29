import { User, getPlanById, getUserById } from '../../db/schema';
import { createStripeCheckoutSession } from '../../utils/stripe/api/create-checkout';


export async function stripeCreateCheckout(user: User) {
  if (!user.customerId) throw new Error('Unable to get Customer ID.');

  // Get form values.
  const formData = Object.fromEntries(await request.formData());
  const formDataParsed = JSON.parse(formData.plan as string);
  const planId = String(formDataParsed.planId);
  const planInterval = String(formDataParsed.planInterval);

  if (!planId || !planInterval)
    throw new Error(
      'Missing required parameters to create Stripe Checkout Session.',
    );

  // Get client's currency.
  // const defaultCurrency = getDefaultCurrency(request);

  // Get price ID for the requested plan.
  const plan = await getPlanById(planId, { prices: true });
  const planPrice = plan?.prices.find(
    (price) =>
      price.interval === planInterval && price.currency === defaultCurrency,
  );
  if (!planPrice) throw new Error('Unable to find a Plan price.');

  // Redirect to Checkout.
  const checkoutUrl = await createStripeCheckoutSession(
    user.customerId,
    planPrice.id,
  );
  return redirect(checkoutUrl);
}
