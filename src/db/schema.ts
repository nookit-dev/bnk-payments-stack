import { createSqliteFactory } from '@bnk/core/modules/sqlite';
import { db } from './db';

export const dbFactory = createSqliteFactory({
  db,
  enableForeignKeys: true,
});

export const price = dbFactory.dbTableFactory({
  tableName: 'price',
  schema: {
    id: { primaryKey: true, type: 'TEXT' },
    planId: { type: 'TEXT', foreignKey: 'plan(id)' },
    amount: { type: 'INTEGER' },
    currency: { type: 'TEXT' },
    interval: { type: 'TEXT' },
    active: { type: 'INTEGER' },
    createdAt: { type: 'TEXT' },
    updatedAt: { type: 'TEXT' },
  },
});

export type Price = ReturnType<typeof price.infer>;

export const plan = dbFactory.dbTableFactory({
  tableName: 'plan',
  schema: {
    id: { primaryKey: true, type: 'TEXT' },
    name: { type: 'TEXT' },
    description: { type: 'TEXT' },
    active: { type: 'INTEGER' },
    createdAt: { type: 'TEXT' },
    updatedAt: { type: 'TEXT' },
  },
});

export type Plan = ReturnType<typeof plan.infer>;

export const subscription = dbFactory.dbTableFactory({
  tableName: 'subscription',
  schema: {
    id: { primaryKey: true, type: 'TEXT' },
    userId: { type: 'TEXT' },
    planId: { type: 'TEXT' },
    priceId: { type: 'TEXT' },
    interval: { type: 'TEXT' },
    status: { type: 'TEXT' },
    currentPeriodStart: { type: 'INTEGER' },
    currentPeriodEnd: { type: 'INTEGER' },
    cancelAtPeriodEnd: { type: 'INTEGER' },
    createdAt: { type: 'TEXT' },
    updatedAt: { type: 'TEXT' },
  },
});

export type Subscription = ReturnType<typeof subscription.infer>;

export const user = dbFactory.dbTableFactory({
  tableName: 'users',
  schema: {
    id: { primaryKey: true, type: 'TEXT' },
    username: { type: 'TEXT' },
    passwordHash: { type: 'TEXT' },
    salt: { type: 'TEXT' },
    customerId: { type: 'TEXT' },
    email: { type: 'TEXT' },
    firstName: { type: 'TEXT' },
    lastName: { type: 'TEXT' },
  },
});

export type User = ReturnType<typeof user.infer>;

export const planLimit = dbFactory.dbTableFactory({
  tableName: 'planLimit',
  schema: {
    id: { primaryKey: true, type: 'TEXT' },
    planId: { type: 'TEXT' },
    maxItems: { type: 'INTEGER' },
  },
});

export type PlanLimit = ReturnType<typeof planLimit.infer>;
