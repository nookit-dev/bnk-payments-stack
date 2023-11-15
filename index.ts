import { middlewareFactory, serverFactory } from 'bnkit/server';
import { middleware } from './src/middleware';
import { routes } from './src/router/routes';

const server = serverFactory({
  routes,
  middleware: middlewareFactory(middleware),
});

server.start();


