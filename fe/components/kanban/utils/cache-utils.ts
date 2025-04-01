import { QueryClient } from "@tanstack/react-query";
import { BoardData, Column, Task } from "../types/types";

const BOARD_QUERY_KEY = ["board"];

/**
 * Moves a task to a different column in the cache
 */
export function moveTaskToColumnInCache(
	queryClient: QueryClient,
	taskId: string,
	targetColumnId: string,
) {
	queryClient.setQueryData<BoardData>(BOARD_QUERY_KEY, (oldData) => {
		if (!oldData) return oldData;

		return {
			...oldData,
			tasks: oldData.tasks.map((task) =>
				task.id === taskId ? { ...task, columnId: targetColumnId } : task,
			),
		};
	});
}
