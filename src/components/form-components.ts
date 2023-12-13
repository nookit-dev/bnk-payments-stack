import { CRNode, JsonTagElNode, cc } from "bnkit/htmlody";
import { tag } from "~/router/page-builder";

export const formInput = ({
	name,
	placeholder,
	type,
	label,
	defaultValue,
}: {
	name: string;
	placeholder: string;
	type: string;
	label: string;
	defaultValue?: string;
}): JsonTagElNode<CRNode> => {
	return tag.div({
		child: {
			LABEL: tag.label({
				cr: cc(["block", "text-gray-500", "mt-6", "mb-2"]),
				attributes: {
					for: name,
				},
				content: label,
			}),
			INPUT: tag.input({
				cr: cc(["border", "border-lightgray-600", "rounded", "p-2", "w-full"]),
				attributes: {
					type,
					name,
					id: name,
					placeholder,
					required: "true",
				},
			}),
		},
	});
};

export const hiddenFormVal = (name: string, value: string | number) =>
	tag.input({
		attributes: {
			type: "hidden",
			name,
			value: value.toString(),
		},
	});
