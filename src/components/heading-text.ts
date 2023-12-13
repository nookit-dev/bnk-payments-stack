import { CRNode, JsonTagElNode } from "bnkit/htmlody";
import { CSSMapKeys } from "bnkit/htmlody/css-engine";
import { combineClasses } from "./utils";

export const heading = (
	content: string,
	size: "h6" | "h5" | "h4" | "h3" | "h2" | "h1" = "h1",
	node?: Omit<CRNode, "tag" | "content">,
) => {
	const styles: CSSMapKeys[] = ["font-bold"];
	let headingTag: JsonTagElNode["tag"] = "h3";

	switch (size) {
		case "h6":
			styles.push("text-sm");
			headingTag = "h6";
			break;
		// default size
		case "h5":
			headingTag = "h5";
			break;
		case "h4":
			headingTag = "h4";
			styles.push("text-lg");
			break;
		case "h3":
			headingTag = "h3";
			styles.push("text-lg");
			break;
		case "h2":
			headingTag = "h2";
			styles.push("text-2xl");
			break;
		case "h1":
			headingTag = "h1";
			styles.push("text-4xl");
			break;
	}

	// map styles to an object
	const stylesObjArray = styles.map((style) => ({ [style]: true }));
	const stylesObj = Object.assign({}, ...stylesObjArray);

	return {
		...node,
		tag: headingTag,
		cr: combineClasses(stylesObj, node),
		content,
	} satisfies CRNode;
};
