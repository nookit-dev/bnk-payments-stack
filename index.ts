import * as bnk from '@bnk/core';
import { routes } from './src/routes';
import { middleware } from './src/middleware';
import { middlewareFactory } from '@bnk/core/modules/server';

const server = bnk.server.serverFactory({
  serve: Bun.serve,
  routes,
  middlewareControl: middlewareFactory(middleware),
});

const port = 3000;
server.start(port);
