import { Injectable, NotFoundException } from "@nestjs/common";
import { CommandHandler, ICommand, ICommandHandler } from "@nestjs/cqrs";
import { eq } from "drizzle-orm";
import { DatabaseService } from "../../database/database.service";
import { tasks } from "../../schema";
import { SSEService } from "../../sse/sse.service";
import { ColumnService } from "../column.service";
import { TaskService } from "../task.service";

export class MoveTaskCommand implements ICommand {
	constructor(
		public readonly taskId: string,
		public readonly targetColumnId: string,
		public readonly userId: string,
	) {}
}

@Injectable()
@CommandHandler(MoveTaskCommand)
export class MoveTaskHandler implements ICommandHandler<MoveTaskCommand> {
	constructor(
		private readonly taskService: TaskService,
		private readonly columnService: ColumnService,
		private readonly db: DatabaseService,
		private readonly sseService: SSEService,
	) {}

	async execute(command: MoveTaskCommand) {
		const { taskId, targetColumnId } = command;

		const task = await this.taskService.getTaskById(taskId);

		await this.columnService.getColumnById(targetColumnId);

		const [updatedTask] = await this.db
			.getDB()
			.update(tasks)
			.set({
				columnId: targetColumnId,
				updatedAt: new Date(),
			})
			.where(eq(tasks.id, taskId))
			.returning();

		this.sseService.emit("task.moved", {
			id: updatedTask.id,
			columnId: updatedTask.columnId,
			previousColumnId: task.columnId,
		});

		return updatedTask;
	}
}
