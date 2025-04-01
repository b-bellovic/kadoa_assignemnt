import {
	Inject,
	Injectable,
	OnModuleDestroy,
	OnModuleInit,
} from "@nestjs/common";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../schema";

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
	constructor(
		@Inject("DB") private readonly db: PostgresJsDatabase<typeof schema>,
		@Inject("SQL") private readonly sql: postgres.Sql,
	) {}

	async onModuleInit() {
		// Add any initialization logic here
		// For example, you could run migrations
	}

	async onModuleDestroy() {
		// Close the database connection
		await this.sql.end();
	}

	// Example method to get the database instance
	getDB() {
		return this.db;
	}

	// Add more database helper methods as needed
}
