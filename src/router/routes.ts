import { initGoogleOAuth, oAuthFactory } from 'bnkit/auth';
import { encodeCookie } from 'bnkit/cookies';
import { JsonTagElNode, cc, children } from 'bnkit/htmlody';
import { Routes, htmlRes, jsonRes, redirectRes } from 'bnkit/server';
import { HttpMethod } from 'bnkit/utils/http-types';
import { authForm } from '../components/auth-form';
import { hostURL, isDev } from '../config';
import { db } from '../db/db';
import {
  Shortcut,
  shortcutCollection,
  shortcutGroup,
  subscription,
  user as userSchema,
} from '../db/schema';
import { middleware } from '../middleware';
import { authenticateUserJwt, createUser } from '../utils/stripe/auth';
import { createStripeCheckoutUrl } from '../utils/stripe/resources/create-stripe-checkout';
import { stripeCreateCustomerRouteResource } from '../utils/stripe/resources/create-stripe-customer';
import { stripeCreateCustomerPortalResource } from '../utils/stripe/resources/create-stripe-customer-portal';
import { ShortcutGroup, shortcut } from './../db/schema';
import { builder, msgWarp, renderPage } from './page-builder';
import { accountPage } from './routes/account';
import { plansPage } from './routes/plans';
import { stripeWebhook } from './stripe-webhook';

const oauthCallbackUri = '/oauth-callback';

const googleClientId = Bun.env.GOOGLE_OAUTH_CLIENT_ID || '';
const googleClientSecret = Bun.env.GOOGLE_OAUTH_CLIENT_SECRET || '';

const googleOAuthConfig = initGoogleOAuth(
  {
    clientId: googleClientId,
    clientSecret: googleClientSecret,
  },
  {
    redirectUrl: hostURL + oauthCallbackUri,
  }
);

const googleOAuth = oAuthFactory(googleOAuthConfig);

const authenticateAndRetrieveUser = async (
  auth: ReturnType<(typeof middleware)['auth']>
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

const methodActionMap: Record<HttpMethod | string, string> = {
  POST: 'to',
  GET: 'from',
};

const actionButton = ({
  content,
  method = 'POST',
  uri,
}: {
  content?: string;
  method?: HttpMethod;
  uri: string;
}): JsonTagElNode => {
  const actionText = methodActionMap[method] || 'to';

  return {
    // tag: 'form',
    // children: {
    // GOOGLE: {
    // {
    tag: 'button',
    content: content ? content : `${method} ${actionText} ${uri}`,

    attributes: {
      // type: 'submit',
      // method: 'POST',
      // action: uri,
      onclick: `window.location.href='/google-oauth'`, // todo change
    },
  };
  // },
  // };
};

export const routes = {
  '/': {
    GET: () => {
      return renderPage({
        COUNTER: {
          tag: 'section',
          cr: cc(['flex', 'flex-col', 'justify-center', 'items-center', 'p-8']),
          children: children([
            {
              tag: 'h2',
              content: 'Counter',
              cr: cc(['text-3xl', 'font-bold', 'mb-4']),
              attributes: {
                itemprop: 'headline',
              },
            },
          ]),
        },
      });
    },
  },
  '/apps': {
    GET: () => {
      const collections = shortcutCollection.readAll();

      return renderPage({
        APPS: {
          tag: 'section',
          cr: cc(['flex', 'flex-col', 'justify-center', 'items-center', 'p-8']),
          children: children([
            {
              tag: 'h2',
              content: 'Apps',
              cr: cc(['text-3xl', 'font-bold', 'mb-4']),
              attributes: {
                itemprop: 'headline',
              },
            },
            {
              tag: 'ul',
              children: children(
                collections.map((collection) => ({
                  tag: 'li',
                  children: children([
                    {
                      tag: 'a',
                      attributes: {
                        href: '/app?id=' + collection.id,
                      },
                      content: collection.name,
                    },
                  ]),
                }))
              ),
            },
          ]),
        },
      });
    },
  },
  '/app': {
    GET: (request) => {
      const queryParams = new URLSearchParams(request.url.split('?')[1]);

      const id = queryParams.get('id');

      if (!id) {
        return htmlRes('No id provided', { status: 400 });
      }

      const collectionGroups = shortcutGroup.readItemsWhere({
        collectionId: id,
      });

      // load the shortcuts for each group
      const groups = collectionGroups.map((group) => {
        const shortcuts = shortcut.readItemsWhere({
          groupId: group.id,
        });

        return {
          group: group,
          shortcuts: shortcuts,
        };
      });

      // create map of group id to shortcuts, maintain typesafety
      const groupMap: Record<
        string,
        { shortcut: Shortcut[]; group: ShortcutGroup }
      > = {};

      groups.forEach((group) => {
        groupMap[group.group.id] = {
          group: group.group,
          shortcut: group.shortcuts,
        };
      });

      console.log(JSON.stringify({ groupMap, groups }, null, 2));

      return renderPage({
        APP: {
          tag: 'section',
          cr: cc(['flex', 'flex-col', 'justify-center', 'items-center', 'p-8']),
          children: children([
            {
              tag: 'h2',
              content: 'App',
              cr: cc(['text-3xl', 'font-bold', 'mb-4']),
              attributes: {
                itemprop: 'headline',
              },
            },
            {
              tag: 'ul',
              children: children(
                // render each key shortcut within the group
                Object.keys(groupMap).map((groupId) => {
                  const group = groupMap[groupId].group;
                  const shortcuts = groupMap[groupId].shortcut;

                  return {
                    tag: 'li',
                    children: children([
                      {
                        tag: 'h3',
                        cr: cc(['text-2xl']),
                        children: children([
                          // span
                          {
                            tag: 'span',
                            cr: cc(['mr-2']),
                            content: group.emoji,
                          },
                          // h3
                          {
                            tag: 'span',
                            content: group.name,
                          },
                        ]),
                      },
                      {
                        tag: 'div',
                        // evenly layout using grid
                        cr: cc(['grid', 'grid-cols-6', 'gap-4']),
                        children: children(
                          shortcuts.map((shortcut) => ({
                            cr: cc([
                              'p-4',
                              'border',
                              'border-gray-200',
                              'shadow-md',
                              'rounded-md',
                            ]),
                            tag: 'div',
                            children: children([
                              {
                                tag: 'h4',
                                content: shortcut.keys,
                              },
                              {
                                tag: 'p',
                                content: shortcut.description,
                              },
                              {
                                tag: 'hr',
                              },
                            ]),
                          }))
                        ),
                      },
                    ]),
                  };
                })
              ),
            },
          ]),
        },
      });
    },
  },

  '/login': {
    GET: async (_, { auth }) => {
      const loginPage = () =>
        renderPage({
          LOGIN_FORM: authForm({ register: false }),
          OAUTH: actionButton({
            uri: '/google-auth',
          }),
          // {
          //   tag: 'form',
          //   children: {
          //     GOOGLE: {
          //       tag: 'button',
          //       content: 'Login With Google',
          //       attributes: {
          //         type: 'submit',
          //         method: 'POST',
          //       },
          //     },
          //   },
          // },
        });

      if (auth) {
        try {
          const result = await auth?.verifyJwt();
          if (result?.payload) {
            return redirectRes('/account');
          }
        } catch (e) {
          return loginPage();
        }
      }

      return loginPage();
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

        return redirectRes('/account', {
          headers: {
            'Set-Cookie': jwtCookie,
          },
        });
      } catch (e) {
        console.error(e);
        return jsonRes({
          message: 'We ran into an error on our end. Please try again later.',
        });
      }
    },
  },
  '/google-oauth': {
    GET: () => {
      const authUrl = googleOAuth.initiateOAuthFlow();

      return new Response(null, {
        headers: { Location: authUrl },
        status: 302,
      });
    },
  },
  [oauthCallbackUri]: {
    GET: async (req) => {
      try {
        const host = req.headers.get('host');
        // Parse the URL and query parameters
        const url = new URL(req.url, `http://${host}`);
        const queryParams = new URLSearchParams(url.search);
        const code = queryParams.get('code');

        if (!code) {
          return new Response('No code provided in query', { status: 400 });
        }

        const tokenInfo = await googleOAuth.handleRedirect(code);

        console.log({ tokenInfo });

        // Logic after successful authentication
        return new Response('Login Successful!');
      } catch (error) {
        console.error(error);
        return new Response('Authentication failed', { status: 500 });
      }
    },
  },
  '/logout': {
    POST: async (_) => {
      return redirectRes('/login', {
        headers: {
          'Set-Cookie': encodeCookie('jwt', '', {
            httpOnly: true,
            secure: true,
            sameSite: 'Strict',
          }),
        },
      });
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
      return renderPage({
        REGISTER_FORM: authForm({ register: true }),
      });
    },
    POST: async (request) => {
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
          { status: 400 }
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
      return renderPage(plansPage);
    },
    POST: async (request, { auth }) => {
      const user = await authenticateAndRetrieveUser(auth);

      if (user instanceof Response) return user;

      const checkoutUrl = await createStripeCheckoutUrl(user, request);

      return redirectRes(checkoutUrl);
    },
  },
  //  this renders the page template along with a node to mount html from over the wire from /messages
  '/warp-test': {
    GET: () => {
      return renderPage({
        TURBO_FRAME: msgWarp.docNodeMount({
          tag: 'h1',
          content: 'Loading..',
        }),
      });
    },
  },
  // when the above route is hit, msgWarp.docNodeMount creates a request to /messasges, and  pushNode takes in
  // htmlody nodes and mounts them to the turbo-frame on the client as fully rendered html over the wire
  '/messages': {
    GET: () =>
      msgWarp.pushNode({
        tag: 'h1',
        content: 'Over the wire whattttttt',
      }),
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
  '^/assets/.+': {
    GET: (request) => {
      const filename = request.url.split('/assets/')[1];
      return new Response(Bun.file(`./src/assets/${filename}`).stream());
    },
  },
} satisfies Routes<{ middleware: typeof middleware }>;

if (isDev) {
  const routeKeys = Object.keys(routes) as (keyof typeof routes)[];

  routeKeys.forEach((routeKey) => {
    // check if key is regex
    if (routeKey.startsWith('^')) {
      console.info(`Regex: ${routeKey.slice(1)}`);
      return;
    }

    // console.log(routes[routeKey]);
    const routeMethods = Object.keys(routes[routeKey]) as HttpMethod[];

    console.info(`${hostURL}${routeKey} - ${routeMethods.join(', ')}`);
  });
}
