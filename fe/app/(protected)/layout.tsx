"use client";

import { useAuth } from "@/modules/auth/auth-provider";
import { LoadingSpinner } from "@/components/ui/custom/loading-spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type React from "react";

export default function ProtectedLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const { loading, isAuthenticated, isLoggedOut, error } = useAuth();
	const router = useRouter();
	
	useEffect(() => {
		// If not loading and either not authenticated or logged out, redirect to login
		if (!loading && (!isAuthenticated || isLoggedOut)) {
			const currentPath = window.location.pathname;
			router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
		}
	}, [loading, isAuthenticated, isLoggedOut, router]);

	// Show loading state while authentication is being checked
	if (loading) {
		return <LoadingSpinner />;
	}
	
	// Show error state if there's an authentication error
	if (error) {
		return (
			<div className="flex items-center justify-center h-screen p-4">
				<Alert variant="destructive" className="max-w-md">
					<AlertCircle className="h-4 w-4" />
					<AlertTitle>Authentication Error</AlertTitle>
					<AlertDescription>
						There was a problem with your authentication. Please try{" "}
						<a href="/login" className="underline font-medium">
							logging in again
						</a>.
					</AlertDescription>
				</Alert>
			</div>
		);
	}
	
	// Show children only if authenticated
	return isAuthenticated ? children : null;
}
