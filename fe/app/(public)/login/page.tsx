"use client";

import {
	LoginForm,
	LoginFormFallback,
} from "@/modules/auth/components/forms/login-form";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { ThemeToggle } from "@/components/ui/custom/theme-toggle";
import type React from "react";
import { Suspense } from "react";

export default function LoginPage() {
	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-background">
			<div className="absolute top-4 right-4">
				<ThemeToggle />
			</div>
			<Card className="w-full max-w-md bg-card">
				<CardHeader>
					<CardTitle>Login</CardTitle>
					<CardDescription>
						Enter your credentials to access your kanban board
					</CardDescription>
				</CardHeader>
				<Suspense fallback={<LoginFormFallback />}>
					<LoginForm />
				</Suspense>
			</Card>
		</div>
	);
}
