import { encodeCookie } from '@bnk/core/modules/cookies';
import {
  Routes,
  htmlRes,
  jsonRes,
  redirectRes,
} from '@bnk/core/modules/server';
import { getLayout } from '../components/layout';
import { db } from '../db/db';
import { user as userSchema } from '../db/schema';
import { middleware } from '../middleware';
import { accountPage } from '../pages/account';
import { builder } from '../pages/builder';
import { homePage } from '../pages/home';
import { loginPage } from '../pages/login';
import { plansPage } from '../pages/plans';
import { registerPage } from '../pages/register';
import { authenticateUserJwt, createUser } from '../utils/stripe/auth';
import { createStripeCheckoutUrl } from '../utils/stripe/resources/create-stripe-checkout';
import { stripeCreateCustomerRouteResource } from '../utils/stripe/resources/create-stripe-customer';
import { stripeCreateCustomerPortalResource } from '../utils/stripe/resources/create-stripe-customer-portal';
import { stripeCreateSubscriptionResource } from '../utils/stripe/resources/create-stripe-subscription';
import { stripeWebhook } from './stripe-webhook';

let count = 0;

export const routes: Routes<typeof middleware> = {
  '/': {
    GET: (request, {}) => {
      count++;

      return builder.response(
        homePage({
          countDisplay: `Count: ${count}`,
        }),
      );
    },
  },
  '/login': {
    GET: (request) => {
      return builder.response(loginPage());
    },
    POST: async (request, { auth }) => {
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
    GET: async (_, { auth }) => {
      console.log({ auth });
      if (auth === null) redirectRes('/login');
      const jwtVerification = await auth?.verifyJwt();

      if (!jwtVerification?.payload) {
        return redirectRes('/login');
      }

      const { userId } = jwtVerification.payload;
      const user = userSchema.readById(userId);

      console.log({user})

      if (!user) {
        return redirectRes('/login');
      }

      return builder.response(
        accountPage({
          user: user,
        }),
      );
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
      if (auth === null) redirectRes('/login');
      const jwtVerification = await auth?.verifyJwt();

      if (!jwtVerification?.payload) {
        return redirectRes('/login');
      }

      const { userId } = jwtVerification.payload;
      const user = userSchema.readById(userId);

      if (!user) {
        return redirectRes('/login');
      }

      const checkoutUrl = await createStripeCheckoutUrl(user, request);

      return redirectRes(checkoutUrl);
    },
  },
  '/create-stripe-customer-portal': {
    POST: async (request, { auth }) => {
      if (auth === null) redirectRes('/login');
      const jwtVerification = await auth?.verifyJwt();

      if (!jwtVerification?.payload) {
        return redirectRes('/login');
      }

      const { userId } = jwtVerification.payload;
      const user = userSchema.readById(userId);

      if (!user) {
        return redirectRes('/login');
      }

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
    POST: async (request, { auth }) => {
      if (auth === null) redirectRes('/login');
      const jwtVerification = await auth?.verifyJwt();

      if (!jwtVerification?.payload) {
        return redirectRes('/login');
      }

      const { userId } = jwtVerification.payload;
      const user = userSchema.readById(userId);

      if (!user) {
        return redirectRes('/login');
      }

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
    GET: async (request, { auth }) => {
      if (auth === null) redirectRes('/login');
      const jwtVerification = await auth?.verifyJwt();

      if (!jwtVerification?.payload) {
        return redirectRes('/login');
      }

      const { userId } = jwtVerification.payload;
      const user = userSchema.readById(userId);

      if (!user) {
        return redirectRes('/login');
      }

      // may want to pass in the users current plan to the plans page
      return builder.response(plansPage);
    },
    POST: async (request, { auth }) => {
      if (auth === null) redirectRes('/login');
      const jwtVerification = await auth?.verifyJwt();

      if (!jwtVerification?.payload) {
        return redirectRes('/login');
      }

      const { userId } = jwtVerification.payload;
      const user = userSchema.readById(userId);

      if (!user) {
        return redirectRes('/login');
      }

      const checkoutUrl = await createStripeCheckoutUrl(user, request);

      return redirectRes(checkoutUrl);
    },
  },
  // '/create-stripe-price': {
  //   POST: async (request, { auth }) => {
  //     if (auth === null) redirectRes('/login');
  //     const jwtVerification = await auth?.verifyJwt();

  //     if (!jwtVerification?.payload) {
  //       return redirectRes('/login');
  //     }

  //     const { userId } = jwtVerification.payload;
  //     const user = userSchema.readById(userId);

  //     if (!user) {
  //       return redirectRes('/login');
  //     }

  //     return redirectRes('/account');
  //   },
  // },
  '/create-stripe-subscription': {
    POST: async (request, { auth }) => {
      if (auth === null) redirectRes('/login');
      const jwtVerification = await auth?.verifyJwt();

      if (!jwtVerification?.payload) {
        return redirectRes('/login');
      }

      const { userId } = jwtVerification.payload;
      const user = userSchema.readById(userId);

      if (!user) {
        return redirectRes('/login');
      }

      const subscription = await stripeCreateSubscriptionResource(user);

      return jsonRes(subscription, {
        status: 200,
      });

      // return redirectRes('/account');
    },
  },

  // '/create-stripe-product': {
  //   POST: async (request, { auth }) => {
  //     if (auth === null) redirectRes('/login');
  //     const jwtVerification = await auth?.verifyJwt();

  //     if (!jwtVerification?.payload) {
  //       return redirectRes('/login');
  //     }

  //     const { userId } = jwtVerification.payload;
  //     const user = userSchema.readById(userId);

  //     const product = createStripeProduct({

  //     })

  //     // if (!user) {
  //     //   return redirectRes('/login');
  //     // }

  //     // return redirectRes('/account');
  //   },
  // },

  '/stripe-webhook': {
    POST: async (request) => stripeWebhook(request),
  },
  '^/assets/.+': {
    GET: (request) => {
      const filename = request.url.split('/assets/')[1];
      return new Response(Bun.file(`./src/assets/${filename}`).stream());
    },
  },
};
