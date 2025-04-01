import { vi } from "vitest";

/**
 * Mock the console.error method for cleaner test output
 * Use this within a try/finally block to ensure it gets restored
 *
 * @example
 * const restoreConsole = mockConsoleError();
 * try {
 *   // Test code here
 * } finally {
 *   restoreConsole();
 * }
 *
 * @returns Function to restore the original console.error
 */
export function mockConsoleError() {
	const originalConsoleError = console.error;
	console.error = vi.fn();

	return () => {
		console.error = originalConsoleError;
	};
}
