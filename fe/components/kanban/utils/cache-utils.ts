import { QueryClient } from "@tanstack/react-query";
import { BoardData, Column, Task } from "../types/types";

const BOARD_QUERY_KEY = ["board"];

/**
 * Updates a task in the cache
 */
export function updateTaskInCache(
	queryClient: QueryClient,
	taskId: string,
	updates: Partial<Task>,
) {
	queryClient.setQueryData<BoardData>(BOARD_QUERY_KEY, (oldData) => {
		if (!oldData) return oldData;

		return {
			...oldData,
			tasks: oldData.tasks.map((task) =>
				task.id === taskId ? { ...task, ...updates } : task,
			),
		};
	});
}

/**
 * Removes a task from the cache
 */
export function removeTaskFromCache(queryClient: QueryClient, taskId: string) {
	queryClient.setQueryData<BoardData>(BOARD_QUERY_KEY, (oldData) => {
		if (!oldData) return oldData;

		return {
			...oldData,
			tasks: oldData.tasks.filter((task) => task.id !== taskId),
		};
	});
}

/**
 * Moves a task to a different column in the cache
 */
export function moveTaskToColumnInCache(
	queryClient: QueryClient,
	taskId: string,
	targetColumnId: string,
) {
	queryClient.setQueryData<BoardData>(BOARD_QUERY_KEY, (oldData) => {
		if (!oldData) return oldData;

		return {
			...oldData,
			tasks: oldData.tasks.map((task) =>
				task.id === taskId ? { ...task, columnId: targetColumnId } : task,
			),
		};
	});
}

/**
 * Adds a new task to the cache
 */
export function addTaskToCache(queryClient: QueryClient, task: Task) {
	queryClient.setQueryData<BoardData>(BOARD_QUERY_KEY, (oldData) => {
		if (!oldData) return oldData;

		// Make sure we don't add duplicate tasks
		const exists = oldData.tasks.some((t) => t.id === task.id);
		if (exists) return oldData;

		return {
			...oldData,
			tasks: [...oldData.tasks, task],
		};
	});
}

/**
 * Adds a new column to the cache
 */
export function addColumnToCache(queryClient: QueryClient, column: Column) {
	queryClient.setQueryData<BoardData>(BOARD_QUERY_KEY, (oldData) => {
		if (!oldData) return oldData;

		// Make sure we don't add duplicate columns
		const exists = oldData.columns.some((c) => c.id === column.id);
		if (exists) return oldData;

		return {
			...oldData,
			columns: [...oldData.columns, column],
		};
	});
}

/**
 * Updates a column in the cache
 */
export function updateColumnInCache(
	queryClient: QueryClient,
	columnId: string,
	updates: Partial<Column>,
) {
	queryClient.setQueryData<BoardData>(BOARD_QUERY_KEY, (oldData) => {
		if (!oldData) return oldData;

		return {
			...oldData,
			columns: oldData.columns.map((column) =>
				column.id === columnId ? { ...column, ...updates } : column,
			),
		};
	});
}

/**
 * Removes a column from the cache and optionally its associated tasks
 */
export function removeColumnFromCache(
	queryClient: QueryClient,
	columnId: string,
	removeTasks: boolean = false,
) {
	queryClient.setQueryData<BoardData>(BOARD_QUERY_KEY, (oldData) => {
		if (!oldData) return oldData;

		const updatedData = {
			...oldData,
			columns: oldData.columns.filter((column) => column.id !== columnId),
		};

		if (removeTasks) {
			updatedData.tasks = oldData.tasks.filter(
				(task) => task.columnId !== columnId,
			);
		}

		return updatedData;
	});
}
