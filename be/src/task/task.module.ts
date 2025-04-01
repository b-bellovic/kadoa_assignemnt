import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { CqrsModule } from "@nestjs/cqrs";
import { DatabaseModule } from "../database";
import { SSEModule } from "../sse/sse.module";
import { ColumnService } from "./column.service";
import { DeleteColumnHandler } from "./commands/delete-column.command";
import { MoveTaskHandler } from "./commands/move-task.command";
import { ReorderColumnsHandler } from "./commands/reorder-columns.command";
import { ReorderTasksHandler } from "./commands/reorder-tasks.command";
import { GenerateTaskHandler } from "./queries/generate-task.query";
import { GetBoardHandler } from "./queries/get-board.query";
import { TaskController } from "./task.controller";
import { TaskService } from "./task.service";

const CommandHandlers = [
	MoveTaskHandler,
	ReorderTasksHandler,
	DeleteColumnHandler,
	ReorderColumnsHandler,
];

const QueryHandlers = [GetBoardHandler, GenerateTaskHandler];

@Module({
	imports: [DatabaseModule, CqrsModule, SSEModule, ConfigModule],
	controllers: [TaskController],
	providers: [TaskService, ColumnService, ...CommandHandlers, ...QueryHandlers],
	exports: [TaskService, ColumnService],
})
export class TaskModule {}
