import { CRNode, children } from "bnkit/htmlody";
import { HTTPMethod } from "bnkit/utils/http-types";

import { cc } from "bnkit/htmlody";
import { tag } from "~/router/page-builder";
import { styleCfg } from "~/style";

const methodActionMap: Record<HTTPMethod | string, string> = {
	post: "to",
	get: "from",
};

export const actionButton = ({
	content,
	method = "POST",
	uri,
}: {
	content?: string;
	method?: HTTPMethod;
	uri: string;
}): CRNode => {
	const actionText = methodActionMap[method] || "to";

	return {
		tag: "button",
		content: content ? content : `${method} ${actionText} ${uri}`,
		cr: cc(styleCfg.buttons.primary),
		attributes: {
			onclick: `window.location.href='${uri}'`,
		},
	};
};

export const linkButton = ({
	collectionId,
	label,
	params,
	uri = "/print",
}: {
	collectionId: string;
	label?: string;
	uri: string;
	params?: Record<string, string>;
}) => {
	const paramsString = new URLSearchParams(params).toString();

	return tag.a({
		content: label,
		cr: cc(styleCfg.buttons.primary),
		attributes: {
			href: `${uri}${paramsString ? `?${paramsString}` : ""}`,
			target: "_blank",
		},
	});
};

export const downloadButton = ({
	collectionId,
	type,
	label,
}: {
	collectionId: string;
	type: "markdown" | "json";
	label?: string;
}) => {
	return tag.a({
		content: label,
		cr: cc(styleCfg.buttons.primary),
		attributes: {
			href: `/export?id=${collectionId}&type=${type}`,
			download: `${collectionId}.md`,
		},
	});
};

export const copyButton = (contentToCopy: string, labelDisplay: string) => {
	return tag.button({
		cr: cc(styleCfg.buttons.submit),
		content: labelDisplay,
		attributes: {
			onclick: `navigator.clipboard.writeText('${contentToCopy}')`,
		},
	});
};

export const submitContainerBtn = (text = "Submit") => {
	return tag.div({
		cr: cc(["flex", "flex-row", "justify-center", "py-4"]),
		child: children([
			tag.button({
				content: text,
				cr: cc(styleCfg.buttons.submit),
				attributes: {
					type: "submit",
				},
			}),
		]),
	});
};
