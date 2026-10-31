import { beforeEach, describe, expect, it, vi } from "vitest";
import * as vscode from "vscode";
import type { WebviewPanel } from "vscode";

vi.mock("@/request/bangumi", () => ({
    getAllBangumi: vi.fn(),
    getWeekBangumi: vi.fn(),
}));

import { getAllBangumi } from "@/request/bangumi";
import { bangumisData } from "@/test/mocks/fixtures/bangumi";

/**
 * Minimal `WebviewPanel` double that records the assigned html.
 *
 * @author sdttttt
 */
function makePanel() {
    return {
        webview: {
            html: "",
            asWebviewUri: (uri: { fsPath: string }) => `webview:${uri.fsPath}`,
        },
        reveal: vi.fn(),
        onDidDispose: vi.fn(),
        dispose: vi.fn(),
    };
}

/**
 * Reloads the view module so its singleton state (page number, open panel)
 * starts clean, wiring the extension context into the same module registry.
 *
 * @author sdttttt
 */
async function loadView(): Promise<
    (typeof import("@/views/bangumi"))["default"]
> {
    vi.resetModules();
    const constants = await import("@/constants");
    constants.setContext({
        extensionPath: "/extension",
        subscriptions: [],
    } as never);

    return (await import("@/views/bangumi")).default;
}

describe("BangumisView", () => {
    let view: (typeof import("@/views/bangumi"))["default"];
    let panel: ReturnType<typeof makePanel>;

    beforeEach(async () => {
        panel = makePanel();
        vi.mocked(vscode.window.createWebviewPanel).mockReturnValue(
            panel as unknown as WebviewPanel
        );
        vi.mocked(vscode.window.showInformationMessage).mockResolvedValue(
            undefined
        );

        view = await loadView();
    });

    it("opens a webview panel with the loading view first", () => {
        vi.mocked(getAllBangumi).mockReturnValue(new Promise(() => {}));

        view.openBangumi();

        expect(vscode.window.createWebviewPanel).toHaveBeenCalledTimes(1);
        expect(panel.webview.html).toContain("Loading...");
    });

    it("renders the bangumi list once the request resolves", async () => {
        vi.mocked(getAllBangumi).mockResolvedValue(bangumisData());

        view.openBangumi();

        await vi.waitFor(() => {
            expect(panel.webview.html).toContain("测试番剧");
        });
    });

    it("renders the not found view when the request fails", async () => {
        vi.mocked(getAllBangumi).mockResolvedValue(undefined);

        view.openBangumi();

        await vi.waitFor(() => {
            expect(panel.webview.html).toContain("没有数据!");
        });
    });

    it("requests the first page by default", () => {
        vi.mocked(getAllBangumi).mockReturnValue(new Promise(() => {}));

        view.openBangumi();

        const url = vi.mocked(getAllBangumi).mock.calls.at(-1)?.[0];
        expect(url?.build().finalUrl).toContain("page=1");
    });

    it("increments the page on nextPage", () => {
        vi.mocked(getAllBangumi).mockReturnValue(new Promise(() => {}));

        view.nextPage();

        expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
            "🐶 第2页"
        );
    });

    it("decrements the page on backPage", () => {
        vi.mocked(getAllBangumi).mockReturnValue(new Promise(() => {}));
        view.nextPage();
        vi.mocked(vscode.window.showInformationMessage).mockClear();

        view.backPage();

        expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
            "🐶 第1页"
        );
    });

    it("stays on the first page when going back", () => {
        vi.mocked(getAllBangumi).mockReturnValue(new Promise(() => {}));

        view.backPage();

        expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
            "😰真的一滴都没有了!"
        );
    });

    it("jumps to the page entered by the user", async () => {
        vi.mocked(getAllBangumi).mockReturnValue(new Promise(() => {}));
        vi.mocked(vscode.window.showInputBox).mockResolvedValue("9");

        view.jumpPage();

        await vi.waitFor(() => {
            const url = vi.mocked(getAllBangumi).mock.calls.at(-1)?.[0];
            expect(url?.build().finalUrl).toContain("page=9");
        });
    });

    it("rejects a non numeric page and keeps the current one", async () => {
        vi.mocked(getAllBangumi).mockReturnValue(new Promise(() => {}));
        vi.mocked(vscode.window.showInputBox).mockResolvedValue("abc");

        view.jumpPage();

        await vi.waitFor(() => {
            expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
                expect.stringContaining("不能是0或者非数字")
            );
        });
    });

    it("reuses the open panel instead of creating a second one", () => {
        vi.mocked(getAllBangumi).mockReturnValue(new Promise(() => {}));

        view.openBangumi();
        view.nextPage();

        expect(vscode.window.createWebviewPanel).toHaveBeenCalledTimes(1);
        expect(panel.reveal).toHaveBeenCalled();
    });
});
