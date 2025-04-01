# Testing Approach

This documentation covers the testing strategy employed in the Kadoa Assignment application. Note that **only minimal testing was added** to showcase the approach that would be used in a complete implementation.

## Testing Strategy

The testing approach includes:

1. **Unit Tests**: Testing individual components in isolation
2. **Integration Tests**: Verifying interaction between components
3. **End-to-End Tests**: Testing complete user flows
4. **LLM-Based Tests**: Evaluating AI-generated content

## Backend Testing (NestJS)

Backend tests are implemented using Jest and include:

- **Controller Tests**: Verify API endpoints and responses
- **Service Tests**: Test business logic in isolation
- **E2E Tests**: Test complete API flows with a test database

Example E2E tests include:
- Authentication flow (`auth.e2e-spec.ts`)
- Task operations (`task.e2e-spec.ts`)

## Frontend Testing (Next.js)

Frontend tests use Vitest and include:

- **Component Tests**: Verify UI component behavior
- **Hook Tests**: Test custom React hooks
- **Service Tests**: Validate API client functions

## LLM-Based Testing

A notable example of innovative testing is the `generate-task.test.ts` file, which demonstrates an approach to testing LLM-generated content:

```typescript
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
```

This test:

1. Takes a sample user prompt
2. Generates a task using the AI-powered service
3. **Uses another LLM call to evaluate the quality** of the generated task
4. Logs the evaluation results for analysis
5. Asserts that the evaluation score exceeds a threshold

This approach showcases how to test AI-generated content without hardcoding expected outputs, allowing for creative variation while ensuring quality.

## Test Coverage

The implemented tests provide:

- Basic validation of core functionality
- Examples of different testing approaches
- Coverage of critical paths

## Future Testing Enhancements

In a complete implementation, consider:

1. Increasing test coverage across all components
2. Adding more comprehensive boundary and error cases
3. Implementing automated CI/CD pipeline integration
4. Adding property-based testing for robust validation
5. Expanding LLM evaluation tests to cover more use cases 
