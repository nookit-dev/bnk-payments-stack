import { createServerCookieFactory } from '@bnk/core/modules/cookies';
import { createJwtFileHandlers, jwtBack } from '@bnk/core/modules/jwt';
import { MiddlewareConfigMap } from '@bnk/core/modules/server';

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
