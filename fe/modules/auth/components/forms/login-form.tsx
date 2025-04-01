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

export const loginSchema = z.object({
	email: z.string().email({ message: "Please enter a valid email address" }),
	password: z
		.string()
		.min(6, { message: "Password must be at least 6 characters" }),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
	const { login, loading, isAuthenticated } = useAuth();
	const router = useRouter();
	const { toast } = useToast();
	const searchParams = useSearchParams();
	const redirect = searchParams.get("redirect");

	const form = useForm<LoginFormValues>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	// Handle form submission
	const onSubmit = async (values: LoginFormValues) => {
		try {
			await login({ email: values.email, password: values.password });

			// Get saved redirect path or default to dashboard
			const savedRedirect = localStorage.getItem("authRedirect");
			const redirectPath = savedRedirect || "/dashboard";
			localStorage.removeItem("authRedirect"); // Clear saved redirect

			router.push(redirectPath);
		} catch (error: any) {
			toast({
				title: "Authentication failed",
				description:
					error.message || "Please check your credentials and try again.",
				variant: "destructive",
			});
		}
	};

	// Save redirect path if provided
	useEffect(() => {
		if (redirect && typeof window !== "undefined") {
			localStorage.setItem("authRedirect", redirect);
		}
	}, [redirect]);

	// Check if already authenticated
	useEffect(() => {
		if (!loading && isAuthenticated) {
			const savedRedirect = localStorage.getItem("authRedirect");
			const redirectPath = savedRedirect || "/dashboard";
			localStorage.removeItem("authRedirect"); // Clear saved redirect
			router.push(redirectPath);
		}
	}, [isAuthenticated, loading, router]);

	return (
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
