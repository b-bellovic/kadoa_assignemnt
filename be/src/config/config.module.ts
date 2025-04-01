import { Global, Module } from "@nestjs/common";
import { ConfigModule as NestConfigModule } from "@nestjs/config";
import { validationSchema } from "./env.validation";

@Global()
@Module({
	imports: [
		NestConfigModule.forRoot({
			validationSchema,
			validationOptions: {
				abortEarly: true,
			},
		}),
	],
	exports: [NestConfigModule],
})
export class ConfigModule {}
