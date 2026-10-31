import { beforeEach, describe, expect, it, vi } from "vitest";
import * as vscode from "vscode";

vi.mock("@/request/bangumi", () => ({
    getAllBangumi: vi.fn(),
    getWeekBangumi: vi.fn(),
}));

import { getAllBangumi } from "@/request/bangumi";
import { bangumisData } from "@/test/mocks/fixtures/bangumi";
import { createPanelStub, PanelStub } from "@/test/mocks/panel";

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
    let stub: PanelStub;

    beforeEach(async () => {
        stub = createPanelStub();
        vi.mocked(vscode.window.createWebviewPanel).mockReturnValue(stub.panel);
        vi.mocked(vscode.window.showInformationMessage).mockResolvedValue(
            undefined
        );

        view = await loadView();
    });

    it("opens a panel that boots the bundled webview", () => {
        vi.mocked(getAllBangumi).mockReturnValue(new Promise(() => {}));

        view.openBangumi();

        expect(vscode.window.createWebviewPanel).toHaveBeenCalledTimes(1);
        expect(stub.webview.html).toContain("<!DOCTYPE html>");
        expect(stub.webview.html).toContain("main.js");
        expect(stub.webview.html).toContain("main.css");
    });

    it("enables scripts and restricts local resources", () => {
        vi.mocked(getAllBangumi).mockReturnValue(new Promise(() => {}));

        view.openBangumi();

        const options = vi.mocked(vscode.window.createWebviewPanel).mock
            .calls[0][3];
        expect(options?.enableScripts).toBe(true);
        expect(options?.retainContextWhenHidden).toBe(false);
        expect(options?.localResourceRoots).toHaveLength(2);
    });

    it("posts the loading state first", () => {
        vi.mocked(getAllBangumi).mockReturnValue(new Promise(() => {}));

        view.openBangumi();

        expect(stub.posted().at(-1)?.kind).toBe("loading");
    });

    it("renders the bangumi list once the request resolves", async () => {
        vi.mocked(getAllBangumi).mockResolvedValue(bangumisData());

        view.openBangumi();

        await vi.waitFor(() => {
            const state = stub.posted().at(-1);
            expect(state?.kind).toBe("bangumi");
            expect(state?.bangumis?.[0].title).toBe("测试番剧");
        });
    });

    it("passes the current page to the webview", async () => {
        vi.mocked(getAllBangumi).mockResolvedValue(bangumisData());

        view.openBangumi();

        await vi.waitFor(() => {
            expect(stub.posted().at(-1)?.page).toBe(1);
        });
    });

    it("maps the api fields into render payloads", async () => {
        vi.mocked(getAllBangumi).mockResolvedValue(bangumisData({ list: [] }));

        view.openBangumi();

        await vi.waitFor(() => {
            expect(stub.posted().at(-1)?.bangumis).toHaveLength(0);
        });
    });

    it("renders the not found view when the request fails", async () => {
        vi.mocked(getAllBangumi).mockResolvedValue(undefined);

        view.openBangumi();

        await vi.waitFor(() => {
            expect(stub.posted().at(-1)?.kind).toBe("notFound");
        });
    });

    it("replays the last state when the webview asks to be ready", async () => {
        vi.mocked(getAllBangumi).mockResolvedValue(bangumisData());
        view.openBangumi();
        await vi.waitFor(() => {
            expect(stub.posted().at(-1)?.kind).toBe("bangumi");
        });

        stub.receive({ type: "ready" });

        expect(stub.posted().at(-1)?.kind).toBe("bangumi");
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
            "第2页"
        );
    });

    it("decrements the page on backPage", () => {
        vi.mocked(getAllBangumi).mockReturnValue(new Promise(() => {}));
        view.nextPage();
        vi.mocked(vscode.window.showInformationMessage).mockClear();

        view.backPage();

        expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
            "第1页"
        );
    });

    it("stays on the first page when going back", () => {
        vi.mocked(getAllBangumi).mockReturnValue(new Promise(() => {}));

        view.backPage();

        expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
            "真的一滴都没有了!"
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
        expect(stub.reveal).toHaveBeenCalled();
    });

    it("opens a fresh panel after the previous one was closed", () => {
        vi.mocked(getAllBangumi).mockReturnValue(new Promise(() => {}));

        view.openBangumi();
        stub.dispose();
        view.openBangumi();

        expect(vscode.window.createWebviewPanel).toHaveBeenCalledTimes(2);
    });

    it("routes the pager commands sent by the webview", () => {
        vi.mocked(getAllBangumi).mockReturnValue(new Promise(() => {}));
        view.openBangumi();
        vi.mocked(vscode.window.showInformationMessage).mockClear();

        stub.receive({ type: "bangumi:nextPage" });

        expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
            "第2页"
        );
    });

    it("ignores the back command while on the first page", () => {
        vi.mocked(getAllBangumi).mockReturnValue(new Promise(() => {}));
        view.openBangumi();
        vi.mocked(vscode.window.showInformationMessage).mockClear();

        stub.receive({ type: "bangumi:backPage" });

        expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
            "真的一滴都没有了!"
        );
    });
});
