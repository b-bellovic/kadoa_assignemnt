import { DragOverEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { QueryClient } from "@tanstack/react-query";
import { MutableRefObject } from "react";
import { Column, Task } from "../types";
import { moveTaskToColumnInCache } from "./cache-utils";

/**
 * Type for items that can be ordered
 */
export type OrderableItem = { order: number; id: string };

/**
 * Data structure for tracking sortable items during drag operations
 */
export interface SortableData {
	containerId: string;
	index: number;
	items: string[];
}

/**
 * Calculates new order value when reordering items
 *
 * @param items - Array of orderable items
 * @param fromIndex - Original index of the item being moved (-1 if item is new to this container)
 * @param toIndex - Destination index for the item
 * @returns Calculated order value for the item at its new position
 */
export const calculateNewOrder = (
	items: OrderableItem[],
	fromIndex: number,
	toIndex: number,
): number => {
	// Moving to the start of the list
	if (toIndex === 0) {
		return items.length > 0 ? Math.floor(items[0].order / 2) : 1000;
	}

	// Moving to the end of the list
	if (
		toIndex >= items.length ||
		(fromIndex === -1 && toIndex === items.length)
	) {
		return items.length > 0 ? items[items.length - 1].order + 1000 : 1000;
	}

	// Moving between two existing items - calculate midpoint between adjacent items
	const prevOrder = items[toIndex - 1].order;
	const nextOrder = items[toIndex].order;

	// Ensure we return an integer by rounding down
	return Math.floor(prevOrder + (nextOrder - prevOrder) / 2);
};

/**
 * Updates the drag overlay data to reflect current position during drag operations
 *
 * @param activeData - Current data from the active drag element
 * @param containerId - ID of the container (column) where the item is being dragged
 * @param index - Position within the container where item would be placed
 * @param itemIds - Array of item IDs in the container
 * @returns Updated drag overlay data
 */
export const updateDragOverlayData = (
	activeData: any,
	containerId: string,
	index: number,
	itemIds: string[],
) => {
	return {
		...activeData,
		sortable: {
			containerId,
			index,
			items: itemIds,
		} as SortableData,
	};
};
