import { BadRequestException, Injectable } from "@nestjs/common";
import { CommandHandler, ICommand, ICommandHandler } from "@nestjs/cqrs";
import { eq } from "drizzle-orm";
import { DatabaseService } from "../../database/database.service";
import { tasks } from "../../schema";
import { SSEService } from "../../sse/sse.service";
import { ColumnEventType } from "../../sse/types/events";
import { ColumnService } from "../column.service";

export class DeleteColumnCommand implements ICommand {
	constructor(
		public readonly columnId: string,
		public readonly userId: string,
	) {}
}

@Injectable()
@CommandHandler(DeleteColumnCommand)
export class DeleteColumnHandler
	implements ICommandHandler<DeleteColumnCommand>
{
	constructor(
		private readonly db: DatabaseService,
		private readonly columnService: ColumnService,
		private readonly sseService: SSEService,
	) {}

	async execute(command: DeleteColumnCommand) {
		const column = await this.columnService.getColumnById(command.columnId);

		const tasksInColumn = await this.db
			.getDB()
			.select()
			.from(tasks)
			.where(eq(tasks.columnId, command.columnId));

		if (tasksInColumn.length > 0) {
			throw new BadRequestException("Cannot delete column that contains tasks");
		}

		await this.columnService.deleteColumn(command.columnId);

		// Emit the column.deleted event
		this.sseService.emit("board", {
			type: ColumnEventType.DELETED,
			data: {
				id: command.columnId,
				userId: command.userId,
			},
		});

		return { success: true };
	}
}
