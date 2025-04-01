import {
	QueryClient,
	UseMutationOptions,
	useMutation,
} from "@tanstack/react-query";

/**
 * Factory function for creating mutations with consistent behavior
 *
 * @param queryClient - The React Query client instance
 * @param mutationFn - The function to execute when the mutation is triggered
 * @param options - Additional mutation options
 * @returns A configured mutation object
 */
export function createMutation<TData, TError, TVariables, TContext>(
	queryClient: QueryClient,
	mutationFn: (variables: TVariables) => Promise<TData>,
	options: Omit<
		UseMutationOptions<TData, TError, TVariables, TContext>,
		"mutationFn"
	> = {},
) {
	return useMutation({
		mutationFn,
		...options,
		onSuccess: (data, variables, context) => {
			// If there's an invalidate key, invalidate those queries
			if (options.meta?.invalidateQueries) {
				const invalidateQueries = Array.isArray(options.meta.invalidateQueries)
					? options.meta.invalidateQueries
					: [options.meta.invalidateQueries];

				invalidateQueries.forEach((queryKey) => {
					queryClient.invalidateQueries({
						queryKey: Array.isArray(queryKey) ? queryKey : [queryKey],
					});
				});
			}

			// Call the original onSuccess if provided
			if (options.onSuccess) {
				options.onSuccess(data, variables, context);
			}
		},
	});
}
