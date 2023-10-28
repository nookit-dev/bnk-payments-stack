import { registerPage } from './pages/register';
import { middleware } from './middleware';
import {
  Routes,
  htmlRes,
  jsonRes,
  redirectRes,
} from '@bnk/core/modules/server';
import { homePage } from './pages/home';
import { encodeCookie } from '@bnk/core/modules/cookies';
import { authenticateUserJwt, createUser, getUserById } from './auth';
import { db } from './db';
import { pageGenerator } from '@bnk/core/modules/htmlody';
import { accountPage } from './pages/account';
import { getLayout } from './components/layout';

let count = 0;

const htmlody = pageGenerator({
  title: 'HTMLody template',
});

export const routes: Routes<typeof middleware> = {
  '/': {
    GET: (request, {}) => {
      count++;

      return htmlody.response(
        homePage({
          countDisplay: `Count: ${count}`,
        }),
      );
    },
  },
  '/login': {
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

        const response = htmlody.response(
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
      if (auth === null) redirectRes('/login');
      const jwtVerification = await auth?.verifyJwt();

      if (!jwtVerification?.payload) {
        return redirectRes('/login');
      }

      const { userId } = jwtVerification.payload;
      const user = getUserById(db, userId);

      if (!user) {
        return redirectRes('/login');
      }

      return htmlody.response(
        accountPage({
          username: user.username,
        }),
      );
    },
  },
  '/register': {
    GET: () => {
      return htmlody.response(registerPage());
    },
    POST: async (request) => {
      const formData = await request.formData();
      const username = formData.get('username') as string;
      const password = formData.get('password') as string;
      const verifyPassword = formData.get('verifyPassword') as string;

      if (password !== verifyPassword) {
        return htmlRes('<div>Passwords do not match. Please try again.</div>');
      }

      const existingUser = getUserById(db, username);
      if (existingUser) {
        return htmlRes(
          '<div>User already exists. Choose a different username.</div>',
        );
      }

      const user = await createUser(db, {
        password,
        username,
      });

      if (user) {
        return redirectRes('/login');
      } else {
        return htmlRes('<div>Registration failed. Please try again.</div>');
      }
    },
  },
  '^/assets/.+': {
    GET: (request) => {
      const filename = request.url.split('/assets/')[1];
      return new Response(Bun.file(`./src/assets/${filename}`).stream());
    },
  },
};
