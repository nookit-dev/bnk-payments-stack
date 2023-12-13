import * as bnk from "bnkit";
import { createToken, verifyToken } from "bnkit/auth";
import { jwtBack } from "bnkit/jwt";
import { redirectRes } from "bnkit/server";
import { v7 as uuid } from "bnkit/uuid";
import Database from "bun:sqlite";
import { log, users } from "~/db";
import { middleware } from "~/middleware";

export const jwtSecret = "SQ43KRet";
export const jwtFactory = jwtBack({
	factorySignSecret: jwtSecret,
	handlers: bnk.jwt.createJwtFileHandlers("./jwts.json"),
});

export const getTokenExpireEpoch = (date: Date, tokenValidTimeSec: number) => {
	const expireEpoch = date.getTime() + tokenValidTimeSec;

	return expireEpoch;
};

export async function createUser({
	password,
	email,
	firstName,
	lastName,
	customerId,
}: {
	password: string;
	email: string;
	firstName?: string;
	lastName?: string;
	customerId?: string;
}) {
	try {
		const salt = uuid();
		const passwordHash = await createToken(password, salt);
		const userId = uuid();

		// TODO need to update schema to allow params to be set optional
		users.create({
			id: userId,
			passwordHash,
			salt,
			email,
			firstName: firstName ? firstName : "",
			lastName: lastName ? lastName : "",
			stripeCustomerId: customerId ? customerId : "",
			createdAt: new Date(),
			updatedAt: new Date(),
		});

		console.info("User inserted:", userId);

		return users.readWhere({ email });
	} catch (e) {
		log("Error creating user", { error: e });
		return null;
	}
}

export async function loginUser(
	db: Database,
	email: string,
	password: string,
): Promise<{ user: ReturnType<typeof users.infer>; token: string } | null> {
	const existingUser = users.readWhere({ email })[0];
	if (!existingUser) {
		console.info("User does not exist:", email);
		return null;
	}

	const isMatch = await verifyToken(
		password,
		existingUser.salt,
		existingUser.passwordHash,
	);

	if (!isMatch) {
		console.info("Password is incorrect for user:", existingUser.email);
		return null;
	}

	const jwtPayload = {
		userId: existingUser.id,
		email: existingUser.email,
	};

	const token = jwtFactory.createJwt({
		payload: jwtPayload,
	});

	return { user: existingUser, token };
}

export async function authenticateUserJwt(
	db: Database,
	email: string,
	password: string,
) {
	const existingUser = users.readWhere({ email })[0];

	if (!existingUser) {
		console.info("User with email does not exist:", email);
		return null;
	}

	const isMatch = await verifyToken(
		password,
		existingUser.salt,
		existingUser.passwordHash,
	);

	if (!isMatch) {
		console.info("Password is incorrect for user:", existingUser.email);
		return null;
	}

	const jwtPayload = {
		userId: existingUser.id,
		email: existingUser.email,
	};

	const token = await jwtFactory.createJwt({
		payload: jwtPayload,
	});

	return { user: existingUser, token };
}

export const authUser = async (
	auth: ReturnType<(typeof middleware)["auth"]>,
) => {
	if (auth === null) {
		return redirectRes("/login");
	}

	const jwtVerification = await auth.verifyJwt();
	if (!jwtVerification?.payload) {
		return redirectRes("/login");
	}

	const { userId } = jwtVerification.payload;
	const user = users.getById(userId);

	if (!user) {
		return redirectRes("/login");
	}

	return user;
};
