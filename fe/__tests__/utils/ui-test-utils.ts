import { render, RenderOptions, screen } from "@testing-library/react";
import { ReactElement } from "react";
import { createQueryClientWrapper } from "./test-providers";
import userEvent from "@testing-library/user-event";

/**
 * Setup options for rendering components in tests
 */
export interface TestRenderOptions extends Omit<RenderOptions, "wrapper"> {
	/**
	 * Whether to include React Query provider
	 * @default true
	 */
	withReactQuery?: boolean;
}

/**
 * Custom render function that includes common providers
 * @param ui - The component to render
 * @param options - Render options
 */
export function renderWithProviders(
	ui: ReactElement,
	{ withReactQuery = true, ...renderOptions }: TestRenderOptions = {},
) {
	// Set up wrapper based on options
	const wrapper = withReactQuery ? createQueryClientWrapper() : undefined;

	return {
		...render(ui, { wrapper, ...renderOptions }),
		// Return user event setup for easier testing
		user: userEvent.setup(),
	};
}


/**
 * Waits for an element with a specific test ID to appear
 * @param testId - The test ID of the element
 */
export async function waitForElementWithTestId(testId: string) {
	return screen.findByTestId(testId);
}

/**
 * Types text into an input field identified by test ID
 * @param testId - The test ID of the input field
 * @param text - The text to type
 */
export async function typeIntoField(testId: string, text: string) {
	const input = screen.getByTestId(testId);
	return userEvent.type(input, text);
}
