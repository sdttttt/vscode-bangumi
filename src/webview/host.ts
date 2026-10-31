import { randomBytes } from "node:crypto";
import * as path from "node:path";
import * as vscode from "vscode";
import { ENTERRPRISE, HUIHUI, YING_LILI } from "../constants";
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
 * The webview document factory of one extension session.
 *
 * @author sdttttt
 */
export interface WebviewHost {
    /** Options every bangumi panel shares. */
    options(): vscode.WebviewPanelOptions & vscode.WebviewOptions;
    /** Asset URIs of the current webview. */
    assets(webview: vscode.Webview): AssetUris;
    /** Document that boots the webview application. */
    html(webview: vscode.Webview, title: string): string;
    /** Fills in the asset URIs of a state that is about to be posted. */
    withAssets(webview: vscode.Webview, state: ViewState): ViewState;
}

/**
 * Creates the webview document factory of one extension session.
 *
 * `enableScripts` is required because the panel renders a bundled application
 * instead of a static document, and `localResourceRoots` keeps the webview from
 * reading anything outside the bundled assets and the `resources` folder.
 *
 * @param extensionPath root of the installed extension
 * @author sdttttt
 */
export function useWebviewHost(extensionPath: string): WebviewHost {
    /**
     * Resolves a file of the built webview bundle to a webview-safe URI.
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
     * Builds a 32 character nonce for the webview content security policy.
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
             * `img-src ... https:` is required for the bilibili cover images,
             * and `data:` covers the inlined placeholder assets.
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
