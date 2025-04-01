import "dotenv/config";
import { evaluate } from "../../inteligence/llm.utils";
import { logEvaluationResults } from "../../inteligence/logging-utils";
import { generateTaskFromUserPrompt } from "../queries/generate-task.query";

jest.setTimeout(30000); // Set timeout globally for this test file

describe("Generate Task", () => {
	it("should generate a task", async () => {
		const userPrompt = "Create a task to buy groceries";

		const result = await generateTaskFromUserPrompt(userPrompt);

		const evaluation = await evaluate({
			inputs: userPrompt,
			outputs: result,
			prompt: "Evaluate that the task is relevant to the user prompt",
		});

		logEvaluationResults("Generate Task", userPrompt, result, evaluation);

		expect(evaluation.score).toBeGreaterThan(0.5);
	});
});
