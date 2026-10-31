import { beforeEach, describe, expect, it } from "vitest";
import type { Webview } from "vscode";
import { useWebviewHost, WEBVIEW_DIST, type WebviewHost } from "@/webview/host";

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

let host: WebviewHost;

beforeEach(() => {
    host = useWebviewHost("/extension");
});

describe("useWebviewHost", () => {
    it("enables the bundled scripts", () => {
        expect(host.options().enableScripts).toBe(true);
    });

    it("does not keep the context alive when hidden", () => {
        expect(host.options().retainContextWhenHidden).toBe(false);
    });

    it("only allows the bundle and the resources folder", () => {
        const roots = (host.options().localResourceRoots ?? []).map(
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

describe("assets", () => {
    it("resolves every image through the webview", () => {
        const assets = host.assets(makeWebview());

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
    it("attaches the asset uris to the state", () => {
        const state = host.withAssets(makeWebview(), { kind: "loading" });

        expect(state.kind).toBe("loading");
        expect(state.assets?.loading).toContain("/extension/resources/");
    });

    it("keeps the payload of the state", () => {
        const state = host.withAssets(makeWebview(), {
            kind: "bangumi",
            page: 4,
            bangumis: [],
        });

        expect(state.page).toBe(4);
        expect(state.bangumis).toHaveLength(0);
    });
});

describe("html", () => {
    it("emits a complete html document", () => {
        const html = host.html(makeWebview(), "bangumis");

        expect(html.startsWith("<!DOCTYPE html>")).toBe(true);
        expect(html).toContain('<meta charset="UTF-8">');
        expect(html).toContain("<title>bangumis</title>");
        expect(html.trimEnd().endsWith("</html>")).toBe(true);
    });

    it("links the bundled script and stylesheet", () => {
        const html = host.html(makeWebview(), "bangumis");

        expect(html).toContain(`webview:/extension/${WEBVIEW_DIST}/main.js`);
        expect(html).toContain(`webview:/extension/${WEBVIEW_DIST}/main.css`);
    });

    it("locks the document down with a content security policy", () => {
        const html = host.html(makeWebview(), "bangumis");

        expect(html).toContain("default-src 'none'");
        expect(html).toContain("script-src 'nonce-");
    });

    it("allows the cover images served over https", () => {
        const html = host.html(makeWebview(), "bangumis");

        expect(html).toContain("img-src vscode-webview://source https:");
    });

    it("uses the same nonce for the policy and the script tag", () => {
        const html = host.html(makeWebview(), "bangumis");
        const nonce = /script-src 'nonce-([a-f0-9]+)'/.exec(html)?.[1];

        expect(nonce).toBeDefined();
        expect(html).toContain(`<script type="module" nonce="${nonce}"`);
    });

    it("generates a different nonce for every document", () => {
        const first = host.html(makeWebview(), "t");
        const second = host.html(makeWebview(), "t");

        expect(first).not.toBe(second);
    });

    it("keeps the document free of inline scripts", () => {
        const html = host.html(makeWebview(), "bangumis");

        expect(html).not.toContain("<script>");
    });
});
