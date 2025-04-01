"use client";

import { useState } from "react";
import { Task, UpdateTaskParams } from "../types/types";
import { calculateNewOrder, updateDragOverlayData } from "../utils";

interface UseTaskDragProps {
	tasks: Task[];
	updateTask: (params: UpdateTaskParams) => Promise<void>;
}

/**
 * Hook for managing task drag operations specifically
 */
export function useTaskDrag({ tasks, updateTask }: UseTaskDragProps) {
	const [activeTask, setActiveTask] = useState<Task | null>(null);
	const [currentTaskColumnId, setCurrentTaskColumnId] = useState<string | null>(
		null,
	);

	/**
	 * Retrieves tasks for a specific column and sorts them by order
	 * @param columnId - ID of the column to get tasks for
	 * @returns Array of tasks sorted by their order value
	 */
	const getSortedTasksInColumn = (columnId: string): Task[] => {
		return tasks
			.filter((task) => task.columnId === columnId)
			.sort((a, b) => a.order - b.order);
	};

	/**
	 * Handles scenario when a task is dragged over another task
	 * Updates position data for visual feedback
	 */
	const handleTaskOverTask = (
		active: any,
		activeDragTask: Task,
		overTask: Task,
	) => {
		// Update current column ID when moving between columns
		if (activeDragTask.columnId !== overTask.columnId) {
			setCurrentTaskColumnId(overTask.columnId);
		}

		// Get sorted tasks in target column
		const tasksInTargetColumn = getSortedTasksInColumn(overTask.columnId);

		// Find index of task being dragged over
		const overTaskIndex = tasksInTargetColumn.findIndex(
			(task) => task.id === overTask.id,
		);

		// Update drag overlay data for visual positioning
		active.data.current = updateDragOverlayData(
			active.data.current,
			overTask.columnId,
			overTaskIndex,
			tasksInTargetColumn.map((task) => task.id),
		);
	};

	/**
	 * Handles scenario when a task is dragged over a column
	 * Updates position data for visual feedback when moving to a different column
	 */
	const handleTaskOverColumn = (
		active: any,
		activeDragTask: Task,
		overColumnId: string,
	) => {
		// Only handle if moving to a different column
		if (activeDragTask.columnId === overColumnId) return;

		// Update current column ID for visual feedback
		setCurrentTaskColumnId(overColumnId);

		// Get sorted tasks in target column
		const tasksInTargetColumn = getSortedTasksInColumn(overColumnId);

		// Update drag overlay data to position at end of column
		active.data.current = updateDragOverlayData(
			active.data.current,
			overColumnId,
			tasksInTargetColumn.length,
			tasksInTargetColumn.map((task) => task.id),
		);
	};

	/**
	 * Handles moving a task to a different column
	 */
	const handleTaskMovingColumns = async (
		taskId: string,
		fromColumnId: string,
		toColumnId: string,
		toIndex: number,
	): Promise<void> => {
		const tasksInTargetColumn = getSortedTasksInColumn(toColumnId);

		const newOrder = calculateNewOrder(
			tasksInTargetColumn,
			-1, // Not in this column yet
			toIndex,
		);

		await updateTask({
			taskId: taskId,
			updates: {
				columnId: toColumnId,
				order: newOrder,
			},
		});
	};

	/**
	 * Handles reordering a task within the same column
	 */
	const handleTaskReorderingSameColumn = async (
		taskId: string,
		columnId: string,
		fromIndex: number,
		toIndex: number,
	): Promise<void> => {
		if (fromIndex === toIndex) return;

		const tasksInColumn = getSortedTasksInColumn(columnId);

		const newOrder = calculateNewOrder(tasksInColumn, fromIndex, toIndex);

		await updateTask({
			taskId: taskId,
			updates: { order: newOrder },
		});
	};

	/**
	 * Handles dropping a task directly onto a column
	 */
	const handleTaskDroppedOnColumn = async (
		taskId: string,
		fromColumnId: string,
		toColumnId: string,
	): Promise<void> => {
		const tasksInTargetColumn = getSortedTasksInColumn(toColumnId);

		// Calculate new order (add to end of column)
		const newOrder =
			tasksInTargetColumn.length > 0
				? tasksInTargetColumn[tasksInTargetColumn.length - 1].order + 1000
				: 1000;

		await updateTask({
			taskId: taskId,
			updates: {
				columnId: toColumnId,
				order: newOrder,
			},
		});
	};

	return {
		activeTask,
		setActiveTask,
		currentTaskColumnId,
		setCurrentTaskColumnId,
		getSortedTasksInColumn,
		handleTaskOverTask,
		handleTaskOverColumn,
		handleTaskMovingColumns,
		handleTaskReorderingSameColumn,
		handleTaskDroppedOnColumn,
	};
}
