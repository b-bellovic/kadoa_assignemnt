import { apiClient } from "@/lib/api-client";
import { BoardData, Column, Task } from "@/components/kanban/types/types";
import { API_PATHS } from "./paths";

/**
 * Types for API responses
 */
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

/**
 * Board-related API operations
 */
export const boardApi = {
	/**
	 * Fetch the entire board using the GetBoardQuery endpoint
	 * @returns Promise resolving to board data containing columns and tasks
	 */
	getBoard: async (): Promise<BoardData> => {
		const response = await apiClient<BoardApiResponse>(API_PATHS.BOARD);

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

		return { columns, tasks };
	},
};
