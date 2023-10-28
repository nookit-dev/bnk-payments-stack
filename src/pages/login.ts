import type { CRNode, JsonHtmlNodeMap } from '@bnk/core/modules/htmlody';
import { getLayout } from '../components/layout';
import { authForm } from '../components/auth-form';

export const loginPage = (): JsonHtmlNodeMap<CRNode> => {
  return getLayout({
    children: {
      LOGIN_FORM: authForm({ register: false }),
    },
  });
};
