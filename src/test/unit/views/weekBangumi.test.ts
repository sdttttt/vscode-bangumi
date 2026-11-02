import { beforeEach, describe, expect, it, vi } from "vitest";

import type { BangumiApi } from "@/request";
import {
    toScheduleFromBgmTv,
    toScheduleFromBilibili,
    type WeeklySchedule,
} from "@/request/schedule";
import { createSettingsStub, type SettingsStub } from "@/test/mocks/settings";
import {
    createAvailabilityStub,
    type AvailabilityStub,
} from "@/test/mocks/ports";
import {
    weekBangumi,
    weekBangumiData,
} from "@/test/mocks/fixtures/weekBangumi";
import { bgmCalendar } from "@/test/mocks/fixtures/bgm";
import { createPanelStub, PanelStub } from "@/test/mocks/panel";
import { createWebviewHost } from "@/webview/host";
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
): { view: WeekBangumiView; api: BangumiApi; availability: AvailabilityStub } {
    const api: BangumiApi = {
        getIndexPage: vi.fn(),
        getBilibiliSchedule: vi.fn(),
        getBgmTvSchedule: vi.fn(),
    };
    const panel = usePanel({
        viewType: "bangumiOpen.week",
        title: "周番表",
        host: createWebviewHost("/extension"),
        subscriptions: [],
        createPanel: () => stub.panel,
    });
    const availability = createAvailabilityStub();
    const view = useWeekBangumiView({
        api,
        panel,
        settings,
        availability: availability.availability,
    });
    panel.onCommand(view.handleCommand);

    return { view, api, availability };
}

describe("Week bangumi view", () => {
    let view: WeekBangumiView;
    let api: BangumiApi;
    let settings: SettingsStub;
    let stub: PanelStub;
    let availability: AvailabilityStub;

    beforeEach(() => {
        settings = createSettingsStub({
            "bangumiOpen.WeekSource": "bilibili",
            "bangumiOpen.DisplayHistory": true,
        });

        stub = createPanelStub();
        ({ view, api, availability } = loadView(settings, stub));
    });

    it("posts the loading state before the schedule arrives", () => {
        vi.mocked(api.getBilibiliSchedule).mockReturnValue(
            new Promise(() => {})
        );

        view.openWeekBangumi();

        expect(stub.posted().at(-1)?.kind).toBe("loading");
    });

    it("renders every day when history is enabled", async () => {
        vi.mocked(api.getBilibiliSchedule).mockResolvedValue(
            toScheduleFromBilibili(weekBangumi())
        );

        view.openWeekBangumi();

        await vi.waitFor(() => {
            const state = stub.posted().at(-1);
            expect(state?.kind).toBe("weekBangumi");
            expect(state?.days).toHaveLength(7);
            expect(state?.days?.[0].dayOfWeek).toBe(1);
            expect(state?.source).toBe("bilibili");
        });
    });

    it("hides the past days when history is disabled", async () => {
        settings.values["bangumiOpen.DisplayHistory"] = false;
        vi.mocked(api.getBilibiliSchedule).mockResolvedValue(
            toScheduleFromBilibili(
                [
                    weekBangumiData({
                        date: "10-30",
                        day_of_week: 5,
                        is_today: 0,
                    }),
                    weekBangumiData({
                        date: "10-31",
                        day_of_week: 6,
                        is_today: 1,
                    }),
                    weekBangumiData({
                        date: "11-1",
                        day_of_week: 7,
                        is_today: 0,
                    }),
                ],
                Date.UTC(2026, 9, 31, 4, 0)
            )
        );

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
        vi.mocked(api.getBilibiliSchedule).mockResolvedValue(
            toScheduleFromBilibili(weekBangumi())
        );

        view.openWeekBangumi();

        await vi.waitFor(() => {
            expect(stub.posted().at(-1)?.days).toHaveLength(7);
        });
    });

    it("converts the season fields into render payloads", async () => {
        vi.mocked(api.getBilibiliSchedule).mockResolvedValue(
            toScheduleFromBilibili(weekBangumi())
        );

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

    it("shows the not found state when the request returns nothing", async () => {
        vi.mocked(api.getBilibiliSchedule).mockResolvedValue(undefined);

        view.openWeekBangumi();
        await Promise.resolve();

        expect(stub.posted().at(-1)?.kind).toBe("notFound");
    });

    it("shows the unavailable state when every source is down", async () => {
        availability.setDown(true);
        vi.mocked(api.getBilibiliSchedule).mockResolvedValue(undefined);

        view.openWeekBangumi();

        await vi.waitFor(() => {
            expect(stub.posted().at(-1)?.kind).toBe("unavailable");
        });
    });

    it("shows the unavailable state when a failing request leaves every source down", async () => {
        availability.setDown(true);
        vi.mocked(api.getBilibiliSchedule).mockRejectedValue(
            new Error("offline")
        );

        view.openWeekBangumi();

        await vi.waitFor(() => {
            expect(stub.posted().at(-1)?.kind).toBe("unavailable");
        });
    });

    it("redraws the schedule once the sources recover", async () => {
        availability.setDown(true);
        vi.mocked(api.getBilibiliSchedule).mockResolvedValue(undefined);
        view.openWeekBangumi();
        await vi.waitFor(() => {
            expect(stub.posted().at(-1)?.kind).toBe("unavailable");
        });

        vi.mocked(api.getBilibiliSchedule).mockResolvedValue(
            toScheduleFromBilibili(weekBangumi())
        );
        availability.setDown(false);

        await vi.waitFor(() => {
            expect(stub.posted().at(-1)?.kind).toBe("weekBangumi");
        });
    });

    it("shows the not found state when the request rejects", async () => {
        vi.mocked(api.getBilibiliSchedule).mockRejectedValue(
            new Error("offline")
        );

        view.openWeekBangumi();

        await vi.waitFor(() => {
            expect(stub.posted().at(-1)?.kind).toBe("notFound");
        });
    });

    it("ignores a response that arrives after a newer render", async () => {
        let resolveFirst: (value: never) => void = () => undefined;
        const first = new Promise<never>(resolve => {
            resolveFirst = resolve;
        });
        vi.mocked(api.getBilibiliSchedule)
            .mockReturnValueOnce(first)
            .mockResolvedValue(toScheduleFromBilibili(weekBangumi()));

        view.openWeekBangumi();
        view.openWeekBangumi();
        resolveFirst([] as never);

        await vi.waitFor(() => {
            expect(stub.posted().at(-1)?.kind).toBe("weekBangumi");
            expect(stub.posted().at(-1)?.days).toHaveLength(7);
        });
    });

    it("reloads the schedule when the webview asks to refresh", async () => {
        vi.mocked(api.getBilibiliSchedule).mockResolvedValue(
            toScheduleFromBilibili(weekBangumi())
        );
        view.openWeekBangumi();
        await vi.waitFor(() => {
            expect(stub.posted().at(-1)?.kind).toBe("weekBangumi");
        });
        vi.mocked(api.getBilibiliSchedule).mockClear();

        stub.receive({ type: "weekBangumi:refresh" });

        expect(api.getBilibiliSchedule).toHaveBeenCalledTimes(1);
    });

    it("replays the last state when the webview asks to be ready", async () => {
        vi.mocked(api.getBilibiliSchedule).mockResolvedValue(
            toScheduleFromBilibili(weekBangumi())
        );
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

describe("Week bangumi view with the Bangumi source", () => {
    let view: WeekBangumiView;
    let api: BangumiApi;
    let settings: SettingsStub;
    let stub: PanelStub;

    const now = Date.UTC(2026, 9, 31, 4, 0);

    beforeEach(() => {
        settings = createSettingsStub({
            "bangumiOpen.WeekSource": "bangumi",
            "bangumiOpen.DisplayHistory": false,
        });
        stub = createPanelStub();
        ({ view, api } = loadView(settings, stub));
    });

    it("asks the Bangumi source when the setting selects it", async () => {
        vi.mocked(api.getBgmTvSchedule).mockResolvedValue(
            toScheduleFromBgmTv(bgmCalendar(), now)
        );

        view.openWeekBangumi();

        await vi.waitFor(() => {
            expect(api.getBgmTvSchedule).toHaveBeenCalledTimes(1);
        });
        expect(api.getBilibiliSchedule).not.toHaveBeenCalled();
        expect(stub.posted().at(-1)?.source).toBe("bangumi");
    });

    it("keeps the source tag for the webview", async () => {
        vi.mocked(api.getBgmTvSchedule).mockResolvedValue(
            toScheduleFromBgmTv(bgmCalendar(), now)
        );

        view.openWeekBangumi();

        await vi.waitFor(() => {
            expect(stub.posted().at(-1)?.kind).toBe("weekBangumi");
        });
        expect(stub.posted().at(-1)?.source).toBe("bangumi");
    });

    it("renders seven days even when history is disabled", async () => {
        vi.mocked(api.getBgmTvSchedule).mockResolvedValue(
            toScheduleFromBgmTv(bgmCalendar(), now)
        );

        view.openWeekBangumi();

        await vi.waitFor(() => {
            const days = stub.posted().at(-1)?.days ?? [];
            expect(days).toHaveLength(7);
        });
    });

    it("shows the not found state when the Bangumi request fails", async () => {
        vi.mocked(api.getBgmTvSchedule).mockResolvedValue(undefined);

        view.openWeekBangumi();
        await Promise.resolve();

        expect(stub.posted().at(-1)?.kind).toBe("notFound");
    });
});

describe("WeeklySchedule construction", () => {
    it("marks the bilibili schedule as carrying slots", () => {
        const schedule: WeeklySchedule = toScheduleFromBilibili(weekBangumi());

        expect(schedule.source).toBe("bilibili");
        expect(schedule.hasSlots).toBe(true);
    });

    it("marks the Bangumi schedule as slot-less", () => {
        const schedule = toScheduleFromBgmTv(bgmCalendar());

        expect(schedule.source).toBe("bangumi");
        expect(schedule.hasSlots).toBe(false);
    });
});

describe("Week bangumi view default source", () => {
    it("falls back to the Bangumi source when the setting is missing", async () => {
        const settings = createSettingsStub({});
        const stub = createPanelStub();
        const { view, api } = loadView(settings, stub);

        vi.mocked(api.getBgmTvSchedule).mockResolvedValue(
            toScheduleFromBgmTv(bgmCalendar(), Date.UTC(2026, 9, 31, 4, 0))
        );

        view.openWeekBangumi();

        await vi.waitFor(() => {
            expect(stub.posted().at(-1)?.source).toBe("bangumi");
        });
        expect(api.getBgmTvSchedule).toHaveBeenCalledTimes(1);
        expect(api.getBilibiliSchedule).not.toHaveBeenCalled();
    });
});

describe("Week bangumi view source switch", () => {
    let view: WeekBangumiView;
    let api: BangumiApi;
    let settings: SettingsStub;
    let stub: PanelStub;

    const now = Date.UTC(2026, 9, 31, 4, 0);

    beforeEach(() => {
        settings = createSettingsStub({
            "bangumiOpen.WeekSource": "bilibili",
            "bangumiOpen.DisplayHistory": false,
        });
        stub = createPanelStub();
        ({ view, api } = loadView(settings, stub));
        vi.mocked(api.getBilibiliSchedule).mockResolvedValue(
            toScheduleFromBilibili(weekBangumi())
        );
        vi.mocked(api.getBgmTvSchedule).mockResolvedValue(
            toScheduleFromBgmTv(bgmCalendar(), now)
        );
    });

    it("loads the other source without touching the setting", async () => {
        view.openWeekBangumi();
        await vi.waitFor(() => {
            expect(stub.posted().at(-1)?.source).toBe("bilibili");
        });

        stub.receive({ type: "weekBangumi:switchSource", source: "bangumi" });

        await vi.waitFor(() => {
            expect(stub.posted().at(-1)?.source).toBe("bangumi");
        });
        expect(api.getBgmTvSchedule).toHaveBeenCalledTimes(1);
        expect(settings.values["bangumiOpen.WeekSource"]).toBe("bilibili");
    });

    it("shows the loading state while the other source is fetched", async () => {
        view.openWeekBangumi();
        await vi.waitFor(() => {
            expect(stub.posted().at(-1)?.kind).toBe("weekBangumi");
        });

        stub.receive({ type: "weekBangumi:switchSource", source: "bangumi" });

        expect(stub.posted().at(-1)?.kind).toBe("loading");
    });

    it("ignores a switch to the source already on screen", async () => {
        view.openWeekBangumi();
        await vi.waitFor(() => {
            expect(stub.posted().at(-1)?.kind).toBe("weekBangumi");
        });
        vi.mocked(api.getBilibiliSchedule).mockClear();

        stub.receive({ type: "weekBangumi:switchSource", source: "bilibili" });

        expect(api.getBilibiliSchedule).not.toHaveBeenCalled();
    });

    it("keeps the switched source across a refresh", async () => {
        view.openWeekBangumi();
        await vi.waitFor(() => {
            expect(stub.posted().at(-1)?.kind).toBe("weekBangumi");
        });
        stub.receive({ type: "weekBangumi:switchSource", source: "bangumi" });
        await vi.waitFor(() => {
            expect(stub.posted().at(-1)?.source).toBe("bangumi");
        });
        vi.mocked(api.getBgmTvSchedule).mockClear();

        stub.receive({ type: "weekBangumi:refresh" });

        await vi.waitFor(() => {
            expect(api.getBgmTvSchedule).toHaveBeenCalledTimes(1);
        });
        expect(api.getBilibiliSchedule).toHaveBeenCalledTimes(1);
    });

    it("forgets the switch when the panel is opened again", async () => {
        view.openWeekBangumi();
        await vi.waitFor(() => {
            expect(stub.posted().at(-1)?.kind).toBe("weekBangumi");
        });
        stub.receive({ type: "weekBangumi:switchSource", source: "bangumi" });
        await vi.waitFor(() => {
            expect(stub.posted().at(-1)?.source).toBe("bangumi");
        });
        vi.mocked(api.getBilibiliSchedule).mockClear();

        view.openWeekBangumi();

        await vi.waitFor(() => {
            expect(stub.posted().at(-1)?.source).toBe("bilibili");
        });
    });

    it("starts from the setting when the panel opens in the bangumi mode", async () => {
        settings.values["bangumiOpen.WeekSource"] = "bangumi";
        const another = loadView(settings, createPanelStub());
        vi.mocked(another.api.getBgmTvSchedule).mockResolvedValue(
            toScheduleFromBgmTv(bgmCalendar(), now)
        );

        another.view.openWeekBangumi();

        await vi.waitFor(() => {
            expect(another.api.getBgmTvSchedule).toHaveBeenCalledTimes(1);
        });
        expect(another.api.getBilibiliSchedule).not.toHaveBeenCalled();
    });
});
