"use client";

import { formatDistanceToNow, isValid } from "date-fns";
import { Task } from "../../types/types";
import { EditableCard } from "../reusable";

interface TaskCardProps {
	task: Task;
	onDelete?: (id: string) => void;
	onEdit?: (
		id: string,
		updates: { title?: string; description?: string },
	) => void;
}

/**
 * A card component that displays a task with edit and delete capabilities
 * Uses the reusable EditableCard component
 */
export default function TaskCardRefactored({
	task,
	onDelete,
	onEdit,
}: TaskCardProps) {
	const formattedDate = task.updatedAt
		? (() => {
				try {
					const date = new Date(task.updatedAt);
					return isValid(date)
						? formatDistanceToNow(date, { addSuffix: true })
						: "recently";
				} catch (error) {
					console.error("Error formatting date:", error);
					return "recently";
				}
			})()
		: "recently";

	const handleSave = (updates: { title: string; description: string }) => {
		if (onEdit) {
			onEdit(task.id, updates);
		}
	};

	const handleDelete = () => {
		if (onDelete) {
			onDelete(task.id);
		}
	};

	return (
		<EditableCard
			title={task.title}
			description={task.description || ""}
			onSave={handleSave}
			onDelete={onDelete ? handleDelete : undefined}
			className="w-full mb-2 shadow-sm hover:shadow transition-shadow"
			footer={
				<p className="text-xs text-muted-foreground absolute bottom-3 left-3">
					{formattedDate}
				</p>
			}
			footerClassName="p-3 pt-0 flex justify-end items-center relative"
		/>
	);
}
