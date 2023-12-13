import type { JsonHtmlNodeTree } from "bnkit/htmlody";
import { cc, children, classRecordPlugin, htmlodyBuilder } from "bnkit/htmlody";
import { cardComponent } from "~/components/card";
import { styleCfg } from "~/style";
import { PRICING_PLANS, PricingPlanKeys } from "~/utils/stripe/plans";
import { tag } from "../page-builder";

const { nodeFactory } = htmlodyBuilder({ plugins: [classRecordPlugin] });

const { div, h3, p, input, button, form } = nodeFactory();

const planCard = ({
	title,
	subtitle,
	planId,
	imgSrc,
}: {
	title: string;
	subtitle: string;
	planId: keyof typeof PRICING_PLANS;
	imgSrc?: string;
}) => {
	return cardComponent({
		cardTitle: title,
		headerImgSrc: `/assets/${imgSrc}`,
		baseClasses: ["h-96"],
		cardContent: tag.div({
			child: children([
				p({
					content: subtitle,
					attributes: {
						class: "text-center font-semibold text-gray-400",
					},
				}),
				input({
					attributes: {
						type: "radio",
						name: "planId",
						value: planId,
					},
				}),
			]),
		}),
	});
};

const planCards = Object.entries(PRICING_PLANS).map(([planId, plan]) => {
	return planCard({
		title: plan.name,
		subtitle: plan.description,
		planId: planId as PricingPlanKeys,
		imgSrc: plan.imgSrc,
	});
});

export const plansPage: JsonHtmlNodeTree = {
	container: div({
		cr: {
			"*": {
				flex: true,
				"w-full": true,
				"flex-col": true,
				"items-center": true,
				"justify-start": true,
			},
			md: {
				"h-full": true,
			},
		},
		child: {
			header: div({
				cr: cc(["flex", "flex-col", "items-center"]),
				child: {
					headerTitle: h3({
						content: "Select your plan",
						cr: cc(["text-3xl", "font-bold", "text-gray-200"]),
					}),
					headerSubtitle: p({
						content: "You can test the upgrade and won't be charged.",
						cr: cc(["text-center", "font-semibold", "text-gray-400"]),
					}),
				},
			}),
			plans: div({
				child: {
					planForm: form({
						attributes: {
							action: "/plans",
							method: "post",
						},

						child: children([
							tag.div({
								cr: {
									...cc(["flex", "flex-col", "items-center", "justify-center"]),
									lg: {
										"flex-row": true,
									},
								},
								child: children(planCards),
							}),

							button({
								cr: cc([...styleCfg.buttons.submit, "mt-4"]),
								content: "Submit",
								attributes: {
									type: "submit",
									//   class: 'submit-class-name', // Add the appropriate classes for styling
								},
							}),
						]),
					}),
				},
			}),
		},
	}),
};
