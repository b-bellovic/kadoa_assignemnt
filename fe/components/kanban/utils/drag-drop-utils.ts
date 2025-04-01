import { DragOverEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { QueryClient } from "@tanstack/react-query";
import { MutableRefObject } from "react";
import { Column, Task } from "../types/types";
import { moveTaskToColumnInCache } from "./cache-utils";

/**
 * Type for items that can be ordered
 */
export type OrderableItem = { order: number; id: string };

/**
 * Data structure for tracking sortable items during drag operations
 */
export interface SortableData {
	containerId: string;
	index: number;
	items: string[];
}

/**
 * Handles the logic for dragging a task over a column
 *
 * @param event - The drag over event
 * @param activeTaskRef - A ref to the currently active task
 * @param queryClient - React Query client
 */
export const handleTaskOverColumn = (
	event: DragOverEvent,
	activeTaskRef: MutableRefObject<Task | null>,
	queryClient: QueryClient,
): void => {
	const { active, over } = event;

	if (!over || active.id === over.id || !activeTaskRef.current) return;

	const isOverColumn = over.data.current?.type === "column";
	if (!isOverColumn) return;

	const activeTask = activeTaskRef.current;
	const columnId = over.id as string;

	// If task is already in this column, do nothing
	if (activeTask.columnId === columnId) return;

	// Update the local cache optimistically
	moveTaskToColumnInCache(queryClient, activeTask.id, columnId);
};

/**
 * Calculates the new task order when a task is dropped
 *
 * @param droppedTaskId - ID of the task being dropped
 * @param tasks - All tasks
 * @param columnId - Column where the task is dropped
 * @returns New order value for the task
 */
export const calculateTaskOrderOnDrop = (
	droppedTaskId: string,
	tasks: Task[],
	columnId: string,
): number => {
	const tasksInColumn = tasks
		.filter((t) => t.columnId === columnId)
		.sort((a, b) => a.order - b.order);

	// If no tasks in column, start at 1000
	if (tasksInColumn.length === 0) {
		return 1000;
	}

	// If this is the only task (or it's already in this column), put it at the end
	const existingTaskIndex = tasksInColumn.findIndex(
		(t) => t.id === droppedTaskId,
	);
	if (existingTaskIndex !== -1) {
		tasksInColumn.splice(existingTaskIndex, 1);
	}

	// If we removed the task and now column is empty, start at 1000
	if (tasksInColumn.length === 0) {
		return 1000;
	}

	// Otherwise, put at the end by adding 1000 to the highest order
	return tasksInColumn[tasksInColumn.length - 1].order + 1000;
};

/**
 * Handles the reordering of tasks within a column after dragging
 *
 * @param taskId - ID of the task being dragged
 * @param overTaskId - ID of the task being dragged over
 * @param columnId - ID of the column
 * @param tasks - All tasks
 * @param queryClient - React Query client
 * @returns Object with the updated tasks and the new order of the dragged task
 */
export const handleTaskReordering = (
	taskId: string,
	overTaskId: string,
	columnId: string,
	tasks: Task[],
	queryClient: QueryClient,
): { updatedTasks: Task[]; newOrder: number } => {
	// Get all tasks in this column
	const tasksInColumn = tasks
		.filter((t) => t.columnId === columnId)
		.sort((a, b) => a.order - b.order);

	// Find indices within the column tasks array
	const oldIndexInColumn = tasksInColumn.findIndex((t) => t.id === taskId);
	const newIndexInColumn = tasksInColumn.findIndex((t) => t.id === overTaskId);

	if (oldIndexInColumn === -1 || newIndexInColumn === -1) {
		throw new Error("Task indices not found");
	}

	// Reorder tasks within the same column
	const reorderedTasksInColumn = arrayMove(
		tasksInColumn,
		oldIndexInColumn,
		newIndexInColumn,
	);

	// Recalculate positions for all tasks in the column (1000, 2000, 3000, etc)
	const updatedTasksInColumn = reorderedTasksInColumn.map((task, index) => ({
		...task,
		order: (index + 1) * 1000,
	}));

	// Create a new tasks array with the updated positions
	const updatedTasks = tasks.map((task) => {
		if (task.columnId === columnId) {
			const updatedTask = updatedTasksInColumn.find((t) => t.id === task.id);
			return updatedTask || task;
		}
		return task;
	});

	// Get the new order of the dragged task
	const newOrder =
		updatedTasksInColumn.find((t) => t.id === taskId)?.order || 0;

	return { updatedTasks, newOrder };
};

/**
 * Refreshes the order values of all tasks in a column to be sequential
 * This helps prevent order values from getting too large over time
 *
 * @param columnId - ID of the column to normalize
 * @param tasks - All tasks
 * @returns Tasks with normalized order values in the specified column
 */
export const normalizeTaskOrder = (columnId: string, tasks: Task[]): Task[] => {
	// Get all tasks in this column sorted by order
	const tasksInColumn = tasks
		.filter((t) => t.columnId === columnId)
		.sort((a, b) => a.order - b.order);

	// No need to normalize if there are no tasks or just one task
	if (tasksInColumn.length <= 1) {
		return tasks;
	}

	// Assign new sequential order values (1000, 2000, 3000, etc)
	const normalizedTasks = tasksInColumn.map((task, index) => ({
		...task,
		order: (index + 1) * 1000,
	}));

	// Update the order values in the original tasks array
	return tasks.map((task) => {
		if (task.columnId === columnId) {
			const updatedTask = normalizedTasks.find((t) => t.id === task.id);
			return updatedTask || task;
		}
		return task;
	});
};

/**
 * Calculates new order value when reordering items
 *
 * @param items - Array of orderable items
 * @param fromIndex - Original index of the item being moved (-1 if item is new to this container)
 * @param toIndex - Destination index for the item
 * @returns Calculated order value for the item at its new position
 */
export const calculateNewOrder = (
	items: OrderableItem[],
	fromIndex: number,
	toIndex: number,
): number => {
	// Moving to the start of the list
	if (toIndex === 0) {
		return items.length > 0 ? Math.floor(items[0].order / 2) : 1000;
	}

	// Moving to the end of the list
	if (
		toIndex >= items.length ||
		(fromIndex === -1 && toIndex === items.length)
	) {
		return items.length > 0 ? items[items.length - 1].order + 1000 : 1000;
	}

	// Moving between two existing items - calculate midpoint between adjacent items
	const prevOrder = items[toIndex - 1].order;
	const nextOrder = items[toIndex].order;

	// Ensure we return an integer by rounding down
	return Math.floor(prevOrder + (nextOrder - prevOrder) / 2);
};

/**
 * Updates the drag overlay data to reflect current position during drag operations
 *
 * @param activeData - Current data from the active drag element
 * @param containerId - ID of the container (column) where the item is being dragged
 * @param index - Position within the container where item would be placed
 * @param itemIds - Array of item IDs in the container
 * @returns Updated drag overlay data
 */
export const updateDragOverlayData = (
	activeData: any,
	containerId: string,
	index: number,
	itemIds: string[],
) => {
	return {
		...activeData,
		sortable: {
			containerId,
			index,
			items: itemIds,
		} as SortableData,
	};
};
