import type { CRNode, JsonHtmlNodeMap } from '@bnk/core/modules/htmlody';
import { cc } from '@bnk/core/modules/htmlody';
import { getLayout } from '../components/layout';

const lastReset = new Date();

export const homePage = ({
  countDisplay,
}: {
  countDisplay: string;
}): JsonHtmlNodeMap<CRNode> => {
  return getLayout({
    children: {
      COUNTER: {
        tag: 'section',
        cr: cc(['flex', 'flex-col', 'justify-center', 'items-center', 'p-8']),
        children: {
          titleid: {
            tag: 'h2',
            content: 'Counter',
            cr: cc(['text-3xl', 'font-bold', 'mb-4']),
            attributes: {
              itemprop: 'headline',
            },
          },
          counter: {
            tag: 'p',
            content: countDisplay,
            cr: cc(['text-3xl', 'font-bold', 'mb-4']),
            attributes: {
              id: 'counter',
            },
          },
          lastReset: {
            tag: 'div',
            children: {
              lastReset: {
                tag: 'p',
                content: 'Server Reset At: ' + lastReset.toString(),
              },
              current: {
                tag: 'p',
                content: 'Rendered at: ' + new Date().toString(),
              },
            },
            cr: cc(['text-3xl', 'font-bold', 'mb-4']),
            attributes: {
              id: 'last-reset',
            },
          },
        },
      },
    },
  });
};
