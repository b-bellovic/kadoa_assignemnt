"use client";

import { getAuthToken } from "@/lib/auth-token";
import { API_URL } from "@/lib/config";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";
import { ColumnEventType, TaskEventType } from "../types/types";
import { handleColumnEvent, handleTaskEvent } from "../utils";

/**
 * Supported event types for the Kanban board
 * Note: the "board" event type is a container for other events
 * and needs to be subscribed to for nested event handling
 */
const SUPPORTED_EVENT_TYPES = [
	// Task events
	"task.created",
	"task.updated",
	"task.deleted",
	"task.moved",
	"task.reordered",
	"tasks.reordered",

	// Column events
	"column.created",
	"column.updated",
	"column.deleted",
	"column.reordered",

	// Container event type
	"board",
];

/**
 * Maximum number of reconnection attempts
 */
const MAX_RECONNECT_ATTEMPTS = 5;

/**
 * Initial delay for reconnection in milliseconds
 */
const INITIAL_RECONNECT_DELAY = 1000;

/**
 * Hook to subscribe to and handle board-related server-sent events
 * Uses the EventSource API to establish a connection
 * Processes events through registered handlers
 * Includes reconnection logic with exponential backoff
 */
export default function useKanbanEvents() {
	const queryClient = useQueryClient();
	const reconnectAttemptsRef = useRef(0);
	const eventSourceRef = useRef<EventSource | null>(null);
	const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	/**
	 * Process a received event by routing it to the appropriate handler
	 */
	const processEvent = useCallback(
		(eventData: any) => {
			try {
				// Handle "board" event type which contains nested events
				if (
					eventData.type === "board" &&
					eventData.data &&
					eventData.data.type
				) {
					const innerEventType = eventData.data.type;
					const innerData = eventData.data.data;

					if (innerEventType.startsWith("task.")) {
						handleTaskEvent(
							innerEventType as TaskEventType,
							innerData,
							queryClient,
						);
					} else if (innerEventType.startsWith("column.")) {
						handleColumnEvent(
							innerEventType as ColumnEventType,
							innerData,
							queryClient,
						);
					}
				}
				// Handle direct event types (not nested in 'board')
				else {
					const eventType = eventData.type;
					const data = eventData.data;

					if (eventType && data) {
						if (eventType.startsWith("task.")) {
							handleTaskEvent(eventType as TaskEventType, data, queryClient);
						} else if (eventType.startsWith("column.")) {
							handleColumnEvent(
								eventType as ColumnEventType,
								data,
								queryClient,
							);
						}
					}
				}
			} catch (error) {
				console.error("Error processing SSE event:", error);
			}
		},
		[queryClient],
	);

	/**
	 * Creates and configures the EventSource connection
	 */
	const createEventSource = useCallback(() => {
		const token = getAuthToken();

		if (!token) {
			console.warn("No auth token available for SSE connection");
			return null;
		}

		const url = `${API_URL}/events/subscribe?topics=${SUPPORTED_EVENT_TYPES.join(
			",",
		)}&token=${encodeURIComponent(token)}`;

		// Create event source and set up handlers
		const eventSource = new EventSource(url);

		eventSource.onopen = () => {
			console.debug("SSE connection established");
			// Reset the reconnect attempts on successful connection
			reconnectAttemptsRef.current = 0;
		};

		eventSource.onmessage = (event) => {
			try {
				const parsedData = JSON.parse(event.data);
				processEvent(parsedData);
			} catch (error) {
				console.error("Error parsing SSE message:", error);
			}
		};

		eventSource.onerror = (error) => {
			console.error("SSE connection error:", error);

			// Close the current connection
			eventSource.close();
			eventSourceRef.current = null;

			// Attempt to reconnect with exponential backoff
			if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
				const delay =
					INITIAL_RECONNECT_DELAY * Math.pow(2, reconnectAttemptsRef.current);
				console.debug(
					`Attempting to reconnect in ${delay}ms (attempt ${
						reconnectAttemptsRef.current + 1
					}/${MAX_RECONNECT_ATTEMPTS})`,
				);

				// Clear any existing timeout
				if (reconnectTimeoutRef.current) {
					clearTimeout(reconnectTimeoutRef.current);
				}

				// Set a new timeout for reconnection
				reconnectTimeoutRef.current = setTimeout(() => {
					reconnectAttemptsRef.current++;
					const newEventSource = createEventSource();
					if (newEventSource) {
						eventSourceRef.current = newEventSource;
					}
				}, delay);
			} else {
				console.error(
					`Failed to reconnect after ${MAX_RECONNECT_ATTEMPTS} attempts`,
				);
			}
		};

		return eventSource;
	}, [processEvent]);

	useEffect(() => {
		// Initialize the event source
		const eventSource = createEventSource();
		if (eventSource) {
			eventSourceRef.current = eventSource;
		}

		// Clean up the connection when the component unmounts
		return () => {
			console.debug("Closing SSE connection");
			if (eventSourceRef.current) {
				eventSourceRef.current.close();
				eventSourceRef.current = null;
			}

			if (reconnectTimeoutRef.current) {
				clearTimeout(reconnectTimeoutRef.current);
				reconnectTimeoutRef.current = null;
			}
		};
	}, [createEventSource]);

	return {};
}
