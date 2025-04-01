/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
	plugins: [react()],
	test: {
		globals: true,
		environment: "happy-dom",
		setupFiles: ["./vitest.setup.ts"],
		include: ["**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
		exclude: ["node_modules", ".next", "dist"],
	},
	resolve: {
		alias: {
			"@": resolve(__dirname, "./"),
		},
	},
});
