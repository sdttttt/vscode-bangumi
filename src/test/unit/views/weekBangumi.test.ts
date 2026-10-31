import { beforeEach, describe, expect, it, vi } from "vitest";
import * as vscode from "vscode";

vi.mock("@/request/bangumi", () => ({
    getAllBangumi: vi.fn(),
    getWeekBangumi: vi.fn(),
}));

import { getWeekBangumi } from "@/request/bangumi";
import { ConfigKey } from "@/configuration";
import { weekBangumi } from "@/test/mocks/fixtures/weekBangumi";
import { createPanelStub, PanelStub } from "@/test/mocks/panel";

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
    let stub: PanelStub;

    beforeEach(async () => {
        stubConfig({ [ConfigKey.DisplayHistory]: true });

        stub = createPanelStub();
        vi.mocked(vscode.window.createWebviewPanel).mockReturnValue(stub.panel);

        view = await loadView();
    });

    it("posts the loading state before the schedule arrives", () => {
        vi.mocked(getWeekBangumi).mockReturnValue(new Promise(() => {}));

        view.openWeekBangumi();

        expect(stub.posted().at(-1)?.kind).toBe("loading");
    });

    it("renders every day when history is enabled", async () => {
        vi.mocked(getWeekBangumi).mockResolvedValue(weekBangumi());

        view.openWeekBangumi();

        await vi.waitFor(() => {
            const state = stub.posted().at(-1);
            expect(state?.kind).toBe("weekBangumi");
            expect(state?.days).toHaveLength(7);
            expect(state?.days?.[0].dayOfWeek).toBe(1);
        });
    });

    it("hides the past days when history is disabled", async () => {
        stubConfig({ [ConfigKey.DisplayHistory]: false });
        vi.mocked(getWeekBangumi).mockResolvedValue(weekBangumi());

        view.openWeekBangumi();

        await vi.waitFor(() => {
            const days = stub.posted().at(-1)?.days ?? [];
            expect(days).toHaveLength(2);
            expect(days[0].dayOfWeek).toBe(6);
        });
    });

    it("converts the season fields into render payloads", async () => {
        vi.mocked(getWeekBangumi).mockResolvedValue(weekBangumi());

        view.openWeekBangumi();

        await vi.waitFor(() => {
            const season = stub.posted().at(-1)?.days?.[0].seasons[0];
            expect(season?.title).toBe("第1天的番剧");
            expect(season?.delay).toBe(false);
            expect(season?.cover).toBe(
                "https://i0.hdslb.com/bfs/cover/a-square.jpg"
            );
        });
    });

    it("keeps the loading state when the request fails", async () => {
        vi.mocked(getWeekBangumi).mockResolvedValue(undefined);

        view.openWeekBangumi();
        await Promise.resolve();

        expect(stub.posted().at(-1)?.kind).toBe("loading");
    });

    it("reloads the schedule when the webview asks to refresh", async () => {
        vi.mocked(getWeekBangumi).mockResolvedValue(weekBangumi());
        view.openWeekBangumi();
        await vi.waitFor(() => {
            expect(stub.posted().at(-1)?.kind).toBe("weekBangumi");
        });
        vi.mocked(getWeekBangumi).mockClear();

        stub.receive({ type: "weekBangumi:refresh" });

        expect(getWeekBangumi).toHaveBeenCalledTimes(1);
    });

    it("replays the last state when the webview asks to be ready", async () => {
        vi.mocked(getWeekBangumi).mockResolvedValue(weekBangumi());
        view.openWeekBangumi();
        await vi.waitFor(() => {
            expect(stub.posted().at(-1)?.kind).toBe("weekBangumi");
        });
        const before = stub.posted().length;

        stub.receive({ type: "ready" });

        expect(stub.posted()).toHaveLength(before + 1);
        expect(stub.posted().at(-1)?.kind).toBe("weekBangumi");
    });
});
