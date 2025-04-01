import { QueryClient } from "@tanstack/react-query";

/**
 * Creates a standard optimistic update handler for React Query mutations
 * @param queryClient - React Query client
 * @param queryKey - Key for the query to update
 * @param updateFn - Function to update the data optimistically
 * @returns Object with React Query mutation handlers
 */
export function createOptimisticHandler<TData, TVariables>(
	queryClient: QueryClient,
	queryKey: unknown[],
	updateFn: (data: TData, variables: TVariables) => TData,
) {
	return {
		onMutate: async (variables: TVariables) => {
			await queryClient.cancelQueries({ queryKey });

			const previousData = queryClient.getQueryData<TData>(queryKey);

			if (previousData) {
				queryClient.setQueryData(queryKey, updateFn(previousData, variables));
			}

			return { previousData };
		},
		onError: (err: any, variables: TVariables, context: any) => {
			if (context?.previousData) {
				queryClient.setQueryData(queryKey, context.previousData);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey });
		},
	};
}
