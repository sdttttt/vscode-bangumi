import {
    describe, test, expect, vi
} from "vitest";
import type {
    Webview
} from "vscode";
import LoadingHTMLGenerator from "@/html/loadingHtml";
import NotFoundHTMLGenerator from "@/html/NotFoundHtml";

vi.mock("vscode", () => ({
    Uri: {
        file: (fsPath: string) => fsPath,
    },
}));

vi.mock("@/constants", () => ({
    getContext: () => ({
        extensionPath: "/extension",
    }),
    HUIHUI     : "loading.gif",
    ENTERRPRISE: "enterprise.jpg",
    LOADING_CSS: "css/loading.css",
}));

function makeWebview(id: string): Webview
{
    return {
        asWebviewUri: (uri: unknown) => `${id}:${String(uri)}`,
    } as unknown as Webview;
}

/**
 * HTML Generator TEST
 *
 * @author sdttttt
 */
describe("HTML Generator TEST", () =>
{
    test("loading view binds resources to the given webview", () =>
    {
        const first = LoadingHTMLGenerator.generateHTML(
            undefined,
            makeWebview("panel-a")
        );
        const second = LoadingHTMLGenerator.generateHTML(
            undefined,
            makeWebview("panel-b")
        );

        expect(first).toContain("panel-a:/extension/resources/loading.gif");
        expect(first).toContain("panel-a:/extension/resources/css/loading.css");
        expect(second).toContain("panel-b:/extension/resources/loading.gif");
        expect(second).not.toContain("panel-a:");
    });

    test("not found view binds resources to the given webview", () =>
    {
        const html = NotFoundHTMLGenerator.generateHTML(
            undefined,
            makeWebview("panel-c")
        );

        expect(html).toContain("panel-c:/extension/resources/enterprise.jpg");
        expect(html).toContain("没有数据!");
    });
});
