import request from "supertest";
import { BaseTest } from "./utils/base-test";

class AuthTest extends BaseTest {
	async setup() {
		await this.setupTest(false);
	}

	async teardown() {
		await this.teardownTest();
	}

	async registerUser(email: string, password: string) {
		return request(this.getHttpServer())
			.post("/users/register")
			.send({ email, password });
	}

	async loginUser(email: string, password: string) {
		return request(this.getHttpServer())
			.post("/auth/login")
			.send({ email, password });
	}

	async getProfile(token?: string) {
		const req = request(this.getHttpServer()).get("/users/profile");
		if (token) {
			req.set("Authorization", `Bearer ${token}`);
		}
		return req;
	}
}

describe("Authentication (e2e)", () => {
	let testContext: AuthTest;

	beforeAll(async () => {
		testContext = new AuthTest();
		await testContext.setup();
	});

	afterAll(async () => {
		await testContext.teardown();
	});

	describe("Authentication Flow", () => {
		const testUser = {
			email: "test@example.com",
			password: "password123",
		};

		let jwtToken: string;

		it("should register a new user", async () => {
			const response = await testContext.registerUser(
				testUser.email,
				testUser.password,
			);
			expect(response.status).toBe(201);
			expect(response.body).toHaveProperty("id");
			expect(response.body).toHaveProperty("email", testUser.email);
			expect(response.body).toHaveProperty("createdAt");
			expect(response.body).toHaveProperty("updatedAt");
			expect(response.body).not.toHaveProperty("password");
		});

		it("should not register a user with existing email", async () => {
			const response = await testContext.registerUser(
				testUser.email,
				testUser.password,
			);
			expect(response.status).toBe(409);
			expect(response.body).toHaveProperty("message", "Email already exists");
		});

		it("should login with valid credentials", async () => {
			const response = await testContext.loginUser(
				testUser.email,
				testUser.password,
			);
			expect(response.status).toBe(201);
			expect(response.body).toHaveProperty("access_token");
			jwtToken = response.body.access_token;
		});

		it("should not login with invalid credentials", async () => {
			const response = await testContext.loginUser(
				testUser.email,
				"wrongpassword",
			);
			expect(response.status).toBe(401);
			expect(response.body).toHaveProperty("message", "Invalid credentials");
		});

		it("should access protected route with valid JWT", async () => {
			const response = await testContext.getProfile(jwtToken);
			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty("id");
			expect(response.body).toHaveProperty("email", testUser.email);
			expect(response.body).not.toHaveProperty("password");
		});

		it("should not access protected route without JWT", async () => {
			const response = await testContext.getProfile();
			expect(response.status).toBe(401);
		});

		it("should not access protected route with invalid JWT", async () => {
			const response = await testContext.getProfile("invalid.token.here");
			expect(response.status).toBe(401);
		});
	});
});
