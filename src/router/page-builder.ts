import {
	JsonTagElNode,
	classRecordPlugin,
	htmlodyBuilder,
} from "bnkit/htmlody";
import { layout } from "~/components/layout";
import { users } from "~/db";

const plugins = [
	classRecordPlugin, //  markdownPlugin
];

export const builder = htmlodyBuilder({
	plugins,
	options: {
		allpages: {
			headConfig: {
				title: "BNK Template",

				linkTags: [
					{
						rel: "stylesheet",
						href: "/assets/normalizer.css",
					},
				],
			},
		},
	},
});


const { nodeFactory } = builder;
export const tag = nodeFactory();

export const renderPage = <
	Content extends typeof builder.inferTree = typeof builder.inferTree,
>(
	content: Content,
	user?: ReturnType<typeof users.infer> | null,
) => {
	return builder.response(layout(content, { user }));
};

export const pageRes = (
	node: JsonTagElNode,
	user?: ReturnType<typeof users.infer>,
) => {
	return builder.response(layout({ node }, { user }));
};

export const msgWarp = builder?.warp({
	id: "message-test",
	src: "/messages",
});
