import { eq } from "drizzle-orm";
import request from "supertest";
import { tasks } from "../src/schema";
import { BaseTest } from "./utils/base-test";

class TaskTest extends BaseTest {
	async setup() {
		await this.setupTest(true);
	}

	async teardown() {
		await this.teardownTest();
	}

	async createColumn(title: string, description: string, order: number) {
		return request(this.getHttpServer())
			.post("/board/column")
			.set("Authorization", `Bearer ${this.jwtToken}`)
			.send({ title, description, order });
	}

	async getBoard() {
		return request(this.getHttpServer())
			.get("/board")
			.set("Authorization", `Bearer ${this.jwtToken}`);
	}

	async createTask(
		title: string,
		description: string,
		columnId: string,
		order: number,
	) {
		return request(this.getHttpServer())
			.post("/board/task")
			.set("Authorization", `Bearer ${this.jwtToken}`)
			.send({ title, description, columnId, order, status: "TODO" });
	}

	async moveTask(taskId: string, targetColumnId: string) {
		return request(this.getHttpServer())
			.post(`/board/task/${taskId}/move`)
			.set("Authorization", `Bearer ${this.jwtToken}`)
			.send({ targetColumnId });
	}

	async reorderTasks(columnId: string, taskIds: string[]) {
		return request(this.getHttpServer())
			.post(`/board/column/${columnId}/reorder`)
			.set("Authorization", `Bearer ${this.jwtToken}`)
			.send({ taskIds });
	}

	async deleteTask(taskId: string) {
		return this.dbService
			.getDB()
			.delete(tasks)
			.where(eq(tasks.id, taskId))
			.execute();
	}

	async deleteColumn(columnId: string) {
		return request(this.getHttpServer())
			.delete(`/board/column/${columnId}`)
			.set("Authorization", `Bearer ${this.jwtToken}`);
	}

	// Helper methods for critical path tests
	async getBoardWithoutAuth() {
		return request(this.getHttpServer()).get("/board");
	}

	async createTaskWithoutAuth(
		title: string,
		description: string,
		columnId: string,
		order: number,
	) {
		return request(this.getHttpServer())
			.post("/board/task")
			.send({ title, description, columnId, order, status: "TODO" });
	}

	async moveTaskWithInvalidToken(taskId: string, targetColumnId: string) {
		return request(this.getHttpServer())
			.post(`/board/task/${taskId}/move`)
			.set("Authorization", "Bearer invalid_token")
			.send({ targetColumnId });
	}

	async setupTestData() {
		// Create initial columns
		const column1Response = await this.createColumn(
			"To Do",
			"Tasks to be done",
			0,
		);
		const column2Response = await this.createColumn(
			"In Progress",
			"Tasks being worked on",
			1,
		);

		// Create a task in the first column
		const taskResponse = await this.createTask(
			"Test Task",
			"Test Description",
			column1Response.body.id,
			0,
		);

		return {
			column1Id: column1Response.body.id,
			column2Id: column2Response.body.id,
			taskId: taskResponse.body.id,
		};
	}
}

describe("Task Management (e2e)", () => {
	let testContext: TaskTest;
	let testData: { column1Id: string; column2Id: string; taskId: string };

	beforeAll(async () => {
		testContext = new TaskTest();
		await testContext.setup();
		testData = await testContext.setupTestData();
	});

	afterAll(async () => {
		await testContext.teardown();
	});

	describe("Board Management", () => {
		it("should create a column", async () => {
			const response = await testContext.createColumn(
				"To Do",
				"Tasks to be done",
				0,
			);
			expect(response.status).toBe(201);
			expect(response.body).toHaveProperty("id");
			expect(response.body.title).toBe("To Do");
			expect(response.body.description).toBe("Tasks to be done");
			expect(response.body.order).toBe(0);
		});

		it("should get the board state", async () => {
			const response = await testContext.getBoard();
			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty("columns");
			expect(Array.isArray(response.body.columns)).toBe(true);
			expect(response.body.columns.length).toBeGreaterThan(0);
		});

		it("should create a task in a column", async () => {
			const response = await testContext.createTask(
				"Another Task",
				"Another Description",
				testData.column1Id,
				1,
			);
			expect(response.status).toBe(201);
			expect(response.body).toHaveProperty("id");
			expect(response.body.title).toBe("Another Task");
			expect(response.body.description).toBe("Another Description");
			expect(response.body.columnId).toBe(testData.column1Id);
			expect(response.body.order).toBe(1);
		});

		it("should move a task to another column", async () => {
			const moveResponse = await testContext.moveTask(
				testData.taskId,
				testData.column2Id,
			);
			expect(moveResponse.status).toBe(201);

			// Wait for the move operation to complete
			await new Promise((resolve) => setTimeout(resolve, 100));

			const boardResponse = await testContext.getBoard();
			const movedTask = boardResponse.body.columns
				.find((c: any) => c.id === testData.column2Id)
				?.tasks.find((t: any) => t.id === testData.taskId);
			expect(movedTask).toBeDefined();
			expect(movedTask.id).toBe(testData.taskId);
			expect(movedTask.columnId).toBe(testData.column2Id);
		});

		it("should reorder tasks within a column", async () => {
			// Create another task in the second column
			const newTaskResponse = await testContext.createTask(
				"Another Task",
				"Another Description",
				testData.column2Id,
				1,
			);

			// Wait for the task creation to complete
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Get the current tasks in the column
			const boardResponse = await testContext.getBoard();
			const column = boardResponse.body.columns.find(
				(c: any) => c.id === testData.column2Id,
			);
			expect(column).toBeDefined();
			const tasks = column.tasks;
			expect(tasks.length).toBe(2);

			// Reorder the tasks
			const response = await testContext.reorderTasks(testData.column2Id, [
				newTaskResponse.body.id,
				tasks[0].id,
			]);
			expect(response.status).toBe(201);

			// Wait for the reorder operation to complete
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Verify the tasks are in the correct order
			const updatedBoardResponse = await testContext.getBoard();
			const updatedColumn = updatedBoardResponse.body.columns.find(
				(c: any) => c.id === testData.column2Id,
			);
			expect(updatedColumn).toBeDefined();
			const updatedTasks = updatedColumn.tasks;
			expect(updatedTasks.length).toBe(2);
			expect(updatedTasks[0].id).toBe(newTaskResponse.body.id);
			expect(updatedTasks[1].id).toBe(tasks[0].id);
		});

		it("should delete a column and its tasks", async () => {
			const columnResponse = await testContext.createColumn(
				"To Delete",
				"Column to be deleted",
				3,
			);

			const taskResponse = await testContext.createTask(
				"Task to Delete",
				"This task should be deleted with the column",
				columnResponse.body.id,
				0,
			);

			await testContext.deleteTask(taskResponse.body.id);

			const response = await testContext.deleteColumn(columnResponse.body.id);
			expect(response.status).toBe(200);
		});

		describe("Critical Path Tests", () => {
			it("should enforce authentication for protected endpoints", async () => {
				// Test board access
				const boardResponse = await testContext.getBoardWithoutAuth();
				expect(boardResponse.status).toBe(401);

				// Test task creation
				const createTaskResponse = await testContext.createTaskWithoutAuth(
					"Test Task",
					"Test Description",
					testData.column1Id,
					0,
				);
				expect(createTaskResponse.status).toBe(401);

				// Test invalid token
				const moveTaskResponse = await testContext.moveTaskWithInvalidToken(
					testData.taskId,
					testData.column2Id,
				);
				expect(moveTaskResponse.status).toBe(401);
			});

			it("should handle non-existent task move gracefully", async () => {
				const nonExistentTaskId = "00000000-0000-0000-0000-000000000000";

				const response = await testContext.moveTask(
					nonExistentTaskId,
					testData.column2Id,
				);
				expect(response.status).toBe(404);
			});

			it("should handle non-existent column move gracefully", async () => {
				const nonExistentColumnId = "00000000-0000-0000-0000-000000000000";

				const response = await testContext.moveTask(
					testData.taskId,
					nonExistentColumnId,
				);
				expect(response.status).toBe(404);
			});

			it("should handle reordering with invalid task IDs", async () => {
				const nonExistentTaskId = "00000000-0000-0000-0000-000000000000";

				const response = await testContext.reorderTasks(testData.column1Id, [
					nonExistentTaskId,
				]);
				expect(response.status).toBe(404);
			});

			it("should prevent deleting a column with tasks", async () => {
				const columnResponse = await testContext.createColumn(
					"Column with Tasks",
					"Should not be deletable",
					3,
				);

				await testContext.createTask(
					"Blocking Task",
					"This task prevents column deletion",
					columnResponse.body.id,
					0,
				);

				const response = await testContext.deleteColumn(columnResponse.body.id);
				expect(response.status).toBe(400);
				expect(response.body.message).toBe(
					"Cannot delete column that contains tasks",
				);
			});
		});
	});
});
