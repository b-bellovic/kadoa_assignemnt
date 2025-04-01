import console from "console";

// Store the original Jest console
const jestConsole = global.console;

beforeEach(() => {
	// Replace with native console during tests
	global.console = console;
});

afterEach(() => {
	// Restore Jest's console after each test
	global.console = jestConsole;
});
