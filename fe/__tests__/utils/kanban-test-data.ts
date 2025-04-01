import { BoardData, Column, Task } from "@/components/kanban/types/types";

/**
 * Mock board data with columns and tasks for testing
 */
export const mockBoardData: BoardData = {
	columns: [
		{
			id: "col1",
			title: "To Do",
			order: 1000,
			createdAt: "2023-01-01",
			updatedAt: "2023-01-01",
		},
		{
			id: "col2",
			title: "In Progress",
			order: 2000,
			createdAt: "2023-01-01",
			updatedAt: "2023-01-01",
		},
		{
			id: "col3",
			title: "Done",
			order: 3000,
			createdAt: "2023-01-01",
			updatedAt: "2023-01-01",
		},
	],
	tasks: [
		{
			id: "task1",
			title: "Task 1",
			description: "Description for task 1",
			columnId: "col1",
			order: 1000,
			createdAt: "2023-01-01",
			updatedAt: "2023-01-01",
		},
		{
			id: "task2",
			title: "Task 2",
			description: "Description for task 2",
			columnId: "col1",
			order: 2000,
			createdAt: "2023-01-01",
			updatedAt: "2023-01-01",
		},
		{
			id: "task3",
			title: "Task 3",
			description: "Description for task 3",
			columnId: "col2",
			order: 1000,
			createdAt: "2023-01-01",
			updatedAt: "2023-01-01",
		},
	],
};

/**
 * Create a new mock column with specified properties
 * @param overrides - Properties to override in the mock column
 */
export function createMockColumn(overrides: Partial<Column> = {}): Column {
	return {
		id: `col-${Date.now()}`,
		title: "New Column",
		order: 4000,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		...overrides,
	};
}

/**
 * Create a new mock task with specified properties
 * @param overrides - Properties to override in the mock task
 */
export function createMockTask(overrides: Partial<Task> = {}): Task {
	return {
		id: `task-${Date.now()}`,
		title: "New Task",
		description: "Task description",
		columnId: "col1",
		order: 3000,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		...overrides,
	};
}
