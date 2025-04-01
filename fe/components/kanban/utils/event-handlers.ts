import { QueryClient } from "@tanstack/react-query";
import {
	ColumnEventData,
	ColumnEventType,
	TaskEventData,
	TaskEventType,
} from "../types/types";
import {
	addColumnToCache,
	addTaskToCache,
	moveTaskToColumnInCache,
	removeColumnFromCache,
	removeTaskFromCache,
	updateColumnInCache,
	updateTaskInCache,
} from "./board-cache-utils";

/**
 * Type for any handler function that processes an event
 */
type EventHandler<T> = (data: T, queryClient: QueryClient) => void;

/**
 * Registry of task event handlers
 */
export const taskEventHandlers: Record<
	TaskEventType,
	EventHandler<TaskEventData>
> = {
	"task.created": (data, queryClient) => {
		if (data.id) {
			addTaskToCache(queryClient, data as any);
		}
	},

	"task.updated": (data, queryClient) => {
		if (data.id) {
			updateTaskInCache(queryClient, data.id, data);
		}
	},

	"task.deleted": (data, queryClient) => {
		if (data.id) {
			removeTaskFromCache(queryClient, data.id);
		}
	},

	"task.moved": (data, queryClient) => {
		if (data.id && data.columnId) {
			moveTaskToColumnInCache(queryClient, data.id, data.columnId);
		}
	},

	"task.reordered": (data, queryClient) => {
		// For simple reordering, invalidate the query to refetch the latest ordering
		queryClient.invalidateQueries({ queryKey: ["board"] });
	},

	"tasks.reordered": (data, queryClient) => {
		// For batch reordering, invalidate the query to refetch the latest ordering
		queryClient.invalidateQueries({ queryKey: ["board"] });
	},
};

/**
 * Registry of column event handlers
 */
export const columnEventHandlers: Record<
	ColumnEventType,
	EventHandler<ColumnEventData>
> = {
	"column.created": (data, queryClient) => {
		if (data.id) {
			addColumnToCache(queryClient, data as any);
		}
	},

	"column.updated": (data, queryClient) => {
		if (data.id) {
			updateColumnInCache(queryClient, data.id, data);
		}
	},

	"column.deleted": (data, queryClient) => {
		if (data.id) {
			removeColumnFromCache(queryClient, data.id, true);
		}
	},

	"column.reordered": (data, queryClient) => {
		// For column reordering, always invalidate the board cache to refetch the latest order
		// This ensures we get the latest column order regardless of the event structure
		queryClient.invalidateQueries({ queryKey: ["board"] });
	},
};

/**
 * Process a task-related event with the appropriate handler
 *
 * Note: Events can come in two formats:
 * 1. Direct event: { type: "task.created", data: {...} }
 * 2. Nested event: { type: "board", data: { type: "task.created", data: {...} } }
 * Both formats are handled in the useKanbanEvents hook.
 *
 * @param eventType - Type of task event
 * @param data - Event data
 * @param queryClient - React Query client for cache updates
 */
export function handleTaskEvent(
	eventType: TaskEventType,
	data: TaskEventData,
	queryClient: QueryClient,
) {
	const handler = taskEventHandlers[eventType];
	if (handler) {
		handler(data, queryClient);
	} else {
		console.warn(`No handler found for task event: ${eventType}`);
	}
}

/**
 * Process a column-related event with the appropriate handler
 *
 * Note: Events can come in two formats:
 * 1. Direct event: { type: "column.created", data: {...} }
 * 2. Nested event: { type: "board", data: { type: "column.created", data: {...} } }
 * Both formats are handled in the useKanbanEvents hook.
 *
 * @param eventType - Type of column event
 * @param data - Event data
 * @param queryClient - React Query client for cache updates
 */
export function handleColumnEvent(
	eventType: ColumnEventType,
	data: ColumnEventData,
	queryClient: QueryClient,
) {
	const handler = columnEventHandlers[eventType];
	if (handler) {
		handler(data, queryClient);
	} else {
		console.warn(`No handler found for column event: ${eventType}`);
	}
}
