import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import KanbanBoard from "@/modules/board/components/kanban-board";

// Create mock objects before any imports
const mockApiObjects = vi.hoisted(() => {
	return {
		mockKanbanApi: {
			getBoard: vi.fn(),
			createColumn: vi.fn(),
			updateColumn: vi.fn(),
			deleteColumn: vi.fn(),
			createTask: vi.fn(),
			updateTask: vi.fn(),
			deleteTask: vi.fn(),
			generateTask: vi.fn(),
		},
		mockAuthApi: {
			login: vi.fn(),
			register: vi.fn(),
			getProfile: vi.fn(),
		},
	};
});

// Use the mocks before any imports that might use them
vi.mock("@/api/kanban-api", () => ({
	kanbanApi: mockApiObjects.mockKanbanApi,
}));

vi.mock("@/api/auth-api", () => ({
	authApi: mockApiObjects.mockAuthApi,
}));

// Now import other utilities
import {
	mockConsoleError,
	renderWithProviders,
	createMockColumn,
	mockBoardData,
	typeIntoField,
	waitForElementWithTestId,
} from "@/__tests__/utils";

describe("Add Column Integration", () => {
	// Mock the new column
	const mockNewColumn = createMockColumn({
		id: "col3",
		title: "New Column",
		order: 4000,
	});

	beforeEach(() => {
		vi.clearAllMocks();

		// Mock the API responses using our hoisted mock objects
		mockApiObjects.mockKanbanApi.getBoard.mockResolvedValue(mockBoardData);
		mockApiObjects.mockKanbanApi.createColumn.mockResolvedValue(mockNewColumn);
	});

	it("should trigger API call when adding a new column through UI", async () => {
		// Render the Kanban board component with the QueryClient provider
		const { user } = renderWithProviders(<KanbanBoard />);

		// Wait for the board to load
		await waitFor(() => {
			expect(screen.getByText("Your Kanban Board")).toBeInTheDocument();
		});

		// Check that the API was called to get the board data
		expect(mockApiObjects.mockKanbanApi.getBoard).toHaveBeenCalledTimes(1);

		// Find and click the "Add Column" button in the header
		const addColumnButton = screen.getByText(/add column/i);
		fireEvent.click(addColumnButton);

		// Check that the add column modal appears
		const modal = await waitForElementWithTestId("add-column-modal");
		expect(modal).toBeInTheDocument();

		// Find the input field and enter a column title
		await typeIntoField("column-title-input", "New Column");

		// Find and click the submit button
		const submitButton = screen.getByTestId("add-column-submit-button");
		fireEvent.click(submitButton);

		// Verify the API was called with the correct parameters
		await waitFor(() => {
			expect(mockApiObjects.mockKanbanApi.createColumn).toHaveBeenCalledTimes(
				1,
			);
			expect(mockApiObjects.mockKanbanApi.createColumn).toHaveBeenCalledWith(
				"New Column",
				4000,
			);
		});
	});

	it("should handle errors when adding a column fails", async () => {
		// Setup error for API call
		const errorMessage = "Failed to create column";
		mockApiObjects.mockKanbanApi.createColumn.mockRejectedValueOnce(
			new Error(errorMessage),
		);

		// Mock console.error to avoid test output noise
		const restoreConsole = mockConsoleError();

		try {
			// Render the Kanban board component
			const { user } = renderWithProviders(<KanbanBoard />);

			// Wait for the board to load
			await waitFor(() => {
				expect(screen.getByText("Your Kanban Board")).toBeInTheDocument();
			});

			// Find and click the "Add Column" button
			const addColumnButton = screen.getByText(/add column/i);
			fireEvent.click(addColumnButton);

			// Check that the add column modal appears
			const modal = await waitForElementWithTestId("add-column-modal");
			expect(modal).toBeInTheDocument();

			// Find the input field and enter a column title
			await typeIntoField("column-title-input", "Error Column");

			// Find and click the submit button
			const submitButton = screen.getByTestId("add-column-submit-button");
			fireEvent.click(submitButton);

			// Verify the API was called with error
			await waitFor(() => {
				expect(mockApiObjects.mockKanbanApi.createColumn).toHaveBeenCalledTimes(
					1,
				);
				expect(mockApiObjects.mockKanbanApi.createColumn).toHaveBeenCalledWith(
					"Error Column",
					4000,
				);
			});
		} finally {
			// Restore original console.error
			restoreConsole();
		}
	});
});
