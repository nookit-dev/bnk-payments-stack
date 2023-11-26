import { initGoogleOAuth, oAuthFactory } from 'bnkit/auth';
import { encodeCookie } from 'bnkit/cookies';
import { jsonRes, redirectRes } from 'bnkit/server';
import { actionButton } from '../components/action-button';
import { authForm } from '../components/auth-form';
import { hostURL } from '../config';
import { db } from '../db/db';
import { authenticateUserJwt } from '../utils/stripe/auth';
import { renderPage } from './page-builder';
import { accountPage as AccountPage } from './pages/account';
import type { RouterTypes } from './route-types';

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

export const authRoutes = {
  '/account': {
    get: AccountPage,
  },
  '/login': {
    get: async (_, { auth }) => {
      const loginPage = () =>
        renderPage({
          LOGIN_FORM: authForm({ register: false }),
          OAUTH: actionButton({
            uri: '/google-auth',
          }),
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
    post: async (request) => {
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
    get: () => {
      const authUrl = googleOAuth.initiateOAuthFlow();

      return new Response(null, {
        headers: { Location: authUrl },
        status: 302,
      });
    },
  },
  [oauthCallbackUri]: {
    get: async (req) => {
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

        // Logic after successful authentication
        return new Response('Login Successful!');
      } catch (error) {
        console.error(error);
        return new Response('Authentication failed', { status: 500 });
      }
    },
  },
  '/logout': {
    post: async () => {
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
} satisfies RouterTypes;
