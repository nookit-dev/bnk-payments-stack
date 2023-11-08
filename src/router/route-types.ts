import { Routes } from '@bnk/core/modules/server';
import { middleware } from '../middleware';

export type AppRoutes = Routes<typeof middleware>;



