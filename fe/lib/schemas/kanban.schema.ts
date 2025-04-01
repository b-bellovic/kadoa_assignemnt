import { z } from "zod";

// Task schema
export const taskSchema = z.object({
	title: z.string().min(1, { message: "Title is required" }),
	description: z.string().optional(),
});

export type TaskFormValues = z.infer<typeof taskSchema>;

// Column schema
export const columnSchema = z.object({
	title: z.string().min(1, { message: "Column title is required" }),
});

export type ColumnFormValues = z.infer<typeof columnSchema>;

// AI Task schema
export const aiTaskSchema = z.object({
	prompt: z
		.string()
		.min(10, { message: "Prompt should be at least 10 characters" }),
});

export type AITaskFormValues = z.infer<typeof aiTaskSchema>;
