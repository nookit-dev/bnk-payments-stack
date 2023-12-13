import {
	CRNode,
	JsonHtmlNodeTree,
	JsonTagElNode,
	cc,
	children,
	children as childrenHelper,
} from "bnkit/htmlody";
import { users } from "~/db";
import { tag } from "~/router/page-builder";

type NavConfig = {
	link: string;
	title: string;
};

const navLinks = (isAuthed: boolean): NavConfig[] => {
	const home = {
		link: "/",
		title: "Home",
	};

	if (!isAuthed) {
		return [
			home,
			{
				link: "/login",
				title: "Login",
			},
			{
				link: "/register",
				title: "Signup",
			},
		] satisfies NavConfig[];
	}

	return [
		home,
		{
			link: "/account",
			title: "Account",
		},
		{
			link: "/plans",
			title: "Plans",
		},
		{
			link: "/company",
			title: "My Company",
		},
	] satisfies NavConfig[];
};

export const nav = (isAuthed: boolean): JsonTagElNode<CRNode> => {
	const renderLinks = () => {
		return navLinks(isAuthed).map((navLink) => {
			return tag.li({
				cr: cc(["mx-2", "text-black", "font-bold", "text-xl"]),
				child: children([
					tag.a({
						content: navLink.title,
						attributes: {
							href: navLink.link,
						},
					}),
				]),
			});
		});
	};

	return tag.nav({
		cr: cc([
			"flex",
			"flex-row",
			"p-1",
			"bg-white",
			"rounded-r-sm",
			"shadow-sm",
			"justify-evenly",
		]),
		attributes: {
			id: "app-nav",
		},
		child: {
			NAV_LINKS: {
				tag: "ul",
				cr: cc(["flex", "flex-row", "text-left", "text-lg"]), // Change 'flex-col' to 'flex-row'
				child: childrenHelper(renderLinks()),
			},
		},
	});
};

export const layout = (
	children: JsonHtmlNodeTree<CRNode>,
	{
		user,
	}: {
		user?: ReturnType<typeof users.infer> | null;
	} = {},
): JsonHtmlNodeTree<CRNode> => {
	console.log({ user });
	return {
		nav: nav(!!user),
		APP_CONTAINER: tag.div({
			cr: cc([
				"flex",
				"flex-col", // "min-h-screen"
			]),
			child: childrenHelper([
				tag.main({
					cr: cc(["flex-grow", "min-h-screen"]),
					child: children,
				}),
				tag.footer({
					cr: cc(["text-white", "p-8", "text-center", "shadow-md"]),
					attributes: {
						role: "contentinfo",
					},
					child: {
						footer: {
							cr: cc(["text-black", "font-bold"]),
							tag: "p",
							// content: "Made with ❤️ by Bun Nook Kit",
						},
					},
				}),
			]),
		}),
	};
};
