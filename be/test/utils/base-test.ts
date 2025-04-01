import { INestApplication } from "@nestjs/common";
import { StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import request from "supertest";
import { DatabaseService } from "../../src/database/database.service";
import { taskColumns, tasks, users } from "../../src/schema";
import { TestContext, setupTestApp, setupTestContainer } from "./test-utils";

export class BaseTest {
	protected app: INestApplication;
	protected dbService: DatabaseService;
	protected container: StartedPostgreSqlContainer;
	protected jwtToken: string;

	protected async setupTest(needsAuth = false): Promise<void> {
		this.container = await setupTestContainer();
		const context: TestContext = await setupTestApp(this.container);

		this.app = context.app;
		this.dbService = context.dbService;
		this.container = context.container;

		if (needsAuth) {
			this.jwtToken = await this.authenticateUser();
		}
	}

	protected async teardownTest(): Promise<void> {
		const db = this.dbService.getDB();
		// Clean up in reverse order of dependencies
		await db.delete(tasks).execute();
		await db.delete(taskColumns).execute();
		await db.delete(users).execute();
		await this.app.close();
		await this.container?.stop();
	}

	protected async authenticateUser(): Promise<string> {
		const testUser = {
			email: "test@example.com",
			password: "password123",
		};

		await request(this.getHttpServer()).post("/users/register").send(testUser);

		const loginResponse = await request(this.getHttpServer())
			.post("/auth/login")
			.send(testUser);

		return loginResponse.body.access_token;
	}

	protected getHttpServer() {
		return this.app.getHttpServer();
	}
}
