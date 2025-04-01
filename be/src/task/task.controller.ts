import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Put,
	UseGuards,
} from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { User } from "../auth/decorators/user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { User as UserEntity } from "../schema";
import { ColumnService } from "./column.service";
import { DeleteColumnCommand } from "./commands/delete-column.command";
import { MoveTaskCommand } from "./commands/move-task.command";
import { ReorderColumnsCommand } from "./commands/reorder-columns.command";
import { ReorderTasksCommand } from "./commands/reorder-tasks.command";
import { CreateColumnDto } from "./dto/create-column.dto";
import { CreateTaskDto } from "./dto/create-task.dto";
import { GenerateTaskQuery } from "./queries/generate-task.query";
import { GetBoardQuery } from "./queries/get-board.query";
import { TaskService } from "./task.service";

/**
 * DTO for moving a task to a different column
 */
interface MoveTaskDto {
	targetColumnId: string;
}

/**
 * DTO for reordering tasks within a column
 */
interface ReorderTasksDto {
	taskIds: string[];
}

/**
 * DTO for reordering columns
 */
interface ReorderColumnsDto {
	columnIds: string[];
}

/**
 * Controller responsible for handling all kanban board operations
 * Includes endpoints for managing tasks and columns
 */
@Controller("board")
@UseGuards(JwtAuthGuard)
export class TaskController {
	constructor(
		private readonly commandBus: CommandBus,
		private readonly queryBus: QueryBus,
		private readonly taskService: TaskService,
		private readonly columnService: ColumnService,
	) {}

	/**
	 * Retrieves the entire kanban board data
	 * Returns all columns and tasks for the current user
	 *
	 * @returns Promise resolving to the complete board data
	 */
	@Get()
	async getBoard() {
		return this.queryBus.execute(new GetBoardQuery());
	}

	/**
	 * Moves a task to a different column
	 *
	 * @param taskId - ID of the task to move
	 * @param dto - Transfer object containing the target column ID
	 * @param user - Current authenticated user
	 * @returns Promise resolving to the result of the move operation
	 */
	@Post("task/:id/move")
	async moveTask(
		@Param("id") taskId: string,
		@Body() dto: MoveTaskDto,
		@User() user: UserEntity,
	) {
		return this.commandBus.execute(
			new MoveTaskCommand(taskId, dto.targetColumnId, user.id),
		);
	}

	/**
	 * Reorders tasks within a column
	 *
	 * @param columnId - ID of the column containing the tasks
	 * @param dto - Transfer object containing the ordered task IDs
	 * @param user - Current authenticated user
	 * @returns Promise resolving to the result of the reorder operation
	 */
	@Post("column/:id/reorder")
	async reorderTasks(
		@Param("id") columnId: string,
		@Body() dto: ReorderTasksDto,
		@User() user: UserEntity,
	) {
		return this.commandBus.execute(
			new ReorderTasksCommand(dto.taskIds, user.id),
		);
	}

	/**
	 * Reorders columns on the board
	 *
	 * @param dto - Transfer object containing the ordered column IDs
	 * @param user - Current authenticated user
	 * @returns Promise resolving to the result of the reorder operation
	 */
	@Post("columns/reorder")
	async reorderColumns(
		@Body() dto: ReorderColumnsDto,
		@User() user: UserEntity,
	) {
		return this.commandBus.execute(
			new ReorderColumnsCommand(dto.columnIds, user.id),
		);
	}

	/**
	 * Deletes a column and all its tasks
	 *
	 * @param columnId - ID of the column to delete
	 * @param user - Current authenticated user
	 * @returns Promise resolving to the result of the delete operation
	 */
	@Delete("column/:id")
	async deleteColumn(@Param("id") columnId: string, @User() user: UserEntity) {
		return this.commandBus.execute(new DeleteColumnCommand(columnId, user.id));
	}

	/**
	 * Creates a new task
	 *
	 * @param dto - Data transfer object containing task details
	 * @param user - Current authenticated user
	 * @returns Promise resolving to the created task
	 */
	@Post("task")
	async createTask(@Body() dto: CreateTaskDto, @User() user: UserEntity) {
		return this.taskService.createTask(dto);
	}

	/**
	 * Retrieves a specific task by ID
	 *
	 * @param id - ID of the task to retrieve
	 * @returns Promise resolving to the task data
	 */
	@Get("task/:id")
	async getTask(@Param("id") id: string) {
		return this.taskService.getTaskById(id);
	}

	/**
	 * Updates a task's properties
	 *
	 * @param id - ID of the task to update
	 * @param updateData - Partial DTO containing properties to update
	 * @returns Promise resolving to the updated task
	 */
	@Patch("task/:id")
	async updateTask(
		@Param("id") id: string,
		@Body() updateData: Partial<CreateTaskDto>,
	) {
		return this.taskService.updateTask(id, updateData);
	}

	/**
	 * Deletes a task
	 *
	 * @param id - ID of the task to delete
	 * @returns Promise resolving to a success message
	 */
	@Delete("task/:id")
	async deleteTask(@Param("id") id: string) {
		await this.taskService.deleteTask(id);
		return { success: true, message: "Task deleted successfully" };
	}

	/**
	 * Creates a new column
	 *
	 * @param dto - Data transfer object containing column details
	 * @param user - Current authenticated user
	 * @returns Promise resolving to the created column
	 */
	@Post("column")
	async createColumn(@Body() dto: CreateColumnDto, @User() user: UserEntity) {
		return this.columnService.createColumn(dto, user.id);
	}

	/**
	 * Updates a column's properties
	 *
	 * @param id - ID of the column to update
	 * @param updateData - Partial DTO containing properties to update
	 * @returns Promise resolving to the updated column
	 */
	@Patch("column/:id")
	async updateColumn(
		@Param("id") id: string,
		@Body() updateData: Partial<CreateColumnDto>,
	) {
		return this.columnService.updateColumn(id, updateData);
	}

	/**
	 * Retrieves a specific column by ID
	 *
	 * @param id - ID of the column to retrieve
	 * @returns Promise resolving to the column data
	 */
	@Get("column/:id")
	async getColumn(@Param("id") id: string) {
		return this.columnService.getColumnById(id);
	}

	/**
	 * Generates a new task using AI based on a description
	 *
	 * @param body - Object containing the task description and target column ID
	 * @returns Promise resolving to the generated task
	 */
	@Post("task/generate")
	async generateTask(@Body() body: { description: string; columnId: string }) {
		return this.queryBus.execute(
			new GenerateTaskQuery(body.description, body.columnId),
		);
	}
}
