"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "@/components/ui/card";
import { Edit, Save, Trash2, X } from "lucide-react";
import { ReactNode, useEffect, useState } from "react";
import EditableField from "./editable-field";

interface EditableCardProps {
	title: string;
	description?: string;
	onSave: (updates: { title: string; description: string }) => void;
	onDelete?: () => void;
	footer?: ReactNode;
	className?: string;
	cardRef?: React.RefObject<HTMLDivElement>;
	cardProps?: React.HTMLAttributes<HTMLDivElement>;
	style?: React.CSSProperties;
	headerClassName?: string;
	contentClassName?: string;
	footerClassName?: string;
	renderHeader?: (isEditing: boolean) => ReactNode;
	renderFooter?: (isEditing: boolean) => ReactNode;
}

/**
 * A card component with built-in editing functionality
 * Combines Card UI with inline editing capability
 */
export default function EditableCard({
	title,
	description = "",
	onSave,
	onDelete,
	footer,
	className = "",
	cardRef,
	cardProps = {},
	style = {},
	headerClassName = "p-3 pb-0",
	contentClassName = "p-3 pt-2",
	footerClassName = "p-2 pt-0 flex justify-between",
	renderHeader,
	renderFooter,
}: EditableCardProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [editTitle, setEditTitle] = useState(title);
	const [editDescription, setEditDescription] = useState(description);

	// Update state when props change (e.g., when the card is updated externally)
	useEffect(() => {
		setEditTitle(title);
		setEditDescription(description);
	}, [title, description]);

	const handleSave = () => {
		// Only save if title is not empty
		if (editTitle.trim()) {
			onSave({
				title: editTitle,
				description: editDescription,
			});
		}
		setIsEditing(false);
	};

	const handleCancel = () => {
		setEditTitle(title);
		setEditDescription(description);
		setIsEditing(false);
	};

	return (
		<Card ref={cardRef} className={className} style={style} {...cardProps}>
			<CardHeader className={headerClassName}>
				{renderHeader ? (
					renderHeader(isEditing)
				) : (
					<EditableField
						value={editTitle}
						onChange={setEditTitle}
						isEditing={isEditing}
						className={isEditing ? "p-1 border rounded" : "text-sm font-medium"}
						autoFocus={isEditing}
						placeholder="Enter title"
					/>
				)}
			</CardHeader>
			<CardContent className={contentClassName}>
				<EditableField
					value={editDescription}
					onChange={setEditDescription}
					isEditing={isEditing}
					multiline={true}
					className={
						isEditing
							? "w-full p-1 border rounded text-sm"
							: "text-xs text-muted-foreground"
					}
					rows={3}
					placeholder="Enter description"
				/>
			</CardContent>
			<CardFooter className={footerClassName}>
				{renderFooter ? (
					renderFooter(isEditing)
				) : (
					<>
						{isEditing ? (
							<div className="flex gap-2 w-full">
								<Button size="sm" onClick={handleSave} className="flex-1">
									<Save className="h-4 w-4 mr-2" />
									Save
								</Button>
								<Button
									size="sm"
									variant="outline"
									onClick={handleCancel}
									className="flex-1"
								>
									<X className="h-4 w-4 mr-2" />
									Cancel
								</Button>
							</div>
						) : (
							<div className="flex space-x-1 ml-auto">
								<Button
									variant="ghost"
									size="icon"
									onClick={() => setIsEditing(true)}
								>
									<Edit className="h-4 w-4" />
								</Button>
								{onDelete && (
									<Button variant="ghost" size="icon" onClick={onDelete}>
										<Trash2 className="h-4 w-4" />
									</Button>
								)}
							</div>
						)}
						{footer && !isEditing && footer}
					</>
				)}
			</CardFooter>
		</Card>
	);
}
