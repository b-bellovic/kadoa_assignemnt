import { Injectable, NotFoundException } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { DatabaseService } from "../database";
import { taskColumns } from "../schema";
import { SSEService } from "../sse/sse.service";
import { ColumnEventType } from "../sse/types/events";
import { CreateColumnDto } from "./dto/create-column.dto";

@Injectable()
export class ColumnService {
	constructor(
		private readonly databaseService: DatabaseService,
		private readonly sseService: SSEService,
	) {}

	async createColumn(createColumnDto: CreateColumnDto, userId: string) {
		const [column] = await this.databaseService
			.getDB()
			.insert(taskColumns)
			.values({
				...createColumnDto,
				createdById: userId,
			})
			.returning();

		this.sseService.emit("board", {
			type: ColumnEventType.CREATED,
			data: {
				id: column.id,
				title: column.title,
				order: column.order,
			},
		});

		return column;
	}

	async getColumnById(id: string) {
		const [column] = await this.databaseService
			.getDB()
			.select()
			.from(taskColumns)
			.where(eq(taskColumns.id, id));

		if (!column) {
			throw new NotFoundException(`Column with ID "${id}" not found`);
		}
		return column;
	}

	async updateColumn(id: string, updateData: Partial<CreateColumnDto>) {
		const [column] = await this.databaseService
			.getDB()
			.update(taskColumns)
			.set({
				...updateData,
				updatedAt: new Date(),
			})
			.where(eq(taskColumns.id, id))
			.returning();

		if (!column) {
			throw new NotFoundException(`Column with ID "${id}" not found`);
		}

		this.sseService.emit("board", {
			type: ColumnEventType.UPDATED,
			data: {
				id: column.id,
				...updateData,
			},
		});

		return column;
	}

	async deleteColumn(id: string) {
		const [column] = await this.databaseService
			.getDB()
			.delete(taskColumns)
			.where(eq(taskColumns.id, id))
			.returning();

		if (!column) {
			throw new NotFoundException(`Column with ID "${id}" not found`);
		}
	}
}
