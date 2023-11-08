import {
  classRecordPlugin,
  htmlodyBuilder,
  markdownPlugin,
} from '@bnk/core/modules/htmlody';
import { RouteKeys, getLayout } from '../components/layout';
import { User } from '../db/schema';

const plugins = [classRecordPlugin, markdownPlugin];

export const turboFrame = (id: string, src: RouteKeys) => {
  return builder.createNode({
    attributes: {
      id,
      src,
    },
    tag: 'turbo-frame',
    content: 'Loading...',
  });
};

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
<script type="module">
  import hotwiredTurbo from 'https://cdn.skypack.dev/@hotwired/turbo';
</script>
`;

export const builder = htmlodyBuilder(plugins, {
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
});

export const renderPage = (content: typeof builder.inferTree, user?: User) => {
  return builder.response(getLayout({ children: content, user }));
};
