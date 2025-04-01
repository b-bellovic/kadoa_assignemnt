import { apiClient } from "@/lib/api-client";
import {
	Column,
	ColumnUpdates,
	CreateColumnParams,
} from "@/components/kanban/types/types";
import { API_PATHS } from "./paths";

/**
 * Column-related API operations
 */
export const columnsApi = {
	/**
	 * Create a new column
	 * @param title - Column title
	 * @param order - Display order for the column
	 * @returns Promise resolving to the created column
	 */
	createColumn: async (title: string, order: number): Promise<Column> => {
		return apiClient<Column>(API_PATHS.COLUMN, {
			method: "POST",
			body: JSON.stringify({ title, order }),
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
		return apiClient<Column>(API_PATHS.getColumnPath(columnId), {
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
		await apiClient(API_PATHS.getColumnPath(columnId), {
			method: "DELETE",
		});
	},

	/**
	 * Reorder columns on the board
	 * @param columnIds - Array of column IDs in their new order
	 * @returns Promise resolving when the columns are reordered
	 */
	reorderColumns: async (columnIds: string[]): Promise<void> => {
		await apiClient(API_PATHS.COLUMNS_REORDER, {
			method: "POST",
			body: JSON.stringify({ columnIds }),
		});
	},
};
