import { JsonHtmlNodeMap, CRNode, cc } from '@bnk/core/modules/htmlody';

export const getLayout = ({
  children,
}: {
  children: JsonHtmlNodeMap<CRNode>;
}): JsonHtmlNodeMap<CRNode> => {
  return {
    HEADER: {
      tag: 'header',
      cr: cc(['text-white', 'p-8', 'text-center', 'shadow-md']),
      attributes: {
        role: 'banner',
      },
      children: {
        titleid: {
          tag: 'h1',
          cr: cc(['text-4xl', 'font-bold', 'mb-2']),
          children: {
            span2: {
              tag: 'span',
              cr: cc(['text-black', 'font-bold']),
              content: 'HTMLody',
            },
          },
          attributes: {
            itemprop: 'name',
          },
        },
        subtitleid: {
          tag: 'p',
          content: 'Plugable and TypeSafe JSON to HTML Generator',
          cr: cc(['text-lg', 'font-semibold', 'text-black', 'p-4']),
        },
      },
    },
    CONTENT: {
      tag: 'main',
      children,
    },
    FOOTER: {
      tag: 'footer',
      cr: cc(['text-white', 'p-8', 'text-center', 'shadow-md']),
      attributes: {
        role: 'contentinfo',
      },
      children: {
        footer: {
          tag: 'p',
          content: 'Made with ❤️ by @bnk',
        },
      },
    },
  };
};
