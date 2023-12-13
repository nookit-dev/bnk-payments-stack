import {
	CRNode,
	ClassRecord,
	JsonHtmlNodeTree,
	children as childrenUtil,
} from "bnkit/htmlody";
import { tag } from "~/router/page-builder";
import { ResponsiveClassRecord, combineClasses } from "./utils";

export const section = (
	children: CRNode[],
	{
		tagOvrride: tagOverride,
		layout = {
			desktop: "col",
			tablet: "col",
			mobile: "col",
		},
		cr,
		attributes,
		content,
	}: {
		layout?: {
			desktop: "col" | "row";
			tablet: "col" | "row";
			mobile: "col" | "row";
		};
		tagOvrride?: CRNode["tag"];
		cr?: ResponsiveClassRecord;
		attributes?: CRNode["attributes"];
		content?: CRNode["content"];
	} = {},
) => {
	const baseClasses = {
		flex: true,
		"justify-center": true,
		"items-center": true,
		"p-8": true,
	} satisfies ClassRecord;

	const classes: {
		"*": ClassRecord;
		md: ClassRecord;
		lg: ClassRecord;
	} = {
		"*": baseClasses,
		md: baseClasses,
		lg: baseClasses,
	} satisfies ResponsiveClassRecord;

	if (layout?.mobile) {
		if (layout.mobile === "col") {
			classes["*"]["flex-col"] = true;
		} else {
			classes["*"]["flex-row"] = true;
		}
	}

	if (layout?.desktop === "col") {
		classes.md["flex-col"] = true;
	} else {
		classes.md["flex-row"] = true;
	}

	if (layout?.tablet === "col") {
		classes.lg["flex-col"] = true;
	} else {
		classes.lg["flex-row"] = false;
	}


	return {
		section: tag.section({
			cr: combineClasses(classes, {}),
			child: childrenUtil(children),
			attributes,
			content,
		}),
	} satisfies JsonHtmlNodeTree<CRNode>;
};
