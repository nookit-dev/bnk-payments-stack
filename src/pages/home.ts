import type { CRNode, JsonHtmlNodeMap } from '@bnk/core/modules/htmlody';
import { cc, children } from '@bnk/core/modules/htmlody';
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
        children: children([
          {
            tag: 'h2',
            content: 'Counter',
            cr: cc(['text-3xl', 'font-bold', 'mb-4']),
            attributes: {
              itemprop: 'headline',
            },
          },
          {
            tag: 'p',
            content: countDisplay,
            cr: cc(['text-3xl', 'font-bold', 'mb-4']),
            attributes: {
              id: 'counter',
            },
          },

          {
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
        ]),
      },
    },
  });
};
