export const endpointSecret = process.env.STRIPE_WEBHOOK_ENDPOINT || '';

export const isDev = Bun.env.NODE_ENV === 'development' || '';

export const sessionSecret = Bun.env.SESSION_SECRET || '';

export const stripePublicKey = Bun.env.STRIPE_PUBLIC_KEY || '';
export const stripeSecretKey = Bun.env.STRIPE_SECRET_KEY || '';

export const webhookEndpoint = Bun.env.STRIPE_WEBHOOK || '';
export const hostURL = Bun.env.HOST_URL || '';
