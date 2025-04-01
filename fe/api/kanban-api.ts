import { apiClient } from "@/lib/api-client";
import {
	BoardData,
	Column,
	ColumnUpdates,
	Task,
	TaskUpdates,
} from "@/components/kanban/types/types";

/**
 * Kanban API module
 * Contains API calls for kanban board operations
 */
export const kanbanApi = {
	/**
	 * Fetch the entire board using the GetBoardQuery endpoint
	 * @returns Promise resolving to board data containing columns and tasks
	 */
	getBoard: async (): Promise<BoardData> => {
		// Define the response type from the backend API
		interface BoardApiResponse {
			columns: Array<{
				id: string;
				title: string;
				description: string | null;
				createdAt: string;
				updatedAt: string;
				tasks: Array<{
					id: string;
					title: string;
					description: string | null;
					order: number;
					columnId: string;
					createdAt: string;
					updatedAt: string;
					assignee?: {
						id: string;
						email: string;
					};
				}>;
			}>;
		}

		// Use the dedicated GetBoardQuery endpoint which returns nested data
		const response = await apiClient<BoardApiResponse>("/board");

		// Extract columns with their positions
		const columnsMap = new Map<string, Column>();
		response.columns.forEach((column, index) => {
			columnsMap.set(column.id, {
				id: column.id,
				title: column.title,
				order: index * 1000, // Set order based on array index
				createdAt: column.createdAt,
				updatedAt: column.updatedAt,
			});
		});

		const columns = Array.from(columnsMap.values());

		// Extract all tasks from the nested structure
		const tasks: Task[] = [];
		response.columns.forEach((column) => {
			column.tasks.forEach((task) => {
				tasks.push({
					id: task.id,
					title: task.title,
					description: task.description || "",
					columnId: task.columnId,
					order: task.order,
					createdAt: task.createdAt,
					updatedAt: task.updatedAt,
				});
			});
		});

		return {
			columns,
			tasks,
		};
	},

	/**
	 * Create a new column
	 * @param title - Column title
	 * @param order - Display order for the column
	 * @returns Promise resolving to the created column
	 */
	createColumn: async (title: string, order: number): Promise<Column> => {
		return apiClient<Column>("/board/column", {
			method: "POST",
			body: JSON.stringify({
				title,
				order,
			}),
		});
	},

	/**
	 * Update a column
	 * @param columnId - ID of the column to update
	 * @param updates - Object containing properties to update
	 * @returns Promise resolving to the updated column
	 */
	updateColumn: async (
		columnId: string,
		updates: ColumnUpdates,
	): Promise<Column> => {
		return apiClient<Column>(`/board/column/${columnId}`, {
			method: "PATCH",
			body: JSON.stringify(updates),
		});
	},

	/**
	 * Delete a column
	 * @param columnId - ID of the column to delete
	 * @returns Promise resolving when the column is deleted
	 */
	deleteColumn: async (columnId: string): Promise<void> => {
		await apiClient(`/board/column/${columnId}`, {
			method: "DELETE",
		});
	},

	/**
	 * Reorder columns on the board
	 * @param columnIds - Array of column IDs in their new order
	 * @returns Promise resolving when the columns are reordered
	 */
	reorderColumns: async (columnIds: string[]): Promise<void> => {
		await apiClient("/board/columns/reorder", {
			method: "POST",
			body: JSON.stringify({
				columnIds,
			}),
		});
	},

	/**
	 * Create a new task
	 * @param title - Task title
	 * @param description - Task description
	 * @param columnId - ID of the column this task belongs to
	 * @param order - Display order for the task
	 * @returns Promise resolving to the created task
	 */
	createTask: async (
		title: string,
		description: string,
		columnId: string,
		order: number,
	): Promise<Task> => {
		return apiClient<Task>("/board/task", {
			method: "POST",
			body: JSON.stringify({
				title,
				description,
				columnId,
				order,
			}),
		});
	},

	/**
	 * Update a task
	 * @param taskId - ID of the task to update
	 * @param updates - Object containing properties to update
	 * @returns Promise resolving to the updated task
	 */
	updateTask: async (taskId: string, updates: TaskUpdates): Promise<Task> => {
		// If columnId is being updated, use the move task endpoint
		if (updates.columnId) {
			return apiClient<Task>(`/board/task/${taskId}/move`, {
				method: "POST",
				body: JSON.stringify({
					targetColumnId: updates.columnId,
				}),
			});
		}

		return apiClient<Task>(`/board/task/${taskId}`, {
			method: "PATCH",
			body: JSON.stringify(updates),
		});
	},

	/**
	 * Delete a task
	 * @param taskId - ID of the task to delete
	 * @returns Promise resolving when the task is deleted
	 */
	deleteTask: async (taskId: string): Promise<void> => {
		await apiClient(`/board/task/${taskId}`, {
			method: "DELETE",
		});
	},

	/**
	 * Generate a task using AI
	 * @param prompt - Natural language prompt for the AI
	 * @param columnId - ID of the column where the task should be created
	 * @returns Promise resolving to the generated task content
	 */
	generateTask: async (
		prompt: string,
		columnId: string,
	): Promise<{ title: string; description: string }> => {
		return apiClient<{ title: string; description: string }>(
			"/board/task/generate",
			{
				method: "POST",
				body: JSON.stringify({
					description: prompt,
					columnId,
				}),
			},
		);
	},
};
