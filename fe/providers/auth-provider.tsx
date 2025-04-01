"use client";

import { useAuthService } from "@/hooks/use-auth-service";
import { getAuthToken } from "@/lib/auth-token";
import { Credentials, User } from "@/types/auth";
import { createContext, useContext, useEffect, useState } from "react";

// Auth context type
interface AuthContextType {
	user: User | null;
	loading: boolean;
	error: unknown;
	login: (credentials: Credentials) => void;
	register: (credentials: Credentials) => void;
	logout: () => Promise<void>;
	isAuthenticated: boolean;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [tokenChecked, setTokenChecked] = useState(false);

	// Use our custom auth service hook
	const auth = useAuthService();

	// Force initial token check
	useEffect(() => {
		setTokenChecked(true);
	}, []);

	// Check token status on mount and periodically
	useEffect(() => {
		if (!tokenChecked) return;

		// Refresh user status if we have a token
		const refreshUserStatus = () => {
			const token = getAuthToken();
			if (token) {
				auth.refetch();
			}
		};

		// Check token initially
		refreshUserStatus();

		// Set up periodic check (every 5 minutes)
		const intervalId = setInterval(refreshUserStatus, 5 * 60 * 1000);

		return () => clearInterval(intervalId);
	}, [auth.refetch, tokenChecked]);

	// Determine if authenticated based on user existence and loading state
	const loading = auth.loading || !tokenChecked;

	// Provide auth context
	return (
		<AuthContext.Provider
			value={{
				user: auth.user || null,
				loading,
				error: auth.error,
				login: auth.login,
				register: auth.register,
				logout: auth.logout,
				isAuthenticated: auth.isAuthenticated,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

// Custom hook to use auth context
export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
