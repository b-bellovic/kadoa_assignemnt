import { apiClient } from "@/lib/api-client";
import {
	Task,
	TaskUpdates,
	GenerateTaskResponse,
	MoveTaskParams,
} from "@/components/kanban/types/types";
import { API_PATHS } from "./paths";

/**
 * Task-related API operations
 */
export const tasksApi = {
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
		return apiClient<Task>(API_PATHS.TASK, {
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
			return apiClient<Task>(API_PATHS.getTaskMovePath(taskId), {
				method: "POST",
				body: JSON.stringify({
					targetColumnId: updates.columnId,
					order: updates.order,
				}),
			});
		}

		return apiClient<Task>(API_PATHS.getTaskPath(taskId), {
			method: "PATCH",
			body: JSON.stringify(updates),
		});
	},

	/**
	 * Move a task to a different column
	 * @param params - Task moving parameters
	 * @returns Promise resolving to the moved task
	 */
	moveTask: async (params: MoveTaskParams): Promise<Task> => {
		return apiClient<Task>(API_PATHS.getTaskMovePath(params.taskId), {
			method: "POST",
			body: JSON.stringify({
				targetColumnId: params.targetColumnId,
				order: params.order,
			}),
		});
	},

	/**
	 * Delete a task
	 * @param taskId - ID of the task to delete
	 * @returns Promise resolving when the task is deleted
	 */
	deleteTask: async (taskId: string): Promise<void> => {
		await apiClient(API_PATHS.getTaskPath(taskId), {
			method: "DELETE",
		});
	},

	/**
	 * Reorder tasks within a column
	 * @param columnId - ID of the column containing the tasks
	 * @param taskIds - Array of task IDs in their new order
	 * @returns Promise resolving when the tasks are reordered
	 */
	reorderTasks: async (columnId: string, taskIds: string[]): Promise<void> => {
		await apiClient(API_PATHS.getColumnReorderPath(columnId), {
			method: "POST",
			body: JSON.stringify({ taskIds }),
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
	): Promise<GenerateTaskResponse> => {
		return apiClient<GenerateTaskResponse>(API_PATHS.TASK_GENERATE, {
			method: "POST",
			body: JSON.stringify({
				description: prompt,
				columnId,
			}),
		});
	},
};
