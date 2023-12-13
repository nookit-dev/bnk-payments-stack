import { CRNode, JsonHtmlNodeTree, JsonTagElNode, cc } from "bnkit/htmlody";
import { submitContainerBtn } from "~/components/buttons";
import { tag } from "~/router/page-builder";
import { styleCfg } from "~/style";
import { cardComponent } from "./card";
import { formInput } from "./form-components";

// handle  login and register form creation
export const authForm = ({ register = false }): JsonTagElNode<CRNode> => {
	// Base structure
	const baseChildren = {
		emailField: formInput({
			label: "Email:",
			name: "email",
			placeholder: "Enter your email",
			type: "text",
		}),
		passwordField: formInput({
			label: "Password:",
			name: "password",
			placeholder: "Enter your password",
			type: "password",
		}),
	};

	const submitButton = {
		submitButton: {
			tag: "button",
			cr: cc(styleCfg.buttons.submit),
			attributes: {
				type: "submit",
			},
			content: register ? "Register" : "Login",
		},
	} satisfies JsonHtmlNodeTree<CRNode>;

	const result = cardComponent({
		cardTitle: register
			? "Create an account"
			: "Login to your Account",
		cardContent: tag.form({
			attributes: {
				action: register ? "/register" : "/login",
				method: "post",
				id: register ? "register-form" : "login-form",
				role: "form",
			},
			child: {
				...baseChildren,
				...(register
					? {
							confirmPasswordField: formInput({
								label: "Confirm Password:",
								name: "confirmPassword",
								placeholder: "Confirm your password",
								type: "password",
							}),
					  }
					: {}),
				div: submitContainerBtn(register ? "Register" : "Login"),
			},
		}),
	}) satisfies JsonTagElNode<CRNode>;

	return result;
};
