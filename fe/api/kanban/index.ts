import { boardApi } from "./board";
import { columnsApi } from "./columns";
import { tasksApi } from "./tasks";

/**
 * Unified API module for Kanban board operations
 * Provides a clean interface for all board-related API calls
 */
export const kanbanApi = {
	...boardApi,
	...columnsApi,
	...tasksApi,
};
