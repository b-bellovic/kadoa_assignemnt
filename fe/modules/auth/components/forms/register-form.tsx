"use client";

import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/modules/auth/auth-provider";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type React from "react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AuthErrorBoundary } from "@/components/ui/custom/error-boundary";

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

export function RegisterForm() {
	const { register, loading, isAuthenticated, setIsLoggedOut } = useAuth();
	const router = useRouter();
	const { toast } = useToast();
	const searchParams = useSearchParams();

	// Get the redirect path and ensure it's properly formed
	const redirectParam = searchParams?.get("redirect");
	// If redirect exists, make sure it starts with a slash
	const redirect = redirectParam
		? redirectParam.startsWith("/")
			? redirectParam
			: `/${redirectParam}`
		: "/dashboard";

	// Reset logged out state when visiting register page
	useEffect(() => {
		setIsLoggedOut(false);
	}, [setIsLoggedOut]);

	const form = useForm<RegisterFormValues>({
		resolver: zodResolver(registerSchema),
		defaultValues: {
			email: "",
			password: "",
			confirmPassword: "",
		},
	});

	const onSubmit = async (values: RegisterFormValues) => {
		try {
			await register({ email: values.email, password: values.password });
			toast({
				title: "Registration successful",
				description: "Welcome! You have been automatically logged in.",
			});
			// Redirect to dashboard or specific redirect path
			router.push(redirect);
		} catch (error: any) {
			toast({
				title: "Registration failed",
				description:
					error.message || "There was an error creating your account.",
				variant: "destructive",
			});
		}
	};

	// Check if already authenticated
	useEffect(() => {
		if (!loading && isAuthenticated) {
			router.push(redirect);
		}
	}, [isAuthenticated, loading, router, redirect]);

	return (
		<AuthErrorBoundary>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)}>
					<CardContent className="space-y-4">
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email</FormLabel>
									<FormControl>
										<Input
											placeholder="name@example.com"
											type="email"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="password"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Password</FormLabel>
									<FormControl>
										<Input type="password" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="confirmPassword"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Confirm Password</FormLabel>
									<FormControl>
										<Input type="password" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</CardContent>
					<CardFooter className="flex flex-col space-y-2">
						<Button type="submit" className="w-full" disabled={loading}>
							{loading ? "Creating account..." : "Register"}
						</Button>
						<p className="text-sm text-center text-muted-foreground">
							Already have an account?{" "}
							<Link href="/login" className="text-primary hover:underline">
								Login
							</Link>
						</p>
					</CardFooter>
				</form>
			</Form>
		</AuthErrorBoundary>
	);
}
