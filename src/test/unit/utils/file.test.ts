import * as path from "node:path";
import { describe, expect, it, vi } from "vitest";
import type { Webview } from "vscode";
import { getResourceFile } from "@/utils/file";

/**
 * 构建一个 Webview，其 `asWebviewUri` 会给磁盘路径加上前缀后返回。
 *
 * @author sdttttt
 */
function makeWebview(prefix: string): Webview {
    return {
        asWebviewUri: (uri: { fsPath: string }) => `${prefix}:${uri.fsPath}`,
    } as unknown as Webview;
}

describe("getResourceFile", () => {
    it("resolves the file under the resources folder", () => {
        const result = getResourceFile(
            makeWebview("webview"),
            "css/bangumi.css",
            "/extension"
        );

        expect(String(result)).toBe(
            `webview:${path.join("/extension", "resources", "css", "bangumi.css")}`
        );
    });

    it("routes the uri through webview.asWebviewUri exactly once", () => {
        const asWebviewUri = vi.fn((uri: { fsPath: string }) => uri.fsPath);
        const webview = { asWebviewUri } as unknown as Webview;

        getResourceFile(webview, "loading.gif", "/extension");

        expect(asWebviewUri).toHaveBeenCalledTimes(1);
    });

    it("uses the uri belonging to the calling webview", () => {
        const first = getResourceFile(
            makeWebview("panel-a"),
            "loading.gif",
            "/extension"
        );
        const second = getResourceFile(
            makeWebview("panel-b"),
            "loading.gif",
            "/extension"
        );

        expect(String(first)).toContain("panel-a:");
        expect(String(second)).toContain("panel-b:");
        expect(String(second)).not.toContain("panel-a:");
    });

    it("resolves against the extension path it is given", () => {
        const result = getResourceFile(
            makeWebview("webview"),
            "loading.gif",
            "/other"
        );

        expect(String(result)).toBe(
            `webview:${path.join("/other", "resources", "loading.gif")}`
        );
    });
});
