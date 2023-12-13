import { CRNode, JsonTagElNode, cc, children } from "bnkit/htmlody";
import { tag } from "~/router/page-builder";
import { styleCfg } from "~/style";

export type SelectOption<ValidValueKeys extends string> = {
	value: ValidValueKeys;
	displayText: string;
};

export type SelectOptions<ValidValueKeys extends string = string> =
	SelectOption<ValidValueKeys>[];

export const selectComponent = ({
	name,
	options,
	label,
	defaultValue,
	selectStyle = "primary",
	labelStyle = "secondary",
}: {
	name: string;
	options: SelectOptions;
	label?: string;
	defaultValue?: string;
	selectStyle?: keyof typeof styleCfg.input;
	labelStyle?: keyof typeof styleCfg.text;
}): JsonTagElNode<CRNode> => {
	const optionNodes = options.map((option) =>
		tag.option({
			attributes: {
				value: option.value,
				...(defaultValue === option.value && { selected: "selected" }),
			},
			content: option.displayText,
		}),
	);

	return tag.div({
		cr: cc(["flex", "flex-col", "mb-4"]),
		child: children([
			tag.label({
				cr: cc(styleCfg.text[labelStyle]),
				attributes: {
					for: name,
				},
				content: label,
			}),
			tag.select({
				cr: cc(styleCfg.input[selectStyle]),
				attributes: {
					name,
					id: name,
				},
				child: children(optionNodes),
			}),
		]),
	});
};
