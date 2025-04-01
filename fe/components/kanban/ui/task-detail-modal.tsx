import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { format, formatDistanceToNow, isValid } from "date-fns";
import { Calendar, Clock, Edit2, Trash, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Task } from "../types/types";
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog";

interface TaskDetailModalProps {
	task: Task;
	onEdit: (updates: { title?: string; description?: string }) => void;
	onDelete: () => void;
	children: React.ReactNode;
	defaultIsEditing?: boolean;
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
}

export function TaskDetailModal({
	task,
	onEdit,
	onDelete,
	children,
	defaultIsEditing = false,
	isOpen,
	onOpenChange,
}: TaskDetailModalProps) {
	const [isEditing, setIsEditing] = useState(defaultIsEditing);
	const [title, setTitle] = useState(task.title);
	const [description, setDescription] = useState(task.description || "");

	// Reset editing state when modal opens/closes
	useEffect(() => {
		if (isOpen) {
			setIsEditing(defaultIsEditing);
		} else {
			setTitle(task.title);
			setDescription(task.description || "");
		}
	}, [isOpen, defaultIsEditing, task]);

	const handleSave = () => {
		onEdit({ title, description });
		setIsEditing(false);
		onOpenChange(false);
	};

	const createdAt = task.createdAt
		? (() => {
				try {
					const date = new Date(task.createdAt);
					return isValid(date) ? format(date, "PPP 'at' pp") : "Unknown date";
				} catch (error) {
					console.error("Error formatting createdAt date:", error);
					return "Unknown date";
				}
			})()
		: "Unknown date";

	const lastUpdated = task.updatedAt
		? (() => {
				try {
					const date = new Date(task.updatedAt);
					return isValid(date)
						? formatDistanceToNow(date, { addSuffix: true })
						: "recently";
				} catch (error) {
					console.error("Error formatting updatedAt date:", error);
					return "recently";
				}
			})()
		: "recently";

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className="sm:max-w-[600px] h-[80vh] max-h-[600px] flex flex-col">
				<DialogHeader className="flex-shrink-0">
					<div className="flex-1">
						{isEditing ? (
							<>
								<VisuallyHidden>
									<DialogTitle>Editing: {task.title}</DialogTitle>
								</VisuallyHidden>
								<Input
									value={title}
									onChange={(e) => setTitle(e.target.value)}
									placeholder="Task title"
									className="text-lg font-semibold"
								/>
							</>
						) : (
							<DialogTitle className="text-lg">{task.title}</DialogTitle>
						)}
						<div className="mt-2 space-y-1">
							<DialogDescription></DialogDescription>
							<div className="flex items-center gap-4 text-xs text-muted-foreground">
								<div className="flex items-center gap-1">
									<Calendar className="h-3 w-3" />
									Created {createdAt}
								</div>
								<div className="flex items-center gap-1">
									<Clock className="h-3 w-3" />
									Updated {lastUpdated}
								</div>
							</div>
						</div>
					</div>
				</DialogHeader>

				<div className="flex-1 py-4 overflow-y-auto">
					{isEditing ? (
						<Textarea
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="Add a description..."
							className="min-h-[300px] resize-none"
						/>
					) : (
						<p className="text-sm text-muted-foreground whitespace-pre-wrap">
							{task.description || "No description provided."}
						</p>
					)}
				</div>

				<DialogFooter className="flex-shrink-0 flex items-center justify-between gap-2 sm:justify-between">
					<div className="flex gap-2">
						{isEditing ? (
							<>
								<Button variant="outline" onClick={() => setIsEditing(false)}>
									<X className="h-4 w-4 mr-2" />
									Cancel
								</Button>
								<Button onClick={handleSave}>
									<Edit2 className="h-4 w-4 mr-2" />
									Save Changes
								</Button>
							</>
						) : (
							<Button variant="outline" onClick={() => setIsEditing(true)}>
								<Edit2 className="h-4 w-4 mr-2" />
								Edit Task
							</Button>
						)}
					</div>
					<DeleteConfirmationDialog
						title="Delete Task"
						description="Are you sure you want to delete this task? This action cannot be undone."
						onConfirm={() => {
							onDelete();
							onOpenChange(false);
						}}
					>
						<Button
							variant="ghost"
							className="text-destructive hover:bg-destructive/10"
						>
							<Trash className="h-4 w-4 mr-2" />
							Delete Task
						</Button>
					</DeleteConfirmationDialog>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
