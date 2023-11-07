import { encodeCookie } from '@bnk/core/modules/cookies';
import {
  Routes,
  htmlRes,
  jsonRes,
  redirectRes,
} from '@bnk/core/modules/server';
import { getLayout } from '../components/layout';
import { db } from '../db/db';
import { subscription, user as userSchema } from '../db/schema';
import { middleware } from '../middleware';
import { authenticateUserJwt, createUser } from '../utils/stripe/auth';
import { createStripeCheckoutUrl } from '../utils/stripe/resources/create-stripe-checkout';
import { stripeCreateCustomerRouteResource } from '../utils/stripe/resources/create-stripe-customer';
import { stripeCreateCustomerPortalResource } from '../utils/stripe/resources/create-stripe-customer-portal';
import { accountPage } from './routes/account';
import { builder } from './routes/builder';
import { homePage } from './routes/home';
import { loginPage } from './routes/login';
import { plansPage } from './routes/plans';
import { registerPage } from './routes/register';
import { stripeWebhook } from './stripe-webhook';

const authenticateAndRetrieveUser = async (
  auth: ReturnType<(typeof middleware)['auth']>,
  redirectOnFailure = true,
) => {
  if (auth === null) {
    return redirectRes('/login');
  }

  const jwtVerification = await auth.verifyJwt();
  if (!jwtVerification?.payload) {
    return redirectRes('/login');
  }

  const { userId } = jwtVerification.payload;
  const user = userSchema.readById(userId);

  if (!user) {
    return redirectRes('/login');
  }

  return user;
};

export const routes: Routes<typeof middleware> = {
  '/': {
    GET: () => {
      return builder.response(homePage());
    },
  },
  '/login': {
    GET: () => {
      return builder.response(loginPage());
    },
    POST: async (request) => {
      try {
        const formData = await request.formData();
        const username = formData.get('username') as string;
        const password = formData.get('password') as string;

        const authResult = await authenticateUserJwt(db, username, password);

        if (!authResult?.user) {
          return jsonRes({
            message: 'invalid username or password',
          });
        }

        const { token } = authResult;

        const jwtCookie = encodeCookie('jwt', token, {
          httpOnly: true,
          secure: true,
          sameSite: 'Strict',
        });

        const response = builder.response(
          getLayout({
            children: {
              SECTION: {
                tag: 'div',
                children: {
                  h1: {
                    tag: 'h1',
                    content: 'Logged in',
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
            },
          }),
        );

        response.headers.append('Set-Cookie', jwtCookie);

        return response;
      } catch (e) {
        console.error(e);
        return jsonRes({
          message: 'We ran into an error on our end. Please try again later.',
        });
      }
    },
  },
  '/account': {
    GET: async (request, { auth }) => {
      const authRes = await authenticateAndRetrieveUser(auth);

      if (authRes instanceof Response) return authRes; // Early return if Response is received

      // Now we have the authenticated user from the middleware
      return builder.response(accountPage({ user: authRes }));
    },
  },
  '/register': {
    GET: () => {
      return builder.response(registerPage());
    },
    POST: async (request) => {
      const formData = await request.formData();
      const username = formData.get('username') as string;
      const password = formData.get('password') as string;
      const email = formData.get('email') as string;

      const confirmPassword = formData.get('confirmPassword') as string;

      if (password !== confirmPassword) {
        return htmlRes('<div>Passwords do not match. Please try again.</div>');
      }

      const existingUser = userSchema.readById(username);
      if (existingUser) {
        return htmlRes(
          '<div>User already exists. Choose a different username.</div>',
        );
      }

      const user = await createUser(db, {
        password,
        username,
        email,
      });

      if (user) {
        return redirectRes('/login');
      } else {
        return htmlRes('<div>Registration failed. Please try again.</div>');
      }
    },
  },
  '/create-stripe-checkout': {
    POST: async (request, { auth }) => {
      const user = await authenticateAndRetrieveUser(auth);

      if (user instanceof Response) return user;

      const checkoutUrl = await createStripeCheckoutUrl(user, request);

      return redirectRes(checkoutUrl);
    },
  },
  '/create-stripe-customer-portal': {
    POST: async (_, { auth }) => {
      const user = await authenticateAndRetrieveUser(auth);

      if (user instanceof Response) return user;

      const customerPortalUrl = await stripeCreateCustomerPortalResource(user);

      if (!customerPortalUrl) {
        return jsonRes(
          {
            message: 'Unable to create customer portal.',
          },
          { status: 400 },
        );
      }

      return redirectRes(customerPortalUrl);
    },
  },
  '/create-stripe-customer': {
    POST: async (_, { auth }) => {
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
    GET: async (_, { auth }) => {
      const user = await authenticateAndRetrieveUser(auth);

      if (user instanceof Response) return user;

      // may want to pass in the users current plan to the plans page
      return builder.response(plansPage);
    },
    POST: async (request, { auth }) => {
      const user = await authenticateAndRetrieveUser(auth);

      if (user instanceof Response) return user;

      const checkoutUrl = await createStripeCheckoutUrl(user, request);

      return redirectRes(checkoutUrl);
    },
  },
  '/stripe-webhook': {
    POST: async (request) => stripeWebhook(request),
  },
  '/checkout': {
    GET: async (_, { auth }) => {
      const user = await authenticateAndRetrieveUser(auth);

      if (user instanceof Response) return user;

      const userSubscription = subscription.readItemsWhere({
        userId: user.id,
      })[0];

      if (!user) {
        return redirectRes('/login');
      }21qw2

      return builder.response(
        getLayout({
          children: {
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
          },
        }),
      );
    },
  },
  '^/assets/.+': {
    GET: (request) => {
      const filename = request.url.split('/assets/')[1];
      return new Response(Bun.file(`./src/assets/${filename}`).stream());
    },
  },
};
