import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [react()],
	test: {
		environment: "jsdom",
		setupFiles: ["./vitest.setup.ts"],
		coverage: {
			provider: "v8",
			include: ["components/**/*", "pages/**/*"],
			exclude: [
				"**/_app.tsx",
				"**/_document.tsx",
				"coverage/**",
				"dist/**",
				"**/[.]**",
				"packages/*/test?(s)/**",
				"**/*.d.ts",
				"**/virtual:*",
				"**/__x00__*",
				"**/\x00*",
				"cypress/**",
				"test?(s)/**",
				"test?(-*).?(c|m)[jt]s?(x)",
				"**/*{.,-}{test,spec}?(-d).?(c|m)[jt]s?(x)",
				"**/__tests__/**",
				"**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*",
				"**/vitest.{workspace,projects}.[jt]s?(on)",
				"**/.{eslint,mocha,prettier}rc.{?(c|m)js,yml}",
			],
		},
	},
});
