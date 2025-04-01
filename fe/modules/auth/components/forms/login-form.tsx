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

export const loginSchema = z.object({
	email: z.string().email({ message: "Please enter a valid email address" }),
	password: z
		.string()
		.min(6, { message: "Password must be at least 6 characters" }),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
	const { login, loading, isAuthenticated, setIsLoggedOut } = useAuth();
	const router = useRouter();
	const { toast } = useToast();
	const searchParams = useSearchParams();
	
	// Get the redirect path and ensure it's properly formed
	const redirectParam = searchParams?.get("redirect");
	// If redirect exists, make sure it starts with a slash
	const redirect = redirectParam 
		? redirectParam.startsWith('/') ? redirectParam : `/${redirectParam}`
		: "/dashboard";

	const form = useForm<LoginFormValues>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	// Reset logged out state when visiting login page
	useEffect(() => {
		setIsLoggedOut(false);
	}, [setIsLoggedOut]);

	// Handle form submission
	const onSubmit = async (values: LoginFormValues) => {
		try {
			// The redirect is handled in useAuthService after successful login
			await login({ email: values.email, password: values.password });
		} catch (error: any) {
			toast({
				title: "Authentication failed",
				description:
					error.message || "Please check your credentials and try again.",
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
					</CardContent>
					<CardFooter className="flex flex-col space-y-2">
						<Button type="submit" className="w-full" disabled={loading}>
							{loading ? "Logging in..." : "Login"}
						</Button>
						<p className="text-sm text-center text-muted-foreground">
							Don&apos;t have an account?{" "}
							<Link href="/register" className="text-primary hover:underline">
								Register
							</Link>
						</p>
					</CardFooter>
				</form>
			</Form>
		</AuthErrorBoundary>
	);
}

// Loading fallback component
export function LoginFormFallback() {
	return (
		<>
			<CardContent className="space-y-4">
				<div className="space-y-2">
					<div className="text-sm font-medium">Email</div>
					<Input type="email" placeholder="name@example.com" disabled />
				</div>
				<div className="space-y-2">
					<div className="text-sm font-medium">Password</div>
					<Input type="password" disabled />
				</div>
			</CardContent>
			<CardFooter className="flex flex-col space-y-2">
				<Button className="w-full" disabled>
					Loading...
				</Button>
				<p className="text-sm text-center text-muted-foreground">
					Don&apos;t have an account?{" "}
					<Link href="/register" className="text-primary hover:underline">
						Register
					</Link>
				</p>
			</CardFooter>
		</>
	);
}
