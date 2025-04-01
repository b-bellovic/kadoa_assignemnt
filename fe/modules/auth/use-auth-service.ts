import { authApi } from "@/modules/auth/api/auth-api";
import {
	clearAuthToken,
	getAuthToken,
	setAuthToken,
} from "@/modules/auth/auth-token";
import { Credentials, User } from "@/modules/auth/auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";

export function useAuthService() {
	const queryClient = useQueryClient();
	const router = useRouter();
	const searchParams = useSearchParams();

	const {
		data: user,
		isLoading: profileLoading,
		error,
		refetch,
	} = useQuery({
		queryKey: ["auth-user"],
		queryFn: authApi.getProfile,
		enabled: !!getAuthToken(),
		retry: false, // Don't retry on failure
		staleTime: 5 * 60 * 1000, // 5 minutes
	});

	// Helper to get the proper redirect path
	const getRedirectPath = () => {
		const redirectParam = searchParams?.get("redirect");
		if (!redirectParam) return "/dashboard";

		// Ensure the redirect path starts with a slash
		return redirectParam.startsWith("/") ? redirectParam : `/${redirectParam}`;
	};

	const loginMutation = useMutation({
		mutationFn: async (credentials: Credentials) => {
			const response = await authApi.login(credentials);
			if (response.access_token) {
				setAuthToken(response.access_token);
				return response;
			}
			throw new Error("No access token received from server");
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["auth-user"] });
			refetch();

			// Get redirect path from URL
			const redirectPath = getRedirectPath();
			router.push(redirectPath);
		},
	});

	// Register mutation
	const registerMutation = useMutation({
		mutationFn: async (credentials: Credentials) => {
			const response = await authApi.register(credentials);
			if (response.access_token) {
				setAuthToken(response.access_token);
				return response;
			}
			throw new Error("No access token received from server");
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["auth-user"] });
			refetch();

			// Get redirect path from URL
			const redirectPath = getRedirectPath();
			router.push(redirectPath);
		},
	});

	const logout = async () => {
		// This will be updated by the auth provider
		// We don't need direct access to setIsLoggedOut here

		// First invalidate and remove queries to prevent any unauthorized requests
		queryClient.invalidateQueries({ queryKey: ["auth-user"] });
		queryClient.removeQueries({ queryKey: ["auth-user"] });

		// Clear any other queries that might depend on auth
		queryClient.clear();

		// Clear the token after queries are cleared
		clearAuthToken();

		// Use setTimeout to ensure navigation happens in the next event loop
		// after React has processed the state changes from clearing the queries
		setTimeout(() => {
			router.push("/login");
		}, 0);
	};

	return {
		user,
		loading:
			profileLoading || loginMutation.isPending || registerMutation.isPending,
		error: error || loginMutation.error || registerMutation.error,
		login: loginMutation.mutate,
		register: registerMutation.mutate,
		logout,
		isAuthenticated: !!user && !!getAuthToken(), // Check both user and token
		refetch,
	};
}
