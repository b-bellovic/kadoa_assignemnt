import { kanbanApi } from "@/api/kanban";
import {
	BoardData,
	CreateTaskParams,
	TaskUpdates,
	MoveTaskParams,
	Task,
	ReorderTasksParams,
	UpdateTaskParams,
} from "@/components/kanban/types/types";
import { createMutation } from "@/lib/query-utils";
import { createOptimisticHandler } from "@/lib/optimistic-updates";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Hook for task-related mutations
 */
export function useTaskMutations(boardQueryKey: string[]) {
	const queryClient = useQueryClient();

	// Create task mutation - no optimistic update, just invalidate
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

	// Update task mutation with optimistic update
	const updateTaskMutation = createMutation(
		queryClient,
		({ taskId, updates }: UpdateTaskParams) =>
			kanbanApi.updateTask(taskId, updates),
		createOptimisticHandler<BoardData, UpdateTaskParams>(
			queryClient,
			boardQueryKey,
			(data, { taskId, updates }) => ({
				...data,
				tasks: data.tasks.map((task) =>
					task.id === taskId ? { ...task, ...updates } : task,
				),
			}),
		),
	);

	// Move task mutation with optimistic update
	const moveTaskMutation = createMutation(
		queryClient,
		(params: MoveTaskParams) => kanbanApi.moveTask(params),
		createOptimisticHandler<BoardData, MoveTaskParams>(
			queryClient,
			boardQueryKey,
			(data, { taskId, targetColumnId, order }) => ({
				...data,
				tasks: data.tasks.map((task) =>
					task.id === taskId
						? {
								...task,
								columnId: targetColumnId,
								...(order !== undefined ? { order } : {}),
							}
						: task,
				),
			}),
		),
	);

	// Delete task mutation with optimistic update
	const deleteTaskMutation = createMutation(
		queryClient,
		(taskId: string) => kanbanApi.deleteTask(taskId),
		createOptimisticHandler<BoardData, string>(
			queryClient,
			boardQueryKey,
			(data, taskId) => ({
				...data,
				tasks: data.tasks.filter((task) => task.id !== taskId),
			}),
		),
	);

	// Reorder tasks mutation with optimistic update
	const reorderTasksMutation = createMutation(
		queryClient,
		({ columnId, taskIds }: ReorderTasksParams) =>
			kanbanApi.reorderTasks(columnId, taskIds),
		createOptimisticHandler<BoardData, ReorderTasksParams>(
			queryClient,
			boardQueryKey,
			(data, { columnId, taskIds }) => {
				// Create a mapping of taskId to new order
				const orderMap = taskIds.reduce(
					(acc, id, index) => {
						acc[id] = index;
						return acc;
					},
					{} as Record<string, number>,
				);

				// Update tasks with new order
				return {
					...data,
					tasks: data.tasks.map((task) =>
						task.columnId === columnId && orderMap[task.id] !== undefined
							? { ...task, order: orderMap[task.id] }
							: task,
					),
				};
			},
		),
	);

	// Helper function for creating a task at the end of a column
	const createTaskAtEnd = (
		params: Omit<CreateTaskParams, "order">,
		tasks: Task[],
	) => {
		const columnTasks = tasks.filter(
			(task) => task.columnId === params.columnId,
		);
		const lastOrder =
			columnTasks.length > 0
				? Math.max(...columnTasks.map((task) => task.order))
				: -1;

		createTaskMutation.mutate({
			...params,
			order: lastOrder + 1000,
		});
	};

	return {
		createTask: createTaskMutation.mutate,
		createTaskAtEnd,
		updateTask: updateTaskMutation.mutate,
		moveTask: moveTaskMutation.mutate,
		deleteTask: deleteTaskMutation.mutate,
		reorderTasks: reorderTasksMutation.mutate,
		isCreatingTask: createTaskMutation.isPending,

		// Raw mutations for complex use cases
		createTaskMutation,
		updateTaskMutation,
		moveTaskMutation,
		deleteTaskMutation,
		reorderTasksMutation,
	};
}
