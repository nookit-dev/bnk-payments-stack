import {
    CRNode,
    JsonHtmlNodeTree,
    JsonTagElNode,
    cc,
} from 'bnkit/htmlody';
import { textField } from './text-field';

// handle  login and register form creation
export const authForm = ({ register = false }): JsonTagElNode<CRNode> => {
  // Base structure
  const baseChildren = {
    usernameField: textField({
      label: 'Username:',
      name: 'username',
      placeholder: 'Enter your username',
      type: 'text',
    }),
    passwordField: textField({
      label: 'Password:',
      name: 'password',
      placeholder: 'Enter your password',
      type: 'password',
    }),
  };

  const submitButton = {
    submitButton: {
      tag: 'button',
      cr: cc(['bg-blue-500', 'text-white', 'p-2', 'rounded']),
      attributes: {
        type: 'submit',
      },
      content: register ? 'Register' : 'Login',
    },
  } satisfies JsonHtmlNodeTree<CRNode>;

  const result = {
    tag: 'form',
    cr: cc(['flex', 'flex-col', 'p-8', 'items-center']),
    attributes: {
      action: register ? '/register' : '/login',
      method: 'post',
      id: register ? 'register-form' : 'login-form',
      role: 'form',
    },
    children: {
      ...baseChildren,
      ...(register
        ? {
            confirmPasswordField: textField({
              label: 'Confirm Password:',
              name: 'confirmPassword',
              placeholder: 'Confirm your password',
              type: 'password',
            }),
          }
        : {}),
      ...submitButton,
    },
  } satisfies JsonTagElNode<CRNode>;

  return result;
};
