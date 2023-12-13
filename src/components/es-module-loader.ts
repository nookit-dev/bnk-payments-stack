import { tag } from "~/router/page-builder";

export const esModuleFileLoader = (src: string) => {
	return tag.script({
		attributes: {
			type: "module",
			src: src,
		},
	});
};

export const inlineEsScript = (script: string) => {
	return tag.script({
		attributes: {
			type: "module",
		},
		content: script,
	});
};

export const loadModuleFromNodeModules = (pathRelativeToNodeModues: string) => {
	return esModuleFileLoader(`/module/${pathRelativeToNodeModues}`);
};
