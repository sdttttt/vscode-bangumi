import { defineConfig } from "vite";
import { builtinModules } from "module";
import path from "path";

const nodeBuiltins = [
    ...builtinModules,
    ...builtinModules.map(name => `node:${name}`),
];

export default defineConfig({
    resolve: {
        // 解析到 Node.js 入口（`main`），绝不解析浏览器版本。
        mainFields: ["module", "main"],
        /*
         * 优先使用 `node` 这个导出条件，任何依赖都会解析到 Node.js 实现，
         * 而不是浏览器实现。
         */
        conditions: ["node"],
        alias: {
            "@": path.resolve(import.meta.dirname, "src"),
        },
    },
    build: {
        outDir: "dist",
        emptyOutDir: true,
        // VS Code 1.100 自带 Electron 34，其中内置 Node.js 20。
        target: "node20",
        minify: false,
        sourcemap: false,
        lib: {
            entry: path.resolve(import.meta.dirname, "src/extension.ts"),
            /*
             * 输出 ES module，与 package.json 里的 `type: module` 一致。
             * Node.js 扩展宿主自 VS Code 1.100 起支持 ESM，而 `engines.vscode`
             * 要求的下限正是这个版本。
             */
            formats: ["es"],
            fileName: () => "extension.js",
        },
        rolldownOptions: {
            // `import("vscode")` 由宿主提供，绝不打包进产物。
            external: ["vscode", ...nodeBuiltins],
        },
    },
});
