import { createSqliteFactory } from "bnkit/sqlite";
import { FieldDef } from "bnkit/sqlite/sqlite-factory";
import { uuidV7DT } from "bnkit/uuid/generate-uuid";
import { db } from "./db";

const idField = {
	primaryKey: true,
	type: "TEXT",
	unique: true,
} satisfies FieldDef;

export const dbFactory = createSqliteFactory({
	db,
	enableForeignKeys: true,
	debug: false,
});

export const users = dbFactory.dbTableFactory({
	tableName: "users",
	schema: {
		id: idField,
		createdAt: { type: "DATE", defaultValue: "CURRENT_TIMESTAMP" },
		updatedAt: { type: "DATE", defaultValue: "CURRENT_TIMESTAMP" },
		passwordHash: { type: "TEXT" },
		salt: { type: "TEXT" },
		stripeCustomerId: { type: "TEXT" },
		email: { type: "TEXT", required: true },
		firstName: { type: "TEXT" },
		lastName: { type: "TEXT" },
	},
});

export const prices = dbFactory.dbTableFactory({
	tableName: "prices",
	schema: {
		id: idField,
		createdAt: { type: "DATE", defaultValue: "CURRENT_TIMESTAMP" },
		updatedAt: { type: "DATE", defaultValue: "CURRENT_TIMESTAMP" },
		planId: { type: "TEXT", foreignKey: "plans(id)" },
		amount: { type: "INTEGER" },
		currency: { type: "TEXT" },
		interval: { type: "TEXT" },
		active: { type: "INTEGER" },
	},
});

export const plans = dbFactory.dbTableFactory({
	tableName: "plans",
	schema: {
		id: idField,
		createdAt: { type: "DATE", defaultValue: "CURRENT_TIMESTAMP" },
		updatedAt: { type: "DATE", defaultValue: "CURRENT_TIMESTAMP" },
		name: { type: "TEXT" },
		description: { type: "TEXT" },
		active: { type: "INTEGER" },
	},
});

export const subscriptions = dbFactory.dbTableFactory({
	tableName: "subscriptions",
	schema: {
		id: idField,
		createdAt: { type: "DATE", defaultValue: "CURRENT_TIMESTAMP" },
		updatedAt: { type: "DATE", defaultValue: "CURRENT_TIMESTAMP" },
		userId: { type: "TEXT" },
		planId: { type: "TEXT", foreignKey: "plans(id)" },
		priceId: { type: "TEXT", foreignKey: "prices(id)" },
		interval: { type: "TEXT" },
		status: { type: "TEXT" },
		currentPeriodStart: { type: "INTEGER" },
		currentPeriodEnd: { type: "INTEGER" },
		cancelAtPeriodEnd: { type: "INTEGER" },
	},
});

export const planLimit = dbFactory.dbTableFactory({
	tableName: "planLimits",
	schema: {
		id: idField,
		createdAt: { type: "DATE", defaultValue: "CURRENT_TIMESTAMP" },
		updatedAt: { type: "DATE", defaultValue: "CURRENT_TIMESTAMP" },
		planId: { type: "TEXT", foreignKey: "plans(id)" },
		maxItems: { type: "INTEGER" },
	},
});

type Log = {
	data: string;
	level?: "log" | "info" | "error";
	parseAs?: "json" | "string" | "number";
	outputLevel?: boolean;
	error?: Error | unknown;
	dbSave?: boolean;
	returnCreatedLog?: boolean;
};

export const logs = dbFactory.dbTableFactory({
	tableName: "logs",
	// allow option for uuid: true, create uuid v7 as primary key
	schema: {
		id: { primaryKey: true, type: "TEXT", unique: true },
		data: { type: "TEXT" },
		type: { type: "TEXT" },
		parseAs: { type: "TEXT" },
		error: { required: false, type: "TEXT" },
		createdAt: { type: "DATE", defaultValue: "CURRENT_TIMESTAMP" },
		updatedAt: { type: "DATE", defaultValue: "CURRENT_TIMESTAMP" },
	},
});

export const log = (data: string, options?: Omit<Log, "data">) => {
	try {
		const dbSave = options?.dbSave ?? true;
		const returnCreatedLog = options?.returnCreatedLog ?? false;

		const [id, date] = uuidV7DT();
		const { level: type = "log", parseAs = "string" } = options || {};

		const logStr = [];

		if (options?.outputLevel) {
			logStr.push(`[${type}]`);
		}

		logStr.push(`[${date}]`);
		logStr.push(data);

		console[type](logStr.join(" "));

		if (!dbSave) return;

		return logs.create(
			{
				id,
				data,
				type,
				parseAs: parseAs ?? "string",
				// @ts-expect-error - error is optional, but type isn't inferred automatically
				error: options?.error ? JSON.stringify(options?.error) : undefined,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			{ returnInsertedItem: returnCreatedLog },
		);
	} catch (error) {
		console.error("Error logging", { error });
	}
};

export const logJson = (data: unknown, options?: Omit<Log, "data">) => {
	return log(JSON.stringify(data), {
		...options,
		parseAs: "json",
	});
};
