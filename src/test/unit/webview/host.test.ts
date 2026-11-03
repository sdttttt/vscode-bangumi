import * as path from "node:path";
import { beforeEach, describe, expect, it } from "vitest";
import type { Webview } from "vscode";
import {
    createWebviewHost,
    WEBVIEW_DIST,
    type WebviewHost,
} from "@/webview/host";

/**
 * 按当前平台的路径分隔符拼出期望的磁盘路径。
 *
 * 生产代码用 `path.join` 组装路径，Windows 上得到的是反斜杠，
 * 断言不能写死 POSIX 风格。
 *
 * @author sdttttt
 */
const join = (...segments: string[]): string => path.join(...segments);

/**
 * 构建一个 Webview 替身，其 `asWebviewUri` 返回可读的字符串。
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
    host = createWebviewHost("/extension");
});

describe("createWebviewHost", () => {
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
            join("/extension", WEBVIEW_DIST),
            join("/extension", "resources"),
        ]);
    });

    it("points at a directory outside of dist", () => {
        expect(WEBVIEW_DIST.startsWith("dist")).toBe(false);
    });
});

describe("assets", () => {
    it("resolves the illustration through the webview", () => {
        const assets = host.assets(makeWebview());

        expect(assets.image).toBe(
            `webview:${join("/extension", "resources", "miyagi.jpg")}`
        );
    });
});

describe("withAssets", () => {
    it("attaches the asset uris to the state", () => {
        const state = host.withAssets(makeWebview(), { kind: "loading" });

        expect(state.kind).toBe("loading");
        expect(state.assets?.image).toContain(
            join("/extension", "resources") + path.sep
        );
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

        expect(html).toContain(
            `webview:${join("/extension", WEBVIEW_DIST, "main.js")}`
        );
        expect(html).toContain(
            `webview:${join("/extension", WEBVIEW_DIST, "main.css")}`
        );
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

    it("escapes html special characters in the title", () => {
        /*
         * 复现（L3，见 TODO.md）：title 目前只来自静态常量，但 html() 是
         * 公开接口——动态标题里的标记不应被原样注入文档头部。
         */
        const html = host.html(
            makeWebview(),
            "</title><script>alert(1)</script>"
        );

        expect(html).toContain(
            "<title>&lt;/title&gt;&lt;script&gt;alert(1)&lt;/script&gt;</title>"
        );
    });
});
