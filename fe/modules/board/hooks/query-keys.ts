/**
 * Query keys for Kanban board operations
 */
export const KANBAN_KEYS = {
	board: () => ["board"],
	column: (id?: string) => [...KANBAN_KEYS.board(), "column", id],
	task: (id?: string) => [...KANBAN_KEYS.board(), "task", id],
};
