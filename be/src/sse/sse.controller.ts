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
		@Query("token") token?: string,
	): Observable<MessageEvent> {
		try {
			// Validate the token
			if (!token) {
				throw new UnauthorizedException("Authentication required");
			}

			let payload: any;
			try {
				payload = this.jwtService.verify(token);
			} catch (error) {
				this.logger.error(`Invalid token: ${error.message}`);
				throw new UnauthorizedException("Invalid authentication token");
			}

			const user = {
				id: payload.sub,
				email: payload.email,
			} as User;

			return this.sseService.subscribe(user);
		} catch (error) {
			this.logger.error(`Error in SSE connection: ${error.message}`);
			throw error;
		}
	}
}
