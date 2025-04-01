"use client";

import TaskForm from "@/modules/board/components/forms/task-form";
import AITaskForm from "@/modules/board/components/forms/ai-task-form";
import ColumnForm from "@/modules/board/components/forms/column-form";
import { kanbanApi } from "@/modules/board/api";

interface BoardModalsProps {
	isAddingColumn: boolean;
	isAddingTask: boolean;
	isAddingAITask: boolean;
	selectedColumnId: string | null;
	onAddColumn: (title: string) => void;
	onAddTask: (title: string, description: string) => void;
	onConfirmAITask: (title: string, description: string) => Promise<void>;
	onCancelAddColumn: () => void;
	onCancelAddTask: () => void;
	onCancelAddAITask: () => void;
}

/**
 * Component that manages all modal forms for the Kanban board
 * Handles column, task, and AI task creation forms
 */
export function BoardModals({
	isAddingColumn,
	isAddingTask,
	isAddingAITask,
	selectedColumnId,
	onAddColumn,
	onAddTask,
	onConfirmAITask,
	onCancelAddColumn,
	onCancelAddTask,
	onCancelAddAITask,
}: BoardModalsProps) {
	const handleAddAITask = async (prompt: string) => {
		if (!selectedColumnId) {
			throw new Error("No column selected");
		}
		return kanbanApi.generateTask(prompt, selectedColumnId);
	};

	return (
		<>
			{isAddingColumn && (
				<ColumnForm onSubmit={onAddColumn} onCancel={onCancelAddColumn} />
			)}

			{isAddingTask && (
				<TaskForm onSubmit={onAddTask} onCancel={onCancelAddTask} />
			)}

			{isAddingAITask && (
				<AITaskForm
					onSubmit={handleAddAITask}
					onConfirm={onConfirmAITask}
					onCancel={onCancelAddAITask}
				/>
			)}
		</>
	);
}
