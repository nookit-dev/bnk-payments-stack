import Stripe from "stripe";
import { stripeSecretKey } from "~/config";

if (!stripeSecretKey) throw new Error("Missing STRIPE_SECRET_KEY.");

export const stripe = new Stripe(stripeSecretKey, {
	apiVersion: "2023-10-16",
	typescript: true,
});
