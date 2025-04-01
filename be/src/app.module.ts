import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { ConfigModule } from "./config/config.module";
import { SSEModule } from "./sse/sse.module";
import { TaskModule } from "./task/task.module";
import { UserModule } from "./user/user.module";

@Module({
	imports: [ConfigModule, AuthModule, UserModule, TaskModule, SSEModule],
	controllers: [],
	providers: [],
})
export class AppModule {}
