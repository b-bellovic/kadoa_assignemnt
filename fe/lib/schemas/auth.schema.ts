import { z } from "zod";

// Login schema
export const loginSchema = z.object({
	email: z.string().email({ message: "Please enter a valid email address" }),
	password: z
		.string()
		.min(6, { message: "Password must be at least 6 characters" }),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

// Registration schema
export const registerSchema = z
	.object({
		email: z.string().email({ message: "Please enter a valid email address" }),
		password: z
			.string()
			.min(6, { message: "Password must be at least 6 characters" }),
		confirmPassword: z
			.string()
			.min(6, { message: "Password must be at least 6 characters" }),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"],
	});

export type RegisterFormValues = z.infer<typeof registerSchema>;
