import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { AuthModule } from "../auth/auth.module";
import { SSEController } from "./sse.controller";
import { SSEService } from "./sse.service";

@Module({
	imports: [
		// Import AuthModule for authentication-related services
		AuthModule,
		// Import JwtModule for token verification
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => ({
				secret: configService.get<string>("JWT_SECRET"),
				signOptions: {
					expiresIn: configService.get<string>("JWT_EXPIRES_IN", "1d"),
				},
			}),
		}),
	],
	providers: [SSEService],
	controllers: [SSEController],
	exports: [SSEService],
})
export class SSEModule {}
