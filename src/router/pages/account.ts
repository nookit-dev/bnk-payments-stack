import { cc } from 'bnkit/htmlody';
import { Plan, plan, subscription } from '../../db/schema';
import { authenticateAndRetrieveUser } from '../auth-utils';
import { renderPage } from '../page-builder';
import { AppRoute } from '../route-types';

export const accountPage: AppRoute = async (request, mid) => {
  const authRes = mid?.auth
    ? await authenticateAndRetrieveUser(mid.auth)
    : null;

  if (authRes instanceof Response) return authRes;

  const user = await mid?.auth?.verifyJwt();
  const userId = user?.payload.userId;

  const userSubscription = subscription.readById(userId || '');

  let userPlan: Plan | null = null;

  if (userSubscription?.status === 'active') {
    userPlan = plan.readById(userSubscription.planId);
  }

  return renderPage({
    COUNTER: {
      tag: 'section',
      cr: cc(['flex', 'flex-col', 'justify-center', 'items-center', 'p-8']),
      children: {
        titleid: {
          tag: 'h2',
          content: userSubscription?.status === 'active' ? 'Active' : 'Inactive',
          cr: cc(['text-3xl', 'font-bold', 'mb-4']),
          attributes: {
            itemprop: 'headline',
          },
        },
        stripePlan: {
          tag: 'p',
          content: `Stripe Plan: ${userPlan?.name}`,
          cr: cc(['text-xl', 'mb-4']),
        },
        raw: {
          tag: 'pre',
          content: JSON.stringify(
            { user, userSubscription, userPlan },
            null,
            2
          ),
        },
      },
    },
  });

  // layout();
};
