import {
  CRNode,
  JsonHtmlNodeTree,
  cc,
  children as childrenHelper,
} from '@bnk/core/modules/htmlody';
import { User } from '../db/schema';
import { routes } from '../router/routes';

type NavConfig = {
  link: keyof typeof routes;
  title: string;
};

const navLinks: NavConfig[] = [
  {
    link: '/',
    title: 'Home',
  },
  {
    link: '/account',
    title: 'Account',
  },
  {
    link: '/plans',
    title: 'Plans',
  },
  {
    link: '/login',
    title: 'Login',
  },
  {
    link: '/register',
    title: 'Signup',
  },
];

const renderLinks = () => {
  return navLinks.map((navLink) => {
    return {
      tag: 'li',
      cr: cc(['mx-4', 'text-black']),
      children: {
        link: {
          tag: 'a',
          content: navLink.title,
          attributes: {
            href: navLink.link,
          },
        },
      },
    };
  });
};

export const getLayout = ({
  children,
  user,
}: {
  children: JsonHtmlNodeTree<CRNode>;
  user?: User;
}): JsonHtmlNodeTree<CRNode> => {
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
        NAVBAR: {
          tag: 'nav',
          children: {
            NAV_LINKS: {
              tag: 'ul',
              cr: cc(['flex', 'justify-center', 'items-center', 'p-4']),
              children: childrenHelper(renderLinks()),
            },
          },
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
