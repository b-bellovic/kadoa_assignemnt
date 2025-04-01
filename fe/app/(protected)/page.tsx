"use client";

import { useAuth } from "@/modules/auth/auth-provider";
import { LoadingSpinner } from "@/components/ui/custom/loading-spinner";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
	const { isAuthenticated, loading } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (!loading) {
			router.push(isAuthenticated ? "/dashboard" : "/login");
		}
	}, [isAuthenticated, loading, router]);

	// Show loading state while checking auth
	return loading ? <LoadingSpinner /> : null;
}
