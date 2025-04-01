"use client";

import { useAuthService } from "@/modules/auth/use-auth-service";
import { getAuthToken } from "@/modules/auth/auth-token";
import { Credentials, User } from "@/modules/auth/auth";
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [tokenChecked, setTokenChecked] = useState(false);

	const auth = useAuthService();

	useEffect(() => {
		setTokenChecked(true);
	}, []);

	useEffect(() => {
		if (!tokenChecked) return;

		const refreshUserStatus = () => {
			const token = getAuthToken();
			if (token) {
				auth.refetch();
			}
		};

		refreshUserStatus();

		const intervalId = setInterval(refreshUserStatus, 5 * 60 * 1000);

		return () => clearInterval(intervalId);
	}, [auth.refetch, tokenChecked]);

	const loading = auth.loading || !tokenChecked;

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

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
