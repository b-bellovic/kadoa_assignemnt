import {
	DragEndEvent,
	DragOverEvent,
	DragStartEvent,
	PointerSensor,
	TouchSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import { useState } from "react";
import {
	Column,
	Task,
	UpdateColumnParams,
	UpdateTaskParams,
} from "../types/types";
import { useColumnDrag } from "./use-column-drag";
import { useTaskDrag } from "./use-task-drag";

/**
 * Props for the useDragAndDrop hook
 */
interface UseDragAndDropProps {
	columns: Column[];
	tasks: Task[];
	updateTask: (params: UpdateTaskParams) => Promise<void>;
	updateColumn: (params: UpdateColumnParams) => Promise<void>;
}

/**
 * Data structure for tracking sortable items during drag operations
 */
interface SortableData {
	containerId: string;
	index: number;
	items: string[];
}

/**
 * Generic type for items that can be ordered
 */
type OrderableItem = { order: number; id: string };

/**
 * Custom hook that provides drag and drop functionality for kanban board
 * Handles reordering tasks within columns and moving tasks between columns
 */
export const useDragAndDrop = ({
	columns,
	tasks,
	updateTask,
	updateColumn,
}: UseDragAndDropProps) => {
	// Use specialized hooks for task and column drag operations
	const taskDrag = useTaskDrag({ tasks, updateTask });
	const columnDrag = useColumnDrag({ columns, updateColumn });

	// Destructure for convenience
	const {
		activeTask,
		setActiveTask,
		currentTaskColumnId,
		setCurrentTaskColumnId,
	} = taskDrag;
	const { activeColumn, setActiveColumn } = columnDrag;

	/**
	 * Configure drag and drop sensors with appropriate constraints
	 */
	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: { distance: 5 },
		}),
		useSensor(TouchSensor, {
			activationConstraint: {
				delay: 250,
				tolerance: 5,
			},
		}),
	);

	/**
	 * Handles the start of a drag operation
	 * Identifies whether a task or column is being dragged and updates state accordingly
	 */
	const handleDragStart = (event: DragStartEvent) => {
		const { active } = event;
		const activeId = active.id.toString();

		// Check if dragging a task
		const draggedTask = tasks.find((task) => task.id === activeId);
		if (draggedTask) {
			setActiveTask(draggedTask);
			setCurrentTaskColumnId(draggedTask.columnId);
			return;
		}

		// Check if dragging a column
		const draggedColumn = columns.find((column) => column.id === activeId);
		if (draggedColumn) {
			setActiveColumn(draggedColumn);
		}
	};

	/**
	 * Handles drag over event to provide visual feedback during dragging
	 */
	const handleDragOver = (event: DragOverEvent) => {
		const { active, over } = event;

		// Exit on invalid scenarios
		if (!over || active.id === over.id || !activeTask) return;

		const overId = over.id.toString();

		// Get data about the item being dragged over
		const overTask = tasks.find((task) => task.id === overId);
		const overColumn = columns.find((column) => column.id === overId);

		// Exit if not over a valid target
		if (!overTask && !overColumn) return;

		// Handle different drag scenarios
		if (overTask) {
			taskDrag.handleTaskOverTask(active, activeTask, overTask);
		} else if (overColumn) {
			taskDrag.handleTaskOverColumn(active, activeTask, overColumn.id);
		}
	};

	/**
	 * Handles the end of a drag operation
	 * Determines the final position and updates the backend accordingly
	 */
	const handleDragEnd = async (event: DragEndEvent) => {
		const { active, over } = event;

		// Reset tracking state
		setCurrentTaskColumnId(null);

		// Exit if no over element
		if (!over) {
			setActiveTask(null);
			setActiveColumn(null);
			return;
		}

		const activeId = active.id.toString();
		const overId = over.id.toString();

		// Handle column reordering
		if (activeColumn) {
			await columnDrag.handleColumnReordering(activeId, overId);
			return;
		}

		// Handle task operations
		if (activeTask) {
			const activeTaskItem = tasks.find((task) => task.id === activeId);
			if (!activeTaskItem) {
				setActiveTask(null);
				return;
			}

			// Find if dropping over a task or a column
			const overTaskItem = tasks.find((task) => task.id === overId);
			const overColumn = columns.find((column) => column.id === overId);

			// Handle different drop scenarios
			if (overTaskItem) {
				// Get indices for the active and over tasks in their respective columns
				const activeIndex = taskDrag
					.getSortedTasksInColumn(activeTaskItem.columnId)
					.findIndex((task) => task.id === activeId);

				const overIndex = taskDrag
					.getSortedTasksInColumn(overTaskItem.columnId)
					.findIndex((task) => task.id === overId);

				// Check if moving between columns or reordering in same column
				if (activeTaskItem.columnId !== overTaskItem.columnId) {
					await taskDrag.handleTaskMovingColumns(
						activeId,
						activeTaskItem.columnId,
						overTaskItem.columnId,
						overIndex,
					);
				} else {
					await taskDrag.handleTaskReorderingSameColumn(
						activeId,
						activeTaskItem.columnId,
						activeIndex,
						overIndex,
					);
				}
			} else if (overColumn && activeTaskItem.columnId !== overColumn.id) {
				// Handle dropping a task directly onto a column
				await taskDrag.handleTaskDroppedOnColumn(
					activeId,
					activeTaskItem.columnId,
					overColumn.id,
				);
			}

			setActiveTask(null);
		}
	};

	return {
		activeTask,
		activeColumn,
		currentTaskColumnId,
		sensors,
		handleDragStart,
		handleDragOver,
		handleDragEnd,
	};
};
