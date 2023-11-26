import { jsonRes, redirectRes } from 'bnkit/server';
import { authForm } from '../components/auth-form';
import { db } from '../db/db';
import { subscription, user as userSchema } from '../db/schema';
import { createUser } from '../utils/stripe/auth';
import { createStripeCheckoutUrl } from '../utils/stripe/resources/create-stripe-checkout';
import { stripeCreateCustomerRouteResource } from '../utils/stripe/resources/create-stripe-customer';
import { stripeCreateCustomerPortalResource } from '../utils/stripe/resources/create-stripe-customer-portal';
import { authenticateAndRetrieveUser } from './auth-utils';
import { renderPage } from './page-builder';
import { plansPage } from './pages/plans';
import { RouterTypes } from './route-types';
import { stripeWebhook } from './stripe-webhook';

export const stripeRoutes = {
  '/stripe-webhook': {
    post: async (request) => stripeWebhook(request),
  },
  '/checkout': {
    get: async (_, { auth }) => {
      const user = await authenticateAndRetrieveUser(auth);

      if (user instanceof Response) return user;

      const userSubscription = subscription.readWhere({
        userId: user.id,
      })[0];

      if (!user) {
        return redirectRes('/login');
      }

      return renderPage({
        SECTION: {
          tag: 'div',
          children: {
            h1: {
              tag: 'h1',
              content: 'Checkout',
            },
            p: {
              tag: 'p',
              content: `User: ${user.username}`,
            },
            p2: {
              tag: 'p',
              content: `Subscription: ${userSubscription?.id}`,
            },
            a: {
              tag: 'a',
              attributes: {
                href: '/account',
              },
              content: 'Go to account',
            },
          },
        },
      });
    },
  },
  '/register': {
    get: () => {
      return renderPage({
        REGISTER_FORM: authForm({ register: true }),
      });
    },
    post: async (request) => {
      const formData = await request.formData();
      const username = formData.get('username') as string;
      const password = formData.get('password') as string;
      const email = formData.get('email') as string;

      const confirmPassword = formData.get('confirmPassword') as string;

      if (password !== confirmPassword) {
        return renderPage({
          REGIGSTER_FORM: authForm({ register: true }),
          PASSWORDS_DONT_MATCH: {
            tag: 'div',
            content: 'Passwords do not match.',
          },
        });
      }

      const existingUser = userSchema.readById(username);
      if (existingUser) {
        return renderPage({
          REGIGSTER_FORM: authForm({ register: true }),
          USER_ALREADY_EXISTS: {
            tag: 'div',
            content: 'User already exists. Choose a different username.',
          },
        });
      }

      const user = await createUser(db, {
        password,
        username,
        email,
      });

      if (user) {
        return redirectRes('/login');
      } else {
        return renderPage({
          REGIGSTER_FORM: authForm({ register: true }),
          ERROR_CREATING_USER: {
            tag: 'div',
            content: 'Error creating user. Please try again later.',
          },
        });
      }
    },
  },
  '/create-stripe-checkout': {
    post: async (request, { auth }) => {
      const user = await authenticateAndRetrieveUser(auth);

      if (user instanceof Response) return user;

      const checkoutUrl = await createStripeCheckoutUrl(user, request);

      return redirectRes(checkoutUrl);
    },
  },
  '/create-stripe-customer-portal': {
    post: async (_, { auth }) => {
      const user = await authenticateAndRetrieveUser(auth);

      if (user instanceof Response) return user;

      const customerPortalUrl = await stripeCreateCustomerPortalResource(user);

      if (!customerPortalUrl) {
        return jsonRes(
          {
            message: 'Unable to create customer portal.',
          },
          { status: 400 }
        );
      }

      return redirectRes(customerPortalUrl);
    },
  },
  '/create-stripe-customer': {
    post: async (_, { auth }) => {
      const user = await authenticateAndRetrieveUser(auth);

      if (user instanceof Response) return user;
      await stripeCreateCustomerRouteResource({
        email: user.email,
        firstName: user.firstName,
        id: user.id,
        lastName: user.lastName,
      });

      return redirectRes('/account');
    },
  },
  '/plans': {
    get: async (_, { auth }) => {
      const user = await authenticateAndRetrieveUser(auth);

      if (user instanceof Response) return user;

      // may want to pass in the users current plan to the plans page
      return renderPage(plansPage);
    },
    post: async (request, { auth }) => {
      const user = await authenticateAndRetrieveUser(auth);

      if (user instanceof Response) return user;

      const checkoutUrl = await createStripeCheckoutUrl(user, request);

      return redirectRes(checkoutUrl);
    },
  },
} satisfies RouterTypes;
