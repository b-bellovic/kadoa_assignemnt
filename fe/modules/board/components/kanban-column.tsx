"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSortable } from "@dnd-kit/sortable";
import {
	SortableContext,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MoreHorizontal, Plus, Sparkles, Trash } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Column, Task } from "../types";
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog";
import KanbanTask from "./kanban-task";

interface KanbanColumnProps {
	column: Column;
	tasks: Task[];
	onAddTask: () => void;
	onAddAITask: () => void;
	onDeleteColumn: () => void;
	onDeleteTask: (taskId: string) => void;
	onEditTask: (
		taskId: string,
		updates: { title?: string; description?: string },
	) => void;
	isDragging?: boolean;
	activeId?: string | null;
	isDropTarget?: boolean;
}

export default function KanbanColumn({
	column,
	tasks,
	onAddTask,
	onAddAITask,
	onDeleteColumn,
	onDeleteTask,
	onEditTask,
	isDragging = false,
	activeId = null,
	isDropTarget = false,
}: KanbanColumnProps) {
	const [isAddingTask, setIsAddingTask] = useState(false);
	const [isAddingAITask, setIsAddingAITask] = useState(false);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);

	// Keep track of previous tasks to handle state persistence
	const previousTasksRef = useRef<Task[]>(tasks);
	const [localTasks, setLocalTasks] = useState<Task[]>(tasks);

	// Update local tasks when tasks prop changes, but preserve order during drag
	useEffect(() => {
		if (!isDragging) {
			setLocalTasks(tasks);
			previousTasksRef.current = tasks;
		}
	}, [tasks, isDragging]);

	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging: isDraggingColumn,
		isOver,
	} = useSortable({
		id: column.id,
		data: {
			type: "column",
			column,
		},
		disabled: isDragging,
	});

	// Memoize sorted tasks with state persistence
	const sortedTasks = useMemo(() => {
		// During column drag, maintain the previous task order
		if (isDraggingColumn) {
			return [...previousTasksRef.current].sort((a, b) => a.order - b.order);
		}

		// During normal operation or task drag, use current tasks
		return [...localTasks].sort((a, b) => a.order - b.order);
	}, [localTasks, isDraggingColumn]);

	// Memoize task IDs for SortableContext
	const taskIds = useMemo(
		() => sortedTasks.map((task) => task.id),
		[sortedTasks],
	);

	const style = useMemo(
		() => ({
			transform: CSS.Transform.toString(transform),
			transition,
		}),
		[transform, transition],
	);

	const handleAddTask = async () => {
		setIsAddingTask(true);
		try {
			await onAddTask();
		} finally {
			setIsAddingTask(false);
		}
	};

	const handleAddAITask = async () => {
		setIsAddingAITask(true);
		try {
			await onAddAITask();
		} finally {
			setIsAddingAITask(false);
		}
	};

	return (
		<>
			<Card
				ref={setNodeRef}
				style={style}
				data-column-id={column.id}
				data-testid="kanban-column"
				className={`w-[300px] shrink-0 border-2 border-border/80
          bg-gradient-to-b from-card to-card/90 flex flex-col h-full rounded-xl
          ${isDraggingColumn ? "opacity-50 scale-[1.02] shadow-2xl ring-2 ring-primary/20" : ""}
          shadow-[0_0_0_2px_rgba(0,0,0,0.08)]
          transition-all duration-200`}
			>
				<CardHeader
					className={`p-3 flex flex-row items-center space-y-0 bg-gradient-to-b from-muted/90 via-muted/60 to-transparent rounded-t-[calc(0.75rem-1px)] border-b border-border/50
            ${isDraggingColumn ? "cursor-grabbing" : "cursor-grab"}`}
					{...attributes}
					{...listeners}
				>
					<CardTitle className="text-sm flex-1 text-foreground flex items-center gap-2">
						<span className="font-semibold">{column.title}</span>
						<Badge
							variant="secondary"
							className="bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
						>
							{sortedTasks.length} {sortedTasks.length === 1 ? "task" : "tasks"}
						</Badge>
					</CardTitle>
					<DropdownMenu>
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<DropdownMenuTrigger asChild>
										<Button
											variant="ghost"
											size="icon"
											className="text-muted-foreground hover:text-primary hover:bg-primary/10"
										>
											<MoreHorizontal className="h-4 w-4" />
										</Button>
									</DropdownMenuTrigger>
								</TooltipTrigger>
								<TooltipContent>
									<p>Column actions</p>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
						<DropdownMenuContent align="end">
							<DropdownMenuItem
								onClick={handleAddTask}
								disabled={isAddingTask}
								className="text-sm"
							>
								<Plus className="mr-2 h-4 w-4" />
								Add task
							</DropdownMenuItem>
							<DropdownMenuSub>
								<DropdownMenuSubTrigger className="text-sm">
									<Sparkles className="mr-2 h-4 w-4" />
									Add AI task
								</DropdownMenuSubTrigger>
								<DropdownMenuSubContent>
									<DropdownMenuItem
										onClick={handleAddAITask}
										disabled={isAddingAITask}
										className="text-sm"
									>
										<Sparkles className="mr-2 h-4 w-4" />
										Generate task
									</DropdownMenuItem>
								</DropdownMenuSubContent>
							</DropdownMenuSub>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								onClick={() => setShowDeleteDialog(true)}
								className="text-destructive focus:text-destructive text-sm"
							>
								<Trash className="mr-2 h-4 w-4" />
								Delete column
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</CardHeader>

				<CardContent className="px-2 pt-2 pb-3 flex-1 overflow-y-auto [mask-image:linear-gradient(to_bottom,transparent,black_20px,black_calc(100%-20px),transparent)]">
					<div className="space-y-2 min-h-[50px]">
						{!isDragging && sortedTasks.length === 0 && (
							<div className="h-24 border-2 border-dashed border-muted-foreground/40 rounded-lg flex items-center justify-center mx-1 bg-muted/10">
								<p className="text-sm text-muted-foreground/80">No tasks yet</p>
							</div>
						)}
						<SortableContext
							items={taskIds}
							strategy={verticalListSortingStrategy}
						>
							{sortedTasks.map((task) => (
								<div
									key={task.id}
									className="px-1 py-0.5"
									data-column-id={column.id}
									data-task-order={task.order}
								>
									<KanbanTask
										task={task}
										onDelete={() => onDeleteTask(task.id)}
										onEdit={(updates) => onEditTask(task.id, updates)}
										isActive={activeId === task.id}
										isDraggingAny={!!activeId}
									/>
								</div>
							))}

							{/* Drop indicator at the end of column if being targeted */}
							{(isDropTarget || isOver) &&
								activeId &&
								activeId !== column.id && (
									<div className="h-16 border-2 border-dashed border-primary rounded-lg mx-1 my-2 bg-primary/5 transition-all duration-300 animate-pulse"></div>
								)}
						</SortableContext>
					</div>
				</CardContent>
			</Card>

			<DeleteConfirmationDialog
				isOpen={showDeleteDialog}
				onOpenChange={setShowDeleteDialog}
				onConfirm={() => {
					onDeleteColumn();
					setShowDeleteDialog(false);
				}}
				title="Delete column"
				description="Are you sure you want to delete this column? All tasks in this column will be deleted as well. This action cannot be undone."
			/>
		</>
	);
}
