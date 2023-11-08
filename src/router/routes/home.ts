import type { CRNode, JsonHtmlNodeTree } from '@bnk/core/modules/htmlody';
import { cc, children } from '@bnk/core/modules/htmlody';
import { getLayout } from '../../components/layout';

export const homePage = (): JsonHtmlNodeTree<CRNode> => {
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
        ]),
      },
    },
  });
};
