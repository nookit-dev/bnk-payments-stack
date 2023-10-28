import type { CRNode, JsonHtmlNodeMap } from '@bnk/core/modules/htmlody';
import { getLayout } from '../components/layout';
import { authForm } from '../components/auth-form';

export const registerPage = (): JsonHtmlNodeMap<CRNode> => {
  return getLayout({
    children: {
      REGISTER_FORM: authForm({ register: true }),
    },
  });
};
