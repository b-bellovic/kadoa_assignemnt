"use client";

import {
	MutationCache,
	QueryCache,
	QueryClient,
	QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ReactNode, useState } from "react";

function QueryProvider({ children }: { children: ReactNode }) {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						retry: 1,
						refetchOnWindowFocus: false,
						staleTime: 5 * 60 * 1000, // 5 minutes
					},
				},
				queryCache: new QueryCache({
					onError: (error, query) => {
						console.error(`Query error: ${error}`, query);
					},
				}),
				mutationCache: new MutationCache({
					onError: (error, _variables, _context, mutation) => {
						console.error(`Mutation error: ${error}`, mutation);
					},
				}),
			}),
	);

	return (
		<QueryClientProvider client={queryClient}>
			{children}
			{process.env.NODE_ENV !== "production" && <ReactQueryDevtools />}
		</QueryClientProvider>
	);
}

export default QueryProvider;
