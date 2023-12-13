import { CRNode, cc, children } from "bnkit/htmlody";
import { CSSMapKeys } from "bnkit/htmlody/css-engine";
import {
	ClassRecord,
	JsonTagElNode,
	ResponsiveClassRecord,
} from "bnkit/htmlody/htmlody-types";
import { tag } from "~/router/page-builder";
import { heading } from "./heading-text";

export const cardComponent = ({
	cardContent,
	contentStyle,
	headerImgSrc,
	headerImgAlt,
	cardContentText,
	cardTitle,
	baseClasses,
}: {
	headerImgSrc?: string;
	contentStyle?: ResponsiveClassRecord;
	headerImgAlt?: string;
	cardContentText?: string;
	cardContent?: JsonTagElNode<CRNode>;
	cardTitle?: string;
	lgCr?: ClassRecord;
	baseClasses?: CSSMapKeys[];
}) => {
	const itemsToRender: CRNode[] = [];

	if (cardTitle) {
		itemsToRender.push(heading(cardTitle, "h3"));
	}

	if (cardContentText) {
		itemsToRender.push(
			tag.p({
				cr: cc(["text-gray-700", "text-base"]),
				content: cardContentText,
			}),
		);
	}

	if (cardContent) {
		itemsToRender.push(cardContent);
	}

	return tag.div({
		cr: {
			...cc([
				"flex",
				"flex-col",
				"justify-center",
				"items-center",
				"max-w-2xl",
				"w-full",
				"rounded-lg",
				"overflow-hidden",
				"shadow-lg",
				"border",
				"border-lightgray-600",
				"m-4",
				...(baseClasses || []),
			]),
		},

		child: children([
			tag.img({
				cr: cc(["max-w-xs", "w-44", "m-4"]),
				...(headerImgSrc && {
					attributes: {
						src: headerImgSrc || "",
						alt: headerImgAlt || "",
					},
				}),
			}),
			tag.div({
				child: children(itemsToRender),
				cr: Object.assign(cc(["px-6", "py-4"]), contentStyle),
			}),
		]),
	});
};
