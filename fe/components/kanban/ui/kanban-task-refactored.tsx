"use client";

import { Task } from "../../types/types";
import { EditableCard, SortableItem } from "../reusable";

interface KanbanTaskProps {
	task: Task;
	onDelete: () => void;
	onEdit: (updates: { title?: string; description?: string }) => void;
}

/**
 * A sortable task component for use within kanban columns
 * Combines SortableItem and EditableCard reusable components
 */
export default function KanbanTaskRefactored({
	task,
	onDelete,
	onEdit,
}: KanbanTaskProps) {
	return (
		<SortableItem id={task.id} type="task">
			{({ setNodeRef, style, attributes, listeners }) => (
				<div ref={setNodeRef} style={style} {...attributes} {...listeners}>
					<EditableCard
						title={task.title}
						description={task.description || ""}
						onSave={onEdit}
						onDelete={onDelete}
						className="cursor-grab active:cursor-grabbing bg-card border-muted hover:border-muted-foreground/20"
					/>
				</div>
			)}
		</SortableItem>
	);
}
