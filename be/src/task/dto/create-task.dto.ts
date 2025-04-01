import { Type } from "class-transformer";
import {
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
	IsUUID,
} from "class-validator";

export class CreateTaskDto {
	@IsNotEmpty()
	@IsString()
	title: string;

	@IsOptional()
	@IsString()
	description?: string;

	@IsNotEmpty()
	@IsUUID()
	columnId: string;

	@IsOptional()
	@IsUUID()
	assigneeId?: string;

	@IsOptional()
	@IsNumber()
	@Type(() => Number)
	order?: number;
}
