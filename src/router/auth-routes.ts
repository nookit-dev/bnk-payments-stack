import { initGoogleOAuth, oAuthFactory } from "bnkit/auth";
import { encodeCookie } from "bnkit/cookies";
import { jsonRes, redirectRes } from "bnkit/server";
import { authForm } from "~/components/auth-form";
import { section } from "~/components/section";
import { hostURL } from "~/config";
import { log, users } from "~/db";
import { db } from "~/db/db";
import { authenticateUserJwt, createUser } from "~/utils/auth";
import { renderPage, tag } from "./page-builder";
import { accountPage as AccountPage } from "./pages/account";
import { RouterTypes } from "./route-types";

const oauthCallbackUri = "/oauth-callback";

const googleClientId = Bun.env.GOOGLE_OAUTH_CLIENT_ID || "";
const googleClientSecret = Bun.env.GOOGLE_OAUTH_CLIENT_SECRET || "";

const googleOAuthConfig = initGoogleOAuth(
	{
		clientId: googleClientId,
		clientSecret: googleClientSecret,
	},
	{
		redirectUrl: hostURL + oauthCallbackUri,
	},
);

const googleOAuth = oAuthFactory(googleOAuthConfig);

export const authRoutes = {
	"/account": {
		get: AccountPage,
	},
	"/register": {
		get: () => {
			return renderPage(section([authForm({ register: true })]));
		},
		post: async (request) => {
			const pageReturn = (content: string) =>
				renderPage(
					section([
						authForm({ register: true }),
						tag.div({
							content,
						}),
					]),
				);
			const formData = await request.formData();
			const password = formData.get("password") as string;
			const email = formData.get("email") as string;

			const confirmPassword = formData.get("confirmPassword") as string;

			if (password !== confirmPassword) {
				return pageReturn("Passwords do not match.");
			}

			const existingUser = users.getByKey("email", email);

			if (existingUser) {
				return pageReturn("Email already used. Choose a different email.");
			}

			const user = await createUser({
				password,
				email,
			});

			const authResult = await authenticateUserJwt(db, email, password);

			if (!authResult?.user) {
				return jsonRes({
					message: "Error creating user:",
				});
			}

			const { token } = authResult;

			const jwtCookie = encodeCookie("jwt", token, {
				httpOnly: true,
				secure: true,
				sameSite: "Strict",
			});

			return redirectRes("/account", {
				headers: {
					"Set-Cookie": jwtCookie,
				},
			});
		},
	},
	"/login": {
		get: async (_, { auth }) => {
			const loginPage = () =>
				renderPage(section([authForm({ register: false })]));

			if (auth) {
				try {
					const result = await auth?.verifyJwt();
					if (result?.payload) {
						return redirectRes("/account");
					}
				} catch (e) {
					return loginPage();
				}
			}

			return loginPage();
		},
		post: async (request) => {
			const email = "";

			try {
				const formData = await request.formData();
				const email = formData.get("email") as string;
				const password = formData.get("password") as string;

				const authResult = await authenticateUserJwt(db, email, password);

				if (!authResult?.user) {
					return jsonRes({
						message: "invalid email or password",
					});
				}

				const { token } = authResult;

				const jwtCookie = encodeCookie("jwt", token, {
					httpOnly: true,
					secure: true,
					sameSite: "Strict",
				});

				return redirectRes("/account", {
					headers: {
						"Set-Cookie": jwtCookie,
					},
				});
			} catch (e) {
				log(`Login error, email: ${email}`, { error: e });

				return jsonRes({
					message: "We ran into an error on our end. Please try again later.",
				});
			}
		},
	},
	"/google-oauth": {
		get: () => {
			const authUrl = googleOAuth.initiateOAuthFlow();

			return new Response(null, {
				headers: { Location: authUrl },
				status: 302,
			});
		},
	},
	[oauthCallbackUri]: {
		get: async (req) => {
			try {
				const host = req.headers.get("host");
				// Parse the URL and query parameters
				const url = new URL(req.url, `http://${host}`);
				const queryParams = new URLSearchParams(url.search);
				const code = queryParams.get("code");

				if (!code) {
					return new Response("No code provided in query", { status: 400 });
				}

				const tokenInfo = await googleOAuth.handleRedirect(code);

				// Logic after successful authentication
				return new Response("Login Successful!");
			} catch (error) {
				log("Error in OAuth callback, authentication Failed", { error });
				return new Response("Authentication failed", { status: 500 });
			}
		},
	},
	"/logout": {
		post: async () => {
			return redirectRes("/login", {
				headers: {
					"Set-Cookie": encodeCookie("jwt", "", {
						httpOnly: true,
						secure: true,
						sameSite: "Strict",
					}),
				},
			});
		},
	},
} satisfies RouterTypes;
