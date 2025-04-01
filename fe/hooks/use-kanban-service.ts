import { kanbanApi } from "@/api/kanban-api";
import {
	BoardData,
	Column,
	ColumnUpdates,
	CreateColumnParams,
	CreateTaskParams,
	Task,
	TaskUpdates,
} from "@/components/kanban/types/types";
import { createMutation } from "@/lib/query-utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";

/**
 * Custom hook for managing Kanban board data and operations
 * Provides board data fetching and CRUD operations with React Query
 */
export function useKanbanService() {
	const queryClient = useQueryClient();
	const boardQueryKey = ["board"];

	const {
		data: boardData,
		isLoading,
		error,
		refetch,
	} = useQuery<BoardData>({
		queryKey: boardQueryKey,
		queryFn: kanbanApi.getBoard,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});

	const columns = boardData?.columns || [];
	const tasks = boardData?.tasks || [];

	// Create column mutation
	const createColumnMutation = createMutation(
		queryClient,
		({ title, order }: CreateColumnParams) =>
			kanbanApi.createColumn(title, order),
		{
			meta: {
				invalidateQueries: boardQueryKey,
			},
			// Optimistic update could be added here if needed
		},
	);

	const updateColumnMutation = createMutation(
		queryClient,
		({ columnId, updates }: { columnId: string; updates: ColumnUpdates }) =>
			kanbanApi.updateColumn(columnId, updates),
		{
			onMutate: async ({ columnId, updates }) => {
				await queryClient.cancelQueries({ queryKey: boardQueryKey });

				const previousBoard =
					queryClient.getQueryData<BoardData>(boardQueryKey);

				if (previousBoard) {
					queryClient.setQueryData<BoardData>(boardQueryKey, {
						...previousBoard,
						columns: previousBoard.columns.map((column) =>
							column.id === columnId ? { ...column, ...updates } : column,
						),
					});
				}

				return { previousBoard };
			},
			onError: (err, variables, context) => {
				if (context?.previousBoard) {
					queryClient.setQueryData(boardQueryKey, context.previousBoard);
				}
			},
			onSettled: () => {
				queryClient.invalidateQueries({ queryKey: boardQueryKey });
			},
		},
	);

	const deleteColumnMutation = createMutation(
		queryClient,
		(columnId: string) => kanbanApi.deleteColumn(columnId),
		{
			onMutate: async (columnId) => {
				await queryClient.cancelQueries({ queryKey: boardQueryKey });

				const previousBoard =
					queryClient.getQueryData<BoardData>(boardQueryKey);

				if (previousBoard) {
					queryClient.setQueryData<BoardData>(boardQueryKey, {
						...previousBoard,
						columns: previousBoard.columns.filter(
							(column) => column.id !== columnId,
						),
						tasks: previousBoard.tasks.filter(
							(task) => task.columnId !== columnId,
						),
					});
				}

				return { previousBoard };
			},
			onError: (err, columnId, context) => {
				if (context?.previousBoard) {
					queryClient.setQueryData(boardQueryKey, context.previousBoard);
				}
			},
			onSettled: () => {
				queryClient.invalidateQueries({ queryKey: boardQueryKey });
			},
		},
	);

	const createTaskMutation = createMutation(
		queryClient,
		(params: CreateTaskParams) =>
			kanbanApi.createTask(
				params.title,
				params.description,
				params.columnId,
				params.order,
			),
		{
			meta: {
				invalidateQueries: boardQueryKey,
			},
		},
	);

	const updateTaskMutation = createMutation(
		queryClient,
		({ taskId, updates }: { taskId: string; updates: TaskUpdates }) =>
			kanbanApi.updateTask(taskId, updates),
		{
			onMutate: async ({ taskId, updates }) => {
				await queryClient.cancelQueries({ queryKey: boardQueryKey });

				const previousBoard =
					queryClient.getQueryData<BoardData>(boardQueryKey);

				if (previousBoard) {
					queryClient.setQueryData<BoardData>(boardQueryKey, {
						...previousBoard,
						tasks: previousBoard.tasks.map((task) =>
							task.id === taskId ? { ...task, ...updates } : task,
						),
					});
				}

				return { previousBoard };
			},
			onError: (err, variables, context) => {
				if (context?.previousBoard) {
					queryClient.setQueryData(boardQueryKey, context.previousBoard);
				}
			},
			onSettled: () => {
				queryClient.invalidateQueries({ queryKey: boardQueryKey });
			},
		},
	);

	const deleteTaskMutation = createMutation(
		queryClient,
		(taskId: string) => kanbanApi.deleteTask(taskId),
		{
			onMutate: async (taskId) => {
				await queryClient.cancelQueries({ queryKey: boardQueryKey });

				const previousBoard =
					queryClient.getQueryData<BoardData>(boardQueryKey);

				if (previousBoard) {
					queryClient.setQueryData<BoardData>(boardQueryKey, {
						...previousBoard,
						tasks: previousBoard.tasks.filter((task) => task.id !== taskId),
					});
				}

				return { previousBoard };
			},
			onError: (err, taskId, context) => {
				if (context?.previousBoard) {
					queryClient.setQueryData(boardQueryKey, context.previousBoard);
				}
			},
			onSettled: () => {
				queryClient.invalidateQueries({ queryKey: boardQueryKey });
			},
		},
	);

	return {
		// Board data
		boardData,
		columns,
		tasks,

		// Loading and error states
		isLoading,
		error,
		refetch,

		// Column operations
		createColumn: createColumnMutation.mutate,
		updateColumn: updateColumnMutation.mutate,
		deleteColumn: deleteColumnMutation.mutate,
		isCreatingColumn: createColumnMutation.isPending,

		// Task operations
		createTask: createTaskMutation.mutate,
		updateTask: updateTaskMutation.mutate,
		deleteTask: deleteTaskMutation.mutate,
		isCreatingTask: createTaskMutation.isPending,

		// Raw mutations (for more complex use cases)
		createColumnMutation,
		updateColumnMutation,
		deleteColumnMutation,
		createTaskMutation,
		updateTaskMutation,
		deleteTaskMutation,
	};
}
