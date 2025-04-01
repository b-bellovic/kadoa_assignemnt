import { useBoardQuery } from "./use-board-query";
import { useColumnMutations } from "./use-column-mutations";
import { useTaskMutations } from "./use-task-mutations";

/**
 * Custom hook for managing Kanban board data and operations
 * Provides board data fetching and CRUD operations with React Query
 */
export function useKanbanService() {
	// Get board data and query key
	const boardQuery = useBoardQuery();

	// Initialize column mutations with the board query key
	const columnOperations = useColumnMutations(boardQuery.boardQueryKey);

	// Initialize task mutations with the board query key
	const taskOperations = useTaskMutations(boardQuery.boardQueryKey);

	// Create a createColumnAtEnd function that automatically uses the current columns
	const createColumnAtEnd = (title: string) => {
		columnOperations.createColumnAtEnd(title, boardQuery.columns);
	};

	// Create a createTaskAtEnd function that automatically uses the current tasks
	const createTaskAtEnd = (
		params: Omit<Parameters<typeof taskOperations.createTaskAtEnd>[0], "order">,
	) => {
		taskOperations.createTaskAtEnd(params, boardQuery.tasks);
	};

	// Extract the raw mutation objects to maintain backward compatibility
	const {
		createColumnMutation,
		updateColumnMutation,
		deleteColumnMutation,
		reorderColumnsMutation,
	} = columnOperations;

	const {
		createTaskMutation,
		updateTaskMutation,
		moveTaskMutation,
		deleteTaskMutation,
		reorderTasksMutation,
	} = taskOperations;

	return {
		// Board data and query state
		...boardQuery,

		// Column operations
		...columnOperations,
		createColumnAtEnd,

		// Task operations
		...taskOperations,
		createTaskAtEnd,

		// Raw mutations for complex use cases (backward compatibility)
		createColumnMutation,
		updateColumnMutation,
		deleteColumnMutation,
		reorderColumnsMutation,
		createTaskMutation,
		updateTaskMutation,
		moveTaskMutation,
		deleteTaskMutation,
		reorderTasksMutation,
	};
}

// Re-export the individual hooks for more granular usage
export { useBoardQuery } from "./use-board-query";
export { useColumnMutations } from "./use-column-mutations";
export { useTaskMutations } from "./use-task-mutations";
