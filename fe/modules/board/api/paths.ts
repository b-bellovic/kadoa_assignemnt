/**
 * Constants for API paths
 */
export const API_PATHS = {
	BOARD: "/board",
	COLUMN: "/board/column",
	COLUMNS_REORDER: "/board/columns/reorder",
	TASK: "/board/task",
	TASK_GENERATE: "/board/task/generate",
	getColumnPath: (columnId: string) => `/board/column/${columnId}`,
	getColumnReorderPath: (columnId: string) =>
		`/board/column/${columnId}/reorder`,
	getTaskPath: (taskId: string) => `/board/task/${taskId}`,
	getTaskMovePath: (taskId: string) => `/board/task/${taskId}/move`,
};
