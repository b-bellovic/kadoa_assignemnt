"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { formatDistanceToNow } from "date-fns";
import { isValid } from "date-fns";
import { Edit } from "lucide-react";
import { useMemo, useState } from "react";
import { Task } from "../types/types";
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
					className={`cursor-grab active:cursor-grabbing bg-background border-2 
            ${isMovingBetweenColumns ? "border-primary" : isBeingDraggedOver ? "border-primary border-dashed" : "border-border/60"} 
            hover:border-border transition-all group relative overflow-hidden rounded-lg
            ${isDragging ? "shadow-2xl ring-2 ring-primary/20 backdrop-blur-sm rotate-1" : "hover:shadow-lg"}
            ${isActive ? "ring-2 ring-primary/40" : ""}
            ${isBeingDraggedOver ? "scale-[1.01] shadow-lg" : ""}
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
								? "from-primary/25 via-primary/20 to-transparent opacity-100"
								: isBeingDraggedOver
									? "from-primary/15 via-primary/10 to-transparent opacity-100"
									: "from-primary/15 via-primary/10 to-transparent opacity-0 group-hover:opacity-100"
						} 
            pointer-events-none transition-opacity`}
					/>
					<CardContent className="p-3 relative">
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
							<div className="flex items-center text-xs">
								<p className="text-primary/80 group-hover:text-primary transition-colors">
									Updated {lastUpdated}
								</p>
							</div>
						</div>
					</CardContent>
					<CardFooter className="p-2 pt-0 flex justify-end relative">
						<Button
							variant="ghost"
							size="icon"
							onClick={handleEditClick}
							className="text-muted-foreground/90 hover:text-primary hover:bg-primary/15"
						>
							<Edit className="h-4 w-4" />
						</Button>
					</CardFooter>
				</Card>
			</TaskDetailModal>
		</>
	);
}
