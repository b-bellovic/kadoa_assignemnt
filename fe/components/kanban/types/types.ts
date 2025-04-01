/**
 * Represents a task in the kanban board
 */
export interface Task {
	id: string;
	title: string;
	description?: string;
	/** The ID of the column this task belongs to */
	columnId: string;
	/** Position of the task within its column */
	order: number;
	createdAt: string;
	updatedAt: string;
}

/**
 * Represents a column in the kanban board
 */
export interface Column {
	id: string;
	title: string;
	/** Position of the column in the board */
	order: number;
	createdAt: string;
	updatedAt: string;
}

/**
 * Complete data structure for the kanban board
 */
export interface BoardData {
	columns: Column[];
	tasks: Task[];
}

/**
 * Possible event types for task-related operations
 * Used in real-time event handling
 */
export type TaskEventType =
	| "task.created"
	| "task.updated"
	| "task.deleted"
	| "task.moved"
	| "task.reordered"
	| "tasks.reordered";

/**
 * Possible event types for column-related operations
 * Used in real-time event handling
 */
export type ColumnEventType =
	| "column.created"
	| "column.updated"
	| "column.deleted"
	| "column.reordered";

/**
 * Data structure for task events
 * Contains at minimum the task ID plus any changed properties
 */
export interface TaskEventData extends Partial<Task> {
	id: string;
}

/**
 * Data structure for column events
 * Contains at minimum the column ID plus any changed properties
 */
export interface ColumnEventData extends Partial<Column> {
	id: string;
}

/**
 * Properties that can be updated on a task
 */
export interface TaskUpdates {
	title?: string;
	description?: string;
	order?: number;
	columnId?: string;
}

/**
 * Properties that can be updated on a column
 */
export interface ColumnUpdates {
	title?: string;
	order?: number;
}

/**
 * Parameters for creating a new column
 */
export interface CreateColumnParams {
	title: string;
	order: number;
}

/**
 * Parameters for updating an existing column
 */
export interface UpdateColumnParams {
	columnId: string;
	updates: ColumnUpdates;
}

/**
 * Parameters for creating a new task
 */
export interface CreateTaskParams {
	title: string;
	description: string;
	columnId: string;
	order: number;
}

/**
 * Parameters for updating an existing task
 */
export interface UpdateTaskParams {
	taskId: string;
	updates: TaskUpdates;
}

/**
 * Parameters for creating a new task using AI generation
 */
export interface CreateAITaskParams {
	prompt: string;
	columnId: string;
}
