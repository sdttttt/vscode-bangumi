import { describe, test, expect, vi } from "vitest";
import type { Webview } from "vscode";
import { getResourceFile } from "@/utils/file";

const asWebviewUri = vi.fn((uri: unknown) => `webview:${String(uri)}`);

vi.mock("vscode", () => ({
    Uri: {
        file: (fsPath: string) => fsPath,
    },
}));

vi.mock("@/constants", () => ({
    getContext: () => ({
        extensionPath: "/extension",
    }),
}));

/**
 * Resource file TEST
 *
 * @author sdttttt
 */
describe("Resource File TEST", () => {
    test("uses asWebviewUri and joins the resources folder", () => {
        const webview = {
            asWebviewUri,
        } as unknown as Webview;

        const result = getResourceFile(webview, "css/bangumi.css");

        expect(asWebviewUri).toHaveBeenCalledTimes(1);
        expect(asWebviewUri).toHaveBeenCalledWith(
            "/extension/resources/css/bangumi.css"
        );
        expect(result).toBe("webview:/extension/resources/css/bangumi.css");
    });
});
