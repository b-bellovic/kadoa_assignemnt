import { kanbanApi } from "@/api/kanban";
import {
	BoardData,
	CreateColumnParams,
	ColumnUpdates,
	Column,
	UpdateColumnParams,
} from "@/components/kanban/types/types";
import { createMutation } from "@/lib/query-utils";
import { createOptimisticHandler } from "@/lib/optimistic-updates";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Hook for column-related mutations
 */
export function useColumnMutations(boardQueryKey: string[]) {
	const queryClient = useQueryClient();

	// Create column mutation - no optimistic update needed
	const createColumnMutation = createMutation(
		queryClient,
		({ title, order }: CreateColumnParams) =>
			kanbanApi.createColumn(title, order),
		{
			meta: {
				invalidateQueries: boardQueryKey,
			},
		},
	);

	// Update column mutation with optimistic update
	const updateColumnMutation = createMutation(
		queryClient,
		({ columnId, updates }: UpdateColumnParams) =>
			kanbanApi.updateColumn(columnId, updates),
		createOptimisticHandler<BoardData, UpdateColumnParams>(
			queryClient,
			boardQueryKey,
			(data, { columnId, updates }) => ({
				...data,
				columns: data.columns.map((column) =>
					column.id === columnId ? { ...column, ...updates } : column,
				),
			}),
		),
	);

	// Delete column mutation with optimistic update
	const deleteColumnMutation = createMutation(
		queryClient,
		(columnId: string) => kanbanApi.deleteColumn(columnId),
		createOptimisticHandler<BoardData, string>(
			queryClient,
			boardQueryKey,
			(data, columnId) => ({
				...data,
				columns: data.columns.filter((column) => column.id !== columnId),
				tasks: data.tasks.filter((task) => task.columnId !== columnId),
			}),
		),
	);

	// Reorder columns mutation - no optimistic update, just invalidate
	const reorderColumnsMutation = createMutation(
		queryClient,
		(columnIds: string[]) => kanbanApi.reorderColumns(columnIds),
		{
			meta: {
				invalidateQueries: boardQueryKey,
			},
		},
	);

	// Helper function for creating a column at the end of the board
	const createColumnAtEnd = (title: string, columns: Column[]) => {
		const lastOrder =
			columns.length > 0
				? Math.max(...columns.map((column) => column.order))
				: -1;

		createColumnMutation.mutate({
			title,
			order: lastOrder + 1000,
		});
	};

	return {
		createColumn: createColumnMutation.mutate,
		createColumnAtEnd,
		updateColumn: updateColumnMutation.mutate,
		deleteColumn: deleteColumnMutation.mutate,
		reorderColumns: reorderColumnsMutation.mutate,
		isCreatingColumn: createColumnMutation.isPending,

		// Raw mutations for complex use cases
		createColumnMutation,
		updateColumnMutation,
		deleteColumnMutation,
		reorderColumnsMutation,
	};
}
