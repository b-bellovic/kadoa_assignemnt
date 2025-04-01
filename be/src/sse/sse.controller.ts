import {
	Controller,
	Logger,
	Query,
	Req,
	Sse,
	UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Response } from "express";
import { Observable } from "rxjs";
import { Public } from "../auth/decorators/public.decorator";
import { User } from "../schema";
import { SSEService } from "./sse.service";

interface SSERequest {
	res: Response;
}

@Controller("events")
export class SSEController {
	private readonly logger = new Logger(SSEController.name);

	constructor(
		private readonly sseService: SSEService,
		private readonly jwtService: JwtService,
	) {}

	@Public()
	@Sse("subscribe")
	subscribe(
		@Req() req: SSERequest,
		@Query("topics") topics?: string,
		@Query("token") token?: string,
	): Observable<MessageEvent> {
		try {
			// Validate the token
			if (!token) {
				throw new UnauthorizedException("Authentication required");
			}

			let payload;
			try {
				payload = this.jwtService.verify(token);
			} catch (error) {
				this.logger.error(`Invalid token: ${error.message}`);
				throw new UnauthorizedException("Invalid authentication token");
			}

			// Get user from token payload
			const user = {
				id: payload.sub,
				email: payload.email,
			} as User;

			// Parse topics from query parameter
			const topicsList = topics?.split(",").filter(Boolean) || ["*"];

			// Generate client ID
			const clientId = `${user.id}-${Date.now()}`;

			// Register the response object with the SSE service
			this.sseService.setClientResponse(clientId, req.res);

			this.logger.log(
				`Client connected: ${clientId}, topics: ${topicsList.join(", ")}`,
			);

			// Set headers for SSE
			req.res.setHeader("Content-Type", "text/event-stream");
			req.res.setHeader("Cache-Control", "no-cache");
			req.res.setHeader("Connection", "keep-alive");

			// Return the event stream
			return this.sseService.subscribe(user, topicsList);
		} catch (error) {
			this.logger.error(`Error in SSE connection: ${error.message}`);
			throw error;
		}
	}
}
