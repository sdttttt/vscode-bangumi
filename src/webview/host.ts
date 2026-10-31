import { randomBytes } from "node:crypto";
import * as path from "node:path";
import * as vscode from "vscode";
import { ENTERRPRISE, getContext, HUIHUI, YING_LILI } from "../constants";
import { getResourceFile } from "../utils/file";
import type { AssetUris, ViewState } from "./protocol";

/**
 * Directory of the built webview bundle, relative to the extension root.
 *
 * It deliberately lives outside `dist/` so the extension rebuild (`pnpm watch`)
 * can keep emptying `dist/` without deleting the webview bundle.
 *
 * @author sdttttt
 */
export const WEBVIEW_DIST = "webview-dist";

/**
 * Script file emitted by `vite.webview.mts`.
 *
 * @author sdttttt
 */
const WEBVIEW_SCRIPT = "main.js";

/**
 * Stylesheet file emitted by `vite.webview.mts`.
 *
 * @author sdttttt
 */
const WEBVIEW_STYLE = "main.css";

/**
 * Resolves a file of the built webview bundle to a webview-safe URI.
 *
 * @author sdttttt
 */
function getBundleFile(webview: vscode.Webview, filename: string): vscode.Uri {
    const onDiskPath = vscode.Uri.file(
        path.join(getContext().extensionPath, WEBVIEW_DIST, filename)
    );
    return webview.asWebviewUri(onDiskPath);
}

/**
 * Options every bangumi panel shares.
 *
 * `enableScripts` is required because the panel renders a bundled application
 * instead of a static document, and `localResourceRoots` keeps the webview from
 * reading anything outside the bundled assets and the `resources` folder.
 *
 * @author sdttttt
 */
export function getWebviewOptions(): vscode.WebviewPanelOptions &
    vscode.WebviewOptions {
    const root = getContext().extensionPath;

    return {
        enableScripts: true,
        retainContextWhenHidden: false,
        localResourceRoots: [
            vscode.Uri.file(path.join(root, WEBVIEW_DIST)),
            vscode.Uri.file(path.join(root, "resources")),
        ],
    };
}

/**
 * Local images the webview has to display.
 *
 * Only the extension host can turn a disk path into a URI a webview may load,
 * so they travel with every posted state.
 *
 * @author sdttttt
 */
export function createAssetUris(webview: vscode.Webview): AssetUris {
    return {
        todayBadge: getResourceFile(webview, YING_LILI).toString(),
        loading: getResourceFile(webview, HUIHUI).toString(),
        enterprise: getResourceFile(webview, ENTERRPRISE).toString(),
    };
}

/**
 * Builds a 32 character nonce for the webview content security policy.
 *
 * @author sdttttt
 */
function createNonce(): string {
    return randomBytes(16).toString("hex");
}

/**
 * Produces the document that boots the webview application.
 *
 * The document is intentionally state free: the bundle asks for data by posting
 * `{ type: "ready" }`, which keeps the security policy free of inline scripts.
 *
 * @param webview the panel the document belongs to
 * @param title document title, shown to the user by the editor chrome
 * @author sdttttt
 */
export function createWebviewHtml(
    webview: vscode.Webview,
    title: string
): string {
    const nonce = createNonce();
    const script: vscode.Uri = getBundleFile(webview, WEBVIEW_SCRIPT);
    const style: vscode.Uri = getBundleFile(webview, WEBVIEW_STYLE);

    /*
     * `img-src ... https:` is required for the bilibili cover images, and
     * `data:` covers the inlined placeholder assets.
     */
    const csp = [
        "default-src 'none'",
        `img-src ${webview.cspSource} https: data:`,
        `style-src ${webview.cspSource}`,
        `font-src ${webview.cspSource}`,
        `script-src 'nonce-${nonce}'`,
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
<script type="module" nonce="${nonce}" src="${script}"></script>
</body>
</html>`;
}

/**
 * Fills in the asset URIs of a state that is about to be posted.
 *
 * @author sdttttt
 */
export function withAssets(
    webview: vscode.Webview,
    state: ViewState
): ViewState {
    return { ...state, assets: createAssetUris(webview) };
}
