import { cc } from "bnkit/htmlody";
import { HTTPMethod } from "bnkit/utils/http-types";
import { heading } from "~/components/heading-text";
import { section } from "~/components/section";
import { hostURL, isDev } from "~/config";
import { authRoutes } from "./auth-routes";
import { renderPage } from "./page-builder";

import { users } from "~/db";
import { RouterTypes } from "./route-types";
import { stripeRoutes } from "./stripe-routes";

export const routeToCurl = (route: string, method: HTTPMethod) => {
	return `curl -X ${method} ${hostURL}${route}`;
};

export const routes = {
	"/": {
		get: async (_, mid) => {
			let userData: null | ReturnType<typeof users.infer> = null;

			try {
				const result = await mid?.auth?.verifyJwt();
				const userId = result?.payload.userId;

				userData = users.getById(userId || "");
			} catch (e) {
				console.error(e);
			}

			return renderPage(
				section([
					heading("Sendem.ai", "h2", {
						cr: cc(["mb-4"]),
					}),
				]),
				userData,
			);
		},
	},

	"^/assets/.+": {
		get: (request) => {
			const filename = request.url.split("/assets/")[1];
			return new Response(Bun.file(`./src/assets/${filename}`).stream());
		},
	},
	"^/module/.+": {
		get: (request) => {
			const filePath = request.url.split("/module/")[1];
			const file = Bun.file(`./node_modules/${filePath}`);
			return new Response(file.stream());
		},
	},
	...authRoutes,
	...stripeRoutes,
} satisfies RouterTypes;

if (isDev) {
	const routeKeys = Object.keys(routes) as (keyof typeof routes)[];

	routeKeys.forEach((routeKey) => {
		console.info(`${hostURL}${routeKey}`);
	});
}
