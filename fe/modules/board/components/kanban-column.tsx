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
import { MoreHorizontal, Plus, Sparkles, Trash, ListPlus } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Column, Task } from "../types";
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog";
import KanbanTask from "./kanban-task";
import { cn } from "@/lib/utils";

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
				className={`w-[300px] shrink-0 border-t-4 border-primary/30
          bg-card/95 flex flex-col h-full rounded-md
          ${isDraggingColumn ? "opacity-50 scale-[1.02] shadow-2xl" : ""}
          shadow-sm hover:shadow-md
          transition-all duration-200
          first:ml-2 last:mr-2
          `}
			>
				<CardHeader
					className={`p-3 flex flex-row items-center space-y-0 bg-gradient-to-b from-muted/70 via-muted/40 to-transparent rounded-t-[calc(0.5rem-1px)] border-b border-border/50
            ${isDraggingColumn ? "cursor-grabbing" : "cursor-grab"}`}
					{...attributes}
					{...listeners}
				>
					<CardTitle className="text-sm flex-1 text-foreground flex items-center gap-2">
						<span className="font-semibold">{column.title}</span>
						<Badge
							variant="secondary"
							className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
						>
							{sortedTasks.length}
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
											className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10"
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

				<CardContent className="px-2 pt-2 pb-3 flex-1 overflow-y-auto">
					<div className="space-y-2 min-h-[50px]">
						{!isDragging && sortedTasks.length === 0 && (
							<div className="h-32 flex flex-col items-center justify-center gap-2 mx-1 mt-2 p-4 rounded-md bg-muted/20 border border-dashed border-muted">
								<ListPlus className="h-5 w-5 text-muted-foreground/60" />
								<p className="text-sm text-muted-foreground/70 text-center">No tasks yet</p>
								<Button variant="outline" size="sm" onClick={handleAddTask} className="mt-1">
									<Plus className="mr-1 h-3.5 w-3.5" /> Add Task
								</Button>
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
