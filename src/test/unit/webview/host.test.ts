import { beforeEach, describe, expect, it } from "vitest";
import type { Webview } from "vscode";
import { setContext } from "@/constants";
import {
    createAssetUris,
    createWebviewHtml,
    getWebviewOptions,
    WEBVIEW_DIST,
    withAssets,
} from "@/webview/host";

/**
 * Builds a webview double whose `asWebviewUri` stays readable.
 *
 * @author sdttttt
 */
function makeWebview(): Webview {
    return {
        cspSource: "vscode-webview://source",
        asWebviewUri: (uri: { fsPath: string }) => `webview:${uri.fsPath}`,
    } as unknown as Webview;
}

describe("getWebviewOptions", () => {
    beforeEach(() => {
        setContext({ extensionPath: "/extension" } as never);
    });

    it("enables the bundled scripts", () => {
        expect(getWebviewOptions().enableScripts).toBe(true);
    });

    it("does not keep the context alive when hidden", () => {
        expect(getWebviewOptions().retainContextWhenHidden).toBe(false);
    });

    it("only allows the bundle and the resources folder", () => {
        const roots = (getWebviewOptions().localResourceRoots ?? []).map(
            root => root.fsPath
        );

        expect(roots).toEqual([
            `/extension/${WEBVIEW_DIST}`,
            "/extension/resources",
        ]);
    });

    it("points at a directory outside of dist", () => {
        expect(WEBVIEW_DIST.startsWith("dist")).toBe(false);
    });
});

describe("createAssetUris", () => {
    beforeEach(() => {
        setContext({ extensionPath: "/extension" } as never);
    });

    it("resolves every image through the webview", () => {
        const assets = createAssetUris(makeWebview());

        expect(assets.todayBadge).toBe(
            "webview:/extension/resources/heiheihei.gif"
        );
        expect(assets.loading).toBe("webview:/extension/resources/loading.gif");
        expect(assets.enterprise).toBe(
            "webview:/extension/resources/enterprise.jpg"
        );
    });
});

describe("withAssets", () => {
    beforeEach(() => {
        setContext({ extensionPath: "/extension" } as never);
    });

    it("attaches the asset uris to the state", () => {
        const state = withAssets(makeWebview(), { kind: "loading" });

        expect(state.kind).toBe("loading");
        expect(state.assets?.loading).toContain("/extension/resources/");
    });

    it("keeps the payload of the state", () => {
        const state = withAssets(makeWebview(), {
            kind: "bangumi",
            page: 4,
            bangumis: [],
        });

        expect(state.page).toBe(4);
        expect(state.bangumis).toHaveLength(0);
    });
});

describe("createWebviewHtml", () => {
    beforeEach(() => {
        setContext({ extensionPath: "/extension" } as never);
    });

    it("emits a complete html document", () => {
        const html = createWebviewHtml(makeWebview(), "bangumis");

        expect(html.startsWith("<!DOCTYPE html>")).toBe(true);
        expect(html).toContain('<meta charset="UTF-8">');
        expect(html).toContain("<title>bangumis</title>");
        expect(html.trimEnd().endsWith("</html>")).toBe(true);
    });

    it("links the bundled script and stylesheet", () => {
        const html = createWebviewHtml(makeWebview(), "bangumis");

        expect(html).toContain(`webview:/extension/${WEBVIEW_DIST}/main.js`);
        expect(html).toContain(`webview:/extension/${WEBVIEW_DIST}/main.css`);
    });

    it("locks the document down with a content security policy", () => {
        const html = createWebviewHtml(makeWebview(), "bangumis");

        expect(html).toContain("default-src 'none'");
        expect(html).toContain("script-src 'nonce-");
    });

    it("allows the cover images served over https", () => {
        const html = createWebviewHtml(makeWebview(), "bangumis");

        expect(html).toContain("img-src vscode-webview://source https:");
    });

    it("uses the same nonce for the policy and the script tag", () => {
        const html = createWebviewHtml(makeWebview(), "bangumis");
        const nonce = /script-src 'nonce-([a-f0-9]+)'/.exec(html)?.[1];

        expect(nonce).toBeDefined();
        expect(html).toContain(`<script type="module" nonce="${nonce}"`);
    });

    it("generates a different nonce for every document", () => {
        const first = createWebviewHtml(makeWebview(), "t");
        const second = createWebviewHtml(makeWebview(), "t");

        expect(first).not.toBe(second);
    });

    it("keeps the document free of inline scripts", () => {
        const html = createWebviewHtml(makeWebview(), "bangumis");

        expect(html).not.toContain("<script>");
    });
});
