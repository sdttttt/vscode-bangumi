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
         * Prefer the `node` export condition so dependencies keep their
         * Node.js implementations (e.g. axios' http adapter).
         */
        conditions: ["node"],
        alias: {
            "@": path.resolve(import.meta.dirname, "src"),
        },
    },
    build: {
        outDir: "dist",
        emptyOutDir: true,
        // VS Code 1.144 ships Electron 43, which bundles Node.js 24.
        target: "node24",
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
