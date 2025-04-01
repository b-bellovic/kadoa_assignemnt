import { arrayMove } from "@dnd-kit/sortable";
import { QueryClient } from "@tanstack/react-query";
import { Column, ColumnUpdates, Task, TaskUpdates } from "../types/types";
import {
	getNextTaskOrder,
	moveTaskToColumnInCache,
	replaceColumnsInCache,
	updateColumnInCache,
	updateTaskInCache,
} from "./board-cache-utils";

/**
 * Utilities for performing optimistic updates on the kanban board
 */

/**
 * Optimistically update a task and handle rollback on error
 *
 * @param queryClient - React Query client
 * @param taskId - ID of the task to update
 * @param updates - Updates to apply to the task
 * @param onSuccess - Callback for successful update
 * @param onError - Callback for error handling
 */
export const optimisticTaskUpdate = (
	queryClient: QueryClient,
	taskId: string,
	updates: TaskUpdates,
	onSuccess?: (updatedTask: Task) => void,
	onError?: (error: unknown) => void,
): { mutate: () => Promise<void> } => {
	// Create a function that can be called to perform the optimistic update
	const mutate = async () => {
		// Keep a snapshot of the previous state for rollback
		const previousData = queryClient.getQueryData<{
			columns: Column[];
			tasks: Task[];
		}>(["board"]);

		try {
			// Apply optimistic update
			updateTaskInCache(queryClient, taskId, updates);

			// Let the caller know it succeeded and provide the updated task
			if (onSuccess && previousData) {
				const updatedTask = previousData.tasks.find(
					(task) => task.id === taskId,
				);

				if (updatedTask) {
					onSuccess({
						...updatedTask,
						...updates,
					});
				}
			}
		} catch (error) {
			// Rollback on error
			if (previousData) {
				queryClient.setQueryData(["board"], previousData);
			}

			// Let the caller handle the error
			if (onError) {
				onError(error);
			}
		}
	};

	return { mutate };
};

/**
 * Optimistically move a task to a different column
 *
 * @param queryClient - React Query client
 * @param taskId - ID of the task to move
 * @param sourceColumnId - Current column ID
 * @param targetColumnId - Target column ID
 * @param tasks - All tasks (needed to calculate new order)
 * @param onSuccess - Callback for successful update
 * @param onError - Callback for error handling
 */
export const optimisticTaskMove = (
	queryClient: QueryClient,
	taskId: string,
	sourceColumnId: string,
	targetColumnId: string,
	tasks: Task[],
	onSuccess?: (movedTask: Task) => void,
	onError?: (error: unknown) => void,
): { mutate: () => Promise<void> } => {
	// Create a function that can be called to perform the optimistic update
	const mutate = async () => {
		// Keep a snapshot of the previous state for rollback
		const previousData = queryClient.getQueryData<{
			columns: Column[];
			tasks: Task[];
		}>(["board"]);

		try {
			// Calculate new order (at the end of the target column)
			const newOrder = getNextTaskOrder(tasks, targetColumnId);

			// Apply optimistic update
			moveTaskToColumnInCache(queryClient, taskId, targetColumnId, newOrder);

			// Let the caller know it succeeded
			if (onSuccess && previousData) {
				const task = previousData.tasks.find((t) => t.id === taskId);
				if (task) {
					const movedTask = {
						...task,
						columnId: targetColumnId,
						order: newOrder,
					};
					onSuccess(movedTask);
				}
			}
		} catch (error) {
			// Rollback on error
			if (previousData) {
				queryClient.setQueryData(["board"], previousData);
			}

			// Let the caller handle the error
			if (onError) {
				onError(error);
			}
		}
	};

	return { mutate };
};

/**
 * Optimistically update column order after dragging
 *
 * @param queryClient - React Query client
 * @param columns - All columns in their current order
 * @param sourceIndex - Index of the column being moved
 * @param destinationIndex - Target index for the column
 * @param onSuccess - Callback for successful update
 * @param onError - Callback for error handling
 */
export const optimisticReorderColumns = (
	queryClient: QueryClient,
	columns: Column[],
	sourceIndex: number,
	destinationIndex: number,
	onSuccess?: (reorderedColumns: Column[]) => void,
	onError?: (error: unknown) => void,
): { mutate: () => Promise<void> } => {
	// Create a function that can be called to perform the optimistic update
	const mutate = async () => {
		// Keep a snapshot of the previous state for rollback
		const previousData = queryClient.getQueryData<{
			columns: Column[];
			tasks: Task[];
		}>(["board"]);

		try {
			// Reorder columns
			const reorderedColumns = arrayMove(
				columns,
				sourceIndex,
				destinationIndex,
			);

			// Calculate new order values (1000, 2000, 3000, etc.)
			const columnsWithNewOrder = reorderedColumns.map((column, index) => ({
				...column,
				order: (index + 1) * 1000,
			}));

			// Apply optimistic update
			replaceColumnsInCache(queryClient, columnsWithNewOrder);

			// Let the caller know it succeeded
			if (onSuccess) {
				onSuccess(columnsWithNewOrder);
			}
		} catch (error) {
			// Rollback on error
			if (previousData) {
				queryClient.setQueryData(["board"], previousData);
			}

			// Let the caller handle the error
			if (onError) {
				onError(error);
			}
		}
	};

	return { mutate };
};
