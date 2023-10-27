import type { CRNode, JsonHtmlNodeMap } from '@bnk/core/modules/htmlody';
import { cc } from '@bnk/core/modules/htmlody';

const lastReset = new Date();

export const getPage = ({
  countDisplay,
}: {
  countDisplay: string;
}): JsonHtmlNodeMap<CRNode> => {
  return {
    LOGIN_FORM: {
      tag: 'form',
      cr: cc(['flex', 'flex-col', 'p-8', 'items-center']),
      attributes: {
        action: '/login', // The server endpoint where the form should POST the data to.
        method: 'post',
        id: 'login-form',
        role: 'form',
      },
      children: {
        usernameField: {
          tag: 'div',
          cr: cc(['mb-4']),
          children: {
            usernameLabel: {
              tag: 'label',
              cr: cc(['block', 'text-gray-700', 'mb-2']),
              attributes: {
                for: 'username',
              },
              content: 'Username:',
            },
            usernameInput: {
              tag: 'input',
              cr: cc(['border', 'rounded', 'p-2', 'w-full']),
              attributes: {
                type: 'text',
                name: 'username',
                id: 'username',
                placeholder: 'Enter your username',
                required: 'true',
              },
            },
          },
        },
        passwordField: {
          tag: 'div',
          cr: cc(['mb-4']),
          children: {
            passwordLabel: {
              tag: 'label',
              cr: cc(['block', 'text-gray-700', 'mb-2']),
              attributes: {
                for: 'password',
              },
              content: 'Password:',
            },
            passwordInput: {
              tag: 'input',
              cr: cc(['border', 'rounded', 'p-2', 'w-full']),
              attributes: {
                type: 'password',
                name: 'password',
                id: 'password',
                placeholder: 'Enter your password',
                required: 'true',
              },
            },
          },
        },
        submitButton: {
          tag: 'button',
          cr: cc([
            'bg-blue-500',
            // 'hover:bg-blue-600',
            'text-white',
            'p-2',
            'rounded',
          ]),
          attributes: {
            type: 'submit',
          },
          content: 'Login',
        },
      },
    },
    HEADER: {
      tag: 'header',
      cr: cc(['text-white', 'p-8', 'text-center', 'shadow-md']),
      attributes: {
        role: 'banner',
      },
      children: {
        titleid: {
          tag: 'h1',
          cr: cc(['text-4xl', 'font-bold', 'mb-2']),
          children: {
            span2: {
              tag: 'span',
              cr: cc([
                'text-white',
                'font-bold',
                'text-stroke-1',
                'text-stroke-black',
              ]),
              content: 'HTMLody',
            },
          },
          attributes: {
            itemprop: 'name',
          },
        },
        subtitleid: {
          tag: 'p',
          content: 'Plugable and TypeSafe JSON to HTML Generator',
          cr: cc(['text-lg', 'font-semibold', 'text-black', 'p-4']),
        },
      },
    },
    COUNTER: {
      tag: 'section',
      cr: cc(['flex', 'flex-col', 'justify-center', 'items-center', 'p-8']),
      children: {
        titleid: {
          tag: 'h2',
          content: 'Counter',
          cr: cc(['text-3xl', 'font-bold', 'mb-4']),
          attributes: {
            itemprop: 'headline',
          },
        },
        counter: {
          tag: 'p',
          content: countDisplay,
          cr: cc(['text-3xl', 'font-bold', 'mb-4']),
          attributes: {
            id: 'counter',
          },
        },
        // last reset
        lastReset: {
          tag: 'div',
          children: {
            lastReset: {
              tag: 'p',
              content: 'Server Rest At: ' + lastReset.toString(),
            },
            current: {
              tag: 'p',
              content: 'Rendered at: ' + new Date().toString(),
            },
          },
          cr: cc(['text-3xl', 'font-bold', 'mb-4']),
          attributes: {
            id: 'last-reset',
          },
        },
      },
    },
  };
};
