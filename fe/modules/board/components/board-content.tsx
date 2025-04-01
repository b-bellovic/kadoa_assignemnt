"use client";

import {
	SortableContext,
	horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { memo, useCallback } from "react";
import { Column, Task, TaskUpdates } from "../types";
import KanbanColumn from "./kanban-column";

interface BoardContentProps {
	columns: Column[];
	tasks: Task[];
	activeTask: Task | null;
	activeColumn: Column | null;
	currentTaskColumnId: string | null;
	onAddTask: (columnId: string) => void;
	onAddAITask: (columnId: string) => void;
	onDeleteColumn: (columnId: string) => void;
	onDeleteTask: (taskId: string) => void;
	onEditTask: (
		taskId: string,
		updates: Pick<TaskUpdates, "title" | "description">,
	) => void;
}

/**
 * Component that renders the main content of the Kanban board
 * Displays all columns and their tasks with drag-and-drop functionality
 */
const BoardContentComponent = ({
	columns,
	tasks,
	activeTask,
	activeColumn,
	currentTaskColumnId,
	onAddTask,
	onAddAITask,
	onDeleteColumn,
	onDeleteTask,
	onEditTask,
}: BoardContentProps) => {
	/**
	 * Get the tasks for a specific column
	 */
	const getTasksForColumn = useCallback(
		(columnId: string) => {
			return tasks.filter((task) => task.columnId === columnId);
		},
		[tasks],
	);

	/**
	 * Check if the column is a drop target
	 */
	const isColumnDropTarget = useCallback(
		(columnId: string) => {
			return (
				activeTask !== null &&
				currentTaskColumnId === columnId &&
				activeTask.columnId !== columnId
			);
		},
		[activeTask, currentTaskColumnId],
	);

	/**
	 * Create a handler for adding a task to a column
	 */
	const createAddTaskHandler = useCallback(
		(columnId: string) => {
			return () => onAddTask(columnId);
		},
		[onAddTask],
	);

	/**
	 * Create a handler for adding an AI task to a column
	 */
	const createAddAITaskHandler = useCallback(
		(columnId: string) => {
			return () => onAddAITask(columnId);
		},
		[onAddAITask],
	);

	/**
	 * Create a handler for deleting a column
	 */
	const createDeleteColumnHandler = useCallback(
		(columnId: string) => {
			return () => onDeleteColumn(columnId);
		},
		[onDeleteColumn],
	);

	/**
	 * Check if any dragging is in progress
	 */
	const isDragging = activeTask !== null || activeColumn !== null;

	/**
	 * Get the active item ID
	 */
	const activeId = activeTask?.id || activeColumn?.id;

	return (
		<div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-13rem)] min-h-[500px]">
			<SortableContext
				items={columns.map((col) => col.id)}
				strategy={horizontalListSortingStrategy}
			>
				{columns.map((column) => (
					<KanbanColumn
						key={column.id}
						column={column}
						tasks={getTasksForColumn(column.id)}
						onAddTask={createAddTaskHandler(column.id)}
						onAddAITask={createAddAITaskHandler(column.id)}
						onDeleteColumn={createDeleteColumnHandler(column.id)}
						onDeleteTask={onDeleteTask}
						onEditTask={onEditTask}
						isDragging={isDragging}
						activeId={activeId}
						isDropTarget={isColumnDropTarget(column.id)}
					/>
				))}
			</SortableContext>
		</div>
	);
};

/**
 * Memoized version of the BoardContent component to prevent unnecessary re-renders
 */
export const BoardContent = memo(BoardContentComponent);
