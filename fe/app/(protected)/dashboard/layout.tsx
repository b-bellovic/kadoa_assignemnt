"use client";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/custom/theme-toggle";
import { useAuth } from "@/modules/auth/auth-provider";
import { LoadingSpinner } from "@/components/ui/custom/loading-spinner";
import { AuthErrorBoundary } from "@/components/ui/custom/error-boundary";
import { LayoutDashboard, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
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
			<div className="flex flex-col h-screen bg-background/50">
				<header className="bg-background border-b shadow-sm py-3 px-4 dark:border-gray-800 sticky top-0 z-10">
					<div className="container mx-auto flex justify-between items-center">
						<div className="flex items-center">
							<LayoutDashboard className="h-5 w-5 text-primary mr-2" />
							<h1 className="text-xl font-bold text-foreground/90">Kanban Dashboard</h1>
						</div>
						<div className="flex items-center space-x-3">
							<p className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full hidden sm:block">
								{user?.email}
							</p>
							<ThemeToggle />
							<Button variant="outline" size="sm" onClick={handleLogout} className="gap-1.5">
								<LogOut className="h-4 w-4" />
								<span className="hidden sm:inline">Logout</span>
							</Button>
						</div>
					</div>
				</header>

				<main className="flex flex-col flex-1 overflow-hidden">
					{children}
				</main>

				<footer className="bg-muted/50 py-2 px-4 text-center border-t text-xs text-muted-foreground">
					<p>Kanban Board · {new Date().getFullYear()}</p>
				</footer>
			</div>
		</AuthErrorBoundary>
	);
}
