import { defineConfig } from "vite";
import { builtinModules } from "module";
import path from "path";

const nodeBuiltins = [
    ...builtinModules,
    ...builtinModules.map(name => `node:${name}`),
];

export default defineConfig({
    resolve: {
        // Bundle the Node.js entry points (`main`), never the browser ones.
        mainFields: ["module", "main"],
        /*
         * Prefer the `node` export condition so any dependency resolves to its
         * Node.js implementation instead of the browser one.
         */
        conditions: ["node"],
        alias: {
            "@": path.resolve(import.meta.dirname, "src"),
        },
    },
    build: {
        outDir: "dist",
        emptyOutDir: true,
        // VS Code 1.100 ships Electron 34, which bundles Node.js 20.
        target: "node20",
        minify: false,
        sourcemap: false,
        lib: {
            entry: path.resolve(import.meta.dirname, "src/extension.ts"),
            formats: ["cjs"],
            fileName: () => "extension.js",
        },
        rolldownOptions: {
            external: ["vscode", ...nodeBuiltins],
        },
    },
});
