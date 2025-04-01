import { clearAuthToken, getAuthToken } from "@/modules/auth/auth-token";
import { API_URL } from "./config";

/**
 * Core API client function for making authenticated HTTP requests
 * @param endpoint API endpoint path
 * @param options Request options
 * @returns Promise with typed response data
 */
export async function apiClient<T>(
	endpoint: string,
	options: RequestInit = {},
): Promise<T> {
	const headers = {
		"Content-Type": "application/json",
		...options.headers,
	} as Record<string, string>;

	const accessToken = getAuthToken();

	if (accessToken) {
		headers["Authorization"] = `Bearer ${accessToken}`;
	}

	const baseUrl = API_URL || "http://localhost:3001";
	const url = `${baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

	try {
		const response = await fetch(url, {
			...options,
			headers,
			credentials: "include", // Include cookies in the request
		});

		if (response.status === 401) {
			clearAuthToken();
			if (typeof window !== "undefined") {
				window.location.href = "/login";
			}
			throw new Error("Authentication failed");
		}

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			throw new Error(
				errorData.message || `Request failed with status ${response.status}`,
			);
		}

		if (
			response.status === 204 ||
			response.headers.get("content-length") === "0"
		) {
			return {} as T;
		}

		return await response.json();
	} catch (error: any) {
		error.endpoint = endpoint;
		error.timestamp = new Date().toISOString();
		throw error;
	}
}
