import { defineConfig } from "vitest/config";
import path from "path";

/**
 * JSX transform shared by the webview bundle and its tests.
 *
 * Oxc defaults to the React runtime, so Preact has to be named explicitly.
 */
const oxc = {
    jsx: {
        runtime: "automatic" as const,
        importSource: "preact",
    },
};

/**
 * Aliases shared by every project.
 *
 * `@shared` points at the extension sources so the webview tests import the very
 * same protocol the two bundles compile against.
 */
const alias = {
    "@": path.resolve(import.meta.dirname, "src"),
    "@shared": path.resolve(import.meta.dirname, "src"),
    "@webview": path.resolve(import.meta.dirname, "webview/src"),
};

export default defineConfig({
    test: {
        projects: [
            {
                resolve: { alias },
                test: {
                    name: "extension",
                    include: ["src/test/unit/**/*.test.ts"],
                    environment: "node",
                    setupFiles: ["src/test/setup.ts"],
                    restoreMocks: true,
                    clearMocks: true,
                },
            },
            {
                oxc,
                resolve: { alias },
                test: {
                    name: "webview",
                    include: ["webview/src/**/*.test.tsx"],
                    environment: "happy-dom",
                    setupFiles: ["webview/src/test/setup.ts"],
                    restoreMocks: true,
                    clearMocks: true,
                },
            },
        ],
        exclude: ["node_modules", "dist", "out", "webview-dist"],
        coverage: {
            provider: "v8",
            reporter: ["text", "lcov"],
            include: ["src/**/*.ts", "webview/src/**/*.{ts,tsx}"],
            exclude: [
                "src/test/**",
                "webview/src/**/*.test.tsx",
                "webview/src/test/**",
                // Bootstrap only: mounts the root component into #app.
                "webview/src/main.tsx",
            ],
            thresholds: {
                lines: 90,
                functions: 90,
                branches: 85,
                statements: 90,
            },
        },
    },
});
