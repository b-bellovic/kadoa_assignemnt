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

/**
 * Helper to optimize a list update by modifying the cache directly
 *
 * @param queryClient - React Query client instance
 * @param queryKey - Key of the query to update
 * @param itemId - ID of the item to update
 * @param updateFn - Function to apply the update to the found item
 */
export function updateItemInCache<T extends { id: string }>(
	queryClient: QueryClient,
	queryKey: unknown[],
	itemId: string,
	updateFn: (item: T) => T,
) {
	queryClient.setQueryData(queryKey, (oldData: any) => {
		if (!oldData) return oldData;

		// For array data (list of items)
		if (Array.isArray(oldData)) {
			return oldData.map((item: any) =>
				item.id === itemId ? updateFn(item as T) : item,
			);
		}

		// For nested data structures like { items: T[] }
		if (oldData.items && Array.isArray(oldData.items)) {
			return {
				...oldData,
				items: oldData.items.map((item: any) =>
					item.id === itemId ? updateFn(item as T) : item,
				),
			};
		}

		// For board-specific structure with columns and tasks
		if (oldData.columns && oldData.tasks) {
			if (queryKey.includes("task")) {
				return {
					...oldData,
					tasks: oldData.tasks.map((item: any) =>
						item.id === itemId ? updateFn(item as T) : item,
					),
				};
			}

			if (queryKey.includes("column")) {
				return {
					...oldData,
					columns: oldData.columns.map((item: any) =>
						item.id === itemId ? updateFn(item as T) : item,
					),
				};
			}
		}

		return oldData;
	});
}
