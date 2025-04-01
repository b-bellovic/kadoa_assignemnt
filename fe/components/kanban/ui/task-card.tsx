"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { formatDistanceToNow, isValid } from "date-fns";
import { Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { Task } from "../types/types";

interface TaskCardProps {
	task: Task;
	onDelete?: (id: string) => void;
	onEdit?: (
		id: string,
		updates: { title?: string; description?: string },
	) => void;
}

export default function TaskCard({ task, onDelete, onEdit }: TaskCardProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [title, setTitle] = useState(task.title);
	const [description, setDescription] = useState(task.description || "");

	const handleSave = () => {
		if (onEdit) {
			onEdit(task.id, { title, description });
		}
		setIsEditing(false);
	};

	const handleCancel = () => {
		setTitle(task.title);
		setDescription(task.description || "");
		setIsEditing(false);
	};

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

	return (
		<Card className="w-full mb-2 shadow-sm hover:shadow transition-shadow">
			<CardHeader className="p-3 pb-0">
				{isEditing ? (
					<input
						className="w-full p-1 border rounded"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						autoFocus
					/>
				) : (
					<CardTitle className="text-sm flex-1">{task.title}</CardTitle>
				)}
			</CardHeader>
			<CardContent className="p-3 pt-2">
				{isEditing ? (
					<textarea
						className="w-full h-20 p-1 border rounded text-sm"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
					/>
				) : (
					<p className="text-xs text-muted-foreground">
						{task.description || "No description"}
					</p>
				)}
			</CardContent>
			<CardFooter className="p-3 pt-0 flex justify-between items-center">
				<p className="text-xs text-muted-foreground">{formattedDate}</p>
				{isEditing ? (
					<div className="flex space-x-2">
						<Button variant="outline" size="sm" onClick={handleCancel}>
							Cancel
						</Button>
						<Button size="sm" onClick={handleSave}>
							Save
						</Button>
					</div>
				) : (
					<div className="flex space-x-1">
						{onEdit && (
							<Button
								variant="ghost"
								size="icon"
								onClick={() => setIsEditing(true)}
							>
								<Edit className="h-4 w-4" />
							</Button>
						)}
						{onDelete && (
							<Button
								variant="ghost"
								size="icon"
								onClick={() => onDelete(task.id)}
							>
								<Trash2 className="h-4 w-4" />
							</Button>
						)}
					</div>
				)}
			</CardFooter>
		</Card>
	);
}
