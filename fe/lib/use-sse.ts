"use client";

import { useEffect, useRef } from "react";
import { getAuthToken } from "./api-client";
import { API_URL } from "./config";

type EventCallback = (eventType: string, data: any) => void;

// Singleton event bus for SSE
class EventBus {
	private static instance: EventBus;
	private subscribers: Map<string, Set<EventCallback>> = new Map();
	private eventSource: EventSource | null = null;
	private isConnected = false;
	private reconnecting = false;

	private constructor() {}

	// Get singleton instance
	public static getInstance(): EventBus {
		if (!EventBus.instance) {
			EventBus.instance = new EventBus();
		}
		return EventBus.instance;
	}

	// Connect to SSE endpoint
	public connect(baseUrl: string, topics: string[], token: string) {
		if (this.eventSource && this.isConnected) {
			return; // Already connected
		}

		// Close existing connection if any
		if (this.eventSource) {
			this.eventSource.close();
			this.eventSource = null;
		}

		// Build URL with topics and token
		const url = `${baseUrl}/events/subscribe?topics=${topics.join(",")}&token=${encodeURIComponent(token)}`;

		try {
			this.eventSource = new EventSource(url);

			this.eventSource.onopen = () => {
				// SSE connected
				this.isConnected = true;
				this.reconnecting = false;
			};

			this.eventSource.onmessage = (event) => {
				try {
					const parsedData = JSON.parse(event.data);
					const eventType = parsedData.type;
					const data = parsedData.data;

					if (eventType && data) {
						this.notifySubscribers(eventType, data);
					}
				} catch (error) {
					// Error parsing SSE message
				}
			};

			this.eventSource.onerror = (error) => {
				// SSE connection error
				this.isConnected = false;

				if (!this.reconnecting) {
					this.reconnecting = true;
					this.eventSource?.close();
					this.eventSource = null;

					// Simple reconnection attempt
					setTimeout(() => {
						if (this.hasSubscribers()) {
							// Attempting to reconnect SSE
							this.connect(baseUrl, topics, token);
						}
					}, 3000);
				}
			};
		} catch (error) {
			// Failed to create SSE connection
		}
	}

	// Check if we have any subscribers
	private hasSubscribers(): boolean {
		for (const subscribers of this.subscribers.values()) {
			if (subscribers.size > 0) return true;
		}
		return false;
	}

	// Disconnect from SSE
	public disconnect() {
		if (this.eventSource) {
			this.eventSource.close();
			this.eventSource = null;
			this.isConnected = false;
		}
		// Clear all subscribers
		this.subscribers.clear();
	}

	// Subscribe to an event type
	public subscribe(eventType: string, callback: EventCallback): () => void {
		if (!this.subscribers.has(eventType)) {
			this.subscribers.set(eventType, new Set());
		}

		this.subscribers.get(eventType)?.add(callback);

		// Return unsubscribe function
		return () => {
			const subscribers = this.subscribers.get(eventType);
			if (subscribers) {
				subscribers.delete(callback);
				if (subscribers.size === 0) {
					this.subscribers.delete(eventType);
				}
			}

			// If no more subscribers, disconnect
			if (!this.hasSubscribers()) {
				this.disconnect();
			}
		};
	}

	// Notify subscribers of an event
	private notifySubscribers(eventType: string, data: any) {
		// Get subscribers for this specific event type
		const eventSubscribers = this.subscribers.get(eventType) || new Set();
		// Get wildcard subscribers
		const wildcardSubscribers = this.subscribers.get("*") || new Set();

		// Notify all matching subscribers
		[...eventSubscribers, ...wildcardSubscribers].forEach((callback) => {
			try {
				callback(eventType, data);
			} catch (error) {
				// Error in subscriber callback
			}
		});
	}
}

// React hook for using the event bus
export function useSse(eventTypes: string[], callback: EventCallback) {
	const callbackRef = useRef(callback);

	// Keep callback reference updated
	useEffect(() => {
		callbackRef.current = callback;
	}, [callback]);

	useEffect(() => {
		const eventBus = EventBus.getInstance();
		const token = getAuthToken();

		if (!token) {
			// Cannot connect to SSE: No authentication token
			return;
		}

		// Connect to SSE
		eventBus.connect(API_URL, eventTypes, token);

		// Subscribe to all specified event types
		const unsubscribes = eventTypes.map((eventType) =>
			eventBus.subscribe(eventType, (type, data) =>
				callbackRef.current(type, data),
			),
		);

		// Cleanup: unsubscribe on unmount
		return () => {
			unsubscribes.forEach((unsubscribe) => unsubscribe());
		};
	}, [eventTypes]); // Only re-run if event types change
}
