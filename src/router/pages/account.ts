import { cc, children } from "bnkit/htmlody";
import { cardComponent } from "~/components/card";
import { heading } from "~/components/heading-text";
import { section } from "~/components/section";
import { plans, subscriptions } from "~/db";
import { redirect } from "~/utils/redirect";
import { renderPage, tag } from "../page-builder";
import { AppRoute } from "../route-types";
import { authUser } from "~/utils/auth";


export const accountPage: AppRoute = async (_, mid) => {
	let userId = "";
	let userJwt = null;
	const user = mid?.auth ? await authUser(mid.auth) : null;

	if (user instanceof Response) return user;

	try {
		userJwt = await mid?.auth?.verifyJwt();

		if (!userJwt) {
			return redirect("/login");
		}

		userId = userJwt?.payload?.userId || "";
	} catch (e) {
		console.error("Error verifying jwt", e);
		// redirect to login
		return redirect("/login");
	}

	const userSubscription = subscriptions.getById(userId || "");

	let userPlan = null;

	if (userSubscription?.status === "active") {
		userPlan = plans.getById(userSubscription.planId);
	}

	return renderPage(
		section([
			cardComponent({
				cardContent: {
					tag: "div",
					child: children([
						heading("Account", "h2"),
						tag.p({
							content: `Plan: ${userPlan?.name || "Free"}`,
							cr: cc(["text-xl", "mb-4"]),
						}),
						tag.pre({
							content: JSON.stringify(
								{ user: userJwt, userSubscription, userPlan },
								null,
								2,
							),
						}),
						{
							tag: "form",
							cr: cc(["flex", "justify-center", "items-center"]),
							attributes: {
								method: "post",
								action: "/logout",
							},
							child: {
								submit: {
									tag: "button",
									cr: cc([
										"bg-red-500",
										"text-white",
										"font-bold",
										"py-2",
										"px-4",
										"rounded",
									]),
									attributes: {
										type: "submit",
									},
									content: "Logout",
								},
							},
						},
					]),
				},
			}),
		]),
		user,
	);
};
