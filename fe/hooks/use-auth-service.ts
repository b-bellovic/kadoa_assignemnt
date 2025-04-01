import { authApi } from "@/api/auth-api";
import { clearAuthToken, getAuthToken, setAuthToken } from "@/lib/auth-token";
import { Credentials, User } from "@/types/auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export function useAuthService() {
	const queryClient = useQueryClient();
	const router = useRouter();

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
		},
	});

	const logout = async () => {
		clearAuthToken();
		queryClient.removeQueries({ queryKey: ["auth-user"] });
		queryClient.clear();
		router.push("/login");
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
