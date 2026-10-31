import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ExtensionContext, Webview } from "vscode";
import { getResourceFile } from "@/utils/file";
import { setContext } from "@/constants";

/**
 * Builds a webview whose `asWebviewUri` echoes the on-disk path with a prefix.
 *
 * @author sdttttt
 */
function makeWebview(prefix: string): Webview {
    return {
        asWebviewUri: (uri: { fsPath: string }) => `${prefix}:${uri.fsPath}`,
    } as unknown as Webview;
}

describe("getResourceFile", () => {
    beforeEach(() => {
        setContext({ extensionPath: "/extension" } as ExtensionContext);
    });

    it("resolves the file under the resources folder", () => {
        const result = getResourceFile(
            makeWebview("webview"),
            "css/bangumi.css"
        );

        expect(String(result)).toBe(
            "webview:/extension/resources/css/bangumi.css"
        );
    });

    it("routes the uri through webview.asWebviewUri exactly once", () => {
        const asWebviewUri = vi.fn((uri: { fsPath: string }) => uri.fsPath);
        const webview = { asWebviewUri } as unknown as Webview;

        getResourceFile(webview, "loading.gif");

        expect(asWebviewUri).toHaveBeenCalledTimes(1);
    });

    it("uses the uri belonging to the calling webview", () => {
        const first = getResourceFile(makeWebview("panel-a"), "loading.gif");
        const second = getResourceFile(makeWebview("panel-b"), "loading.gif");

        expect(String(first)).toContain("panel-a:");
        expect(String(second)).toContain("panel-b:");
        expect(String(second)).not.toContain("panel-a:");
    });
});
