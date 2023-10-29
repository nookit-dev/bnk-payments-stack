import { db } from './db';

export type Price = {
  id: string;
  planId: string;
  amount: number;
  currency: string;
  interval: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type Plan = {
  id: string;
  name: string;
  description?: string;
  active?: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type Subscription = {
  id: string;
  userId: string;
  planId: string;
  priceId: string;
  interval: string;
  status: string;
  currentPeriodStart: number;
  currentPeriodEnd: number;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type User = {
  username: string;
  passwordHash: string;
  id: string;
  salt: string;
  customerId: string; // stripe customer Id
  email?: string;
  firstName: string;
  lastName: string;
};

export type PlanLimit = {
  id: string;
  planId: string;
  // Here you can define your own limits.
  // For example, you could have a limit on the number of items a user can create.
  maxItems: number;
};

export const createPlan = (
  plan: Omit<Plan, 'createdAt' | 'updatedAt'>,
): Plan => {
  const dateNow = new Date();
  const nowString = new Date().toISOString();

  // Construct the SQL query
  const sql = `
    INSERT INTO plan (id, name, description, active, createdAt, updatedAt) 
    VALUES ($id, $name, $description, $active, $createdAt, $updatedAt);
  `;

  // Execute the query
  db.query(sql).run({
    ...plan,
    $createdAt: nowString,
    $updatedAt: nowString,
  });

  // Return the created plan (Note: In a real-world scenario, you might want to retrieve and return the inserted record)
  return {
    ...plan,
    createdAt: dateNow,
    updatedAt: dateNow,
  };
};

export const deletePlanById = (id: Plan['id']): void => {
  db.query(`DELETE FROM plan WHERE id = $id`).run({ $id: id });
};

export const getPlanById = (id: Plan['id']): Plan | null => {
  return (
    (db.query(`SELECT * FROM plan WHERE id = $id`).get({ $id: id }) as Plan) ||
    null
  );
};

export type PlanWithPrices = Plan & {
  prices: Price[];
};

export const getPlanByIdWithPrices = (
  id: Plan['id'],
): PlanWithPrices | null => {
  const plan: Plan | null = db
    .query(`SELECT * FROM plan WHERE id = $id`)
    .get({ $id: id }) as Plan | null;

  if (!plan) return null;

  const prices: Price[] = db
    .query(`SELECT * FROM price WHERE planId = $id`)
    .all({ $id: id }) as Price[];

  return {
    ...plan,
    prices,
  };
};

export const getAllPlans = (): Plan[] => {
  return db.query(`SELECT * FROM plan`).all() as Plan[];
};

export const updatePlanById = (
  id: Plan['id'],
  plan: Partial<Omit<Plan, 'createdAt' | 'updatedAt'>>,
): Plan => {
  // Construct the SET clause dynamically
  const setClause = Object.keys(plan)
    .map((key) => `${key} = $${key}`)
    .join(', ');

  // Execute the update query
  db.query(`UPDATE plan SET ${setClause} WHERE id = $id`).run({
    $id: id,
    ...plan,
  });

  // Fetch and return the updated plan
  const updatedPlan = getPlanById(id);
  if (!updatedPlan) {
    throw new Error('Failed to fetch the updated plan.');
  }
  return updatedPlan;
};

type CreateUpdateSubscription = Omit<Subscription, 'createdAt' | 'updatedAt'>;

export const createSubscription = (
  subscription: CreateUpdateSubscription,
): Subscription | null => {
  const now = new Date().toISOString();

  // Construct the SQL query
  const sql = `
      INSERT INTO subscription (id, userId, planId, priceId, interval, status, currentPeriodStart, currentPeriodEnd, cancelAtPeriodEnd, createdAt, updatedAt) 
      VALUES ($id, $userId, $planId, $priceId, $interval, $status, $currentPeriodStart, $currentPeriodEnd, $cancelAtPeriodEnd, $createdAt, $updatedAt);
    `;

  try {
    // Execute the insert query
    db.query(sql).run({
      ...subscription,
      $createdAt: now,
      $updatedAt: now,
    });

    // Fetch and return the newly created subscription
    const newSubscription = getSubscriptionById(subscription.id);
    if (!newSubscription) {
      throw new Error('Failed to fetch the newly created subscription.');
    }
    return newSubscription;
  } catch (e) {
    console.error(e);
    return null; // Return null if there was an error
  }
};

export const deleteSubscriptionById = (id: Subscription['id']): void => {
  db.query(`DELETE FROM subscription WHERE id = $id`).run({ $id: id });
};

export const getSubscriptionById = (
  id: Subscription['id'],
): Subscription | null => {
  return (
    (db
      .query(`SELECT * FROM subscription WHERE id = $id`)
      .get({ $id: id }) as Subscription) || null
  );
};

export const getSubscriptionByUserId = (
  userId: User['id'],
): Subscription | null => {
  return (
    (db
      .query(`SELECT * FROM subscription WHERE userId = $userId`)
      .get({ $userId: userId }) as Subscription) || null
  );
};

export const updateSubscriptionById = (
  id: Subscription['id'],
  subscription: CreateUpdateSubscription,
): Subscription => {
  // Construct the SET clause dynamically
  const setClause = Object.keys(subscription)
    .map((key) => `${key} = $${key}`)
    .join(', ');
  db.query(`UPDATE subscription SET ${setClause} WHERE id = $id`).run({
    $id: id,
    ...subscription,
  });

  // Fetch and return the updated subscription
  const updatedSubscription = getSubscriptionById(id);
  if (!updatedSubscription) {
    throw new Error('Failed to fetch the updated subscription.');
  }
  return updatedSubscription;
};

export const updateSubscriptionByUserId = (
  subscription: CreateUpdateSubscription,
): Subscription | null => {
  try {
    const setClause = Object.keys(subscription)
      .map((key) => `${key} = $${key}`)
      .join(', ');
    db.query(`UPDATE subscription SET ${setClause} WHERE userId = $userId`).run(
      {
        ...subscription,
        $userId: subscription.userId,
        $updatedAt: new Date().toISOString(),
        f: 'test',
      },
    );

    // Fetch and return the updated subscription
    return getSubscriptionByUserId(subscription.userId);
  } catch (e) {
    throw e;
  }
};

export const getUserByUsername = (username: string): User | null => {
  return (
    (db
      .query(
        `
        SELECT * FROM users WHERE username = $username
    `,
      )
      .get({
        $username: username,
      }) as User) || null
  );
};

export const getUserById = (userId: string): User | null => {
  return (
    (db
      .query(
        `
        SELECT * FROM users WHERE id = $userId
    `,
      )
      .get({
        $userId: userId,
      }) as User) || null
  );
};

export const updateUserById = (
  userId: User['id'],
  updatedFields: Partial<Omit<User, 'id'>>,
): User | null => {
  // Construct the SET clause dynamically
  const setClause = Object.keys(updatedFields)
    .map((key) => `${key} = $${key}`)
    .join(', ');

  // Execute the update query
  db.query(`UPDATE users SET ${setClause} WHERE id = $userId`).run({
    $userId: userId,
    ...updatedFields,
  });

  // Fetch and return the updated user
  return getUserById(userId);
};

export const getUserByCustomerId = (userCustomerId: string) => {
  return (
    (db
      .query(
        `
        SELECT * FROM users WHERE customerId = $userCustomerId
    `,
      )
      .get({
        $userCustomerId: userCustomerId,
      }) as User) || null
  );
};

export const deleteUserById = (userId: User['id']): void => {
  db.query(`DELETE FROM users WHERE id = $userId`).run({ $userId: userId });
};
