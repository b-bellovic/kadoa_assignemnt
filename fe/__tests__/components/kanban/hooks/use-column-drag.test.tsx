import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useColumnDrag } from "@/components/kanban/hooks/use-column-drag";
import { Column } from "@/components/kanban/types/types";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

// Mock the calculateNewOrder function since it's a dependency
vi.mock("@/components/kanban/utils", () => ({
	calculateNewOrder: vi.fn((items, fromIndex, toIndex) => {
		// Simple mock implementation for testing
		return toIndex === 0 ? 500 : 3000;
	}),
}));

// Mock the kanban API
vi.mock("@/api/kanban-api", () => ({
	kanbanApi: {
		reorderColumns: vi.fn(() => Promise.reject("Not implemented in test")), // Force fallback
	},
}));

describe("useColumnDrag Hook", () => {
	// Sample columns for testing
	const mockColumns: Column[] = [
		{ id: "col1", title: "To Do", order: 1000, createdAt: "", updatedAt: "" },
		{
			id: "col2",
			title: "In Progress",
			order: 2000,
			createdAt: "",
			updatedAt: "",
		},
		{ id: "col3", title: "Done", order: 3000, createdAt: "", updatedAt: "" },
	];

	// Mock the updateColumn function
	const mockUpdateColumn = vi.fn();

	// Create a client for React Query
	const createWrapper = () => {
		const queryClient = new QueryClient();
		// eslint-disable-next-line react/display-name
		return ({ children }: { children: React.ReactNode }) => (
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		);
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should initialize with activeColumn set to null", () => {
		const { result } = renderHook(
			() =>
				useColumnDrag({ columns: mockColumns, updateColumn: mockUpdateColumn }),
			{ wrapper: createWrapper() },
		);

		expect(result.current.activeColumn).toBeNull();
	});

	it("should allow setting the active column", () => {
		const { result } = renderHook(
			() =>
				useColumnDrag({ columns: mockColumns, updateColumn: mockUpdateColumn }),
			{ wrapper: createWrapper() },
		);

		act(() => {
			result.current.setActiveColumn(mockColumns[1]);
		});

		expect(result.current.activeColumn).toEqual(mockColumns[1]);
	});

	it("should handle column reordering from first to last position", async () => {
		const { result } = renderHook(
			() =>
				useColumnDrag({ columns: mockColumns, updateColumn: mockUpdateColumn }),
			{ wrapper: createWrapper() },
		);

		// Set active column
		act(() => {
			result.current.setActiveColumn(mockColumns[0]);
		});

		// Reorder the column - move first column (col1) to after last column (col3)
		await act(async () => {
			await result.current.handleColumnReordering("col1", "col3");
		});

		// Verify updateColumn was called with the correct parameters
		expect(mockUpdateColumn).toHaveBeenCalledWith({
			columnId: "col1",
			updates: { order: 3000 }, // This comes from our mocked calculateNewOrder function
		});

		// Active column should be reset to null after operation
		expect(result.current.activeColumn).toBeNull();
	});

	it("should handle column reordering from last to first position", async () => {
		const { result } = renderHook(
			() =>
				useColumnDrag({ columns: mockColumns, updateColumn: mockUpdateColumn }),
			{ wrapper: createWrapper() },
		);

		// Set active column
		act(() => {
			result.current.setActiveColumn(mockColumns[2]);
		});

		// Reorder the column - move last column (col3) to before first column (col1)
		await act(async () => {
			await result.current.handleColumnReordering("col3", "col1");
		});

		// Verify updateColumn was called with the correct parameters
		expect(mockUpdateColumn).toHaveBeenCalledWith({
			columnId: "col3",
			updates: { order: 500 }, // This comes from our mocked calculateNewOrder function
		});

		// Active column should be reset to null after operation
		expect(result.current.activeColumn).toBeNull();
	});

	it("should not call updateColumn when source and target columns are the same", async () => {
		const { result } = renderHook(
			() =>
				useColumnDrag({ columns: mockColumns, updateColumn: mockUpdateColumn }),
			{ wrapper: createWrapper() },
		);

		// Set active column
		act(() => {
			result.current.setActiveColumn(mockColumns[1]);
		});

		// Try to reorder to the same position
		await act(async () => {
			await result.current.handleColumnReordering("col2", "col2");
		});

		// Verify updateColumn was not called
		expect(mockUpdateColumn).not.toHaveBeenCalled();

		// Active column should still be reset to null
		expect(result.current.activeColumn).toBeNull();
	});
});
