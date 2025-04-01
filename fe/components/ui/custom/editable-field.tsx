"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

interface EditableFieldProps {
	value: string;
	onChange: (value: string) => void;
	isEditing: boolean;
	placeholder?: string;
	multiline?: boolean;
	className?: string;
	rows?: number;
	autoFocus?: boolean;
}

/**
 * A component that switches between edit mode and display mode
 * Used for inline editing of text content
 */
export default function EditableField({
	value,
	onChange,
	isEditing,
	placeholder = "",
	multiline = false,
	className = "",
	rows = 3,
	autoFocus = false,
}: EditableFieldProps) {
	if (isEditing) {
		return multiline ? (
			<Textarea
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
				className={className}
				rows={rows}
				autoFocus={autoFocus}
			/>
		) : (
			<Input
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
				className={className}
				autoFocus={autoFocus}
			/>
		);
	}

	// Display mode
	return multiline ? (
		<p className={className}>{value || placeholder || "No content"}</p>
	) : (
		<h3 className={className}>{value || placeholder || "Untitled"}</h3>
	);
}
