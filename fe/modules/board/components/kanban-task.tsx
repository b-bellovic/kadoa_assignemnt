"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { formatDistanceToNow } from "date-fns";
import { isValid } from "date-fns";
import { Edit, Clock } from "lucide-react";
import { useMemo, useState } from "react";
import { Task } from "../types";
import { TaskDetailModal } from "./task-detail-modal";

interface KanbanTaskProps {
	task: Task;
	onDelete: () => void;
	onEdit: (updates: { title?: string; description?: string }) => void;
	isActive?: boolean;
	isDraggingAny?: boolean;
}

export default function KanbanTask({
	task,
	onDelete,
	onEdit,
	isActive = false,
	isDraggingAny = false,
}: KanbanTaskProps) {
	const [isEditMode, setIsEditMode] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);

	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
		over,
		isOver,
	} = useSortable({
		id: task.id,
		data: {
			type: "task",
			task,
			columnId: task.columnId,
			order: task.order,
		},
		animateLayoutChanges: () => false, // Let React handle animations
	});

	// Check if being dragged over a different column
	const isMovingBetweenColumns =
		isDragging &&
		over &&
		over.data.current?.sortable?.containerId !== task.columnId;

	// Check if this is being dragged over
	const isBeingDraggedOver = isOver && !isDragging;

	const style = useMemo(
		() => ({
			transform: CSS.Transform.toString(transform),
			transition,
			opacity: isDragging ? 0.5 : isDraggingAny ? 0.8 : 1,
			scale: isDragging ? "1.02" : "1",
			zIndex: isDragging ? 50 : "auto",
		}),
		[transform, transition, isDragging, isDraggingAny],
	);

	const handleEditClick = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsEditMode(true);
		setIsModalOpen(true);
	};

	const handleModalOpenChange = (open: boolean) => {
		setIsModalOpen(open);
		if (!open) {
			setIsEditMode(false);
		}
	};

	const lastUpdated = useMemo(() => {
		if (!task.updatedAt) return "recently";

		try {
			const date = new Date(task.updatedAt);
			if (!isValid(date)) return "recently";

			return formatDistanceToNow(date, { addSuffix: true });
		} catch (error) {
			console.error("Error formatting date:", error);
			return "recently";
		}
	}, [task.updatedAt]);

	return (
		<>
			<TaskDetailModal
				task={task}
				onEdit={onEdit}
				onDelete={onDelete}
				defaultIsEditing={isEditMode}
				isOpen={isModalOpen}
				onOpenChange={handleModalOpenChange}
			>
				<Card
					ref={setNodeRef}
					style={style}
					className={`cursor-grab active:cursor-grabbing bg-background border-l-4 
            ${isMovingBetweenColumns ? "border-l-primary" : isBeingDraggedOver ? "border-l-primary" : "border-l-primary/50"} 
            hover:border-l-primary hover:shadow-md transition-all group relative overflow-hidden rounded-md
            ${isDragging ? "shadow-xl rotate-1" : ""}
            ${isActive ? "ring-1 ring-primary/40" : ""}
            ${isBeingDraggedOver ? "scale-[1.01] shadow-md" : ""}
            ${isDraggingAny && !isDragging ? "opacity-80" : ""}
            duration-200`}
					{...attributes}
					{...listeners}
					onClick={() => setIsModalOpen(true)}
					data-task-id={task.id}
					data-column-id={task.columnId}
					data-task-order={task.order}
					data-testid="kanban-task"
				>
					<div
						className={`absolute inset-0 bg-gradient-to-r 
            ${
							isMovingBetweenColumns
								? "from-primary/10 via-primary/5 to-transparent opacity-100"
								: isBeingDraggedOver
									? "from-primary/10 via-primary/5 to-transparent opacity-100"
									: "from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100"
						} 
            pointer-events-none transition-opacity`}
					/>
					<CardContent className="p-3 pb-2 relative">
						<div className="space-y-2">
							<div>
								<h3 className="text-sm font-semibold text-foreground leading-tight group-hover:text-primary transition-colors">
									{task.title}
								</h3>
								{task.description && (
									<p className="text-xs text-muted-foreground/90 mt-1.5 line-clamp-2 leading-normal">
										{task.description}
									</p>
								)}
							</div>
						</div>
					</CardContent>
					<CardFooter className="p-2 pt-0 flex justify-between items-center relative">
						<div className="flex items-center text-xs text-muted-foreground">
							<Clock className="h-3 w-3 mr-1 inline-block" />
							<span className="text-xs">{lastUpdated}</span>
						</div>
						<Button
							variant="ghost"
							size="icon"
							onClick={handleEditClick}
							className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10"
						>
							<Edit className="h-3.5 w-3.5" />
						</Button>
					</CardFooter>
				</Card>
			</TaskDetailModal>
		</>
	);
}
