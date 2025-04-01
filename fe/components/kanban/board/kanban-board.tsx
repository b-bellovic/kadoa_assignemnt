"use client";

import { useKanbanService } from "@/hooks/use-kanban-service";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import { useState } from "react";
import { useDragAndDrop } from "../hooks/use-drag-and-drop";
import {
	UpdateTaskParams,
	UpdateColumnParams,
	TaskUpdates,
} from "../types/types";

import { BoardContent } from "./board-content";
import { BoardHeader } from "./board-header";
import { BoardLoadingState } from "./board-loading-state";
import { BoardModals } from "./board-modals";
import { DragOverlayContent } from "./drag-overlay-content";
import { useKanbanEvents } from "@/components/kanban/hooks/use-kanban-events";

/**
 * Main Kanban board component
 * Orchestrates the entire board UI and functionality
 */
export default function KanbanBoard() {
	// UI state for modals
	const [isAddingColumn, setIsAddingColumn] = useState(false);
	const [isAddingTask, setIsAddingTask] = useState(false);
	const [isAddingAITask, setIsAddingAITask] = useState(false);
	const [selectedColumnId, setSelectedColumnId] = useState<string | null>(null);

	// Board data and operations
	const {
		columns,
		tasks,
		isLoading,
		error,
		createColumn,
		deleteColumn,
		createTask,
		deleteTask,
		updateTask,
		updateColumn,
		reorderTasks,
		reorderColumns,
		// Raw mutations
		updateTaskMutation,
		updateColumnMutation,
	} = useKanbanService();

	// Setup real-time updates
	useKanbanEvents();

	// Mutation handlers
	const handleUpdateTask = async (params: UpdateTaskParams) => {
		try {
			await updateTaskMutation.mutateAsync(params);
		} catch (error) {
			console.error("Failed to update task:", error);
		}
	};

	const handleUpdateColumn = async (params: UpdateColumnParams) => {
		try {
			await updateColumnMutation.mutateAsync(params);
		} catch (error) {
			console.error("Failed to update column:", error);
		}
	};

	// Drag and drop functionality
	const {
		activeTask,
		activeColumn,
		currentTaskColumnId,
		sensors,
		handleDragStart,
		handleDragOver,
		handleDragEnd,
	} = useDragAndDrop({
		columns,
		tasks,
		updateTask: handleUpdateTask,
		updateColumn: handleUpdateColumn,
		reorderTasks,
		reorderColumns,
	});

	// Column handlers
	const handleAddColumn = (title: string) => {
		const order =
			columns.length > 0 ? columns[columns.length - 1].order + 1000 : 1000;
		createColumn({ title, order });
		setIsAddingColumn(false);
	};

	const handleDeleteColumn = (columnId: string) => {
		deleteColumn(columnId);
	};

	// Task handlers
	const handleAddTask = (title: string, description: string) => {
		if (!selectedColumnId) return;

		createTask({
			title,
			description,
			columnId: selectedColumnId,
			order: 1000,
		});

		setIsAddingTask(false);
		setSelectedColumnId(null);
	};

	const handleConfirmAITask = async (
		title: string,
		description: string,
	): Promise<void> => {
		if (!selectedColumnId) return;

		createTask({
			title,
			description,
			columnId: selectedColumnId,
			order: 1000,
		});

		setIsAddingAITask(false);
		setSelectedColumnId(null);
	};

	const handleDeleteTask = (taskId: string) => {
		deleteTask(taskId);
	};

	const handleEditTask = (
		taskId: string,
		updates: Pick<TaskUpdates, "title" | "description">,
	) => {
		updateTask({ taskId, updates });
	};

	const handleSelectColumnForTask = (columnId: string) => {
		setSelectedColumnId(columnId);
		setIsAddingTask(true);
	};

	const handleSelectColumnForAITask = (columnId: string) => {
		setSelectedColumnId(columnId);
		setIsAddingAITask(true);
	};

	// Show loading or error state if needed
	if (isLoading || error) {
		return <BoardLoadingState isLoading={isLoading} error={error} />;
	}

	return (
		<div className="flex flex-col h-full space-y-4">
			<BoardHeader onAddColumn={() => setIsAddingColumn(true)} />

			<DndContext
				sensors={sensors}
				onDragStart={handleDragStart}
				onDragOver={handleDragOver}
				onDragEnd={handleDragEnd}
			>
				<BoardContent
					columns={columns}
					tasks={tasks}
					activeTask={activeTask}
					activeColumn={activeColumn}
					currentTaskColumnId={currentTaskColumnId}
					onAddTask={handleSelectColumnForTask}
					onAddAITask={handleSelectColumnForAITask}
					onDeleteColumn={handleDeleteColumn}
					onDeleteTask={handleDeleteTask}
					onEditTask={handleEditTask}
				/>

				<DragOverlay zIndex={999}>
					<DragOverlayContent
						activeTask={activeTask}
						activeColumn={activeColumn}
					/>
				</DragOverlay>
			</DndContext>

			<BoardModals
				isAddingColumn={isAddingColumn}
				isAddingTask={isAddingTask}
				isAddingAITask={isAddingAITask}
				selectedColumnId={selectedColumnId}
				onAddColumn={handleAddColumn}
				onAddTask={handleAddTask}
				onConfirmAITask={handleConfirmAITask}
				onCancelAddColumn={() => setIsAddingColumn(false)}
				onCancelAddTask={() => {
					setIsAddingTask(false);
					setSelectedColumnId(null);
				}}
				onCancelAddAITask={() => {
					setIsAddingAITask(false);
					setSelectedColumnId(null);
				}}
			/>
		</div>
	);
}
