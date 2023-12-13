import { children } from "bnkit/htmlody";
import { jsonRes, redirectRes } from "bnkit/server";
import { subscriptions } from "~/db";
import { createStripeCheckoutUrl } from "~/utils/stripe/resources/create-stripe-checkout";
import { stripeCreateCustomerRouteResource } from "~/utils/stripe/resources/create-stripe-customer";
import { stripeCreateCustomerPortalResource } from "~/utils/stripe/resources/create-stripe-customer-portal";
import { renderPage, tag } from "./page-builder";
import { plansPage } from "./pages/plans";
import { RouterTypes } from "./route-types";
import { stripeWebhook } from "./stripe-webhook";
import {authUser} from "~/utils/auth"
export const stripeRoutes: RouterTypes = {
	"/stripe-webhook": {
		post: async (request) => stripeWebhook(request),
	},
	"/checkout": {
		get: async (_, { auth }) => {
			const user = await authUser(auth);

			if (user instanceof Response) return user;

			const userSubscription = subscriptions.readWhere({
				userId: user.id,
			})[0];

			if (!user) {
				return redirectRes("/login");
			}

			return renderPage(
				{
					SECTION: tag.div({
						child: children([
							tag.h1({
								content: "Checkout",
							}),
							tag.p({
								content: `User: ${user.firstName} ${user.lastName}`,
							}),
							tag.p({
								content: `Subscription: ${userSubscription?.id}`,
							}),
							tag.a({
								attributes: {
									href: "/account",
								},
								content: "Go to account",
							}),
						]),
					}),
				},
				user,
			);
		},
	},

	"/create-stripe-checkout": {
		post: async (request, { auth }) => {
			const user = await authUser(auth);

			if (user instanceof Response) return user;

			const checkoutUrl = await createStripeCheckoutUrl(user, request);

			return redirectRes(checkoutUrl);
		},
	},
	"/create-stripe-customer-portal": {
		post: async (_, { auth }) => {
			const user = await authUser(auth);

			if (user instanceof Response) return user;

			const customerPortalUrl = await stripeCreateCustomerPortalResource(user);

			if (!customerPortalUrl) {
				return jsonRes(
					{
						message: "Unable to create customer portal.",
					},
					{ status: 400 },
				);
			}

			return redirectRes(customerPortalUrl);
		},
	},
	"/create-stripe-customer": {
		post: async (_, { auth }) => {
			const user = await authUser(auth);

			if (user instanceof Response) return user;

			await stripeCreateCustomerRouteResource({
				email: user.email,
				firstName: user.firstName,
				id: user.id,
				lastName: user.lastName,
			});

			return redirectRes("/account");
		},
	},
	"/plans": {
		get: async (_, { auth }) => {
			console.log("im here");
			const user = await authUser(auth);

			if (user instanceof Response) return user;

			// may want to pass in the users current plan to the plans page
			return renderPage(plansPage, user);
		},
		post: async (request, { auth }) => {
			const user = await authUser(auth);

			if (user instanceof Response) return user;

			const checkoutUrl = await createStripeCheckoutUrl(user, request);

			return redirectRes(checkoutUrl);
		},
	},
};

type RouteTypes = keyof typeof stripeRoutes;
