import { INestApplication } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import {
	PostgreSqlContainer,
	StartedPostgreSqlContainer,
} from "@testcontainers/postgresql";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import request from "supertest";
import { AppModule } from "../../src/app.module";
import { DatabaseService } from "../../src/database/database.service";

export interface TestContext {
	app: INestApplication;
	dbService: DatabaseService;
	container: StartedPostgreSqlContainer;
	jwtToken?: string;
}

export async function setupTestContainer(): Promise<StartedPostgreSqlContainer> {
	return new PostgreSqlContainer()
		.withDatabase("test-db")
		.withUsername("test-user")
		.withPassword("test-pass")
		.start();
}

export async function setupTestApp(
	container: StartedPostgreSqlContainer,
): Promise<TestContext> {
	const sql = postgres(container.getConnectionUri(), { max: 1 });
	const db = drizzle(sql);
	await migrate(db, { migrationsFolder: "drizzle" });

	const moduleFixture: TestingModule = await Test.createTestingModule({
		imports: [
			ConfigModule.forRoot({
				isGlobal: true,
				load: [
					() => ({
						DATABASE_URL: container.getConnectionUri(),
						JWT_SECRET: "test-jwt-secret",
					}),
				],
			}),
			AppModule,
		],
	})
		.overrideProvider("DB")
		.useValue(db)
		.overrideProvider("SQL")
		.useValue(sql)
		.compile();

	const app = moduleFixture.createNestApplication();
	const dbService = moduleFixture.get<DatabaseService>(DatabaseService);
	await app.init();

	return { app, dbService, container };
}

export async function authenticateUser(app: INestApplication): Promise<string> {
	const testUser = {
		email: "test@example.com",
		password: "password123",
	};

	await request(app.getHttpServer()).post("/users/register").send(testUser);

	const loginResponse = await request(app.getHttpServer())
		.post("/auth/login")
		.send(testUser);

	return loginResponse.body.access_token;
}

export const testUser = {
	email: "test@example.com",
	password: "password123",
};
