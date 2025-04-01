"use client";

import { useEffect, useRef } from "react";
import { API_URL } from "./config";
import { getAuthToken } from "./auth-token";

type EventCallback = (eventType: string, data: any) => void;

class EventBus {
	private static instance: EventBus;
	private subscribers: Map<string, Set<EventCallback>> = new Map();
	private eventSource: EventSource | null = null;
	private isConnected = false;
	private reconnecting = false;

	private constructor() {}

	public static getInstance(): EventBus {
		if (!EventBus.instance) {
			EventBus.instance = new EventBus();
		}
		return EventBus.instance;
	}

	public connect(baseUrl: string, topics: string[], token: string) {
		if (this.eventSource && this.isConnected) {
			return; // Already connected
		}

		if (this.eventSource) {
			this.eventSource.close();
			this.eventSource = null;
		}

		const url = `${baseUrl}/events/subscribe?topics=${topics.join(",")}&token=${encodeURIComponent(token)}`;

		try {
			this.eventSource = new EventSource(url);

			this.eventSource.onopen = () => {
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
				this.isConnected = false;

				if (!this.reconnecting) {
					this.reconnecting = true;
					this.eventSource?.close();
					this.eventSource = null;

					setTimeout(() => {
						if (this.hasSubscribers()) {
							this.connect(baseUrl, topics, token);
						}
					}, 3000);
				}
			};
		} catch (error) {
			// Failed to create SSE connection
		}
	}

	private hasSubscribers(): boolean {
		for (const subscribers of this.subscribers.values()) {
			if (subscribers.size > 0) return true;
		}
		return false;
	}

	public disconnect() {
		if (this.eventSource) {
			this.eventSource.close();
			this.eventSource = null;
			this.isConnected = false;
		}
		this.subscribers.clear();
	}

	public subscribe(eventType: string, callback: EventCallback): () => void {
		if (!this.subscribers.has(eventType)) {
			this.subscribers.set(eventType, new Set());
		}

		this.subscribers.get(eventType)?.add(callback);

		return () => {
			const subscribers = this.subscribers.get(eventType);
			if (subscribers) {
				subscribers.delete(callback);
				if (subscribers.size === 0) {
					this.subscribers.delete(eventType);
				}
			}

			if (!this.hasSubscribers()) {
				this.disconnect();
			}
		};
	}

	private notifySubscribers(eventType: string, data: any) {
		const eventSubscribers = this.subscribers.get(eventType) || new Set();
		const wildcardSubscribers = this.subscribers.get("*") || new Set();

		[...eventSubscribers, ...wildcardSubscribers].forEach((callback) => {
			try {
				callback(eventType, data);
			} catch (error) {
				// Error in subscriber callback
			}
		});
	}
}

export function useSse(eventTypes: string[], callback: EventCallback) {
	const callbackRef = useRef(callback);

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

		eventBus.connect(API_URL, eventTypes, token);

		const unsubscribes = eventTypes.map((eventType) =>
			eventBus.subscribe(eventType, (type, data) =>
				callbackRef.current(type, data),
			),
		);

		return () => {
			unsubscribes.forEach((unsubscribe) => unsubscribe());
		};
	}, [eventTypes]);
}
