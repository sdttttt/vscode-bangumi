import { defineConfig } from "vite";
import UnoCSS from "unocss/vite";
import path from "path";

/**
 * Webview 应用的构建配置。
 *
 * 它与扩展分开构建，因为两者目标环境毫无交集：扩展是面向 Node.js 20 的 ES module，
 * Webview 是面向 VS Code 内置 Chromium 的 ES module，而且后者绝不允许看到 `vscode`
 * 或任何 Node.js 内置模块。
 *
 * 文件名固定，宿主因此无需读取 manifest：它永远引用 `main.js` 与 `main.css`。
 *
 * UnoCSS 配置用路径传入而不是依赖约定：插件会把裸配置名解析到进程工作目录
 * （即仓库根目录），而配置文件位于 Webview 源码旁边。生成的工具类会与手写的基础规则
 * 合并到同一份样式表（`cssCodeSplit: false`）。
 */
export default defineConfig({
    root: path.resolve(import.meta.dirname, "webview"),
    plugins: [
        UnoCSS(path.resolve(import.meta.dirname, "webview/uno.config.ts")),
    ],
    // Webview 文档来自一个合成源，资源必须以相对路径引用，否则 `asWebviewUri`
    // 生成的路径会失效。
    base: "./",
    build: {
        outDir: path.resolve(import.meta.dirname, "webview-dist"),
        emptyOutDir: true,
        // VS Code 1.100 自带 Electron 34，其中内置 Chromium 132。
        target: "chrome132",
        minify: "oxc",
        sourcemap: false,
        // 只产出一份样式表，文档里因此只有一个 <link>。
        cssCodeSplit: false,
        lib: {
            name: "bangumiWebview",
            entry: path.resolve(import.meta.dirname, "webview/src/main.tsx"),
            formats: ["es"],
            fileName: () => "main.js",
        },
        rolldownOptions: {
            output: {
                // 库的 ES 构建不会自行导入样式，因此宿主按固定名称引用，
                // 而不是带哈希的文件名。
                assetFileNames: (asset: { names: Array<string> }): string =>
                    asset.names.some(name => name.endsWith(".css"))
                        ? "main.css"
                        : "assets/[name][extname]",
            },
        },
    },
});
