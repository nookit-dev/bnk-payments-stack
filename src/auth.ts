import * as bnk from '@bnk/core';
import { v7 as uuid } from '@bnk/core/modules/uuid';
import { jwtBack } from '@bnk/core/modules/jwt';
import Database from 'bun:sqlite';
import { createToken, verifyToken } from '@bnk/core/modules/auth';

export type User = {
  username: string;
  password_hash: string;
  id: string;
  salt: string;
};

export const jwtSecret = 'SQ43KRet';
export const jwtFactory = jwtBack({
  factorySignSecret: jwtSecret,
  handlers: bnk.jwt.createJwtFileHandlers('./jwts.json'),
});

export const getTokenExpireEpoch = (date: Date, tokenValidTimeSec: number) => {
  const expireEpoch = date.getTime() + tokenValidTimeSec;

  return expireEpoch;
};

export async function createUser(
  db: Database,
  {
    username,
    password,
  }: {
    username: string;
    password: string;
  },
) {
  try {
    const salt = uuid();
    const passwordHash = await createToken(password, salt);
    const userId = uuid();

    const params = {
      $id: userId,
      $username: username,
      $password_hash: passwordHash,
      $salt: salt,
    };
    db.query(
      `
        INSERT INTO users (id, username, password_hash, salt)
        VALUES ($id, $username, $password_hash, $salt)
      `,
    ).run(params);

    console.info('User inserted:', userId);

    return getUserById(db, username);
  } catch (e) {
    console.error({ e, note: 'user creation error' });
    return null;
  }
}

export async function loginUser(
  db: Database,
  username: string,
  password: string,
): Promise<{ user: User; token: string } | null> {
  const existingUser = getUserById(db, username);
  if (!existingUser) {
    console.info('User does not exist:', username);
    return null;
  }

  const isMatch = await verifyToken(
    password,
    existingUser.salt,
    existingUser.password_hash,
  );

  if (!isMatch) {
    console.info('Password is incorrect for user:', existingUser.username);
    return null;
  }

  const jwtPayload = {
    userId: existingUser.id,
    username: existingUser.username,
  };

  const token = jwtFactory.createJwt({
    payload: jwtPayload,
  });

  return { user: existingUser, token };
}

export async function authenticateUserJwt(
  db: Database,
  username: string,
  password: string,
) {
  const existingUser = getUserByUsername(db, username);

  if (!existingUser) {
    console.info('User does not exist:', username);
    return null;
  }

  const isMatch = await verifyToken(
    password,
    existingUser.salt,
    existingUser.password_hash,
  );

  if (!isMatch) {
    console.info('Password is incorrect for user:', existingUser.username);
    return null;
  }

  const jwtPayload = {
    userId: existingUser.id,
    username: existingUser.username,
  };

  const token = await jwtFactory.createJwt({
    payload: jwtPayload,
  });

  return { user: existingUser, token };
}

export const getUserByUsername = (
  db: Database,
  username: string,
): User | null => {
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

export const getUserById = (db: Database, userId: string): User | null => {
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
