import { CSSMapKeys } from "bnkit/htmlody/css-engine";

// input border border-lightgray-600
// label text - text-gray-500

export const pallete = {
	bg: {
		primary: "bg-blue-800",
		secondary: "bg-green-500",
		tertiary: "bg-gray-200",
		accent: "bg-yellow-400",
	},
	text: {
		// create opposites for text colors
		primary: "text-white",
		secondary: "text-black",
		tertiary: "text-lightgray-300",
		accent: "text-orange-400",
		danger: "text-red-500",
	},
} satisfies Record<"bg" | "text", Record<string, CSSMapKeys>>;

export const styleCfg = {
	buttons: {
		primary: [pallete.text.primary, "p-2", "rounded"],
		secondary: [pallete.text.primary, "p-2", "rounded"],
		submit: [pallete.text.accent, "py-2", "rounded", "w-full"],
		danger: [pallete.text.danger, "p-2", "rounded"],
	},
	input: {
		primary: [pallete.bg.primary, pallete.text.primary, "p-2", "rounded"],
		secondary: [pallete.bg.secondary, pallete.text.primary, "p-2", "rounded"],
	},
	text: {
		primary: [pallete.text.primary],
		secondary: [pallete.text.secondary],
		tertiary: [pallete.text.tertiary],
		accent: [pallete.text.accent],
		danger: [pallete.text.danger],
	},
	bg: {
		primary: [pallete.bg.primary],
		secondary: [pallete.bg.secondary],
		tertiary: [pallete.bg.tertiary],
		accent: [pallete.bg.accent],
	},
} satisfies Record<string, Record<string, CSSMapKeys[]>>;
