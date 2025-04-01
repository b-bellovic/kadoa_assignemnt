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
export class DatabaseService implements OnModuleDestroy {
	constructor(
		@Inject("DB") private readonly db: PostgresJsDatabase<typeof schema>,
		@Inject("SQL") private readonly sql: postgres.Sql,
	) {}

	async onModuleDestroy() {
		await this.sql.end();
	}

	getDB() {
		return this.db;
	}
}
