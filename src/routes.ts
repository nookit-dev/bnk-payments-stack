import { middleware } from './middleware';
import {
  Routes,
  htmlRes,
  jsonRes,
  redirectRes,
} from '@bnk/core/modules/server';
import { getPage } from './home-page-config';
import { encodeCookie } from '@bnk/core/modules/cookies';
import {
  authenticateUserJwt,
  createUser,
  getUserById,
} from './auth';
import { db } from './db';
import { htmlFactory, cc } from '@bnk/core/modules/htmlody';

let count = 0;

export const routes: Routes<typeof middleware> = {
  '/': {
    GET: (request, {}) => {
      count++;

      const htmlody = htmlFactory(
        {
          title: 'HTMLody template',
        },
        getPage({
          countDisplay: `Count: ${count}`,
        }),
        {},
      );
      const html = htmlody.getHtmlOut();

      return htmlRes(html);
    },
  },
  '/login': {
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

        const response = htmlRes(`<div>
          <h1>Logged in</h1>
          <a href="/account">Go to account</a>
          </div>
          `);

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

      const htmlody = htmlFactory(
        {
          title: 'HTMLody template',
        },
        {
          account: {
            tag: 'div',
            cr: cc(['flex', 'flex-col', 'p-8', 'items-center']),
            children: {
              username: {
                tag: 'div',
                content: 'Username: ' + user.username,
              },
            },
          },
        },
        {},
      );
      const html = htmlody.getHtmlOut();

      return htmlRes(html);
    },
  },
  '/register': {
    GET: () => {
      // Serve the registration page.
      // This could be a simple HTML form that posts to '/register-action'.
      // For simplicity, I'm just describing it, but you'd replace this with your actual registration page content.
      const html = `
    <form action="/register" method="post">
      <input type="text" name="username" placeholder="Username" required>
      <input type="password" name="password" placeholder="Password" required>
      <input type="password" name="verifyPassword" placeholder="Password" required>
      <button type="submit">Register</button>
    </form>
  `;
      return htmlRes(html);
    },

    POST: async (request) => {
      const formData = await request.formData();
      const username = formData.get('username') as string;
      const password = formData.get('password') as string;
      const verifyPassword = formData.get('verifyPassword') as string;

      if (password !== verifyPassword) {
        return htmlRes('<div>Passwords do not match. Please try again.</div>');
      }

      // Check if user already exists
      const existingUser = getUserById(db, username);
      if (existingUser) {
        return htmlRes(
          '<div>User already exists. Choose a different username.</div>',
        );
      }

      // Create the user
      const user = await createUser(db, {
        password,
        username,
      });

      if (user) {
        // Redirect to login or some other page after successful registration
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
