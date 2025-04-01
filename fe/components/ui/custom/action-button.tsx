"use client";

import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface ActionButtonProps {
	onClick: () => void;
	icon: LucideIcon;
	label?: string;
	variant?:
		| "default"
		| "destructive"
		| "outline"
		| "secondary"
		| "ghost"
		| "link";
	size?: "default" | "sm" | "lg" | "icon";
	className?: string;
	disabled?: boolean;
}

/**
 * A standardized button component with icon and optional label
 * Used for consistent action buttons across the application
 */
export default function ActionButton({
	onClick,
	icon: Icon,
	label,
	variant = "outline",
	size = "sm",
	className = "",
	disabled = false,
}: ActionButtonProps) {
	// For icon-only buttons, use the icon size; otherwise use sm or specified size
	const buttonSize = !label && size === "sm" ? "icon" : size;

	return (
		<Button
			onClick={onClick}
			variant={variant}
			size={buttonSize}
			className={className}
			disabled={disabled}
		>
			<Icon className={`h-4 w-4 ${label ? "mr-2" : ""}`} />
			{label}
		</Button>
	);
}
