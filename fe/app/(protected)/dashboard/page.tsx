"use client";

import KanbanBoard from "@/modules/board/components/kanban-board";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/custom/theme-toggle";
import { useAuth } from "@/modules/auth/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Dashboard() {
	const { user, logout, isAuthenticated, loading } = useAuth();
	const router = useRouter();

	useEffect(() => {
		// Only redirect if we're sure authentication state is loaded
		if (!loading && !isAuthenticated) {
			router.push("/login");
		}
	}, [isAuthenticated, loading, router]);

	// The board data is now prefetched automatically by the useKanbanService hook

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
			</div>
		);
	}

	// Don't render anything if not authenticated
	if (!isAuthenticated) {
		return null;
	}

	return (
		<div className="flex flex-col min-h-screen">
			<header className="bg-background border-b shadow-sm p-4 dark:border-gray-800">
				<div className=" mx-auto flex justify-between items-center">
					<div>
						<h1 className="text-xl font-bold">Kanban Dashboard</h1>
						<p className="text-sm text-muted-foreground">
							Welcome, {user?.email}
						</p>
					</div>
					<div className="flex items-center space-x-2">
						<ThemeToggle />
						<Button variant="outline" onClick={() => logout()}>
							Logout
						</Button>
					</div>
				</div>
			</header>

			<main className="flex-1 p-4 w-full flex flex-col h-[calc(100vh-80px)]">
				<KanbanBoard />
			</main>
		</div>
	);
}
