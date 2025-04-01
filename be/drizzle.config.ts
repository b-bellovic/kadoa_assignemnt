import "dotenv/config";

import type { Config } from "drizzle-kit";

const connectionString = process.env.DATABASE_URL || "";

export default {
	schema: "./src/schema.ts",
	out: "./drizzle",
	dialect: "postgresql",
	dbCredentials: {
		url: connectionString,
	},
} satisfies Config;
