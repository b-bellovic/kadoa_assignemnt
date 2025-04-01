import { Injectable, NotFoundException } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { DatabaseService } from "../database";
import { tasks } from "../schema";
import { SSEService } from "../sse/sse.service";
import { TaskEventType } from "../sse/types/events";
import { CreateTaskDto } from "./dto/create-task.dto";

@Injectable()
export class TaskService {
	constructor(
		private readonly databaseService: DatabaseService,
		private readonly sseService: SSEService,
	) {}

	async createTask(createTaskDto: CreateTaskDto) {
		const now = new Date();
		const [task] = await this.databaseService
			.getDB()
			.insert(tasks)
			.values({
				...createTaskDto,
				createdAt: now,
				updatedAt: now,
			})
			.returning();

		this.sseService.emit(TaskEventType.CREATED, {
			id: task.id,
			columnId: task.columnId,
		});

		return task;
	}

	async getTaskById(id: string) {
		const [task] = await this.databaseService
			.getDB()
			.select()
			.from(tasks)
			.where(eq(tasks.id, id));

		if (!task) {
			throw new NotFoundException(`Task with ID "${id}" not found`);
		}
		return task;
	}

	async updateTask(id: string, updateData: Partial<CreateTaskDto>) {
		const [task] = await this.databaseService
			.getDB()
			.update(tasks)
			.set({
				...updateData,
				updatedAt: new Date(),
			})
			.where(eq(tasks.id, id))
			.returning();

		if (!task) {
			throw new NotFoundException(`Task with ID "${id}" not found`);
		}

		this.sseService.emit(TaskEventType.UPDATED, {
			id: task.id,
			...updateData,
		});

		return task;
	}

	async deleteTask(id: string) {
		const [task] = await this.databaseService
			.getDB()
			.delete(tasks)
			.where(eq(tasks.id, id))
			.returning();

		if (!task) {
			throw new NotFoundException(`Task with ID "${id}" not found`);
		}

		this.sseService.emit(TaskEventType.DELETED, {
			id: task.id,
		});
	}
}
