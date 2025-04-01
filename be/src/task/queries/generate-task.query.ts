import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { z } from "zod";
import { askLlmWithSchema } from "../../inteligence/llm.utils";

export class GenerateTaskQuery {
	constructor(
		public readonly prompt: string,
		public readonly columnId: string,
	) {}
}

const taskSchema = z.object({
	title: z.string({ description: "Title of the task" }),
	description: z.string({ description: "Description of the task" }),
});

export const generateTaskFromUserPrompt = async (
	prompt: string,
): Promise<string> => {
	const result = await askLlmWithSchema({
		schema: taskSchema,
		prompt: `Create a task based on the following description. The task should be clear and actionable.

Description: ${prompt}

Generate a task with:
- A concise title that summarizes the task
- A clear description that explains what needs to be done

Format the response as:
Title: <generated title>
Description: <generated description>`,
	});

	const typedResult = result as z.infer<typeof taskSchema>;
	return `Title: ${typedResult.title}\nDescription: ${typedResult.description}`;
};

@Injectable()
@QueryHandler(GenerateTaskQuery)
export class GenerateTaskHandler implements IQueryHandler<GenerateTaskQuery> {
	constructor(private readonly configService: ConfigService) {
		this.configService.getOrThrow<string>("OPENAI_API_KEY");
	}

	async execute(
		query: GenerateTaskQuery,
	): Promise<{ title: string; description: string }> {
		const result = await askLlmWithSchema({
			schema: taskSchema,
			prompt: `Create a task based on the following description. The task should be clear and actionable.

Description: ${query.prompt}

Generate a task with:
- A concise title that summarizes the task
- A clear description that explains what needs to be done`,
		});

		const typedResult = result as z.infer<typeof taskSchema>;
		return {
			title: typedResult.title,
			description: typedResult.description,
		};
	}
}
