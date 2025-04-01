import { Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import { Response } from "express";
import { Observable, Subject } from "rxjs";
import { User } from "../schema";

export interface SSEClient {
	user: User;
	response: Response;
	topics: Set<string>;
}

export interface SSEEvent<T = any> {
	type: string;
	data: T;
	id?: string;
}

@Injectable()
export class SSEService implements OnModuleDestroy {
	private readonly logger = new Logger(SSEService.name);
	private clients = new Map<string, SSEClient>();
	private events$ = new Subject<SSEEvent>();

	subscribe(user: User, topics: string[] = []): Observable<MessageEvent> {
		const clientId = `${user.id}-${Date.now()}`;

		// Store client info
		this.clients.set(clientId, {
			user,
			response: null as any, // Will be set by the controller
			topics: new Set(topics),
		});

		this.logger.log(`Client connected: ${clientId}`);

		// Send connection confirmation
		this.emit("connection", {
			clientId,
			topics,
		});

		return new Observable<MessageEvent>((subscriber) => {
			const messageHandler = (event: SSEEvent) => {
				const messageEvent = new MessageEvent("message", {
					data: JSON.stringify(event),
					lastEventId: event.id,
				});
				subscriber.next(messageEvent);
			};

			this.events$.subscribe(messageHandler);

			return () => {
				this.removeClient(clientId);
			};
		});
	}

	setClientResponse(clientId: string, response: Response) {
		const client = this.clients.get(clientId);
		if (client) {
			client.response = response;
		}
	}

	removeClient(clientId: string) {
		const client = this.clients.get(clientId);
		if (client) {
			this.logger.log(`Client disconnected: ${clientId}`);
			if (client.response) {
				client.response.end();
			}
			this.clients.delete(clientId);
		}
	}

	emit(type: string, data: any) {
		const event: SSEEvent = {
			type,
			data,
			id: Date.now().toString(),
		};

		this.events$.next(event);
		this.broadcastToClients(event);
	}

	private broadcastToClients(event: SSEEvent) {
		let broadcasted = 0;

		for (const [clientId, client] of this.clients.entries()) {
			if (client.topics.has(event.type) || client.topics.has("*")) {
				try {
					if (client.response) {
						client.response.write(`data: ${JSON.stringify(event)}\n\n`);
						broadcasted++;
					}
				} catch (error) {
					this.logger.error(
						`Error broadcasting to client ${clientId}: ${error.message}`,
					);
					this.removeClient(clientId);
				}
			}
		}

		this.logger.debug(
			`Broadcasted event ${event.type} to ${broadcasted} clients`,
		);
	}

	onModuleDestroy() {
		this.logger.log("Cleaning up SSE connections");
		this.events$.complete();
		this.clients.clear();
	}
}
