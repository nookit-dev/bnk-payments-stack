import {
  classRecordPlugin,
  htmlodyBuilder,
  markdownPlugin,
} from '@bnk/core/modules/htmlody';
import { layout } from '../components/layout';
import { User } from '../db/schema';

const plugins = [classRecordPlugin, markdownPlugin];

const stimulusScript = `
import { Application, Controller } from "https://unpkg.com/@hotwired/stimulus/dist/stimulus.js"
window.Stimulus = Application.start()

Stimulus.register("hello", class extends Controller {
  static targets = [ "name" ]

  connect() {
  }
})
`;

const turboScript = `
  import hotwiredTurbo from 'https://cdn.skypack.dev/@hotwired/turbo';
`;

export const builder = htmlodyBuilder({
  plugins,
  options: {
    allpages: {
      headConfig: {
        title: 'BNK Template',

        linkTags: [
          {
            rel: 'stylesheet',
            href: '/assets/normalizer.css',
          },
        ],
        scriptTags: [
          {
            type: 'module',
            content: stimulusScript,
          },
          {
            type: 'module',
            content: turboScript,
          },
        ],
      },
    },
  },
});

export const renderPage = <
  Content extends typeof builder.inferTree = typeof builder.inferTree
>(
  content: Content,
  user?: User
) => {
  return builder.response(layout({ children: content, user }));
};

export const msgWarp = builder?.warp({
  id: 'message-test',
  src: '/messages',
});
