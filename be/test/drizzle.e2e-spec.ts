import { BaseTest } from "./utils/base-test";

class DrizzleTest extends BaseTest {
	async setup() {
		await this.setupTest(false);
	}

	async teardown() {
		await this.teardownTest();
	}

	async testDatabaseServiceIsDefined() {
		expect(this.dbService).toBeDefined();
	}

	async testDatabaseConnection() {
		const db = this.dbService.getDB();
		expect(db).toBeDefined();
	}
}

describe("Drizzle (e2e)", () => {
	let testContext: DrizzleTest;

	beforeAll(async () => {
		testContext = new DrizzleTest();
		await testContext.setup();
	});

	afterAll(async () => {
		await testContext.teardown();
	});

	it("should be defined", () => {
		return testContext.testDatabaseServiceIsDefined();
	});

	it("should connect to the database", () => {
		return testContext.testDatabaseConnection();
	});
});
