import { NextRequest, NextResponse } from "next/server";

// Public routes that don't require authentication
const publicRoutes = [
	"/login",
	"/register",
	"/forgot-password",
	"/reset-password",
	"/api/auth/refresh",
	"/_next",
	"/favicon.ico",
];

// Check if a path matches any public route
function isPublicRoute(path: string): boolean {
	return publicRoutes.some((route) => path.startsWith(route));
}

export function middleware(request: NextRequest) {
	const authToken = request.cookies.get("token")?.value;
	const path = request.nextUrl.pathname;

	// Allow public routes without token
	if (isPublicRoute(path)) {
		return NextResponse.next();
	}

	// Redirect to login if no token and trying to access protected route
	if (!authToken) {
		const loginUrl = new URL("/login", request.url);

		// Add redirect parameter WITHOUT encoding - Next.js handles this automatically
		loginUrl.searchParams.set("redirect", path);

		return NextResponse.redirect(loginUrl);
	}

	// Allow access to protected routes with token
	return NextResponse.next();
}

// Match all routes except static resources and api routes
export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - public (public files)
		 * - images (image files)
		 */
		"/((?!_next/static|_next/image|favicon.ico|public|images).*)",
	],
};
