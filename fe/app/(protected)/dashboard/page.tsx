"use client";

import KanbanBoard from "@/modules/board/components/kanban-board";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/custom/theme-toggle";
import { useAuth } from "@/modules/auth/auth-provider";
import { LoadingSpinner } from "@/components/ui/custom/loading-spinner";
import { AuthErrorBoundary } from "@/components/ui/custom/error-boundary";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Dashboard() {
	const { user, logout, isAuthenticated, loading, isLoggedOut, setIsLoggedOut } = useAuth();
	const router = useRouter();

	// Handle logout action
	const handleLogout = async () => {
		// Set logout state immediately to prevent flashing of content
		setIsLoggedOut(true);
		await logout();
	};

	if (loading) {
		return <LoadingSpinner />;
	}

	// Protected layout should handle this redirect, but as a backup:
	if (!isAuthenticated || isLoggedOut) {
		return null;
	}

	return (
		<AuthErrorBoundary>
			<div className="flex flex-col min-h-screen">
				<header className="bg-background border-b shadow-sm p-4 dark:border-gray-800">
					<div className="mx-auto flex justify-between items-center">
						<div>
							<h1 className="text-xl font-bold">Kanban Dashboard</h1>
							<p className="text-sm text-muted-foreground">
								Welcome, {user?.email}
							</p>
						</div>
						<div className="flex items-center space-x-2">
							<ThemeToggle />
							<Button variant="outline" onClick={handleLogout}>
								Logout
							</Button>
						</div>
					</div>
				</header>

				<main className="flex-1 p-4 w-full flex flex-col h-[calc(100vh-80px)]">
					<KanbanBoard />
				</main>
			</div>
		</AuthErrorBoundary>
	);
}
