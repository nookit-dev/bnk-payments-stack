import {
    classRecordPlugin,
    htmlodyBuilder,
    markdownPlugin,
} from '@bnk/core/modules/htmlody';

const plugins = [classRecordPlugin, markdownPlugin];

export const builder = htmlodyBuilder(plugins, {
  title: 'BNK Template',
});
