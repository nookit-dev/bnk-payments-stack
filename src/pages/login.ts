import type { CRNode, JsonHtmlNodeTree } from '@bnk/core/modules/htmlody';
import { authForm } from '../components/auth-form';
import { getLayout } from '../components/layout';

export const loginPage = (): JsonHtmlNodeTree<CRNode> => {
  return getLayout({
    children: {
      LOGIN_FORM: authForm({ register: false }),
    },
  });
};
