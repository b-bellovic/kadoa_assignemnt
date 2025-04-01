"use client";

import { useAuth } from "@/modules/auth/auth-provider";
import { LoadingSpinner } from "@/components/ui/custom/loading-spinner";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type React from "react";

export default function ProtectedLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const { loading, isAuthenticated, isLoggedOut } = useAuth();
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
	
	// Show children only if authenticated
	return isAuthenticated ? children : null;
}
