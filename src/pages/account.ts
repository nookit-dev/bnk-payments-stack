import type { CRNode, JsonHtmlNodeMap } from '@bnk/core/modules/htmlody';
import { cc } from '@bnk/core/modules/htmlody';
import { getLayout } from '../components/layout';

export const accountPage = ({
  username,
}: {
  username: string;
}): JsonHtmlNodeMap<CRNode> => {
  return getLayout({
    children: {
      COUNTER: {
        tag: 'section',
        cr: cc(['flex', 'flex-col', 'justify-center', 'items-center', 'p-8']),
        children: {
          titleid: {
            tag: 'h2',
            content: username,
            cr: cc(['text-3xl', 'font-bold', 'mb-4']),
            attributes: {
              itemprop: 'headline',
            },
          },
        },
      },
    },
  });
};
