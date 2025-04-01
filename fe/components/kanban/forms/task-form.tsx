"use client";

import { FormDialog } from "@/components/ui/custom";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

export const taskSchema = z.object({
	title: z.string().min(1, { message: "Title is required" }),
	description: z.string().optional(),
});

export type TaskFormValues = z.infer<typeof taskSchema>;

interface TaskFormProps {
	onSubmit: (title: string, description: string) => void;
	onCancel: () => void;
}

/**
 * Form for creating or editing tasks
 * Uses the reusable FormDialog component
 */
export default function TaskForm({ onSubmit, onCancel }: TaskFormProps) {
	const form = useForm<TaskFormValues>({
		resolver: zodResolver(taskSchema),
		defaultValues: {
			title: "",
			description: "",
		},
	});

	const handleSubmit = (values: TaskFormValues) => {
		onSubmit(values.title, values.description || "");
		form.reset();
	};

	return (
		<FormDialog
			title="Add New Task"
			isOpen={true}
			onClose={onCancel}
			onSubmit={form.handleSubmit(handleSubmit)}
			submitLabel="Add Task"
		>
			<Form {...form}>
				<div className="space-y-4">
					<FormField
						control={form.control}
						name="title"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Title</FormLabel>
								<FormControl>
									<Input placeholder="Enter task title" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="description"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Description</FormLabel>
								<FormControl>
									<Textarea
										placeholder="Enter task description"
										rows={3}
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>
			</Form>
		</FormDialog>
	);
}
