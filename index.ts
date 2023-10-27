import * as bnk from "@bnk/core";
import { routes } from "./src/routes";

const server = bnk.server.serverFactory({
  serve: Bun.serve,
  routes,
});

const port = 3000
server.start(port);
