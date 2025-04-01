"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SortableContext } from "@dnd-kit/sortable";
import { MoreHorizontal, Plus, Sparkles, Trash } from "lucide-react";
import { Column, Task } from "../../types/types";
import { ActionButton, SortableItem } from "../reusable";
import KanbanTaskRefactored from "./kanban-task-refactored";

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
}

/**
 * A sortable column component that contains tasks
 * Uses the SortableItem reusable component and ActionButton
 */
export default function KanbanColumnRefactored({
	column,
	tasks,
	onAddTask,
	onAddAITask,
	onDeleteColumn,
	onDeleteTask,
	onEditTask,
	isDragging = false,
}: KanbanColumnProps) {
	// Sort tasks by order
	const sortedTasks = [...tasks].sort((a, b) => a.order - b.order);

	return (
		<SortableItem id={column.id} type="column" disabled={isDragging}>
			{({
				setNodeRef,
				style,
				attributes,
				listeners,
				isDragging: isDraggingLocal,
			}) => {
				// Apply dragging state
				const isCurrentlyDragging = isDragging || isDraggingLocal;

				return (
					<Card
						ref={setNodeRef}
						style={style}
						className={`w-[300px] shrink-0 border border-muted bg-card flex flex-col h-full
                        ${isCurrentlyDragging ? "opacity-70" : "opacity-100"}`}
					>
						<CardHeader
							className="p-3 flex flex-row items-center space-y-0 cursor-grab active:cursor-grabbing"
							{...attributes}
							{...listeners}
						>
							<CardTitle className="text-sm flex-1 text-foreground">
								{column.title}
							</CardTitle>
							{!isDragging && (
								<div className="flex items-center gap-1">
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="ghost" size="icon" className="h-8 w-8">
												<MoreHorizontal className="h-4 w-4" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuItem
												onClick={onDeleteColumn}
												className="text-destructive"
											>
												<Trash className="h-4 w-4 mr-2" />
												Delete Column
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</div>
							)}
						</CardHeader>
						<CardContent className="p-3 pt-0 flex-1 overflow-y-auto">
							<div className="space-y-2 min-h-[50px]">
								{!isDragging && (
									<SortableContext items={sortedTasks.map((task) => task.id)}>
										{sortedTasks.map((task) => (
											<KanbanTaskRefactored
												key={task.id}
												task={task}
												onDelete={() => onDeleteTask(task.id)}
												onEdit={(updates) => onEditTask(task.id, updates)}
											/>
										))}
									</SortableContext>
								)}
							</div>
						</CardContent>
						{!isDragging && (
							<div className="flex gap-2 p-3 pt-0 mt-auto border-t border-muted">
								<ActionButton
									onClick={onAddTask}
									icon={Plus}
									label="Add Task"
									variant="outline"
									size="sm"
									className="w-full"
								/>
								<ActionButton
									onClick={onAddAITask}
									icon={Sparkles}
									variant="outline"
									size="sm"
								/>
							</div>
						)}
					</Card>
				);
			}}
		</SortableItem>
	);
}
