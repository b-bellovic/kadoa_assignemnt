import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import "dotenv/config";
import { hashPassword } from "./utils/crypto.util";

/**
 * Seeds the database with initial data for development and testing
 *
 * This function:
 * 1. Connects to the database using the configured connection string
 * 2. Cleans existing data from tables (tasks, columns, users)
 * 3. Creates a demo user account
 * 4. Creates default kanban columns (To Do, In Progress, Done)
 * 5. Populates the columns with sample tasks
 */
async function main() {
	/**
	 * Initialize database connection
	 */
	const connectionString = process.env.DATABASE_URL;
	if (!connectionString) {
		throw new Error("DATABASE_URL environment variable is not set");
	}

	const sql = postgres(connectionString);
	const db = drizzle(sql);

	console.log("Cleaning up existing data...");
	/**
	 * Delete all existing data in reverse order of foreign key constraints
	 * This ensures we don't encounter constraint violation errors
	 */
	await db.delete(schema.tasks);
	await db.delete(schema.taskColumns);
	await db.delete(schema.users);

	/**
	 * Create a default user for demonstration purposes
	 */
	console.log("Creating default user...");
	const passwordHash = await hashPassword("password123", 10);
	const [user] = await db
		.insert(schema.users)
		.values({
			email: "demo@example.com",
			password: passwordHash,
		})
		.returning();

	/**
	 * Create default kanban columns
	 */
	console.log("Creating columns...");
	const columns = await db
		.insert(schema.taskColumns)
		.values([
			{
				title: "To Do",
				description: "Tasks that need to be started",
				order: 0,
				createdById: user.id,
			},
			{
				title: "In Progress",
				description: "Tasks currently being worked on",
				order: 1,
				createdById: user.id,
			},
			{
				title: "Done",
				description: "Completed tasks",
				order: 2,
				createdById: user.id,
			},
		])
		.returning();

	console.log("Creating tasks...");
	/**
	 * Create a mapping of column titles to their IDs for easier reference
	 */
	const columnMap = columns.reduce(
		(acc, col) => {
			acc[col.title] = col.id;
			return acc;
		},
		{} as Record<string, string>,
	);

	/**
	 * Create sample tasks distributed across the columns
	 */
	await db.insert(schema.tasks).values([
		{
			title: "Implement Kanban board UI",
			description:
				"Create a responsive UI for the Kanban board using React components",
			columnId: columnMap["To Do"],
			order: 0,
			assigneeId: user.id,
		},
		{
			title: "Add real-time updates with WebSockets",
			description:
				"Implement WebSocket connection to receive real-time updates when tasks change",
			columnId: columnMap["To Do"],
			order: 1,
		},
		{
			title: "Design database schema for tasks",
			description:
				"Create an efficient database schema to store tasks, columns, and users",
			columnId: columnMap["In Progress"],
			order: 0,
			assigneeId: user.id,
		},
		{
			title: "Create API for CRUD operations",
			description:
				"Implement RESTful endpoints for creating, reading, updating, and deleting tasks",
			columnId: columnMap["In Progress"],
			order: 1,
		},
		{
			title: "Implement error handling",
			description:
				"Add comprehensive error handling and validation for all endpoints",
			columnId: columnMap["Done"],
			order: 0,
		},
		{
			title: "Set up authentication",
			description: "Implement JWT authentication for secure access to the API",
			columnId: columnMap["Done"],
			order: 1,
			assigneeId: user.id,
		},
		{
			title: "Integrate LLM for task creation",
			description:
				"Connect to an LLM API to generate new tasks from natural language input",
			columnId: columnMap["To Do"],
			order: 2,
		},
		{
			title: "Add drag-and-drop functionality",
			description: "Implement drag-and-drop for moving tasks between columns",
			columnId: columnMap["In Progress"],
			order: 2,
			assigneeId: user.id,
		},
	]);

	await sql.end();
	console.log("Seed completed successfully");
}

/**
 * Execute the seed function and handle any errors
 */
main().catch((e) => {
	console.error(e);
	process.exit(1);
});
