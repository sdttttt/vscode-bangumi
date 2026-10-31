import { beforeEach, describe, expect, it, vi } from "vitest";

import type { BangumiApi } from "@/request/bangumi";
import { createSettingsStub, type SettingsStub } from "@/test/mocks/settings";
import {
    weekBangumi,
    weekBangumiData,
} from "@/test/mocks/fixtures/weekBangumi";
import { createPanelStub, PanelStub } from "@/test/mocks/panel";
import { useWebviewHost } from "@/webview/host";
import { usePanel } from "@/views/panel";
import { useWeekBangumiView, type WeekBangumiView } from "@/views/weekBangumi";

/**
 * 构建独立的视图实例，每个用例因此都从关闭的面板开始。
 *
 * @author sdttttt
 */
function loadView(
    settings: SettingsStub,
    stub: PanelStub
): { view: WeekBangumiView; api: BangumiApi } {
    const api: BangumiApi = {
        getAllBangumi: vi.fn(),
        getWeekBangumi: vi.fn(),
    };
    const panel = usePanel({
        viewType: "bangumiOpen.week",
        title: "周番表",
        host: useWebviewHost("/extension"),
        subscriptions: [],
        createPanel: () => stub.panel,
    });
    const view = useWeekBangumiView({ api, panel, settings });
    panel.onCommand(view.handleCommand);

    return { view, api };
}

describe("Week bangumi view", () => {
    let view: WeekBangumiView;
    let api: BangumiApi;
    let settings: SettingsStub;
    let stub: PanelStub;

    beforeEach(() => {
        settings = createSettingsStub({ "bangumiOpen.DisplayHistory": true });

        stub = createPanelStub();
        ({ view, api } = loadView(settings, stub));
    });

    it("posts the loading state before the schedule arrives", () => {
        vi.mocked(api.getWeekBangumi).mockReturnValue(new Promise(() => {}));

        view.openWeekBangumi();

        expect(stub.posted().at(-1)?.kind).toBe("loading");
    });

    it("renders every day when history is enabled", async () => {
        vi.mocked(api.getWeekBangumi).mockResolvedValue(weekBangumi());

        view.openWeekBangumi();

        await vi.waitFor(() => {
            const state = stub.posted().at(-1);
            expect(state?.kind).toBe("weekBangumi");
            expect(state?.days).toHaveLength(7);
            expect(state?.days?.[0].dayOfWeek).toBe(1);
        });
    });

    it("hides the past days when history is disabled", async () => {
        settings.values["bangumiOpen.DisplayHistory"] = false;
        vi.mocked(api.getWeekBangumi).mockResolvedValue([
            weekBangumiData({ date: "10-30", day_of_week: 5, is_today: 0 }),
            weekBangumiData({ date: "10-31", day_of_week: 6, is_today: 1 }),
            weekBangumiData({ date: "11-1", day_of_week: 7, is_today: 0 }),
        ]);

        view.openWeekBangumi();

        await vi.waitFor(() => {
            const days = stub.posted().at(-1)?.days ?? [];
            expect(days).toHaveLength(2);
            expect(days[0].dayOfWeek).toBe(6);
            expect(days[0].isToday).toBe(true);
        });
    });

    it("keeps the whole schedule when today is missing", async () => {
        settings.values["bangumiOpen.DisplayHistory"] = false;
        vi.mocked(api.getWeekBangumi).mockResolvedValue(weekBangumi());

        view.openWeekBangumi();

        await vi.waitFor(() => {
            expect(stub.posted().at(-1)?.days).toHaveLength(7);
        });
    });

    it("converts the season fields into render payloads", async () => {
        vi.mocked(api.getWeekBangumi).mockResolvedValue(weekBangumi());

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
        vi.mocked(api.getWeekBangumi).mockResolvedValue(undefined);

        view.openWeekBangumi();
        await Promise.resolve();

        expect(stub.posted().at(-1)?.kind).toBe("loading");
    });

    it("reloads the schedule when the webview asks to refresh", async () => {
        vi.mocked(api.getWeekBangumi).mockResolvedValue(weekBangumi());
        view.openWeekBangumi();
        await vi.waitFor(() => {
            expect(stub.posted().at(-1)?.kind).toBe("weekBangumi");
        });
        vi.mocked(api.getWeekBangumi).mockClear();

        stub.receive({ type: "weekBangumi:refresh" });

        expect(api.getWeekBangumi).toHaveBeenCalledTimes(1);
    });

    it("replays the last state when the webview asks to be ready", async () => {
        vi.mocked(api.getWeekBangumi).mockResolvedValue(weekBangumi());
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
