import { useToast } from "@/components/ui/use-toast";
import { QueryClient } from "@tanstack/react-query";

/**
 * Generic error types for Kanban operations
 */
export enum KanbanErrorType {
	CREATE = "create",
	UPDATE = "update",
	DELETE = "delete",
	FETCH = "fetch",
	MOVE = "move",
	REORDER = "reorder",
}

/**
 * Entity types for error messages
 */
export enum EntityType {
	TASK = "task",
	COLUMN = "column",
	BOARD = "board",
}

/**
 * Standard error messages for different error scenarios
 */
export const errorMessages = {
	[KanbanErrorType.CREATE]: {
		[EntityType.TASK]: "Failed to create task",
		[EntityType.COLUMN]: "Failed to create column",
		[EntityType.BOARD]: "Failed to create board",
	},
	[KanbanErrorType.UPDATE]: {
		[EntityType.TASK]: "Failed to update task",
		[EntityType.COLUMN]: "Failed to update column",
		[EntityType.BOARD]: "Failed to update board",
	},
	[KanbanErrorType.DELETE]: {
		[EntityType.TASK]: "Failed to delete task",
		[EntityType.COLUMN]: "Failed to delete column",
		[EntityType.BOARD]: "Failed to delete board",
	},
	[KanbanErrorType.FETCH]: {
		[EntityType.TASK]: "Failed to load task",
		[EntityType.COLUMN]: "Failed to load column",
		[EntityType.BOARD]: "Failed to load board",
	},
	[KanbanErrorType.MOVE]: {
		[EntityType.TASK]: "Failed to move task",
		[EntityType.COLUMN]: "Failed to move column",
	},
	[KanbanErrorType.REORDER]: {
		[EntityType.TASK]: "Failed to reorder tasks",
		[EntityType.COLUMN]: "Failed to reorder columns",
	},
};

/**
 * Error handler options
 */
interface ErrorHandlerOptions {
	toast: ReturnType<typeof useToast>["toast"];
	queryClient?: QueryClient;
	invalidateQueries?: boolean;
	queryKeys?: string[];
	customMessage?: string;
}

/**
 * Generic error handler for Kanban operations
 *
 * @param error - The error object
 * @param errorType - Type of operation that failed
 * @param entityType - Type of entity the operation was performed on
 * @param options - Additional error handling options
 */
export const handleKanbanError = (
	error: unknown,
	errorType: KanbanErrorType,
	entityType: EntityType,
	options: ErrorHandlerOptions,
): void => {
	// Log the error for debugging
	console.error(`${errorType} ${entityType} error:`, error);

	// Show a toast message
	options.toast({
		title: "Error",
		description: options.customMessage || errorMessages[errorType][entityType],
		variant: "destructive",
	});

	// If needed, invalidate queries to refresh the data
	if (options.invalidateQueries && options.queryClient) {
		const keys = options.queryKeys || ["board"];
		options.queryClient.invalidateQueries({ queryKey: keys });
	}
};

/**
 * Creates a standardized error handler for mutations
 *
 * @param errorType - Type of operation that failed
 * @param entityType - Type of entity the operation was performed on
 * @param options - Additional error handling options
 * @returns A function to handle errors
 */
export const createErrorHandler =
	(
		errorType: KanbanErrorType,
		entityType: EntityType,
		options: ErrorHandlerOptions,
	) =>
	(error: unknown) => {
		handleKanbanError(error, errorType, entityType, options);
	};
