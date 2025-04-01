"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { ReactNode } from "react";

interface FormDialogProps {
	title: string | ReactNode;
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (e: React.FormEvent) => void;
	submitLabel?: string;
	cancelLabel?: string;
	isSubmitting?: boolean;
	children: ReactNode;
}

/**
 * A reusable form dialog component with standardized header, footer, and button layout
 * Used for consistent form dialogs across the application
 */
export default function FormDialog({
	title,
	isOpen,
	onClose,
	onSubmit,
	submitLabel = "Submit",
	cancelLabel = "Cancel",
	isSubmitting = false,
	children,
}: FormDialogProps) {
	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
				</DialogHeader>
				<form onSubmit={onSubmit} className="space-y-4">
					{children}
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={onClose}
							disabled={isSubmitting}
						>
							{cancelLabel}
						</Button>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? `${submitLabel}ing...` : submitLabel}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
