import type { CRNode, JsonHtmlNodeTree } from '@bnk/core/modules/htmlody';
import { cc } from '@bnk/core/modules/htmlody';
import { getLayout } from '../components/layout';
import { Plan, User, plan, subscription } from '../db/schema';

export const accountPage = ({
  user,
}: {
  user: User;
}): JsonHtmlNodeTree<CRNode> => {
  const userSubscription = subscription.readItemsWhere({
    userId: user.id,
  })[0];

  let userPlan: Plan | null = null;

  if (userSubscription?.status === 'active') {
    userPlan = plan.readItemsWhere({
      id: userSubscription.planId,
    })[0];
  }

  return getLayout({
    children: {
      COUNTER: {
        tag: 'section',
        cr: cc(['flex', 'flex-col', 'justify-center', 'items-center', 'p-8']),
        children: {
          titleid: {
            tag: 'h2',
            content: user.username,
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
              2,
            ),
          },
        },
      },
    },
  });
};
