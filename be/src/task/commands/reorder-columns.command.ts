import { CommandHandler, ICommand, ICommandHandler } from "@nestjs/cqrs";
import { ColumnEventType } from "../../sse/types/events";
import { SSEService } from "../../sse/sse.service";
import { DatabaseService } from "../../database";
import { taskColumns } from "../../schema";
import { eq } from "drizzle-orm";
import { Logger } from "@nestjs/common";

export class ReorderColumnsCommand implements ICommand {
	constructor(
		public readonly columnIds: string[],
		public readonly userId: string,
	) {}
}

@CommandHandler(ReorderColumnsCommand)
export class ReorderColumnsHandler
	implements ICommandHandler<ReorderColumnsCommand>
{
	private readonly logger = new Logger(ReorderColumnsHandler.name);

	constructor(
		private readonly databaseService: DatabaseService,
		private readonly sseService: SSEService,
	) {}

	async execute(command: ReorderColumnsCommand): Promise<void> {
		const { columnIds, userId } = command;

		if (!columnIds || columnIds.length === 0) {
			this.logger.error("No column IDs provided for reordering");
			return;
		}

		this.logger.log(
			`Reordering ${columnIds.length} columns for user ${userId}`,
		);
		this.logger.debug(`New column order: ${columnIds.join(", ")}`);

		// Update the order of each column in the database
		for (let i = 0; i < columnIds.length; i++) {
			const columnId = columnIds[i];
			const newOrder = (i + 1) * 1000; // 1000, 2000, 3000, etc.

			this.logger.debug(`Setting column ${columnId} order to ${newOrder}`);

			try {
				await this.databaseService
					.getDB()
					.update(taskColumns)
					.set({
						order: newOrder,
						updatedAt: new Date(),
					})
					.where(eq(taskColumns.id, columnId));
			} catch (error) {
				this.logger.error(
					`Failed to update column ${columnId}: ${error.message}`,
				);
				throw error;
			}
		}

		// Send SSE event to notify clients about the reordering
		try {
			this.sseService.emit("board", {
				type: ColumnEventType.REORDERED,
				data: {
					columnIds,
					userId,
				},
			});
			this.logger.log("Sent column.reordered SSE event");
		} catch (error) {
			this.logger.error(`Failed to emit SSE event: ${error.message}`);
		}
	}
}
