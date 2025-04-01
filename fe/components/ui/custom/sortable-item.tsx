"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ReactNode } from "react";

interface SortableItemProps {
	id: string;
	type: string;
	disabled?: boolean;
	children:
		| ReactNode
		| ((props: {
				isDragging: boolean;
				attributes: ReturnType<typeof useSortable>["attributes"];
				listeners: ReturnType<typeof useSortable>["listeners"];
				setNodeRef: ReturnType<typeof useSortable>["setNodeRef"];
				style: React.CSSProperties;
		  }) => ReactNode);
}

/**
 * A wrapper component that adds drag-and-drop functionality to any component
 * Uses render props pattern for maximum flexibility
 */
export default function SortableItem({
	id,
	type,
	disabled = false,
	children,
}: SortableItemProps) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({
		id,
		data: {
			type,
		},
		disabled,
	});

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.4 : 1,
	};

	// If children is a function, call it with all the sortable props
	if (typeof children === "function") {
		return children({
			isDragging,
			attributes,
			listeners,
			setNodeRef,
			style,
		});
	}

	// Otherwise, wrap the children with the sortable props
	return (
		<div ref={setNodeRef} style={style} {...attributes} {...listeners}>
			{children}
		</div>
	);
}
