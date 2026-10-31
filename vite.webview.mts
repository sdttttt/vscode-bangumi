import { defineConfig } from "vite";
import UnoCSS from "unocss/vite";
import path from "path";

/**
 * Bundle of the webview application.
 *
 * Built separately from the extension because the two targets have nothing in
 * common: the extension is an ES module for Node.js 20, the webview is an ES
 * module for the Chromium shipped with VS Code, and it must never see `vscode`
 * or a Node.js builtin.
 *
 * A fixed file name keeps the host free of a manifest lookup: it always links
 * `main.js` and `main.css`.
 *
 * The UnoCSS config is passed by path instead of by convention: the plugin
 * resolves a bare config name against the process working directory, which is
 * the repository root, while the config lives next to the webview sources. The
 * generated utilities are folded into the same stylesheet as the hand written
 * base rules (`cssCodeSplit: false`).
 */
export default defineConfig({
    root: path.resolve(import.meta.dirname, "webview"),
    plugins: [
        UnoCSS(path.resolve(import.meta.dirname, "webview/uno.config.ts")),
    ],
    // Webview documents are served from a synthetic origin, so assets must be
    // addressed relatively or `asWebviewUri` paths break.
    base: "./",
    build: {
        outDir: path.resolve(import.meta.dirname, "webview-dist"),
        emptyOutDir: true,
        // VS Code 1.100 ships Electron 34, which bundles Chromium 132.
        target: "chrome132",
        minify: "oxc",
        sourcemap: false,
        // A single stylesheet keeps the document to one <link>.
        cssCodeSplit: false,
        lib: {
            name: "bangumiWebview",
            entry: path.resolve(import.meta.dirname, "webview/src/main.tsx"),
            formats: ["es"],
            fileName: () => "main.js",
        },
        rolldownOptions: {
            output: {
                // The ES build of a library never imports its own css, so the
                // host links it by name instead of a hashed file.
                assetFileNames: (asset: { names: Array<string> }): string =>
                    asset.names.some(name => name.endsWith(".css"))
                        ? "main.css"
                        : "assets/[name][extname]",
            },
        },
    },
});
