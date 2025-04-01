# LLM Integration

This application integrates a Large Language Model (LLM) through OpenAI to enable AI-powered task generation from natural language input. This document explains how LLM integration is implemented and used throughout the system.

## Architecture

### Backend Integration

The LLM integration is built around several key components:

- **LLM Utilities**: A set of utilities in `inteligence/llm.utils.ts` that provide:
  - Schema-validated LLM responses using Zod
  - Standardized prompting patterns
  - Evaluation capabilities for testing

- **Task Generation Query**: Implemented in `task/queries/generate-task.query.ts` using the CQRS pattern
  - Accepts natural language input
  - Uses LLM to generate structured task data
  - Returns formatted title and description

- **Task Controller**: Exposes the `/task/generate` endpoint in `task/task.controller.ts`
  - Takes in description and target column ID
  - Dispatches the generation query
  - Returns the structured task data

For implementation details about the backend architecture, see the [Backend Architecture](./architecture.md#backend-architecture) documentation.

### Dependencies

The implementation uses:

- `@ai-sdk/openai`: OpenAI client SDK
- `ai`: Core AI utilities for structured generation
- `zod`: Schema validation for LLM responses

## Implementation Details

### LLM Response Schema

The application uses Zod schemas to ensure that LLM responses match the expected structure:

```typescript
const taskSchema = z.object({
    title: z.string({ description: "Title of the task" }),
    description: z.string({ description: "Description of the task" }),
});
```

### Prompt Engineering

The system uses carefully crafted prompts to guide the LLM in generating tasks:

```typescript
const result = await askLlmWithSchema({
    schema: taskSchema,
    prompt:
        `Create a task based on the following description. The task should be clear and actionable.

Description: ${query.prompt}

Generate a task with:
- A concise title that summarizes the task
- A clear description that explains what needs to be done`,
});
```

### Configuration

LLM integration requires:
- An OpenAI API key configured in environment variables (see [Local Development](./local-development.md) for setup)
- Model selection (default: `gpt-4o-mini`)
- Temperature settings for response determinism

## Frontend Integration

The frontend provides:
- A user interface for entering natural language task descriptions
- API calls to the backend's task generation endpoint
- Display of the generated tasks with optimistic updates

## Use Cases

The LLM integration enables the following workflows:

1. **AI Task Generation**: Users can describe tasks in natural language and the system will generate structured task items
2. **Task Summarization**: Complex task descriptions can be converted to concise titles
3. **LLM-Based Testing**: The system uses LLMs to evaluate other LLM outputs in testing

## LLM-Based Testing

A notable innovation is the use of LLMs for testing other LLM outputs, as implemented in `task/evals/generate-task.test.ts`:

```typescript
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

This approach:
- Uses one LLM call to generate content
- Uses another LLM call to evaluate the quality of the generated content
- Provides flexibility in testing creative outputs

For more on testing approaches, see the [Testing documentation](./testing.md).

## Future Enhancements

Potential improvements to the LLM integration include:

1. **Advanced Task Generation**: Incorporating more context like due dates, estimated effort, etc.
2. **Multiple LLM Provider Support**: Adding support for alternative providers (Claude, Gemini, etc.)
3. **Streaming Responses**: Implementing streaming for real-time task generation feedback
4. **Enhanced Prompt Engineering**: Fine-tuning prompts for better quality generation
5. **User Feedback Loop**: Incorporating user feedback to improve generation quality 