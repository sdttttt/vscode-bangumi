import { beforeEach, describe, expect, it, vi } from "vitest";
import * as vscode from "vscode";
import type { WebviewPanel } from "vscode";

vi.mock("@/request/bangumi", () => ({
    getAllBangumi: vi.fn(),
    getWeekBangumi: vi.fn(),
}));

import { getWeekBangumi } from "@/request/bangumi";
import { ConfigKey } from "@/configuration";
import { weekBangumi } from "@/test/mocks/fixtures/weekBangumi";

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
 * Makes the configuration read answer with the given values.
 *
 * @author sdttttt
 */
function stubConfig(values: Record<string, unknown>): void {
    vi.mocked(vscode.workspace.getConfiguration).mockReturnValue({
        get: vi.fn((key: string) => values[key]),
    } as never);
}

/**
 * Reloads the view module so its singleton state starts clean, wiring the
 * extension context into the same module registry.
 *
 * @author sdttttt
 */
async function loadView(): Promise<
    (typeof import("@/views/weekBangumi"))["default"]
> {
    vi.resetModules();
    const constants = await import("@/constants");
    constants.setContext({
        extensionPath: "/extension",
        subscriptions: [],
    } as never);

    return (await import("@/views/weekBangumi")).default;
}

describe("WeekBangumiView", () => {
    let view: (typeof import("@/views/weekBangumi"))["default"];
    let panel: ReturnType<typeof makePanel>;

    beforeEach(async () => {
        stubConfig({ [ConfigKey.DisplayHistory]: true });

        panel = makePanel();
        vi.mocked(vscode.window.createWebviewPanel).mockReturnValue(
            panel as unknown as WebviewPanel
        );

        view = await loadView();
    });

    it("shows the loading view before the schedule arrives", () => {
        vi.mocked(getWeekBangumi).mockReturnValue(new Promise(() => {}));

        view.openWeekBangumi();

        expect(panel.webview.html).toContain("Loading...");
    });

    it("renders the schedule once the request resolves", async () => {
        vi.mocked(getWeekBangumi).mockResolvedValue(weekBangumi());

        view.openWeekBangumi();

        await vi.waitFor(() => {
            expect(panel.webview.html).toContain("第1天的番剧");
        });
    });

    it("keeps the loading view when the request fails", async () => {
        vi.mocked(getWeekBangumi).mockResolvedValue(undefined);

        view.openWeekBangumi();
        await Promise.resolve();

        expect(panel.webview.html).toContain("Loading...");
    });
});
