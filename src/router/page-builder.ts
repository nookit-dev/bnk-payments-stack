import {
  classRecordPlugin,
  htmlodyBuilder,
  markdownPlugin,
} from '@bnk/core/modules/htmlody';
import { getLayout } from '../components/layout';
import { User } from '../db/schema';

const plugins = [classRecordPlugin, markdownPlugin];

export const builder = htmlodyBuilder(plugins, {
  allpages: {
    headConfig: {
      title: 'BNK Template',
      // link assets/normalizer.css
      linkTags: [
        {
          rel: 'stylesheet',
          href: '/assets/normalizer.css',
        },
      ],
    },
  },
});

export const renderPage = (content: typeof builder.inferTree, user?: User) => {
  return builder.response(getLayout({ children: content, user }));
};
