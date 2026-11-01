import { randomBytes } from "node:crypto";
import * as path from "node:path";
import * as vscode from "vscode";
import { ENTERRPRISE, HUIHUI, YING_LILI } from "../constants";
import { getResourceFile } from "../utils/file";
import type { AssetUris, ViewState } from "./protocol";

/**
 * 构建后的 Webview 产物目录，相对于扩展根目录。
 *
 * 它特意放在 `dist/` 之外，这样扩展的重新构建（`pnpm watch`）可以不断清空
 * `dist/`，而不会把 Webview 产物一并删掉。
 *
 * @author sdttttt
 */
export const WEBVIEW_DIST = "webview-dist";

/**
 * 由 `vite.webview.mts` 产出的脚本文件。
 *
 * @author sdttttt
 */
const WEBVIEW_SCRIPT = "main.js";

/**
 * 由 `vite.webview.mts` 产出的样式表文件。
 *
 * @author sdttttt
 */
const WEBVIEW_STYLE = "main.css";

/**
 * 一次扩展会话使用的 Webview 文档工厂。
 *
 * @author sdttttt
 */
export interface WebviewHost {
    /** 所有番剧面板共用的配置项。 */
    options(): vscode.WebviewPanelOptions & vscode.WebviewOptions;
    /** 当前 Webview 的静态资源 Uri。 */
    assets(webview: vscode.Webview): AssetUris;
    /** 用于启动 Webview 应用的文档。 */
    html(webview: vscode.Webview, title: string): string;
    /** 为即将发送的状态补上静态资源 Uri。 */
    withAssets(webview: vscode.Webview, state: ViewState): ViewState;
}

/**
 * 创建一次扩展会话使用的 Webview 文档工厂。
 *
 * `enableScripts` 是必需的，因为面板渲染的是打包后的应用而不是静态文档；
 * `localResourceRoots` 则限制 Webview 只能读取打包资源与 `resources/` 目录。
 *
 * @param extensionPath 已安装扩展的根目录
 * @author sdttttt
 */
export function createWebviewHost(extensionPath: string): WebviewHost {
    /**
     * 把 Webview 产物中的文件解析为 Webview 可安全访问的 Uri。
     */
    const bundleFile = (
        webview: vscode.Webview,
        filename: string
    ): vscode.Uri =>
        webview.asWebviewUri(
            vscode.Uri.file(path.join(extensionPath, WEBVIEW_DIST, filename))
        );

    const assets = (webview: vscode.Webview): AssetUris => ({
        todayBadge: getResourceFile(
            webview,
            YING_LILI,
            extensionPath
        ).toString(),
        loading: getResourceFile(webview, HUIHUI, extensionPath).toString(),
        enterprise: getResourceFile(
            webview,
            ENTERRPRISE,
            extensionPath
        ).toString(),
    });

    /**
     * 为 Webview 的内容安全策略生成 32 位 nonce。
     */
    const nonce = (): string => randomBytes(16).toString("hex");

    return {
        options: () => ({
            enableScripts: true,
            retainContextWhenHidden: false,
            localResourceRoots: [
                vscode.Uri.file(path.join(extensionPath, WEBVIEW_DIST)),
                vscode.Uri.file(path.join(extensionPath, "resources")),
            ],
        }),

        assets,

        html: (webview, title) => {
            const script = bundleFile(webview, WEBVIEW_SCRIPT);
            const style = bundleFile(webview, WEBVIEW_STYLE);
            const scriptNonce = nonce();

            /*
             * `img-src ... https:` 是 B 站封面图所必需的，
             * `data:` 则用于内联的占位图资源。
             */
            const csp = [
                "default-src 'none'",
                `img-src ${webview.cspSource} https: data:`,
                `style-src ${webview.cspSource}`,
                `font-src ${webview.cspSource}`,
                `script-src 'nonce-${scriptNonce}'`,
            ].join("; ");

            return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta http-equiv="Content-Security-Policy" content="${csp}">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<link rel="stylesheet" href="${style}">
</head>
<body>
<div id="app"></div>
<script type="module" nonce="${scriptNonce}" src="${script}"></script>
</body>
</html>`;
        },

        withAssets: (webview, state) => ({
            ...state,
            assets: assets(webview),
        }),
    };
}
