import { clearAuthToken, getAuthToken } from "@/lib/auth-token";
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
	// Prepare headers with Content-Type if not specified
	const headers = {
		"Content-Type": "application/json",
		...options.headers,
	} as Record<string, string>;

	// Get access token
	const accessToken = getAuthToken();

	// Add token to headers if available
	if (accessToken) {
		headers["Authorization"] = `Bearer ${accessToken}`;
	}

	// Build the full URL, ensuring it has the correct format
	const baseUrl = API_URL || "http://localhost:3001";
	const url = `${baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

	// Send request
	try {
		const response = await fetch(url, {
			...options,
			headers,
			credentials: "include", // Include cookies in the request
		});

		// Handle unauthorized error specifically
		if (response.status === 401) {
			// Clear token and redirect to login
			clearAuthToken();
			if (typeof window !== "undefined") {
				window.location.href = "/login";
			}
			throw new Error("Authentication failed");
		}

		// Handle error responses
		if (!response.ok) {
			// Try to get error details from response
			const errorData = await response.json().catch(() => ({}));
			throw new Error(
				errorData.message || `Request failed with status ${response.status}`,
			);
		}

		// Parse and return successful response
		if (
			response.status === 204 ||
			response.headers.get("content-length") === "0"
		) {
			// Handle empty responses for operations like DELETE
			return {} as T;
		}

		return await response.json();
	} catch (error: any) {
		// Enhance error with additional context
		error.endpoint = endpoint;
		error.timestamp = new Date().toISOString();
		throw error;
	}
}
