import { defineConfig } from "vitest/config";
import path from "path";

/**
 * Webview 产物与其测试共用的 JSX 转换配置。
 *
 * Oxc 默认使用 React 运行时，因此必须显式指定 Preact。
 */
const oxc = {
    jsx: {
        runtime: "automatic" as const,
        importSource: "preact",
    },
};

/**
 * 各个 project 共用的别名。
 *
 * `@shared` 指向扩展源码，Webview 测试因此导入的正是两份产物共同编译的同一份协议。
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
                // 仅用于启动：把根组件挂载到 #app。
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
