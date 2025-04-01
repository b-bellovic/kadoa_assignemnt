import { apiClient } from "@/lib/api-client";
import { AuthResponse, Credentials, User } from "@/types/auth";

/**
 * Auth API module
 * Contains API calls for authentication operations
 */
export const authApi = {
	/**
	 * Login with email and password
	 * @param credentials User credentials (email/password)
	 * @returns Authentication response with access token
	 */
	login: async (credentials: Credentials): Promise<AuthResponse> => {
		return apiClient<AuthResponse>("/auth/login", {
			method: "POST",
			body: JSON.stringify(credentials),
		});
	},

	/**
	 * Register a new user
	 * @param credentials User registration data (email/password)
	 * @returns Authentication response with access token
	 */
	register: async (credentials: Credentials): Promise<AuthResponse> => {
		return apiClient<AuthResponse>("/users/register", {
			method: "POST",
			body: JSON.stringify(credentials),
		});
	},

	/**
	 * Get current user profile
	 * @returns User profile data
	 */
	getProfile: async (): Promise<User> => {
		return apiClient<User>("/users/profile");
	},
};
