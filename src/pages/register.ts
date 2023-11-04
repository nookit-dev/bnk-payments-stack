import type { CRNode, JsonHtmlNodeTree } from '@bnk/core/modules/htmlody';
import { authForm } from '../components/auth-form';
import { getLayout } from '../components/layout';

export const registerPage = (): JsonHtmlNodeTree<CRNode> => {
  return getLayout({
    children: {
      REGISTER_FORM: authForm({ register: true }),
    },
  });
};
