import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
    resolve: {
        alias: {
            "@": path.resolve(import.meta.dirname, "src"),
        },
    },
    test: {
        include: ["src/test/unit/**/*.test.ts"],
        exclude: ["node_modules", "dist", "out"],
        setupFiles: ["src/test/setup.ts"],
        restoreMocks: true,
        clearMocks: true,
        coverage: {
            provider: "v8",
            reporter: ["text", "lcov"],
            include: ["src/**/*.ts"],
            exclude: ["src/test/**"],
            thresholds: {
                lines: 90,
                functions: 90,
                branches: 85,
                statements: 90,
            },
        },
    },
});
