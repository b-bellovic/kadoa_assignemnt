import { Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import { Observable, Subject } from "rxjs";
import { User } from "../schema";

export interface SSEClient {
	user: User;
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

	subscribe(user: User): Observable<MessageEvent> {
		const clientId = `${user.id}-${Date.now()}`;

		this.clients.set(clientId, {
			user,
		});

		this.logger.debug(`Client connected: ${clientId}`);

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

	removeClient(clientId: string) {
		const client = this.clients.get(clientId);
		this.logger.debug(`Client disconnected: ${clientId}`);
		if (client) {
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
	}

	onModuleDestroy() {
		this.logger.log("Cleaning up SSE connections");
		this.events$.complete();
		this.clients.clear();
	}
}
