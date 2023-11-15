import { createServerCookieFactory } from 'bnkit/cookies';
import { createJwtFileHandlers, jwtBack } from 'bnkit/jwt';
import { MiddlewareConfigMap } from 'bnkit/server';

export type UserJWTPayload = {
  userId: string;
  username: string;
};

export const jwtSecret = 'SQ43KRet';
export const jwtFactory = jwtBack<UserJWTPayload>({
  factorySignSecret: jwtSecret,
  handlers: createJwtFileHandlers('./jwts.json'),
});

export const middleware = {
  auth: (request) => {
    const cookieFactory = createServerCookieFactory('jwt', {
      request,
    });

    const jwt = cookieFactory.getCookie();

    if (!jwt) {
      return null;
    }

    const verifyJwt = () => jwtFactory.verifyJwt(jwt);

    return {
      jwt,
      verifyJwt,
    };
  },
} satisfies MiddlewareConfigMap;
