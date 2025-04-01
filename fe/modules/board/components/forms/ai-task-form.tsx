"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// AI Task schema
export const aiTaskSchema = z.object({
	prompt: z
		.string()
		.min(10, { message: "Prompt should be at least 10 characters" }),
});

export type AITaskFormValues = z.infer<typeof aiTaskSchema>;

interface AITaskFormProps {
	onSubmit: (prompt: string) => Promise<{ title: string; description: string }>;
	onConfirm: (title: string, description: string) => Promise<void>;
	onCancel: () => void;
}

export default function AITaskForm({
	onSubmit,
	onConfirm,
	onCancel,
}: AITaskFormProps) {
	const [isLoading, setIsLoading] = useState(false);
	const [generatedTask, setGeneratedTask] = useState<{
		title: string;
		description: string;
	} | null>(null);

	const form = useForm<AITaskFormValues>({
		resolver: zodResolver(aiTaskSchema),
		defaultValues: {
			prompt: "",
		},
	});

	const handleSubmit = async (values: AITaskFormValues) => {
		setIsLoading(true);
		try {
			const task = await onSubmit(values.prompt);
			setGeneratedTask(task);
			form.reset();
		} finally {
			setIsLoading(false);
		}
	};

	const handleConfirm = async () => {
		if (!generatedTask) return;
		setIsLoading(true);
		try {
			await onConfirm(generatedTask.title, generatedTask.description);
		} finally {
			setIsLoading(false);
			onCancel();
		}
	};

	const handleBack = () => {
		setGeneratedTask(null);
	};

	return (
		<Dialog open={true} onOpenChange={onCancel}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle className="flex items-center">
						<Sparkles className="h-5 w-5 mr-2 text-yellow-500" />
						Create AI Task
					</DialogTitle>
				</DialogHeader>

				{!generatedTask ? (
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(handleSubmit)}
							className="space-y-4"
						>
							<FormField
								control={form.control}
								name="prompt"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											Describe your task in natural language
										</FormLabel>
										<FormControl>
											<Textarea
												placeholder="E.g., Create a high-priority task for implementing user authentication"
												rows={4}
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<DialogFooter>
								<Button type="button" variant="outline" onClick={onCancel}>
									Cancel
								</Button>
								<Button type="submit" disabled={isLoading}>
									{isLoading ? "Generating..." : "Generate Task"}
								</Button>
							</DialogFooter>
						</form>
					</Form>
				) : (
					<div className="space-y-4">
						<Card>
							<CardHeader>
								<CardTitle className="text-sm font-medium">
									Generated Task
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-2">
								<div>
									<div className="font-medium mb-1">Title</div>
									<div className="text-sm">{generatedTask.title}</div>
								</div>
								<div>
									<div className="font-medium mb-1">Description</div>
									<div className="text-sm whitespace-pre-wrap">
										{generatedTask.description}
									</div>
								</div>
							</CardContent>
						</Card>
						<DialogFooter className="flex justify-between">
							<div className="flex gap-2">
								<Button type="button" variant="outline" onClick={handleBack}>
									Back
								</Button>
								<Button type="button" variant="outline" onClick={onCancel}>
									Cancel
								</Button>
							</div>
							<Button onClick={handleConfirm} disabled={isLoading}>
								{isLoading ? "Creating..." : "Create Task"}
							</Button>
						</DialogFooter>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
