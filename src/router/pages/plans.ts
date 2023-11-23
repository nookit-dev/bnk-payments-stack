import type { JsonHtmlNodeTree } from 'bnkit/htmlody';
import { cc, children, classRecordPlugin, htmlodyBuilder } from 'bnkit/htmlody';
import { PRICING_PLANS, PricingPlanKeys } from '../../utils/stripe/plans';

const { createNode } = htmlodyBuilder({ plugins: [classRecordPlugin] });

const planCard = ({
  title,
  subtitle,
  planId,
}: {
  title: string;
  subtitle: string;
  planId: keyof typeof PRICING_PLANS;
}) => {
  return createNode({
    tag: 'div',
    cr: cc([
      'flex',
      'flex-col',
      'items-center',
      'justify-center',
      'p-4',
      'm-4',
      'rounded-lg',
      'shadow-lg',
    ]),
    children: children([
      {
        tag: 'h3',
        content: title,
        attributes: {
          class: 'text-3xl font-bold text-gray-200',
        },
      },
      {
        tag: 'p',
        content: subtitle,
        attributes: {
          class: 'text-center font-semibold text-gray-400',
        },
      },
      {
        tag: 'input',
        attributes: {
          type: 'radio',
          name: 'planId',
          value: planId,
        },
      },
    ]),
  });
};

const planCards = Object.entries(PRICING_PLANS).map(([planId, plan]) => {
  return planCard({
    title: plan.name,
    subtitle: plan.description,
    planId: planId as PricingPlanKeys,
  });
});

export const plansPage: JsonHtmlNodeTree = {
  container: createNode({
    tag: 'div',
    cr: {
      '*': {
        flex: true,
        'w-full': true,
        'flex-col': true,
        'items-center': true,
        'justify-start': true,
      },
      md: {
        'h-full': true,
      },
    },
    children: {
      header: createNode({
        tag: 'div',
        cr: cc(['flex', 'flex-col', 'items-center']),
        children: {
          headerTitle: createNode({
            tag: 'h3',
            content: 'Select your plan',
            cr: cc(['text-3xl', 'font-bold', 'text-gray-200']),
          }),
          headerSubtitle: createNode({
            tag: 'p',
            content: "You can test the upgrade and won't be charged.",
            cr: cc(['text-center', 'font-semibold', 'text-gray-400']),
          }),
        },
      }),
      plans: createNode({
        tag: 'div',
        cr: cc(['flex', 'flex-col', 'items-center', 'justify-center']),
        children: {
          planForm: {
            tag: 'form',
            attributes: {
              action: '/plans',
              method: 'post',
            },
            children: children([
              ...planCards,
              createNode({
                tag: 'button',
                content: 'Submit',
                attributes: {
                  type: 'submit',
                  //   class: 'submit-class-name', // Add the appropriate classes for styling
                },
              }),
            ]),
          },
        },
      }),
    },
  }),
};
