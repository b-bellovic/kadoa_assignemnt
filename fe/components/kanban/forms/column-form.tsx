"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

export const columnSchema = z.object({
	title: z.string().min(1, { message: "Column title is required" }),
});

export type ColumnFormValues = z.infer<typeof columnSchema>;

interface ColumnFormProps {
	onSubmit: (title: string) => void;
	onCancel: () => void;
}

export default function ColumnForm({ onSubmit, onCancel }: ColumnFormProps) {
	const form = useForm<ColumnFormValues>({
		resolver: zodResolver(columnSchema),
		defaultValues: {
			title: "",
		},
	});

	const handleSubmit = (values: ColumnFormValues) => {
		onSubmit(values.title);
		form.reset();
	};

	return (
		<Dialog open={true} onOpenChange={onCancel}>
			<DialogContent data-testid="add-column-modal">
				<DialogHeader>
					<DialogTitle>Add New Column</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(handleSubmit)}
						className="space-y-4"
					>
						<FormField
							control={form.control}
							name="title"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Title</FormLabel>
									<FormControl>
										<Input
											placeholder="Enter column title"
											{...field}
											data-testid="column-title-input"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={onCancel}
								data-testid="add-column-cancel-button"
							>
								Cancel
							</Button>
							<Button type="submit" data-testid="add-column-submit-button">
								Add Column
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
