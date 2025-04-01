import { Global, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { DatabaseService } from "./database.service";

@Global()
@Module({
	imports: [ConfigModule],
	providers: [
		{
			provide: "SQL",
			inject: [ConfigService],
			useFactory: async (configService: ConfigService) => {
				return postgres(configService.getOrThrow<string>("DATABASE_URL"));
			},
		},
		{
			provide: "DB",
			inject: ["SQL"],
			useFactory: async (sql: postgres.Sql) => {
				return drizzle(sql);
			},
		},
		DatabaseService,
	],
	exports: ["DB", "SQL", DatabaseService],
})
export class DatabaseModule {}
