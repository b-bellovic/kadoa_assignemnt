"use client";

import { RegisterForm } from "@/modules/auth/components/forms/register-form";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { ThemeToggle } from "@/components/ui/custom/theme-toggle";
import { AuthErrorBoundary } from "@/components/ui/custom/error-boundary";
import type React from "react";

export default function RegisterPage() {
	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-background">
			<div className="absolute top-4 right-4">
				<ThemeToggle />
			</div>
			<Card className="w-full max-w-md bg-card">
				<CardHeader>
					<CardTitle>Register</CardTitle>
					<CardDescription>
						Create a new account to access your kanban board
					</CardDescription>
				</CardHeader>
				<AuthErrorBoundary>
					<RegisterForm />
				</AuthErrorBoundary>
			</Card>
		</div>
	);
}
