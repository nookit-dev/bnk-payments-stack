import * as bnk from '@bnk/core';
import { Routes } from '@bnk/core/modules/server';
import { getPage } from './page-config';
import { encodeCookie } from '@bnk/core/modules/cookies';
import {
  authenticateUserJwt,
  createUser,
  getTokenExpireEpoch,
  getUser,
} from './auth';
import { db } from './db';
import { createToken } from '@bnk/core/modules/auth';

let count = 0;

export type UserJWTPayload = {
  userId: string;
  username: string;
};

const jwtSecret = 'SQ43KRet';
const jwtFactory = bnk.jwt.jwtBack<UserJWTPayload>({
  factorySignSecret: jwtSecret,
  handlers: bnk.jwt.createJwtFileHandlers('./jwts.json'),
});

const headersToObj = (headers: Headers) => {
  const obj: Record<string, string> = {};

  for (const [key, value] of headers.entries()) {
    obj[key] = value;
  }

  return obj;
};

export const createSecurityToken = async (
  tokenValidTime: number = 1000 * 60 * 60 * 24, // 24 hours
) => {
  const salt = bnk.uuid.v7();
  const { uuid: tokenId, timestamp } = bnk.uuid.v7({
    returnTimestamp: true,
  });
  const securityToken = await createToken(tokenId, salt);
  const tokenExpireEpoch = getTokenExpireEpoch(timestamp, tokenValidTime);

  return {
    securityToken,
    tokenId,
    tokenExpireEpoch,
  };
};

export const routes: Routes = {
  '/': {
    GET: (request) => {
      count++;

      const htmlody = bnk.htmlody.htmlFactory(
        {
          title: 'HTMLody template',
        },
        getPage({
          countDisplay: `Count: ${count}`,
        }),
        {},
      );
      const html = htmlody.getHtmlOut();

      return bnk.server.htmlRes(html);
    },
  },
  '/login': {
    POST: async (request) => {
      try {
        console.log({ message: 'at login' });

        const formData = await request.formData();
        const username = formData.get('username') as string;
        const password = formData.get('password') as string;

        console.log({ headers: headersToObj(request.headers) });

        const authResult = await authenticateUserJwt(db, username, password);
        console.log(authResult);

        if (!authResult?.user) {
          return bnk.server.jsonRes({
            message: 'invalid username or password',
          });
        }

        const { token } = authResult;

        const jwtCookie = encodeCookie('jwt', token, {
          httpOnly: true,
          secure: true,
          sameSite: 'Strict',
        });

        console.log(jwtCookie);

        // const response = bnk.server.redirectRes('/account');
        const response = bnk.server.htmlRes(`<div>
          <h1>Logged in</h1>
          <a href="/account">Go to account</a>
          </div>
          `);

        response.headers.append('Set-Cookie', jwtCookie);

        return response;
      } catch (e) {
        console.error(e);
        return bnk.server.jsonRes({
          message: 'We ran into an error on our end. Please try again later.',
        });
      }
    },
  },
  '/account': {
    GET: async (request) => {
      const jwtCookie = request.headers.get('Cookie');

      const cookieFactory = bnk.cookies.createServerCookieFactory('jwt', {
        request,
      });

      console.log(cookieFactory.getCookie());

      console.log(jwtCookie);
      if (!jwtCookie) {
        return bnk.server.redirectRes('/login');
      }

      const token = jwtCookie.split('jwt=')[1];
      const jwtVerification = await jwtFactory.verifyJwt(token);
      if (!jwtVerification.payload) {
        return bnk.server.redirectRes('/login');
      }

      const { userId } = jwtVerification.payload;
      const user = getUser(db, userId);

      if (!user) {
        return bnk.server.redirectRes('/login');
      }

      const htmlody = bnk.htmlody.htmlFactory(
        {
          title: 'HTMLody template',
        },
        {
          account: {
            tag: 'div',
            cr: bnk.htmlody.cc(['flex', 'flex-col', 'p-8', 'items-center']),
            children: {
              username: {
                tag: 'div',
                content: user.username,
              },
            },
          },
        },
        {},
      );
      const html = htmlody.getHtmlOut();

      return bnk.server.htmlRes(html);
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
      return bnk.server.htmlRes(html);
    },

    POST: async (request) => {
      const formData = await request.formData();
      const username = formData.get('username') as string;
      const password = formData.get('password') as string;
      const verifyPassword = formData.get('verifyPassword') as string;

      if (password !== verifyPassword) {
        return bnk.server.htmlRes(
          '<div>Passwords do not match. Please try again.</div>',
        );
      }

      // Check if user already exists
      const existingUser = getUser(db, username);
      if (existingUser) {
        return bnk.server.htmlRes(
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
        return bnk.server.redirectRes('/login');
      } else {
        return bnk.server.htmlRes(
          '<div>Registration failed. Please try again.</div>',
        );
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
