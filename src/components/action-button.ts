import { JsonTagElNode } from 'bnkit/htmlody';
import { HttpMethod } from 'bnkit/utils/http-types';

const methodActionMap: Record<HttpMethod | string, string> = {
  POST: 'to',
  GET: 'from',
};

export const actionButton = ({
  content,
  method = 'POST',
  uri,
}: {
  content?: string;
  method?: HttpMethod;
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
