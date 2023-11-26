import { JsonTagElNode } from 'bnkit/htmlody';
import { HTTPMethod } from 'bnkit/utils/http-types';

const methodActionMap: Record<HTTPMethod | string, string> = {
  post: 'to',
  get: 'from',
};

export const actionButton = ({
  content,
  method = 'POST',
  uri,
}: {
  content?: string;
  method?: HTTPMethod;
  uri: string;
}): JsonTagElNode => {
  const actionText = methodActionMap[method] || 'to';

  return {
    tag: 'button',
    content: content ? content : `${method} ${actionText} ${uri}`,

    attributes: {
      // todo remove google oauth as the default
      onclick: `window.location.href='${uri}'`,
    },
  };
};
