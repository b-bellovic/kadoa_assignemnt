import { kanbanApi } from "@/modules/board/api";
import { BoardData } from "@/modules/board/types";
import { KANBAN_KEYS } from "./query-keys";
import { useQuery } from "@tanstack/react-query";

/**
 * Hook for fetching board data
 */
export function useBoardQuery() {
	const boardQueryKey = KANBAN_KEYS.board();

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

	return {
		boardData,
		columns,
		tasks,
		isLoading,
		error,
		refetch,
		boardQueryKey,
	};
}
