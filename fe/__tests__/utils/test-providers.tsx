import React, { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/**
 * Creates a new QueryClient with test-specific settings
 */
export function createTestQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				// Turn off retries for testing to avoid timeouts
				retry: false,
				// Prevent re-fetching during tests
				staleTime: Infinity,
				// Disable caching between tests
				gcTime: 0,
			},
			mutations: {
				// Turn off retries for testing
				retry: false,
			},
		},
		// Silence React Query errors in the console for cleaner test output
		logger: {
			// Keep console.log and console.warn as is
			log: console.log,
			warn: console.warn,
			// Disable error logging as we test errors explicitly
			error: () => {},
		},
	});
}

/**
 * A wrapper component that provides a test-specific QueryClient
 */
export function TestQueryClientProvider({ children }: { children: ReactNode }) {
	const queryClient = createTestQueryClient();

	return (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);
}

/**
 * Creates a wrapper function for ReactQuery tests
 * Use this with the render function from @testing-library/react
 *
 * @example
 * render(<Component />, { wrapper: createQueryClientWrapper() });
 */
export function createQueryClientWrapper() {
	return ({ children }: { children: ReactNode }) => (
		<TestQueryClientProvider>{children}</TestQueryClientProvider>
	);
}
