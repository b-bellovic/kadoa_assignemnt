"use client";

import { useState } from "react";
import { kanbanApi } from "@/api/kanban-api";
import { arrayMove } from "@dnd-kit/sortable";
import { Column, UpdateColumnParams } from "../types/types";
import { calculateNewOrder } from "../utils";
import { useQueryClient } from "@tanstack/react-query";

interface UseColumnDragProps {
	columns: Column[];
	updateColumn: (params: UpdateColumnParams) => Promise<void>;
}

/**
 * Hook for managing column drag operations specifically
 */
export function useColumnDrag({ columns, updateColumn }: UseColumnDragProps) {
	const [activeColumn, setActiveColumn] = useState<Column | null>(null);
	const queryClient = useQueryClient();

	/**
	 * Handles reordering of columns in the board
	 */
	const handleColumnReordering = async (
		activeId: string,
		overId: string,
	): Promise<void> => {
		// Exit early if same column
		if (activeId === overId) {
			setActiveColumn(null);
			return;
		}

		// Create a sorted copy of columns by their order property to ensure consistency
		const sortedColumns = [...columns].sort((a, b) => a.order - b.order);

		// Find column indices in the sorted array
		const activeColumnIndex = sortedColumns.findIndex(
			(col) => col.id === activeId,
		);
		const overColumnIndex = sortedColumns.findIndex((col) => col.id === overId);

		if (activeColumnIndex === -1 || overColumnIndex === -1) {
			console.error("Column not found for reordering", {
				activeId,
				overId,
			});
			setActiveColumn(null);
			return;
		}

		// Get the current column order with sorted columns as source
		const reorderedColumns = arrayMove(
			sortedColumns,
			activeColumnIndex,
			overColumnIndex,
		);

		// Extract column IDs in the new order
		const columnIds = reorderedColumns.map((column) => column.id);

		// Use the new API endpoint to update column order
		try {
			await kanbanApi.reorderColumns(columnIds);

			// Force a refresh of the board data to ensure consistency
			queryClient.invalidateQueries({ queryKey: ["board"] });
		} catch (error) {
			console.error("Failed to reorder columns:", error);

			// Fallback to the old method if reorderColumns fails
			const newOrder = calculateNewOrder(
				sortedColumns,
				activeColumnIndex,
				overColumnIndex,
			);

			await updateColumn({
				columnId: activeId,
				updates: { order: newOrder },
			});
		}

		setActiveColumn(null);
	};

	return {
		activeColumn,
		setActiveColumn,
		handleColumnReordering,
	};
}
