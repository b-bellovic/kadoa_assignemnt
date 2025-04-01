import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

const logger = new Logger("Backend");

/**
 * Bootstrap the NestJS application
 * Sets up the server with appropriate middleware and configuration
 */
async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	const configService = app.get(ConfigService);

	/**
	 * Configure Cross-Origin Resource Sharing (CORS)
	 * Allows the frontend application to make requests to this backend API
	 * Sets appropriate headers and HTTP methods for secure communication
	 */
	app.enableCors({
		origin: "http://localhost:3002", // Use your frontend URL
		methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization", "Accept"],
		exposedHeaders: ["Content-Type"],
		credentials: true,
		preflightContinue: false,
		optionsSuccessStatus: 204,
	});

	await app.listen(configService.get("PORT", 3001));
	logger.log("Server is running on port " + configService.get("PORT", 3001));
}
bootstrap();
