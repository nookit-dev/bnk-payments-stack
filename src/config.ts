export const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

export const isDev = Bun.env.NODE_ENV === "development" || "";

if (isDev) {
	console.info("Running in development mode.");
}

export const sessionSecret = Bun.env.SESSION_SECRET || "";
export const stripePublicKey = Bun.env.STRIPE_PUBLIC_KEY || "";
export const stripeSecretKey = Bun.env.STRIPE_SECRET_KEY || "";
export const hostURL = Bun.env.HOST_URL || "";

const config = {
	endpointSecret,
	isDev,
	sessionSecret,
	stripePublicKey,
	stripeSecretKey,
	hostURL,
};

const configKeys = Object.keys(config) as (keyof typeof config)[];

if (isDev) {
	console.info(new Date().toISOString());
}

for (const key of configKeys) {
	if (!config[key]) {
		throw new Error(`Missing required environment variable: ${key}`);
	}
}
