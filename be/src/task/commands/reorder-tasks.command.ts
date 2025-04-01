import { Injectable, NotFoundException } from "@nestjs/common";
import { CommandHandler, ICommand, ICommandHandler } from "@nestjs/cqrs";
import { eq } from "drizzle-orm";
import { DatabaseService } from "../../database/database.service";
import { tasks } from "../../schema";
import { TaskService } from "../task.service";

export class ReorderTasksCommand implements ICommand {
	constructor(
		public readonly taskIds: string[],
		public readonly userId: string,
	) {}
}

@Injectable()
@CommandHandler(ReorderTasksCommand)
export class ReorderTasksHandler
	implements ICommandHandler<ReorderTasksCommand>
{
	constructor(
		private readonly db: DatabaseService,
		private readonly taskService: TaskService,
	) {}

	async execute(command: ReorderTasksCommand): Promise<void> {
		const { taskIds } = command;

		for (const taskId of taskIds) {
			const task = await this.taskService.getTaskById(taskId);
			if (!task) {
				throw new NotFoundException(`Task with ID "${taskId}" not found`);
			}
		}

		await Promise.all(
			taskIds.map((taskId, index) =>
				this.db
					.getDB()
					.update(tasks)
					.set({
						order: index,
						updatedAt: new Date(),
					})
					.where(eq(tasks.id, taskId)),
			),
		);
	}
}
