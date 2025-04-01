import Cookies from "js-cookie";

// Cookie name for authentication token
export const AUTH_TOKEN_NAME = "token";

/**
 * Authentication token helper functions
 */
export function setAuthToken(token: string): void {
	Cookies.set(AUTH_TOKEN_NAME, token, {
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict",
		path: "/",
		expires: 7, // 7 days
	});
}

export function clearAuthToken(): void {
	Cookies.remove(AUTH_TOKEN_NAME, { path: "/" });
}

export function getAuthToken(): string | undefined {
	return Cookies.get(AUTH_TOKEN_NAME);
}
