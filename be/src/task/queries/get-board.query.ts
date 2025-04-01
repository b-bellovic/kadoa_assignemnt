import { Injectable } from "@nestjs/common";
import { IQuery, IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { eq } from "drizzle-orm";
import { DatabaseService } from "../../database";
import { taskColumns, tasks, users } from "../../schema";

export class GetBoardQuery implements IQuery {}

interface BoardViewModel {
	columns: {
		id: string;
		title: string;
		description: string | null;
		tasks: {
			id: string;
			title: string;
			description: string | null;
			order: number;
			columnId: string;
			createdAt: Date;
			updatedAt: Date;
			assignee?: {
				id: string;
				email: string;
			};
		}[];
	}[];
}

@Injectable()
@QueryHandler(GetBoardQuery)
export class GetBoardHandler implements IQueryHandler<GetBoardQuery> {
	constructor(private readonly db: DatabaseService) {}

	async execute(): Promise<BoardViewModel> {
		// Get all columns with their tasks
		const columns = await this.db
			.getDB()
			.select()
			.from(taskColumns)
			.orderBy(taskColumns.order);

		const tasksWithAssignees = await this.db
			.getDB()
			.select({
				id: tasks.id,
				title: tasks.title,
				description: tasks.description,
				order: tasks.order,
				columnId: tasks.columnId,
				assigneeId: tasks.assigneeId,
				assigneeEmail: users.email,
				createdAt: tasks.createdAt,
				updatedAt: tasks.updatedAt,
			})
			.from(tasks)
			.leftJoin(users, eq(tasks.assigneeId, users.id))
			.orderBy(tasks.order);

		// Group tasks by column
		const tasksByColumn = tasksWithAssignees.reduce(
			(acc, task) => {
				if (!acc[task.columnId]) {
					acc[task.columnId] = [];
				}
				acc[task.columnId].push({
					id: task.id,
					title: task.title,
					description: task.description,
					order: task.order,
					columnId: task.columnId,
					createdAt: task.createdAt,
					updatedAt: task.updatedAt,
					assignee: task.assigneeId
						? {
								id: task.assigneeId,
								email: task.assigneeEmail!,
							}
						: undefined,
				});
				return acc;
			},
			{} as Record<string, any[]>,
		);

		// Build the view model
		return {
			columns: columns.map((column) => ({
				id: column.id,
				title: column.title,
				description: column.description,
				tasks: tasksByColumn[column.id] || [],
			})),
		};
	}
}
