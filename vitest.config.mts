import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
    resolve: {
        alias: {
            "@": path.resolve(import.meta.dirname, "src"),
        },
    },
    test: {
        include: ["src/**/*.{test,spec}.ts"],
        exclude: ["node_modules", "dist", "out"],
    },
});
