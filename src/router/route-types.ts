import { InferMiddlewareDataMap, Routes } from 'bnkit/server';
import { middleware } from '../middleware';

export type RouterTypes = Routes<{ middleware: typeof middleware }>;

export type AppRoute = (
  request: Request,
  middlewareOpt?: InferMiddlewareDataMap<typeof middleware>
) => Response | Promise<Response>;
