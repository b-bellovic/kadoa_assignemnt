import chalk from "chalk";
import { EvaluationResult } from "./llm.utils";
/**
 * Logs evaluation results in a consistent, formatted manner.
 * @param testName - Name of the test case being evaluated
 * @param input - The original input (can be any type)
 * @param output - The processed/enhanced output (can be any type)
 * @param evaluation - The evaluation result containing score and feedback
 */
export function logEvaluationResults(
	testName: string,
	input: unknown,
	output: unknown,
	evaluation: EvaluationResult,
): void {
	const header = chalk.bold.blue(`=== ${testName} ===`);

	console.log(header);

	console.log(chalk.yellow("Input:"));
	console.log(chalk.dim(input));

	console.log(chalk.yellow("Output:"));
	console.log(chalk.dim(output));

	console.log(chalk.yellow("Evaluation:"));

	console.log(chalk.green(`Score: ${evaluation.score}`));
	if (Number(evaluation.score) <= 0.5) {
		console.log(chalk.red(`${evaluation.explanation}`));
	} else {
		console.log(chalk.green(`${evaluation.explanation}`));
	}

	console.log(chalk.blue("===========================\n"));
}
