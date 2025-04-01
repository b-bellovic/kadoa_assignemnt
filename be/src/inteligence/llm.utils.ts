import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";

/**
 * Asks LLM a question and validates response against a schema
 *
 * Simple utility function that:
 * - Sends a prompt to LLM
 * - Expects structured response
 * - Validates against Zod schema
 * - Returns typed result
 *
 * @param params Configuration for LLM interaction
 * @returns Schema-validated response of type T
 */
export async function askLlmWithSchema<T>({
	schema,
	prompt,
	model = "gpt-4o-mini",
	temperature = 0.1,
}: {
	schema: z.ZodType<T>;
	prompt: string;
	model?: string;
	temperature?: number;
}): Promise<T> {
	const result = await generateObject({
		model: openai(model),
		schema,
		temperature,
		output: "object",
		prompt,
	});

	return result.object as T;
}

const evaluationSchema = z
	.object({
		score: z.number(),
		explanation: z.string(),
	})
	.refine((data) => data.score >= 0 && data.score <= 1, {
		message: "Score must be between 0 and 1",
		path: ["score"],
	});

export type EvaluationResult = z.infer<typeof evaluationSchema>;

/**
 * Evaluates input and output using a given prompt
 *
 * @example
 * ```typescript
 * const result = await evaluate({
 *   prompt: "Is the enhanced version better?",
 *   inputs: "The cat sat on the mat",
 *   outputs: "A sleek feline rested gracefully upon the mat"
 * });
 * ```
 */
export async function evaluate({
	prompt,
	inputs,
	outputs,
	model = "openai:o3-mini",
}: {
	prompt: string;
	inputs: unknown;
	outputs: unknown;
	model?: string;
}): Promise<EvaluationResult> {
	const result = await generateObject({
		model: openai("o3-mini"),
		system: `You are an expert evaluator that analyzes outputs based on given criteria.
Your task is to:
1. Carefully analyze the input and output
2. Score the output on a scale from 0.0 to 1.0
3. Provide a detailed explanation of your scoring

You MUST return:
- score: A number between 0.0 and 1.0
- explanation: A detailed explanation of your scoring`,
		schema: evaluationSchema,
		output: "object",
		temperature: 0.1,
		prompt: `
${prompt}

Input:
${JSON.stringify(inputs, null, 2)}

Output:
${JSON.stringify(outputs, null, 2)}

Please evaluate based on the given criteria and provide your assessment.`,
	});

	return result.object;
}
