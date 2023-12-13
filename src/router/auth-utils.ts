import { redirectRes } from 'bnkit/server';
import { users } from '../db/schema';
import { middleware } from '../middleware';

export const authenticateAndRetrieveUser = async (
  auth: ReturnType<(typeof middleware)['auth']>
) => {
  if (auth === null) {
    return redirectRes('/login');
  }

  const jwtVerification = await auth.verifyJwt();
  if (!jwtVerification?.payload) {
    return redirectRes('/login');
  }

  const { userId } = jwtVerification.payload;
  const user = users.getById(userId);

  if (!user) {
    return redirectRes('/login');
  }

  return user;
};
