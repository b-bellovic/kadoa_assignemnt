import { QueryClient } from "@tanstack/react-query";
import { BoardData, Column, Task } from "../types/types";

/**
 * Utilities for working with the Kanban board data and React Query cache
 */

/**
 * Helper for safely updating board data in the query cache
 * @param queryClient - React Query client
 * @param updater - Function that receives current board data and returns updated data
 */
export const updateBoardCache = (
	queryClient: QueryClient,
	updater: (currentData: BoardData) => BoardData,
): void => {
	queryClient.setQueryData<BoardData>(["board"], (oldData) => {
		// Handle the case where data doesn't exist yet
		if (!oldData) {
			return updater({ columns: [], tasks: [] });
		}
		// Apply the updater function to the existing data
		return updater(oldData);
	});
};

/**
 * Adds a new task to the board cache
 * @param queryClient - React Query client
 * @param newTask - Task to add
 */
export const addTaskToCache = (
	queryClient: QueryClient,
	newTask: Task,
): void => {
	updateBoardCache(queryClient, (currentData) => ({
		...currentData,
		tasks: [...currentData.tasks, newTask],
	}));
};

/**
 * Updates an existing task in the board cache
 * @param queryClient - React Query client
 * @param taskId - ID of the task to update
 * @param taskUpdates - Partial task data to merge with existing task
 */
export const updateTaskInCache = (
	queryClient: QueryClient,
	taskId: string,
	taskUpdates: Partial<Task>,
): void => {
	updateBoardCache(queryClient, (currentData) => ({
		...currentData,
		tasks: currentData.tasks.map((task) =>
			task.id === taskId ? { ...task, ...taskUpdates } : task,
		),
	}));
};

/**
 * Removes a task from the board cache
 * @param queryClient - React Query client
 * @param taskId - ID of the task to remove
 */
export const removeTaskFromCache = (
	queryClient: QueryClient,
	taskId: string,
): void => {
	updateBoardCache(queryClient, (currentData) => ({
		...currentData,
		tasks: currentData.tasks.filter((task) => task.id !== taskId),
	}));
};

/**
 * Adds a new column to the board cache
 * @param queryClient - React Query client
 * @param newColumn - Column to add
 */
export const addColumnToCache = (
	queryClient: QueryClient,
	newColumn: Column,
): void => {
	updateBoardCache(queryClient, (currentData) => ({
		...currentData,
		columns: [...currentData.columns, newColumn],
	}));
};

/**
 * Updates an existing column in the board cache
 * @param queryClient - React Query client
 * @param columnId - ID of the column to update
 * @param columnUpdates - Partial column data to merge with existing column
 */
export const updateColumnInCache = (
	queryClient: QueryClient,
	columnId: string,
	columnUpdates: Partial<Column>,
): void => {
	updateBoardCache(queryClient, (currentData) => ({
		...currentData,
		columns: currentData.columns.map((column) =>
			column.id === columnId ? { ...column, ...columnUpdates } : column,
		),
	}));
};

/**
 * Removes a column from the board cache
 * @param queryClient - React Query client
 * @param columnId - ID of the column to remove
 * @param removeTasks - Whether to also remove tasks in this column
 */
export const removeColumnFromCache = (
	queryClient: QueryClient,
	columnId: string,
	removeTasks: boolean = true,
): void => {
	updateBoardCache(queryClient, (currentData) => {
		const filteredColumns = currentData.columns.filter(
			(column) => column.id !== columnId,
		);

		// If we should also remove tasks in this column
		const filteredTasks = removeTasks
			? currentData.tasks.filter((task) => task.columnId !== columnId)
			: currentData.tasks;

		return {
			columns: filteredColumns,
			tasks: filteredTasks,
		};
	});
};

/**
 * Updates multiple columns with new ordering information
 * @param queryClient - React Query client
 * @param updatedColumns - Array of columns with updated order property
 */
export const updateColumnsOrderInCache = (
	queryClient: QueryClient,
	updatedColumns: Column[],
): void => {
	updateBoardCache(queryClient, (currentData) => {
		// Create a map of columnId -> updated order
		const orderUpdates = new Map(
			updatedColumns.map((column) => [column.id, column.order]),
		);

		// Update each column that has a new order value
		const updatedColumnsArray = currentData.columns.map((column) => {
			const newOrder = orderUpdates.get(column.id);
			return newOrder !== undefined ? { ...column, order: newOrder } : column;
		});

		return {
			...currentData,
			columns: updatedColumnsArray,
		};
	});
};

/**
 * Changes the column of a task in the board cache
 * @param queryClient - React Query client
 * @param taskId - ID of the task to move
 * @param newColumnId - ID of the destination column
 * @param newOrder - Optional new order value
 */
export const moveTaskToColumnInCache = (
	queryClient: QueryClient,
	taskId: string,
	newColumnId: string,
	newOrder?: number,
): void => {
	updateBoardCache(queryClient, (currentData) => ({
		...currentData,
		tasks: currentData.tasks.map((task) =>
			task.id === taskId
				? {
						...task,
						columnId: newColumnId,
						...(newOrder !== undefined ? { order: newOrder } : {}),
					}
				: task,
		),
	}));
};

/**
 * Completely replaces the columns array in the board cache
 * @param queryClient - React Query client
 * @param columns - New columns array
 */
export const replaceColumnsInCache = (
	queryClient: QueryClient,
	columns: Column[],
): void => {
	updateBoardCache(queryClient, (currentData) => ({
		...currentData,
		columns,
	}));
};

/**
 * Gets the highest order value for tasks in a specific column
 * @param tasks - Array of all tasks
 * @param columnId - ID of the column to check
 * @returns The highest order value plus 1000, or 1000 if no tasks exist
 */
export const getNextTaskOrder = (tasks: Task[], columnId: string): number => {
	const tasksInColumn = tasks.filter((t) => t.columnId === columnId);

	if (tasksInColumn.length === 0) {
		return 1000;
	}

	const highestOrder = Math.max(...tasksInColumn.map((t) => t.order));
	return highestOrder + 1000;
};

/**
 * Gets the highest order value for columns
 * @param columns - Array of all columns
 * @returns The highest order value plus 1000, or 1000 if no columns exist
 */
export const getNextColumnOrder = (columns: Column[]): number => {
	if (columns.length === 0) {
		return 1000;
	}

	const highestOrder = Math.max(...columns.map((c) => c.order));
	return highestOrder + 1000;
};
