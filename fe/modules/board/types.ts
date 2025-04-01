/**
 * Base entity with common fields for all records
 */
export interface BaseEntity {
	id: string;
	createdAt: string;
	updatedAt: string;
}

/**
 * Column entity representing a Kanban board column
 */
export interface Column extends BaseEntity {
	title: string;
	order: number;
}

/**
 * Task entity representing a Kanban board task/card
 */
export interface Task extends BaseEntity {
	title: string;
	description: string;
	columnId: string;
	order: number;
}

/**
 * Board data containing all columns and tasks
 */
export interface BoardData {
	columns: Column[];
	tasks: Task[];
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
export type ColumnUpdates = Partial<
	Omit<Column, "id" | "createdAt" | "updatedAt">
>;

/**
 * Parameters for updating a column with its ID
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
export type TaskUpdates = Partial<Omit<Task, "id" | "createdAt" | "updatedAt">>;

/**
 * Parameters for updating a task with its ID
 */
export interface UpdateTaskParams {
	taskId: string;
	updates: TaskUpdates;
}

/**
 * Parameters for reordering tasks within a column
 */
export interface ReorderTasksParams {
	columnId: string;
	taskIds: string[];
}

/**
 * Parameters for moving a task to a different column
 */
export interface MoveTaskParams {
	taskId: string;
	targetColumnId: string;
	order?: number;
}

/**
 * Response type for AI task generation
 */
export interface GenerateTaskResponse {
	title: string;
	description: string;
}
