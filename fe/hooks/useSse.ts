import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Configuration options for the SSE connection
 */
export interface SSEOptions {
	/**
	 * The URL to connect to for SSE events
	 */
	url: string;

	/**
	 * Maximum number of reconnection attempts
	 * @default 5
	 */
	maxReconnectAttempts?: number;

	/**
	 * Initial delay before attempting to reconnect (in ms)
	 * @default 1000
	 */
	initialReconnectDelay?: number;

	/**
	 * Whether to automatically reconnect on error
	 * @default true
	 */
	autoReconnect?: boolean;

	/**
	 * Whether to automatically connect when the hook is mounted
	 * @default true
	 */
	autoConnect?: boolean;

	/**
	 * Custom logger function
	 * @default console
	 */
	logger?: {
		debug: (message: string, ...args: any[]) => void;
		error: (message: string, ...args: any[]) => void;
	};
}

/**
 * Status of the SSE connection
 */
export enum ConnectionStatus {
	DISCONNECTED = "disconnected",
	CONNECTING = "connecting",
	CONNECTED = "connected",
	RECONNECTING = "reconnecting",
	FAILED = "failed",
}

/**
 * Return type for the useSSE hook
 */
export interface SSEResult {
	/** Current connection status */
	status: ConnectionStatus;
	/** Establish a connection to the SSE endpoint */
	connect: () => boolean;
	/** Disconnect from the SSE endpoint */
	disconnect: () => void;
	/** Reconnect to the SSE endpoint */
	reconnect: () => boolean;
	/** Current number of reconnection attempts */
	reconnectAttempts: number;
}

/**
 * Default logger implementation
 */
const defaultLogger = {
	debug: (message: string, ...args: any[]) =>
		console.debug(`[SSE] ${message}`, ...args),
	error: (message: string, ...args: any[]) =>
		console.error(`[SSE] ${message}`, ...args),
};

/**
 * Hook for subscribing to Server-Sent Events (SSE)
 *
 * A reusable hook that manages SSE connections with automatic reconnection
 * and custom event handling.
 *
 * @param options Configuration options for the SSE connection
 * @param eventHandler Function to handle incoming SSE events
 * @returns Object with methods and state to control the SSE connection
 *
 **/
export function useSSE(
	options: SSEOptions,
	eventHandler: (eventData: any) => Promise<void> | undefined,
): SSEResult {
	const {
		url,
		maxReconnectAttempts = 5,
		initialReconnectDelay = 1000,
		autoReconnect = true,
		autoConnect = true,
		logger = defaultLogger,
	} = options;

	const eventSourceRef = useRef<EventSource | null>(null);
	const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const reconnectAttemptsRef = useRef<number>(0);

	const [status, setStatus] = useState<ConnectionStatus>(
		ConnectionStatus.DISCONNECTED,
	);
	const [reconnectAttempts, setReconnectAttempts] = useState(0);

	/**
	 * Safely parses JSON data from an event
	 */
	const parseEventData = useCallback(
		(eventData: string): any => {
			try {
				return JSON.parse(eventData);
			} catch (error) {
				logger.error("Failed to parse event data as JSON:", error);
				return eventData; // Return raw data if parsing fails
			}
		},
		[logger],
	);

	/**
	 * Cleans up any existing connection and timeouts
	 */
	const cleanupConnection = useCallback(() => {
		if (eventSourceRef.current) {
			eventSourceRef.current.close();
			eventSourceRef.current = null;
		}

		if (reconnectTimeoutRef.current) {
			clearTimeout(reconnectTimeoutRef.current);
			reconnectTimeoutRef.current = null;
		}
	}, []);

	/**
	 * Connect to the SSE endpoint
	 */
	const connect = useCallback(() => {
		// Don't try to connect if URL is empty
		if (!url || url.trim() === "") {
			logger.error("Cannot create EventSource: URL is empty");
			setStatus(ConnectionStatus.FAILED);
			return false;
		}
		cleanupConnection();
		setStatus(ConnectionStatus.CONNECTING);

		try {
			const eventSource = new EventSource(url);

			eventSource.onmessage = (event: MessageEvent) => {
				try {
					const parsedData = parseEventData(event.data);
					eventHandler(parsedData);
				} catch (error) {
					logger.error("Error processing SSE message:", error);
				}
			};

			eventSource.onopen = () => {
				logger.debug("SSE connection established");
				reconnectAttemptsRef.current = 0;
				setReconnectAttempts(0);
				setStatus(ConnectionStatus.CONNECTED);
			};

			eventSource.onerror = (error) => {
				logger.error("SSE connection error:", error);
				setStatus(ConnectionStatus.DISCONNECTED);

				eventSource.close();
				eventSourceRef.current = null;

				if (
					autoReconnect &&
					reconnectAttemptsRef.current < maxReconnectAttempts
				) {
					const currentAttempt = reconnectAttemptsRef.current;
					const nextAttempt = currentAttempt + 1;
					reconnectAttemptsRef.current = nextAttempt;
					setReconnectAttempts(nextAttempt);

					const delay = initialReconnectDelay * Math.pow(2, currentAttempt);
					setStatus(ConnectionStatus.RECONNECTING);

					logger.debug(
						`Attempting to reconnect in ${delay}ms (attempt ${nextAttempt}/${maxReconnectAttempts})`,
					);

					if (reconnectTimeoutRef.current) {
						clearTimeout(reconnectTimeoutRef.current);
					}

					reconnectTimeoutRef.current = setTimeout(() => {
						connect();
					}, delay);
				} else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
					logger.error(
						`Failed to reconnect after ${maxReconnectAttempts} attempts`,
					);
					setStatus(ConnectionStatus.FAILED);
				}
			};

			eventSourceRef.current = eventSource;
			return true;
		} catch (error) {
			logger.error("Error creating EventSource:", error);
			setStatus(ConnectionStatus.FAILED);
			return false;
		}
	}, [
		url,
		cleanupConnection,
		parseEventData,
		eventHandler,
		logger,
		autoReconnect,
		maxReconnectAttempts,
		initialReconnectDelay,
	]);

	const disconnect = useCallback(() => {
		logger.debug("Closing SSE connection");
		cleanupConnection();
		setStatus(ConnectionStatus.DISCONNECTED);
		reconnectAttemptsRef.current = 0;
		setReconnectAttempts(0);
	}, [cleanupConnection, logger]);

	/**
	 * Effect to connect on mount and clean up on unmount
	 */
	useEffect(() => {
		if (autoConnect) {
			connect();
		}

		return disconnect;
	}, [autoConnect]);

	return {
		status,
		connect,
		disconnect,
		reconnect: connect,
		reconnectAttempts,
	};
}
