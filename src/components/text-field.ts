import { JsonTagElNode, CRNode, cc } from '@bnk/core/modules/htmlody';

export const textField = ({
  name,
  placeholder,
  type,
  label,
}: {
  name: string;
  placeholder: string;
  type: string;
  label: string;
}): JsonTagElNode<CRNode> => {
  return {
    tag: 'div',
    children: {
      usernameLabel: {
        tag: 'label',
        cr: cc(['block', 'text-gray-700', 'mb-2']),
        attributes: {
          for: name,
        },
        content: label,
      },
      INPUT: {
        tag: 'input',
        cr: cc(['border', 'rounded', 'p-2', 'w-full']),
        attributes: {
          type,
          name,
          id: name,
          placeholder,
          required: 'true',
        },
      },
    },
  };
};
