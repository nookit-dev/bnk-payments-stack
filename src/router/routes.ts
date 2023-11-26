import { cc, children } from 'bnkit/htmlody';
import { Routes } from 'bnkit/server';
import { HTTPMethod } from 'bnkit/utils/http-types';
import { hostURL, isDev } from '../config';
import { middleware } from '../middleware';
import { authRoutes } from './auth-routes';
import { msgWarp, renderPage } from './page-builder';
import { stripeRoutes } from './stripe-routes';

export const routes = {
  '/': {
    get: () => {
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

  '^/assets/.+': {
    get: (request) => {
      const filename = request.url.split('/assets/')[1];
      return new Response(Bun.file(`./src/assets/${filename}`).stream());
    },
  },
  ...authRoutes,
  ...stripeRoutes,
  //  this renders the page template along with a node to mount html from over the wire from /messages
  '/warp-test': {
    get: () => {
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
    get: () =>
      msgWarp.pushNode({
        tag: 'h1',
        content: 'Over the wire what?',
      }),
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
    const routeMethods = Object.keys(routes[routeKey]) as HTTPMethod[];

    console.info(`${hostURL}${routeKey} - ${routeMethods.join(', ')}`);
  });
}
